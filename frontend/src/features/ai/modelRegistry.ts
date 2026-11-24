/**
 * Model registry — the single source of truth for which local models FlowForge
 * knows how to run, and how to run them.
 *
 * Design goals (see Essentials/AI 2.0 plan):
 *   - Centralise every model profile so switching models is a data change, not a
 *     code change scattered across the worker.
 *   - Only mark a profile `verified` once its exact ONNX artifacts and runtime
 *     compatibility have been confirmed. Unverified profiles are catalogued for
 *     benchmarking / future work but are NOT selectable by normal users.
 *   - Never auto-download models. The registry describes them; the model manager
 *     decides when (and whether) to fetch weights.
 */

/** Inference backend / device a profile prefers. */
export type ModelBackend = "webgpu" | "wasm";

/** dtype strings accepted by Transformers.js `pipeline()` for text-generation. */
export type ModelDtype =
    | "auto"
    | "q4f16"
    | "q4"
    | "fp32"
    | "fp16"
    | "q8"
    | "int8"
    | "uint8";

/** Quantisation ladder a profile supports, per backend. */
export type ModelQuantization = {
    /** dtype string passed to Transformers.js on WebGPU (e.g. "q4f16"). */
    webgpu: ModelDtype;
    /** dtype string passed to Transformers.js on WASM (e.g. "q4"). */
    wasm: ModelDtype;
};

export type ModelProfile = {
    /** Stable id used in storage, telemetry-free logs, and the benchmark tool. */
    id: string;
    /** Human-facing name. */
    displayName: string;
    /** Hugging Face repo id (ONNX export) fed to `pipeline()`. */
    hfModelId: string;
    /** Where the model is hosted / its project page (for attribution + licenses). */
    sourceUrl: string;
    /** SPDX-style license identifier (review before shipping a default). */
    license: string;
    /** Backend preference hint; actual backend is chosen by capability detection. */
    preferredBackend: ModelBackend;
    /** Quantisation settings per backend. */
    quantization: ModelQuantization;
    /** Rough download size in bytes for the preferred quant (used for UI + budgeting). */
    estimatedDownloadBytes: number;
    /** Whether the ONNX artifacts + runtime path have been verified to work. */
    verified: boolean;
    /** Experimental profiles are hidden from normal model switching. */
    experimental: boolean;
    /** Soft minimum device memory (GB) recommended for this profile, if known. */
    minDeviceMemoryGb?: number;
    /** Free-form capability notes shown in the (developer) benchmark/model info UI. */
    notes: string;
};

/**
 * Candidate profiles.
 *
 * Verified = we have confirmed an ONNX export consumable by the installed
 * Transformers.js runtime for the task. SmolLM2 and Qwen2.5 ship official
 * `onnx-community` exports and are known-good. The larger/newer candidates
 * (Qwen3, Llama 3.2, Gemma 3) are catalogued as experimental because their
 * browser-ready ONNX exports / licenses have not been validated here.
 */
export const MODEL_REGISTRY: readonly ModelProfile[] = [
    {
        id: "qwen2.5-0.5b-instruct",
        displayName: "Qwen2.5 0.5B Instruct",
        hfModelId: "onnx-community/Qwen2.5-0.5B-Instruct",
        sourceUrl:
            "https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct",
        license: "Apache-2.0",
        preferredBackend: "webgpu",
        quantization: { webgpu: "q4f16", wasm: "q4" },
        // ~0.5B params at 4-bit ≈ 350–400 MB; refine from benchmark measurements.
        estimatedDownloadBytes: 380_000_000,
        verified: true,
        experimental: false,
        minDeviceMemoryGb: 2,
        notes:
            "Baseline model. Solid instruction-following for its size; good balance of quality and footprint.",
    },
    {
        id: "smollm2-360m-instruct",
        displayName: "SmolLM2 360M Instruct",
        hfModelId: "onnx-community/SmolLM2-360M-ONNX",
        sourceUrl: "https://huggingface.co/onnx-community/SmolLM2-360M-ONNX",
        license: "Apache-2.0",
        preferredBackend: "webgpu",
        quantization: { webgpu: "q4f16", wasm: "q4" },
        // ~260 MB q4f16 per published measurements.
        estimatedDownloadBytes: 260_000_000,
        verified: true,
        experimental: false,
        minDeviceMemoryGb: 1.5,
        notes:
            "Smallest verified option. Fastest download and lowest memory; lighter reasoning than Qwen2.5.",
    },
    {
        id: "qwen3-0.6b",
        displayName: "Qwen3 0.6B",
        hfModelId: "onnx-community/Qwen3-0.6B",
        sourceUrl: "https://huggingface.co/onnx-community/Qwen3-0.6B",
        license: "Apache-2.0",
        preferredBackend: "webgpu",
        quantization: { webgpu: "q4f16", wasm: "q4" },
        estimatedDownloadBytes: 450_000_000,
        // NOT verified: browser ONNX export / runtime path unconfirmed here.
        verified: false,
        experimental: true,
        minDeviceMemoryGb: 2,
        notes:
            "Experimental. Verify an ONNX export consumable by Transformers.js before enabling.",
    },
    {
        id: "llama-3.2-1b-instruct",
        displayName: "Llama 3.2 1B Instruct",
        hfModelId: "onnx-community/Llama-3.2-1B-Instruct",
        sourceUrl:
            "https://huggingface.co/onnx-community/Llama-3.2-1B-Instruct",
        license: "Llama-3.2-Community",
        preferredBackend: "webgpu",
        quantization: { webgpu: "q4f16", wasm: "q4" },
        estimatedDownloadBytes: 700_000_000,
        verified: false,
        experimental: true,
        minDeviceMemoryGb: 3,
        notes:
            "Experimental. Larger footprint; custom (non-OSI) license — review redistribution terms before shipping.",
    },
    {
        id: "gemma-3-1b",
        displayName: "Gemma 3 1B",
        hfModelId: "onnx-community/gemma-3-1b-it-ONNX",
        sourceUrl: "https://huggingface.co/onnx-community/gemma-3-1b-it-ONNX",
        license: "Gemma-Terms",
        preferredBackend: "webgpu",
        quantization: { webgpu: "q4f16", wasm: "q4" },
        estimatedDownloadBytes: 720_000_000,
        verified: false,
        experimental: true,
        minDeviceMemoryGb: 3,
        notes:
            "Experimental. Custom Gemma terms; verify ONNX export and license before shipping.",
    },
] as const;

/** The model used when the user has not chosen one. Always a verified profile. */
export const DEFAULT_MODEL_ID = "qwen2.5-0.5b-instruct";

const REGISTRY_BY_ID = new Map(MODEL_REGISTRY.map((m) => [m.id, m]));

export function getModelProfile(id: string): ModelProfile | undefined {
    return REGISTRY_BY_ID.get(id);
}

export function getDefaultModelProfile(): ModelProfile {
    const profile = REGISTRY_BY_ID.get(DEFAULT_MODEL_ID);
    if (!profile) {
        // The registry is static; this should be impossible.
        throw new Error(`Default model "${DEFAULT_MODEL_ID}" is not registered.`);
    }
    return profile;
}

/** Profiles a normal user may pick: verified and not experimental. */
export function getSelectableProfiles(): ModelProfile[] {
    return MODEL_REGISTRY.filter((m) => m.verified && !m.experimental);
}

/** Human-readable size for a byte count (e.g. "380 MB"). */
export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    const mb = bytes / 1_000_000;
    if (mb >= 1000) return `${(mb / 1000).toFixed(2)} GB`;
    return `${Math.round(mb)} MB`;
}