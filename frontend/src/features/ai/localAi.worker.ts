/**
 * Local AI worker (Phase 5 + 6).
 *
 * Runs entirely off the main thread. Owns a {@link ModelManager} (which owns the
 * loaded model) and serialises draft requests through a safe queue with
 * correlation ids, cancellation, and crash recovery.
 *
 * Design notes:
 *   - Only one generation runs at a time per model instance; the queue prevents
 *     concurrent generation on a single generator (which Transformers.js does
 *     not support).
 *   - Cancellation is cooperative: if the active request is cancelled mid-flight
 *     we stop forwarding progress and discard its result. The generator itself
 *     cannot be interrupted, so a cancelled request still finishes on the model,
 *     but the caller has already been resolved as "cancelled".
 *   - A crash (unhandled error) posts an error for every queued request so the
 *     main thread never hangs.
 */

import type { AiContext } from "./IAiService";
import { NoopAiService } from "./NoopAiService";
import { parseAiDraftSafe } from "./parseAiDraft";
import { makeMessages, GENERATION_CONFIG, GENERATION_DEADLINE_MS } from "./generationConfig";
import { raceWithDeadline } from "./generationDeadline";
import { ModelManager } from "./modelManager";
import type {
    LocalAiRequest,
    LocalAiResponse,
    GenerationStage,
    ModelLifecycle,
} from "./localAiProtocol";

type ChatMessage = { role: "system" | "user"; content: string };

/* -------------------------------------------------------------------------- */
/* WebGPU probe (mirrors capabilityDetection but worker-safe and sync-ish)     */
/* -------------------------------------------------------------------------- */

function isWebGpuApi(
    value: unknown
): value is { requestAdapter: () => Promise<unknown> } {
    return (
        typeof value === "object" &&
        value !== null &&
        "requestAdapter" in value &&
        typeof (value as { requestAdapter: unknown }).requestAdapter === "function"
    );
}

async function hasWebGpuAdapter(): Promise<boolean> {
    const gpu = Reflect.get(navigator, "gpu");
    if (!isWebGpuApi(gpu)) return false;
    try {
        const adapter = await gpu.requestAdapter();
        return adapter !== null && adapter !== undefined;
    } catch {
        return false;
    }
}

/* -------------------------------------------------------------------------- */
/* Model manager + dynamic pipeline loader                                    */
/* -------------------------------------------------------------------------- */

const manager = new ModelManager(
    async (task, modelId, options) => {
        const { pipeline } = await import("@huggingface/transformers");
        const generator = await pipeline(task, modelId, options);
        // Adapt the Transformers.js pipeline to our TextGenerator signature.
        return (messages: ChatMessage[], genOptions) =>
            (generator as unknown as (m: ChatMessage[], o: unknown) => Promise<unknown>)(
                messages,
                genOptions
            );
    },
    hasWebGpuAdapter,
    (lifecycle: ModelLifecycle) => {
        // Lifecycle changes are surfaced via the active request's progress.
        if (activeRequestId !== null) {
            post({
                type: "progress",
                id: activeRequestId,
                progress: lifecycleToProgress(lifecycle),
            });
        }
    }
);

const heuristic = new NoopAiService();

/* -------------------------------------------------------------------------- */
/* Queue state                                                                */
/* -------------------------------------------------------------------------- */

type QueuedRequest = {
    id: number;
    prompt: string;
    context?: AiContext;
    modelId?: string;
    cancelled: boolean;
};

let activeRequestId: number | null = null;
let activeRequest: QueuedRequest | null = null;
const queue: QueuedRequest[] = [];
let processing = false;
/**
 * The currently-running generator promise (if any). Transformers.js cannot run
 * concurrent generation on one pipeline, so even after a request times out and
 * we fall back, the next request waits for the abandoned generator to settle
 * before starting its own generation. This keeps inference serialized without
 * blocking the user (they already received the fallback).
 */
let activeGeneration: Promise<unknown> | null = null;

function post(message: LocalAiResponse): void {
    self.postMessage(message);
}

function lifecycleToProgress(lifecycle: ModelLifecycle): {
    stage: GenerationStage;
    lifecycle: ModelLifecycle;
} {
    switch (lifecycle) {
        case "DOWNLOADING":
            return { stage: "downloading", lifecycle };
        case "LOADING":
        case "RECOVERING":
            return { stage: "loading", lifecycle };
        case "GENERATING":
            return { stage: "generating", lifecycle };
        case "READY":
            return { stage: "generating", lifecycle };
        case "FAILED":
            return { stage: "failed", lifecycle };
        default:
            return { stage: "preparing", lifecycle };
    }
}

