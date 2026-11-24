/**
 * AI benchmark tool (Phase 10) — developer-facing.
 *
 * Runs the local drafting pipeline against a fixed set of prompts and records
 * timing, output length, validation result, fallback usage, and backend. Intended
 * to be called from the browser dev console (or a dev-only panel), NOT surfaced
 * to normal users. It never sends prompts anywhere — everything runs locally.
 *
 * Usage (dev console):
 *   const { runAiBenchmark } = await import("/src/features/ai/aiBenchmark.ts");
 *   console.table(await runAiBenchmark({ modelId: "qwen2.5-0.5b-instruct" }));
 */

import { defaultAiService } from "./LocalAiService";
import { parseAiDraftSafe } from "./parseAiDraft";
import {
    DEFAULT_MODEL_ID,
    getModelProfile,
    getSelectableProfiles,
    type ModelProfile,
} from "./modelRegistry";
import type { LocalAiResultMeta } from "./localAiProtocol";

/** Fixed prompt set for reproducible comparisons. */
export const BENCHMARK_PROMPTS: readonly string[] = [
    "Fix the cards.",
    "Add dark mode to settings.",
    "Fix login on mobile.",
    "Implement task pagination.",
    "Add assignment notifications.",
    "Refactor dashboard performance.",
    "Add authentication unit tests.",
    "Create task filtering API.",
    "Add profile picture uploads.",
    "Improve board accessibility.",
];

export type BenchmarkResult = {
    prompt: string;
    modelId: string;
    backend: string;
    initMs: number;
    generationMs: number;
    totalMs: number;
    outputChars: number;
    valid: boolean;
    fallback: boolean;
    validationNote: string;
    error?: string;
    /** Optional memory hint if the runtime exposed one (often undefined). */
    resourceHint?: string;
};

export type BenchmarkOptions = {
    /** Model id to benchmark; defaults to the app's current default. */
    modelId?: string;
    /** Per-prompt timeout in ms. */
    timeoutMs?: number;
    /** Limit prompts for a quick run. */
    limit?: number;
    /** Called after each prompt completes (for streaming results to a UI). */
    onResult?: (result: BenchmarkResult) => void;
};

function now(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

async function measurePrompt(
    prompt: string,
    modelId: string,
    timeoutMs: number
): Promise<BenchmarkResult> {
    const startedAt = now();
    const base: BenchmarkResult = {
        prompt,
        modelId,
        backend: "—",
        initMs: 0,
        generationMs: 0,
        totalMs: 0,
        outputChars: 0,
        valid: false,
        fallback: false,
        validationNote: "",
    };

    try {
        const result = await defaultAiService.draftDetailed(prompt, undefined, undefined, {
            modelId,
            timeoutMs,
        });

        const meta: LocalAiResultMeta | undefined = result.meta;
        const validation = parseAiDraftSafe(result.draft.description);

        return {
            ...base,
            backend: meta?.backend ?? "—",
            initMs: meta?.initMs ?? 0,
            generationMs: meta?.generationMs ?? 0,
            totalMs: Math.round(now() - startedAt),
            outputChars: meta?.outputChars ?? result.draft.description.length,
            valid: validation.ok,
            fallback: result.fallback,
            validationNote: validation.ok
                ? "parsed"
                : `unparsed: ${validation.reason}`,
        };
    } catch (error) {
        return {
            ...base,
            totalMs: Math.round(now() - startedAt),
            valid: false,
            validationNote: "request failed",
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Run the benchmark across the fixed prompt set (or a subset). Returns an array
 * of per-prompt results plus a small summary via {@link summarizeBenchmark}.
 */
export async function runAiBenchmark(
    options: BenchmarkOptions = {}
): Promise<BenchmarkResult[]> {
    const modelId = options.modelId ?? DEFAULT_MODEL_ID;
    const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
    const prompts = options.limit
        ? BENCHMARK_PROMPTS.slice(0, options.limit)
        : BENCHMARK_PROMPTS;

    const results: BenchmarkResult[] = [];
    for (const prompt of prompts) {
        const result = await measurePrompt(prompt, modelId, timeoutMs);
        results.push(result);
        options.onResult?.(result);
    }
    return results;
}

export type BenchmarkSummary = {
    modelId: string;
    count: number;
    avgInitMs: number;
    avgGenerationMs: number;
    avgTotalMs: number;
    fallbackCount: number;
    validCount: number;
};

export function summarizeBenchmark(
    results: BenchmarkResult[]
): BenchmarkSummary {
    const count = results.length || 1;
    const sum = (pick: (r: BenchmarkResult) => number) =>
        results.reduce((acc, r) => acc + pick(r), 0);

    return {
        modelId: results[0]?.modelId ?? DEFAULT_MODEL_ID,
        count: results.length,
        avgInitMs: Math.round(sum((r) => r.initMs) / count),
        avgGenerationMs: Math.round(sum((r) => r.generationMs) / count),
        avgTotalMs: Math.round(sum((r) => r.totalMs) / count),
        fallbackCount: results.filter((r) => r.fallback).length,
        validCount: results.filter((r) => r.valid).length,
    };
}

/**
 * Compare multiple candidate models sequentially. Downloads happen lazily per
 * model (only when first used), so this can be expensive — intended for dev use.
 */
export async function compareModels(
    modelIds: string[],
    options: Omit<BenchmarkOptions, "modelId"> = {}
): Promise<Record<string, { results: BenchmarkResult[]; summary: BenchmarkSummary }>> {
    const output: Record<string, { results: BenchmarkResult[]; summary: BenchmarkSummary }> = {};
    for (const modelId of modelIds) {
        const profile = getModelProfile(modelId);
        if (!profile || !profile.verified) {
            continue; // only benchmark selectable/verified profiles
        }
        const results = await runAiBenchmark({ ...options, modelId });
        output[modelId] = { results, summary: summarizeBenchmark(results) };
    }
    return output;
}

/** List profiles suitable for benchmarking (verified, selectable). */
export function listBenchmarkableProfiles(): ModelProfile[] {
    return getSelectableProfiles();
}