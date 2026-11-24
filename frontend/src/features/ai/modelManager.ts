/**
 * Model manager — UI-independent lifecycle owner for the local model.
 *
 * Runs inside the Web Worker. Responsibilities (Phase 4):
 *   - select a backend + profile,
 *   - download + load the model once and reuse it,
 *   - report download/load progress,
 *   - recover from init failures (WebGPU → WASM, then cached-model retry),
 *   - dispose resources when asked.
 *
 * It never touches the DOM or React; the worker bridges it to the main thread.
 */

import type { ModelBackend, ModelProfile } from "./modelRegistry";
import {
    getDefaultModelProfile,
    getModelProfile,
} from "./modelRegistry";
import type { ModelLifecycle } from "./localAiProtocol";

export type ProgressFn = (update: {
    stage: "downloading" | "loading";
    progress?: number;
    lifecycle: ModelLifecycle;
    message?: string;
}) => void;

export type ChatMessage = {
    role: "system" | "user";
    content: string;
};

export type GenerationOptions = {
    max_new_tokens: number;
    do_sample: boolean;
    temperature: number;
    return_full_text: boolean;
};

export type TextGenerator = (
    messages: ChatMessage[],
    options: GenerationOptions
) => Promise<unknown>;

type LoadedModel = {
    profile: ModelProfile;
    backend: ModelBackend;
    generator: TextGenerator;
    /** How long the initial download+load took, for benchmarks. */
    initMs: number;
};

type PipelineFactory = (
    task: "text-generation",
    modelId: string,
    options: {
        device: ModelBackend;
        dtype: "auto" | "q4f16" | "q4" | "fp32" | "fp16" | "q8" | "int8" | "uint8";
        progress_callback: (event: unknown) => void;
    }
) => Promise<TextGenerator>;

/**
 * The model manager keeps a single loaded model at a time. It is deliberately a
 * plain class (no framework types) so it can be unit-tested under Node and run
 * unchanged in the worker.
 *
 * Note: `erasableSyntaxOnly` disallows constructor parameter properties, so deps
 * are assigned explicitly.
 */
export class ModelManager {
    private readonly loadPipeline: PipelineFactory;
    private readonly hasWebGpuAdapter: () => Promise<boolean>;
    private readonly report: (lifecycle: ModelLifecycle) => void;

    private loaded: LoadedModel | undefined;
    private loading: Promise<LoadedModel> | undefined;
    private lifecycle: ModelLifecycle = "UNINITIALIZED";
    private disposed = false;
    /**
     * Once WebGPU has failed and we recovered to WASM, remember that this device
     * cannot run WebGPU so later loads skip the (slow, doomed) adapter probe and
     * WebGPU initialisation entirely. This prevents repeated WebGPU retries that
     * were a major source of slowness.
     */
    private webGpuBroken = false;

    constructor(
        loadPipeline: PipelineFactory,
        hasWebGpuAdapter: () => Promise<boolean>,
        report: (lifecycle: ModelLifecycle) => void
    ) {
        this.loadPipeline = loadPipeline;
        this.hasWebGpuAdapter = hasWebGpuAdapter;
        this.report = report;
    }

    getLifecycle(): ModelLifecycle {
        return this.lifecycle;
    }

    isReady(): boolean {
        return this.lifecycle === "READY" && this.loaded !== undefined;
    }

    private setLifecycle(next: ModelLifecycle): void {
        if (this.lifecycle === next) return;
        this.lifecycle = next;
        this.report(next);
    }

    /**
     * Ensure a model is loaded and return its generator. Idempotent: repeated
     * calls while loading share the in-flight promise; repeated calls once ready
     * return the cached generator without re-initialising.
     */
    async ensureModel(
        modelId: string | undefined,
        onProgress: ProgressFn
    ): Promise<LoadedModel> {
        if (this.disposed) {
            throw new Error("The AI model manager has been disposed.");
        }

        const profile = modelId ? getModelProfile(modelId) : undefined;
        if (modelId && !profile) {
            throw new Error(`Unknown model "${modelId}".`);
        }
        const target = profile ?? getDefaultModelProfile();

        // Reuse an already-loaded model if it matches the requested profile.
        if (this.loaded && this.loaded.profile.id === target.id) {
            return this.loaded;
        }

        // If something else is loading, wait for it; if it's a different model,
        // load the requested one after (we only keep one model resident).
        if (this.loading) {
            try {
                await this.loading;
            } catch {
                // Previous attempt failed; fall through and retry with `target`.
            }
            if (this.loaded && this.loaded.profile.id === target.id) {
                return this.loaded;
            }
        }

        this.loading = this.load(target, onProgress);
        try {
            const result = await this.loading;
            this.loaded = result;
            return result;
        } finally {
            this.loading = undefined;
        }
    }

