import { describe, expect, it } from "vitest";

import {
    MODEL_REGISTRY,
    DEFAULT_MODEL_ID,
    getModelProfile,
    getDefaultModelProfile,
    getSelectableProfiles,
    formatBytes,
} from "./modelRegistry";

describe("model registry", () => {
    it("has a default model that exists and is verified", () => {
        const def = getDefaultModelProfile();
        expect(def.id).toBe(DEFAULT_MODEL_ID);
        expect(def.verified).toBe(true);
        expect(def.experimental).toBe(false);
    });

    it("every profile has required fields", () => {
        for (const profile of MODEL_REGISTRY) {
            expect(profile.id).toBeTruthy();
            expect(profile.displayName).toBeTruthy();
            expect(profile.hfModelId).toBeTruthy();
            expect(profile.license).toBeTruthy();
            expect(profile.quantization.webgpu).toBeTruthy();
            expect(profile.quantization.wasm).toBeTruthy();
            expect(profile.estimatedDownloadBytes).toBeGreaterThan(0);
        }
    });

    it("only returns verified, non-experimental profiles as selectable", () => {
        const selectable = getSelectableProfiles();
        expect(selectable.length).toBeGreaterThan(0);
        for (const profile of selectable) {
            expect(profile.verified).toBe(true);
            expect(profile.experimental).toBe(false);
        }
        // The default must be selectable.
        expect(selectable.some((p) => p.id === DEFAULT_MODEL_ID)).toBe(true);
    });

    it("getModelProfile returns undefined for unknown ids", () => {
        expect(getModelProfile("does-not-exist")).toBeUndefined();
    });

    it("getModelProfile finds a known id", () => {
        expect(getModelProfile(DEFAULT_MODEL_ID)?.id).toBe(DEFAULT_MODEL_ID);
    });
});

describe("formatBytes", () => {
    it("formats MB and GB", () => {
        expect(formatBytes(260_000_000)).toContain("MB");
        expect(formatBytes(1_400_000_000)).toContain("GB");
    });

    it("handles invalid input", () => {
        expect(formatBytes(0)).toBe("—");
        expect(formatBytes(-5)).toBe("—");
    });
});