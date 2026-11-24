/**
 * LocalAiService — main-thread bridge to the local AI worker (Phase 5 + 8).
 *
 * Responsibilities:
 *   - own the single Worker instance (lazy, recreated on crash),
 *   - correlate requests/responses by id,
 *   - enforce a per-request timeout that can never leave the worker wedged,
 *   - surface fine-grained progress to the UI,
 *   - expose cancellation.
 *
 * The actual model + fallback live in the worker. This class also exposes the
 * heuristic helpers (labels/priority/effort/dupes/assignee) directly, since
 * those are cheap and need no model.
 */

import type {
    AiContext,
    AiDraft,
    IAiService,
} from "./IAiService";
import { NoopAiService } from "./NoopAiService";
import type {
    LocalAiProgress,
    LocalAiRequest,
    LocalAiResponse,
    LocalAiResultMeta,
} from "./localAiProtocol";

export { parseAiDraft, parseAiDraftSafe } from "./parseAiDraft";

/**
 * Default ceiling for a full draft request. This intentionally covers the
 * one-time model DOWNLOAD + initialization (which can take minutes on a slow
 * connection) plus generation. It is NOT the neural generation deadline — that
 * is enforced separately and much more tightly inside the worker
 * (GENERATION_DEADLINE_MS, ~20s), after which the heuristic fallback is used
 * immediately. This outer timeout is only the last-resort safety net so the UI
 * never hangs forever if the worker dies mid-download.
 */
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export type DraftResult = {
    draft: AiDraft;
    fallback: boolean;
    meta?: LocalAiResultMeta;
};

type Pending = {
    resolve: (result: DraftResult) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: LocalAiProgress) => void;
    timer: ReturnType<typeof setTimeout> | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isLocalAiResponse(value: unknown): value is LocalAiResponse {
    if (!isRecord(value) || typeof value.id !== "number") {
        return false;
    }
    switch (value.type) {
        case "progress":
            return isRecord(value.progress);
        case "result":
            return isRecord(value.draft);
        case "error":
            return typeof value.message === "string";
        case "cancelled":
            return true;
        default:
            return false;
    }
}

export class LocalAiService implements IAiService {
    private readonly fallback = new NoopAiService();
    private worker: Worker | undefined;
    private nextRequestId = 1;
    private readonly pending = new Map<number, Pending>();

    /**
     * Optional worker factory, injectable for tests. When omitted, a real
     * module worker is created lazily.
     */
    private readonly workerFactory: () => Worker;

    constructor(workerFactory?: () => Worker) {
        this.workerFactory =
            workerFactory ??
            (() =>
                new Worker(new URL("./localAi.worker.ts", import.meta.url), {
                    type: "module",
                }) as Worker);
    }