    private async load(
        profile: ModelProfile,
        onProgress: ProgressFn
    ): Promise<LoadedModel> {
        const startedAt = now();

        // Decide backend. Prefer WebGPU only if an adapter exists; otherwise WASM.
        // If WebGPU has already failed on this device, skip probing/retrying it.
        let backend: ModelBackend = "wasm";
        if (!this.webGpuBroken) {
            try {
                if (await this.hasWebGpuAdapter()) {
                    backend = "webgpu";
                }
            } catch {
                backend = "wasm";
            }
        }

        const progress: ProgressFn = (update) => {
            this.report(update.lifecycle);
            onProgress(update);
        };

        try {
            const generator = await this.createGenerator(profile, backend, progress);
            this.setLifecycle("READY");
            return {
                profile,
                backend,
                generator,
                initMs: now() - startedAt,
            };
        } catch (primaryError) {
            // WebGPU failed — recover to WASM rather than surfacing failure, as
            // long as the primary attempt was on WebGPU. Remember the failure
            // so future loads skip WebGPU entirely.
            if (backend === "webgpu") {
                this.webGpuBroken = true;
                this.setLifecycle("RECOVERING");
                try {
                    const generator = await this.createGenerator(
                        profile,
                        "wasm",
                        progress
                    );
                    this.setLifecycle("READY");
                    return {
                        profile,
                        backend: "wasm",
                        generator,
                        initMs: now() - startedAt,
                    };
                } catch (wasmError) {
                    this.setLifecycle("FAILED");
                    throw new Error(
                        `The local AI model could not start. WebGPU: ${errorMessage(
                            primaryError
                        )} CPU: ${errorMessage(wasmError)}`,
                        { cause: wasmError }
                    );
                }
            }

            this.setLifecycle("FAILED");
            throw primaryError instanceof Error
                ? primaryError
                : new Error(String(primaryError));
        }
    }

    private async createGenerator(
        profile: ModelProfile,
        backend: ModelBackend,
        progress: ProgressFn
    ): Promise<TextGenerator> {
        this.setLifecycle("DOWNLOADING");

        const dtype =
            backend === "webgpu"
                ? profile.quantization.webgpu
                : profile.quantization.wasm;

        // Transformers.js is dynamically imported so its weight is code-split
        // and only fetched when AI is actually used.
        const generator = await this.loadPipeline(
            "text-generation",
            profile.hfModelId,
            {
                device: backend,
                dtype,
                progress_callback: (event) => {
                    const mapped = mapRuntimeProgress(event);
                    if (mapped) {
                        this.setLifecycle(mapped.lifecycle);
                        progress(mapped);
                    }
                },
            }
        );

        this.setLifecycle("LOADING");
        return generator;
    }

    /** Release the loaded model so a subsequent request re-initialises. */
    async dispose(): Promise<void> {
        this.disposed = true;
        const loaded = this.loaded;
        this.loaded = undefined;
        this.loading = undefined;
        this.setLifecycle("UNINITIALIZED");

        // Transformers.js pipelines expose dispose()/dispose? for cleanup.
        const disposable = loaded?.generator as
            | { dispose?: () => Promise<void> | void }
            | undefined;
        if (disposable && typeof disposable.dispose === "function") {
            try {
                await disposable.dispose();
            } catch {
                // Ignore teardown errors; the model is being dropped anyway.
            }
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/**
 * Map a Transformers.js progress event to our progress shape. The runtime emits
 * objects like `{ status: "progress", progress: 42 }`,
 * `{ status: "downloading" }`, `{ status: "ready" }`, etc.
 */
function mapRuntimeProgress(
    event: unknown
): { stage: "downloading" | "loading"; progress?: number; lifecycle: ModelLifecycle; message?: string } | null {
    if (typeof event !== "object" || event === null) {
        return null;
    }
    const status = Reflect.get(event, "status");
    const progress = Reflect.get(event, "progress");
    const file = Reflect.get(event, "file");

    if (status === "progress" && typeof progress === "number") {
        return {
            stage: "downloading",
            progress: Math.max(0, Math.min(100, Math.round(progress))),
            lifecycle: "DOWNLOADING",
            message: typeof file === "string" ? `Downloading ${file}` : undefined,
        };
    }

    if (status === "downloading") {
        return { stage: "downloading", lifecycle: "DOWNLOADING" };
    }

    if (status === "ready") {
        return { stage: "loading", lifecycle: "LOADING" };
    }

    return null;
}