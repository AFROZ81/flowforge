/**
 * Capability detection — conservative, defensive probing of what the current
 * device + browser can actually do, so the model manager can choose a backend
 * that will work rather than one that merely "should".
 *
 * Rules (from the plan):
 *   - Never assume WebGPU support means the model will run.
 *   - Never assume device-memory APIs exist or are accurate.
 *   - Never force WebGPU if initialisation fails — callers fall back to WASM.
 */

import type { ModelBackend, ModelProfile } from "./modelRegistry";

export type CapabilityReport = {
    /** navigator.gpu exists and is callable. */
    hasWebGpuApi: boolean;
    /** A concrete GPU adapter could be obtained. Stronger signal than the API. */
    hasWebGpuAdapter: boolean;
    /** navigator.wasm is present (near-universal, but check anyway). */
    hasWasm: boolean;
    /** Cross-origin isolation (needed for SharedArrayBuffer / threads). */
    crossOriginIsolated: boolean;
    /** Device memory in GB if the (non-standard) API reports it, else undefined. */
    deviceMemoryGb?: number;
    /** Hardware concurrency if available, else undefined. */
    hardwareConcurrency?: number;
    /** Whether this looks like a small/weak device (conservative heuristic). */
    constrainedDevice: boolean;
    /** Recommended backend given the signals above. */
    recommendedBackend: ModelBackend;
    /** Short, human-readable explanation of the recommendation. */
    reason: string;
};

function isWebGpuApi(value: unknown): value is { requestAdapter: () => Promise<unknown> } {
    return (
        typeof value === "object" &&
        value !== null &&
        "requestAdapter" in value &&
        typeof (value as { requestAdapter: unknown }).requestAdapter === "function"
    );
}

/**
 * Probe for a usable WebGPU adapter. Returns false on any error — an adapter
 * request can reject for many reasons (blocklisted, no GPU, insecure context).
 */
export async function hasWebGpuAdapter(): Promise<boolean> {
    if (typeof navigator === "undefined") return false;

    const gpu = Reflect.get(navigator, "gpu");
    if (!isWebGpuApi(gpu)) return false;

    try {
        const adapter = await gpu.requestAdapter();
        return adapter !== null && adapter !== undefined;
    } catch {
        return false;
    }
}

function readDeviceMemory(): number | undefined {
    if (typeof navigator === "undefined") return undefined;
    const memory = Reflect.get(navigator, "deviceMemory");
    return typeof memory === "number" && Number.isFinite(memory) ? memory : undefined;
}

function readHardwareConcurrency(): number | undefined {
    if (typeof navigator === "undefined") return undefined;
    const cores = Reflect.get(navigator, "hardwareConcurrency");
    return typeof cores === "number" && Number.isFinite(cores) ? cores : undefined;
}

function readCrossOriginIsolated(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(Reflect.get(window, "crossOriginIsolated"));
}

/**
 * Detect capabilities. Safe to call repeatedly and in environments without
 * `navigator`/`window` (e.g. unit tests): everything degrades to "unknown".
 */
export async function detectCapabilities(): Promise<CapabilityReport> {
    const hasWebGpuApi =
        typeof navigator !== "undefined" && isWebGpuApi(Reflect.get(navigator, "gpu"));

    // Await the adapter probe even if the API is missing, for a stable shape.
    const webGpuAdapter = hasWebGpuApi ? await hasWebGpuAdapter() : false;
    const hasWasm = typeof WebAssembly !== "undefined";
    const crossOriginIsolated = readCrossOriginIsolated();
    const deviceMemoryGb = readDeviceMemory();
    const hardwareConcurrency = readHardwareConcurrency();

    const constrainedDevice =
        (deviceMemoryGb !== undefined && deviceMemoryGb <= 2) ||
        (hardwareConcurrency !== undefined && hardwareConcurrency <= 2);

    return buildReport({
        hasWebGpuApi,
        hasWebGpuAdapter: webGpuAdapter,
        hasWasm,
        crossOriginIsolated,
        deviceMemoryGb,
        hardwareConcurrency,
        constrainedDevice,
    });
}

function buildReport(
    input: Omit<CapabilityReport, "recommendedBackend" | "reason">
): CapabilityReport {
    const { hasWebGpuAdapter, hasWebGpuApi, hasWasm, constrainedDevice } = input;

    // Prefer WebGPU only when an adapter actually exists. A constrained device
    // can still use WebGPU, but we note it so the model manager can pick a
    // smaller profile.
    if (hasWebGpuAdapter) {
        return {
            ...input,
            recommendedBackend: "webgpu",
            reason: constrainedDevice
                ? "WebGPU adapter available; device is memory-constrained, prefer a small model."
                : "WebGPU adapter available; hardware-accelerated inference preferred.",
        };
    }

    if (hasWasm) {
        return {
            ...input,
            recommendedBackend: "wasm",
            reason: hasWebGpuApi
                ? "WebGPU API present but no adapter; falling back to WASM (CPU)."
                : "WebGPU unavailable; using WASM (CPU) inference.",
        };
    }

    return {
        ...input,
        recommendedBackend: "wasm",
        reason:
            "Neither WebGPU adapter nor WASM detected; WASM will be attempted and may fail.",
    };
}

/**
 * Whether a profile plausibly fits a device, given the capability report and
 * the profile's minimum memory hint. Conservative: if we don't know device
 * memory, we don't exclude — we let the model manager try and recover.
 */
export function profileFitsDevice(
    profile: ModelProfile,
    report: CapabilityReport
): boolean {
    if (profile.minDeviceMemoryGb === undefined) return true;
    if (report.deviceMemoryGb === undefined) return true;
    return report.deviceMemoryGb >= profile.minDeviceMemoryGb;
}