/**
 * Generation configuration for the local drafting model.
 *
 * Tuned for ultra-fast, compact, plain-text drafting on small (~0.5B)
 * instruction models:
 *   - a very short, token-efficient system prompt that asks for a short title
 *     and a plain-text description of exactly two sentences with no Markdown,
 *   - greedy decoding for predictable, deterministic output,
 *   - a tight output-token budget (~90) sized for the JSON wrapper plus a
 *     two-sentence description,
 *   - minimal input context (column + a few labels/titles) so the prompt stays
 *     small and the model does not lose the thread.
 *
 * Values here are the single source of truth used by the worker and referenced
 * by the benchmark tool.
 */

import type { AiContext } from "./IAiService";

export const GENERATION_CONFIG = {
    /**
     * ~90 tokens fits the JSON wrapper (title, priority, storyPoints, labels) plus
     * a two-sentence description. Small models emit this well under the cap; the
     * cap mainly prevents runaway output. The parser normalises/condenses to
     * exactly two sentences and falls back on genuinely malformed output, so a
     * low cap is safe.
     */
    maxNewTokens: 90,
    /** Greedy decoding → deterministic, predictable, fast, no sampling cost. */
    doSample: false,
    /** Only used if sampling is ever enabled; kept for completeness. */
    temperature: 0.2,
    /** Return only the completion, not the prompt echo. */
    returnFullText: false,
} as const;

/**
 * Neural generation deadline (milliseconds).
 *
 * This bounds ONLY the actual model inference step (after the model is already
 * loaded), not the one-time model download/initialization. If generation does
 * not complete within this budget, the worker stops waiting, delivers the
 * heuristic fallback immediately, and safely discards any late model result so
 * the request never blocks the queue or the UI.
 */
export const GENERATION_DEADLINE_MS = 20_000;

/**
 * A short, token-efficient system prompt. It asks the model to return valid JSON
 * with a short title and a plain-text description of exactly two sentences (one
 * for the task, one for the expected outcome), forbids all Markdown, and forbids
 * invented technical detail. Deliberately terse to minimise prompt tokens.
 */
const SYSTEM_PROMPT = [
    "You are a project management assistant.",
    "Convert the user's request into a short work-item draft. Do not invent technical details.",
    'Return valid JSON only: {"title": "...", "description": "...", "priority": 1-4, "storyPoints": 1|2|3|5|8|13, "labels": ["..."]}.',
    "description must be exactly two plain-text sentences: the first explains the task, the second explains the expected outcome.",
    "No Markdown, headings, bullets, lists, tables, or code fences.",
].join("\n");

/**
 * Build the chat messages for a draft request. Context is trimmed to the minimum
 * that materially helps the draft: the target column and a few existing labels.
 * Existing task titles are dropped — they cost input tokens and rarely improve a
 * compact two-sentence draft.
 */
export function makeMessages(
    prompt: string,
    context?: AiContext
): { role: "system" | "user"; content: string }[] {
    const trimmedContext = context
        ? {
              ...(context.columnName ? { column: context.columnName } : {}),
              // Short slice: small models lose the thread with long lists, and
              // each extra label is pure input-token cost.
              existingLabels: context.existingLabels?.slice(0, 6),
          }
        : undefined;

    return [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "user",
            content: JSON.stringify({
                request: prompt.trim(),
                ...(trimmedContext ? { context: trimmedContext } : {}),
            }),
        },
    ];
}