function enqueue(request: LocalAiRequest & { type: "draft" }): void {
    // Request deduplication: if an identical request is already queued or active,
    // reuse it by resolving the newcomer from the same result is complex; instead
    // we coalesce only identical *queued* requests to avoid redundant work.
    const signature = `${request.prompt}||${request.context?.columnName ?? ""}`;
    const duplicate = queue.find(
        (q) => `${q.prompt}||${q.context?.columnName ?? ""}` === signature
    );
    if (duplicate) {
        // Attach the new id as an alias by resolving it with the same outcome.
        // Simplest correct behaviour: treat as a fresh request but immediately
        // share the duplicate's slot result when it completes. We do this by
        // keeping both ids and emitting to both on completion.
        duplicateAliases.set(request.id, duplicate.id);
        return;
    }

    queue.push({
        id: request.id,
        prompt: request.prompt,
        context: request.context,
        modelId: request.modelId,
        cancelled: false,
    });
    void processQueue();
}

/**
 * Alias map: newer request id -> the id of the in-flight/queued request it
 * duplicates. When the canonical request finishes, we also answer the aliases.
 */
const duplicateAliases = new Map<number, number>();

async function processQueue(): Promise<void> {
    if (processing) return;
    processing = true;

    try {
        while (queue.length > 0) {
            // Drop cancelled entries at the head.
            while (queue.length > 0 && queue[0].cancelled) {
                const dropped = queue.shift()!;
                respondCancelled(dropped.id);
            }
            if (queue.length === 0) break;

            const request = queue.shift()!;
            await runRequest(request);
        }
    } catch (error) {
        // A crash in the loop: fail everything still pending so the UI recovers.
        const message = errorMessage(error);
        if (activeRequestId !== null) {
            post({ type: "error", id: activeRequestId, message });
            activeRequestId = null;
            activeRequest = null;
        }
        for (const queued of queue.splice(0)) {
            post({ type: "error", id: queued.id, message });
        }
    } finally {
        processing = false;
        activeRequestId = null;
        activeRequest = null;
    }
}

async function runRequest(request: QueuedRequest): Promise<void> {
    if (request.cancelled) {
        respondCancelled(request.id);
        return;
    }

    activeRequestId = request.id;
    activeRequest = request;
    const startedAt = now();

    try {
        if (!request.prompt.trim()) {
            throw new Error("Describe the work item you want to draft.");
        }

        post({
            type: "progress",
            id: request.id,
            progress: { stage: "preparing", lifecycle: manager.getLifecycle() },
        });

        const loaded = await manager.ensureModel(
            request.modelId,
            (update) => {
                // Ignore progress if this request was cancelled meanwhile.
                if (!activeRequest || activeRequest.id !== request.id) return;
                if (request.cancelled) return;
                post({
                    type: "progress",
                    id: request.id,
                    progress: {
                        stage: update.stage,
                        progress: update.progress,
                        lifecycle: update.lifecycle,
                        message: update.message,
                    },
                });
            }
        );

        if (request.cancelled || activeRequest?.id !== request.id) {
            respondCancelled(request.id);
            return;
        }

        const genStart = now();
        // Serialize inference: wait for any prior (possibly abandoned) generator
        // to settle so we never run two generations on one pipeline. This does
        // not block the user — their request already has its fallback if a prior
        // one timed out — it only delays the next neural attempt.
        if (activeGeneration) {
            try {
                await activeGeneration;
            } catch {
                // Prior generation failed; ignore and proceed.
            }
        }

        // Race the (uninterruptible) generator against a hard deadline. The
        // generator cannot be cancelled mid-flight, so on timeout we abandon the
        // wait, mark this request as timed out, and fall back immediately. Any
        // late result is discarded safely by the stale-request guard below.
        const timedOut = { value: false };
        const generationPromise = loaded.generator(
            makeMessages(request.prompt, request.context),
            {
                max_new_tokens: GENERATION_CONFIG.maxNewTokens,
                do_sample: GENERATION_CONFIG.doSample,
                temperature: GENERATION_CONFIG.temperature,
                return_full_text: GENERATION_CONFIG.returnFullText,
            }
        );
        activeGeneration = generationPromise;
        const output = await raceWithDeadline(
            generationPromise,
            GENERATION_DEADLINE_MS,
            () => {
                timedOut.value = true;
            }
        );
        // Only clear the active-generation marker if we actually have the real
        // result (success or error). On timeout the generator is still running
        // in the background; leave `activeGeneration` set so the next request
        // waits for it to settle (preventing concurrent generation on one
        // pipeline). The abandoned promise's eventual settlement clears itself
        // via the `.finally` below.
        if (!timedOut.value) {
            activeGeneration = null;
        } else {
            // Attach a no-op handler so the abandoned promise's eventual
            // settlement is observed and `activeGeneration` is cleared for
            // future requests. The rejection (if any) is swallowed here so it
            // never surfaces as an unhandled rejection.
            generationPromise.then(
                () => {
                    if (activeGeneration === generationPromise) {
                        activeGeneration = null;
                    }
                },
                () => {
                    if (activeGeneration === generationPromise) {
                        activeGeneration = null;
                    }
                }
            );
        }
        const generationMs = now() - genStart;

        if (timedOut.value) {
            // Neural generation exceeded the deadline → fallback now. The late
            // generator promise is already isolated; we never await it again.
            finishWithFallback(
                request,
                startedAt,
                "Generation exceeded the time limit.",
                "timeout"
            );
            return;
        }

        if (request.cancelled || activeRequest?.id !== request.id) {
            respondCancelled(request.id);
            return;
        }

        // Validate.
        post({
            type: "progress",
            id: request.id,
            progress: { stage: "validating", lifecycle: "GENERATING" },
        });
        const text = extractText(output);
        const parsed = parseAiDraftSafe(text);

        if (parsed.ok) {
            finishWithResult(request.id, parsed.draft, false, {
                modelId: loaded.profile.id,
                backend: loaded.backend,
                initMs: Math.round(loaded.initMs),
                generationMs: Math.round(generationMs),
                outputChars: text.length,
                fallback: false,
            });
        } else {
            // Neural output unusable → heuristic fallback (Phase 8).
            finishWithFallback(request, startedAt, parsed.reason);
        }
    } catch (error) {
        if (request.cancelled || activeRequest?.id !== request.id) {
            respondCancelled(request.id);
            return;
        }
        // Any model/init/generation failure → heuristic fallback.
        finishWithFallback(request, startedAt, errorMessage(error));
    }
}

