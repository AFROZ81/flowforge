import { describe, expect, it } from "vitest";

import {
    detectCapabilities,
    hasWebGpuAdapter,
    profileFitsDevice,
} from "./capabilityDetection";
import { getDefaultModelProfile } from "./modelRegistry";

describe("capability detection", () => {
    it("returns a well-formed report even without browser APIs", async () => {
        // In the node test environment there is no navigator.gpu; the report
        // must still be complete and conservative.
        const report = await detectCapabilities();
        expect(report.hasWebGpuApi).toBe(false);
        expect(report.recommendedBackend).toBe("wasm");
        expect(report.reason).toBeTruthy();
    });

    it("hasWebGpuAdapter is false without a GPU API", async () => {
        await expect(hasWebGpuAdapter()).resolves.toBe(false);
    });

    it("profileFitsDevice is permissive when device memory is unknown", () => {
        const profile = getDefaultModelProfile();
        const report = {
            hasWebGpuApi: false,
            hasWebGpuAdapter: false,
            hasWasm: true,
            crossOriginIsolated: false,
            constrainedDevice: false,
            recommendedBackend: "wasm" as const,
            reason: "test",
        };
        // deviceMemoryGb undefined → should not exclude.
        expect(profileFitsDevice(profile, report)).toBe(true);
    });

    it("profileFitsDevice excludes a profile on a too-small device", () => {
        const profile = getDefaultModelProfile(); // minDeviceMemoryGb = 2
        const report = {
            hasWebGpuApi: false,
            hasWebGpuAdapter: false,
            hasWasm: true,
            crossOriginIsolated: false,
            deviceMemoryGb: 1,
            constrainedDevice: true,
            recommendedBackend: "wasm" as const,
            reason: "test",
        };
        expect(profileFitsDevice(profile, report)).toBe(false);
    });
});