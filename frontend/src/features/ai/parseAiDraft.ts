/**
 * Robust draft parser (Phase 7).
 *
 * Small local models are inconsistent: they wrap output in fences, emit JSON
 * with trailing commas, drift into labeled text, or omit optional fields. This
 * parser accepts all of those shapes, normalises the result, and supplies safe
 * defaults for optional fields. It rejects output only when it is genuinely
 * unusable (no title and no description).
 *
 * It never uses eval or dynamic code execution — all parsing is JSON.parse plus
 * conservative regex/string handling.
 */

import type { AiDraft } from "./IAiService";

export type ParseResult =
    | { ok: true; draft: AiDraft }
    | { ok: false; reason: string };

const FIBONACCI = new Set([0, 1, 2, 3, 5, 8, 13, 21]);

const PRIORITY_WORDS: Record<string, number> = {
    low: 1,
    medium: 2,
    normal: 2,
    high: 3,
    urgent: 3,
    critical: 4,
    blocker: 4,
};

function clampPriority(input: unknown): number {
    const numeric = Number(input);
    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) {
        return numeric;
    }
    if (typeof input === "string") {
        const word = PRIORITY_WORDS[input.trim().toLowerCase()];
        if (word) return word;
        const match = input.match(/\b[1-4]\b/);
        if (match) return Number(match[0]);
    }
    return 2; // default medium
}

function normalizeStoryPoints(input: unknown): number | undefined {
    const numeric = Number(input);
    if (Number.isInteger(numeric) && FIBONACCI.has(numeric)) {
        return numeric;
    }
    if (typeof input === "string") {
        const match = input.match(/\b(1|2|3|5|8|13|21)\b/);
        if (match) {
            const value = Number(match[1]);
            if (FIBONACCI.has(value)) return value;
        }
    }
    return undefined;
}

function normalizeLabels(input: unknown): string[] {
    if (Array.isArray(input)) {
        return input
            .filter((label): label is string => typeof label === "string")
            .map((label) => label.trim())
            .filter(Boolean)
            .slice(0, 8);
    }
    if (typeof input === "string") {
        return input
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean)
            .slice(0, 8);
    }
    return [];
}

function asString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function stripCodeFences(text: string): string {
    return text
        .replace(/```(?:json|text|markdown)?\s*/gi, "")
        .replace(/```/g, "")
        .trim();
}

/**
 * Normalise a model-produced description into clean plain text for a textarea.
 *
 * Removes Markdown decorations the model may still emit (headings, bold/italic
 * markers, inline code, blockquote/table pipes, bullet/numbered prefixes), then
 * condenses the result to exactly two meaningful plain-text sentences so every
 * draft matches FlowForge's compact format.
 */
export function normalizeDescription(raw: string): string {
    const plain = stripMarkdown(raw);
    return condenseToTwoSentences(plain);
}