function finishWithFallback(
    request: QueuedRequest,
    startedAt: number,
    reason: string,
    fallbackReason: import("./localAiProtocol").LocalAiResultMeta["fallbackReason"] = "model-unavailable"
): void {
    void heuristic
        .draftFromPrompt(request.prompt, request.context)
        .then((draft) => {
            finishWithResult(request.id, draft, true, {
                modelId: activeRequest?.modelId ?? "heuristic",
                backend: "wasm",
                initMs: 0,
                generationMs: Math.round(now() - startedAt),
                outputChars: draft.description.length,
                fallback: true,
                fallbackReason,
            });
        })
        .catch((fallbackError) => {
            post({
                type: "error",
                id: request.id,
                message:
                    "The local AI model failed and the fallback draft could not be generated. " +
                    errorMessage(fallbackError),
            });
        });
    void reason;
}

function finishWithResult(
    id: number,
    draft: import("./IAiService").AiDraft,
    fallback: boolean,
    meta: import("./localAiProtocol").LocalAiResultMeta
): void {
    post({ type: "result", id, draft, fallback, meta });
    // Resolve any deduplicated aliases with the same result.
    for (const [aliasId, canonicalId] of duplicateAliases) {
        if (canonicalId === id) {
            post({ type: "result", id: aliasId, draft, fallback, meta });
            duplicateAliases.delete(aliasId);
        }
    }
    if (activeRequestId === id) {
        activeRequestId = null;
        activeRequest = null;
    }
}

function respondCancelled(id: number): void {
    post({ type: "cancelled", id });
    for (const [aliasId, canonicalId] of duplicateAliases) {
        if (canonicalId === id) {
            post({ type: "cancelled", id: aliasId });
            duplicateAliases.delete(aliasId);
        }
    }
    if (activeRequestId === id) {
        activeRequestId = null;
        activeRequest = null;
    }
}

/* -------------------------------------------------------------------------- */
/* Text extraction (tolerant of different pipeline output shapes)             */
/* -------------------------------------------------------------------------- */

function extractText(output: unknown): string {
    if (Array.isArray(output) && output.length > 0) {
        const first = output[0];
        if (typeof first === "object" && first !== null) {
            const record = first as Record<string, unknown>;
            const generated = record.generated_text ?? record.text;
            const text = coerceText(generated);
            if (text) return text;
        }
        if (typeof first === "string") return first;
    }
    const direct = coerceText(output);
    if (direct) return direct;
    throw new Error("The local AI model returned an empty response. Please try again.");
}

function coerceText(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        const last = value[value.length - 1];
        if (typeof last === "object" && last !== null) {
            const content = (last as Record<string, unknown>).content;
            if (typeof content === "string") return content;
        }
    }
    return "";
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/* -------------------------------------------------------------------------- */
/* Message handling                                                           */
/* -------------------------------------------------------------------------- */

self.addEventListener("message", (event: MessageEvent<LocalAiRequest>) => {
    const request = event.data;
    if (!request || typeof request !== "object") return;

    switch (request.type) {
        case "draft": {
            enqueue(request);
            break;
        }
        case "cancel": {
            const targetId = request.id ?? activeRequestId;
            if (targetId === null || targetId === undefined) break;

            if (activeRequestId === targetId && activeRequest) {
                activeRequest.cancelled = true;
                // We cannot interrupt the generator, but we stop treating the
                // request as live so its eventual result is discarded.
                respondCancelled(targetId);
                break;
            }

            const queued = queue.find((q) => q.id === targetId);
            if (queued) {
                queued.cancelled = true;
                respondCancelled(targetId);
            }
            break;
        }
        case "dispose": {
            queue.splice(0).forEach((q) => respondCancelled(q.id));
            void manager.dispose();
            break;
        }
        default:
            break;
    }
});