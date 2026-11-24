import type {
    AiContext,
    AiDraft,
} from "./IAiService";
import type { ModelBackend } from "./modelRegistry";

/** Coarse lifecycle of the model inside the worker. Mirrors Phase 4. */
export type ModelLifecycle =
    | "UNINITIALIZED"
    | "DOWNLOADING"
    | "LOADING"
    | "READY"
    | "GENERATING"
    | "RECOVERING"
    | "FAILED";

/** Fine-grained generation stage reported to the UI (Phase 9). */
export type GenerationStage =
    | "preparing"
    | "downloading"
    | "loading"
    | "generating"
    | "validating"
    | "ready"
    | "failed";

export type LocalAiRequest =
    | {
        type: "draft";
        id: number;
        prompt: string;
        context?: AiContext;
        /** Optional model override for benchmarking / future switching. */
        modelId?: string;
    }
    | {
        type: "cancel";
        /** The request id to cancel. Omit to cancel the active request. */
        id?: number;
    }
    | {
        type: "dispose";
    };

export type LocalAiProgress = {
    stage: GenerationStage;
    /** 0–100 download percentage, when the runtime reports one. */
    progress?: number;
    /** Coarse lifecycle for diagnostics / model info UI. */
    lifecycle?: ModelLifecycle;
    message?: string;
};

export type LocalAiResultMeta = {
    modelId: string;
    backend: ModelBackend;
    initMs: number;
    generationMs: number;
    outputChars: number;
    fallback: boolean;
    /**
     * Why the heuristic fallback was used, when applicable (e.g. "timeout",
     * "model-unavailable", "invalid-output"). Absent for neural successes.
     */
    fallbackReason?: "timeout" | "model-unavailable" | "invalid-output";
};

export type LocalAiResponse =
    | {
        type: "progress";
        id: number;
        progress: LocalAiProgress;
    }
    | {
        type: "result";
        id: number;
        draft: AiDraft;
        /** True when the heuristic fallback produced this draft. */
        fallback?: boolean;
        /** Diagnostics for the benchmark tool. */
        meta?: LocalAiResultMeta;
    }
    | {
        type: "error";
        id: number;
        message: string;
    }
    | {
        type: "cancelled";
        id: number;
    };