/** Strip common Markdown decorations without destroying meaningful text. */
function stripMarkdown(text: string): string {
    return text
        .replace(/\r\n?/g, "\n")
        // Remove fenced code blocks (already handled upstream, belt-and-braces).
        .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
        // Headings: "## Title" / "# Title" → "Title".
        .replace(/^[ \t]*#{1,6}[ \t]*/gm, "")
        // Bold/italic/strike markers.
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/~~(.*?)~~/g, "$1")
        // Inline code backticks.
        .replace(/`([^`]*)`/g, "$1")
        // Blockquote markers.
        .replace(/^[ \t]*>[ \t]?/gm, "")
        // Horizontal rules.
        .replace(/^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, "")
        // Collapse 3+ blank lines to one.
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * Reduce a plain-text description to exactly two meaningful sentences.
 *
 * Steps:
 *   1. Turn the text into a flat list of "units" (paragraphs, bullet/numbered
 *      points, or sentences) with Markdown markers removed.
 *   2. If more than two units exist, merge the tail into the second unit so no
 *      content is dropped.
 *   3. Ensure the two units read as sentences (terminal punctuation).
 *
 * This preserves meaning and never merely truncates.
 */
function condenseToTwoSentences(text: string): string {
    const units = toSentenceUnits(text);

    if (units.length === 0) {
        return "Implement the requested change as described. Verify the result behaves as expected.";
    }

    if (units.length === 1) {
        return [ensureSentence(units[0]), "Verify the result behaves as expected."].join(
            " "
        );
    }

    const first = ensureSentence(units[0]);
    // Merge the tail into a single second sentence: strip terminal punctuation
    // from all but the last unit so the result is one sentence, not many.
    const tail = mergeIntoSentence(units.slice(1));
    return `${first} ${tail}`;
}

/**
 * Join several units into one grammatical sentence. Terminal punctuation is
 * stripped from every unit except the last, which is ensured to end with one.
 */
function mergeIntoSentence(units: string[]): string {
    const cleaned = units
        .map((unit) => unit.replace(/\s+/g, " ").trim())
        .filter(Boolean);
    if (cleaned.length === 0) {
        return "Verify the result behaves as expected.";
    }
    const stripped = cleaned.map((unit, index) =>
        index < cleaned.length - 1 ? unit.replace(/[.!?]+$/, "") : unit
    );
    return ensureSentence(stripped.join("; "));
}

/**
 * Split plain text into candidate sentence/point units. Bulleted and numbered
 * lines are treated as separate units (markers stripped); otherwise sentences
 * are split on terminal punctuation; otherwise paragraphs/lines become units.
 */
function toSentenceUnits(text: string): string[] {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const units: string[] = [];
    for (const line of lines) {
        // Bullet or numbered point → one unit, marker stripped.
        const stripped = line.replace(/^(?:[-*+]|\d+[.)])\s+/, "").trim();
        if (!stripped) continue;

        if (stripped === line) {
            // Not a bullet/numbered line: split into sentences.
            const sentences = stripped
                .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
                .map((s) => s.trim())
                .filter(Boolean);
            for (const sentence of sentences) {
                units.push(sentence);
            }
        } else {
            units.push(stripped);
        }
    }

    return units;
}

/** Ensure a string reads as a sentence (ends with terminal punctuation). */
function ensureSentence(text: string): string {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) return trimmed;
    return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/**
 * Attempt to extract a JSON object from the text, tolerating fenced JSON and
 * common recoverable issues (trailing commas). Returns the parsed record or null.
 */
function extractJsonObject(text: string): Record<string, unknown> | null {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const candidate =
        fenced ?? (start >= 0 && end > start ? text.slice(start, end + 1) : "");
    if (!candidate) return null;

    // First try strict parse.
    const strict = tryParse(candidate);
    if (strict) return strict;

    // Recover: strip trailing commas before } or ].
    const repaired = candidate.replace(/,\s*([}\]])/g, "$1");
    if (repaired !== candidate) {
        const second = tryParse(repaired);
        if (second) return second;
    }

    return null;
}

function tryParse(text: string): Record<string, unknown> | null {
    try {
        const value: unknown = JSON.parse(text);
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
    } catch {
        // fall through
    }
    return null;
}

function draftFromRecord(record: Record<string, unknown>): AiDraft | null {
    const title = asString(record.title);
    const description = asString(record.description ?? record.body ?? record.details);
    const rationale = asString(record.rationale ?? record.reason);

    // Minimum bar for "usable": a title OR a description. Everything else has
    // a safe default.
    if (!title && !description) {
        return null;
    }

    const finalTitle = title || firstLine(description) || "Untitled work item";
    const finalDescription = description
        ? normalizeDescription(description)
        : normalizeDescription(`## Overview\n${finalTitle}`);

    const draft: AiDraft = {
        title: finalTitle,
        description: finalDescription,
        priority: clampPriority(record.priority),
        labels: normalizeLabels(record.labels ?? record.tags),
        rationale:
            rationale ||
            "Draft generated from your request using the local AI model.",
    };

    const storyPoints = normalizeStoryPoints(
        record.storyPoints ?? record.story_points ?? record.estimate
    );
    if (storyPoints !== undefined) {
        draft.storyPoints = storyPoints;
    }

    return draft;
}

