import { describe, expect, it } from "vitest";

import {
    BENCHMARK_PROMPTS,
    summarizeBenchmark,
    listBenchmarkableProfiles,
    type BenchmarkResult,
} from "./aiBenchmark";

function makeResult(overrides: Partial<BenchmarkResult>): BenchmarkResult {
    return {
        prompt: "p",
        modelId: "m",
        backend: "wasm",
        initMs: 0,
        generationMs: 0,
        totalMs: 0,
        outputChars: 0,
        valid: true,
        fallback: false,
        validationNote: "parsed",
        ...overrides,
    };
}

describe("benchmark helpers", () => {
    it("exposes the fixed prompt set", () => {
        expect(BENCHMARK_PROMPTS.length).toBeGreaterThanOrEqual(10);
        expect(BENCHMARK_PROMPTS).toContain("Fix the cards.");
    });

    it("summarises results", () => {
        const summary = summarizeBenchmark([
            makeResult({ initMs: 100, generationMs: 200, totalMs: 300, fallback: false, valid: true }),
            makeResult({ initMs: 300, generationMs: 400, totalMs: 700, fallback: true, valid: false }),
        ]);

        expect(summary.count).toBe(2);
        expect(summary.avgInitMs).toBe(200);
        expect(summary.avgGenerationMs).toBe(300);
        expect(summary.avgTotalMs).toBe(500);
        expect(summary.fallbackCount).toBe(1);
        expect(summary.validCount).toBe(1);
    });

    it("handles an empty result set without dividing by zero", () => {
        const summary = summarizeBenchmark([]);
        expect(summary.count).toBe(0);
        expect(summary.avgTotalMs).toBe(0);
    });

    it("lists only verified selectable profiles", () => {
        const profiles = listBenchmarkableProfiles();
        expect(profiles.length).toBeGreaterThan(0);
        for (const p of profiles) {
            expect(p.verified).toBe(true);
        }
    });
});