    /**
     * Generate a draft. Resolves with metadata so callers (the dialog, the
     * benchmark tool) can show a fallback notice and diagnostics.
     */
    draftDetailed(
        prompt: string,
        context?: AiContext,
        onProgress?: (progress: LocalAiProgress) => void,
        options?: { modelId?: string; timeoutMs?: number }
    ): Promise<DraftResult> {
        if (!prompt.trim()) {
            return Promise.reject(
                new Error("Describe the work item you want to draft.")
            );
        }

        const id = this.nextRequestId++;
        const worker = this.getWorker();
        const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

        const request: LocalAiRequest = {
            type: "draft",
            id,
            prompt,
            ...(context ? { context } : {}),
            ...(options?.modelId ? { modelId: options.modelId } : {}),
        };

        return new Promise<DraftResult>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(id);
                reject(
                    new Error(
                        "The local AI model took too long to respond. Try again, or use a smaller model."
                    )
                );
            }, timeoutMs);

            this.pending.set(id, {
                resolve,
                reject,
                onProgress,
                timer,
            });

            try {
                worker.postMessage(request);
            } catch (error) {
                clearTimeout(timer);
                this.pending.delete(id);
                reject(
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        });
    }

    /** IAiService draft — resolves to just the draft (fallback-aware). */
    async draftFromPrompt(
        prompt: string,
        context?: AiContext,
        onProgress?: (progress: unknown) => void
    ): Promise<AiDraft> {
        const result = await this.draftDetailed(prompt, context, (progress) =>
            onProgress?.(progress)
        );
        return result.draft;
    }

    /** Cancel an in-flight request (or the active one when id is omitted). */
    cancel(id?: number): void {
        const worker = this.worker;
        if (!worker) return;

        if (id === undefined) {
            // Cancel all pending from the caller's perspective.
            for (const [pendingId, pending] of this.pending) {
                this.pending.delete(pendingId);
                if (pending.timer) clearTimeout(pending.timer);
                pending.reject(new Error("Draft request cancelled."));
            }
            worker.postMessage({ type: "cancel" } satisfies LocalAiRequest);
            return;
        }

        const pending = this.pending.get(id);
        if (pending) {
            this.pending.delete(id);
            if (pending.timer) clearTimeout(pending.timer);
            pending.reject(new Error("Draft request cancelled."));
        }
        worker.postMessage({ type: "cancel", id } satisfies LocalAiRequest);
    }

    /** Tear down the worker and free the model (e.g. when AI is disabled). */
    dispose(): void {
        const worker = this.worker;
        this.worker = undefined;
        if (!worker) return;
        try {
            worker.postMessage({ type: "dispose" } satisfies LocalAiRequest);
        } catch {
            // ignore
        }
        // Give the worker a tick to dispose the model, then terminate.
        setTimeout(() => worker.terminate(), 1000);
        this.failAll(new Error("The AI session was disposed."));
    }

    /* ---------------------------------------------------------------------- */
    /* Worker lifecycle                                                       */
    /* ---------------------------------------------------------------------- */

    private getWorker(): Worker {
        if (this.worker) {
            return this.worker;
        }

        const worker = this.workerFactory();

        worker.onmessage = (event: MessageEvent<unknown>) => {
            this.handleMessage(event.data);
        };

        worker.onerror = (event) => {
            event.preventDefault();
            this.failAll(
                new Error(
                    event.message || "The local AI worker stopped unexpectedly."
                )
            );
            this.resetWorker(worker);
        };

        worker.onmessageerror = () => {
            this.failAll(
                new Error("The local AI worker returned an unreadable response.")
            );
            this.resetWorker(worker);
        };

        this.worker = worker;
        return worker;
    }

    private resetWorker(worker: Worker): void {
        worker.terminate();
        if (this.worker === worker) {
            this.worker = undefined;
        }
    }

    private handleMessage(value: unknown): void {
        if (!isLocalAiResponse(value)) {
            this.failAll(
                new Error("The local AI worker returned an invalid response.")
            );
            if (this.worker) this.resetWorker(this.worker);
            return;
        }

        const pending = this.pending.get(value.id);
        if (!pending) {
            // Unknown id (e.g. a cancelled alias) — ignore safely.
            return;
        }

        switch (value.type) {
            case "progress": {
                pending.onProgress?.(value.progress);
                break;
            }
            case "result": {
                this.settle(value.id, pending);
                pending.resolve({
                    draft: value.draft,
                    fallback: Boolean(value.fallback),
                    ...(value.meta ? { meta: value.meta } : {}),
                });
                break;
            }
            case "cancelled": {
                this.settle(value.id, pending);
                pending.reject(new Error("Draft request cancelled."));
                break;
            }
            case "error": {
                this.settle(value.id, pending);
                pending.reject(new Error(value.message));
                break;
            }
            default:
                break;
        }
    }

    private settle(id: number, pending: Pending): void {
        this.pending.delete(id);
        if (pending.timer) clearTimeout(pending.timer);
    }

    private failAll(error: Error): void {
        for (const [id, pending] of this.pending) {
            this.pending.delete(id);
            if (pending.timer) clearTimeout(pending.timer);
            pending.reject(error);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Heuristic helpers (no model needed)                                    */
    /* ---------------------------------------------------------------------- */

    suggestLabels = this.fallback.suggestLabels.bind(this.fallback);
    detectDuplicates = this.fallback.detectDuplicates.bind(this.fallback);
    estimateEffort = this.fallback.estimateEffort.bind(this.fallback);
    recommendPriority = this.fallback.recommendPriority.bind(this.fallback);
    suggestAssignee = this.fallback.suggestAssignee.bind(this.fallback);
}

export const defaultAiService = new LocalAiService();