function firstLine(text: string): string {
    return text.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "";
}

function readField(text: string, label: string): string | undefined {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(
        new RegExp(
            `^[\\t ]*(?:#{1,6}[\\t ]*)?(?:\\*\\*)?${escaped}(?:\\*\\*)?[\\t ]*:[\\t ]*(.+?)\\s*$`,
            "im"
        )
    );
    return match?.[1]?.trim();
}

function draftFromLabeledText(text: string): AiDraft | null {
    const cleaned = stripCodeFences(text);

    // Locate where the description begins: an explicit DESCRIPTION: label, or a
    // markdown "## Overview" heading.
    const descriptionMarker =
        /^[\t ]*(?:#{1,6}[\t ]*)?(?:\*\*)?DESCRIPTION(?:\*\*)?[\t ]*:[\t ]*/im.exec(
            cleaned
        );
    const overviewMarker = /^##[\t ]+Overview\b/im.exec(cleaned);
    const marker = descriptionMarker ?? overviewMarker;

    const headerText = marker ? cleaned.slice(0, marker.index) : cleaned;

    const title = readField(headerText, "TITLE") ?? readField(cleaned, "TITLE");
    // When the description begins at a "## Overview" heading, keep that heading
    // in the description; when it begins at a "DESCRIPTION:" label, drop the
    // label itself.
    const description = marker
        ? overviewMarker && marker === overviewMarker
            ? cleaned.slice(marker.index).trim()
            : cleaned.slice(marker.index + marker[0].length).trim()
        : "";
    const rationale =
        readField(headerText, "RATIONALE") ?? readField(cleaned, "RATIONALE");
    const priority = clampPriority(readField(cleaned, "PRIORITY"));
    const storyPoints = normalizeStoryPoints(
        readField(cleaned, "STORY POINTS") ?? readField(cleaned, "STORY_POINTS")
    );
    const labels = normalizeLabels(readField(cleaned, "LABELS"));

    // Recoverable text: if we have neither labeled title nor a description body,
    // treat the whole (non-empty) text as a plain description with a derived title.
    if (!title && !description) {
        const plain = cleaned.trim();
        if (!plain) return null;
        return {
            title: firstLine(plain).slice(0, 120) || "Untitled work item",
            description: normalizeDescription(plain),
            priority,
            labels,
            rationale:
                "Draft generated from your request using the local AI model.",
        };
    }

    const finalTitle = title || firstLine(description) || "Untitled work item";
    const finalDescription = description
        ? normalizeDescription(description)
        : normalizeDescription(`## Overview\n${finalTitle}`);

    const draft: AiDraft = {
        title: finalTitle,
        description: finalDescription,
        priority,
        labels,
        rationale:
            rationale ||
            "Draft generated from your request using the local AI model.",
    };

    if (storyPoints !== undefined) {
        draft.storyPoints = storyPoints;
    }

    return draft;
}

/**
 * Parse a raw model response into an AiDraft, or return a structured failure
 * reason. Never throws — callers decide whether to fall back.
 */
export function parseAiDraftSafe(response: string): ParseResult {
    if (typeof response !== "string" || response.trim() === "") {
        return { ok: false, reason: "The model returned an empty response." };
    }

    // Try JSON first (strict + recoverable), then labeled/recoverable text.
    const fromJson = extractJsonObject(response);
    if (fromJson) {
        const draft = draftFromRecord(fromJson);
        if (draft) return { ok: true, draft };
    }

    const fromText = draftFromLabeledText(response);
    if (fromText) return { ok: true, draft: fromText };

    return {
        ok: false,
        reason: "The model output could not be interpreted as a draft.",
    };
}

/**
 * Backwards-compatible throwing parser. Kept so existing callers/tests that
 * expect a throw still work, but it now delegates to the safe parser and uses
 * its richer defaults.
 */
export function parseAiDraft(response: string): AiDraft {
    const result = parseAiDraftSafe(response);
    if (result.ok) {
        return result.draft;
    }
    throw new Error("The local AI model could not format a draft. Please try again.");
}