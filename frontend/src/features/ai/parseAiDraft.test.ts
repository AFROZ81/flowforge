import { describe, expect, it } from "vitest";

import {
    normalizeDescription,
    parseAiDraft,
    parseAiDraftSafe,
} from "./parseAiDraft";

// A description already in the normalised plain-text (two-sentence) form the
// parser emits, so round-tripping JSON yields an equal draft.
const validDraft = {
    title: "Add password reset redirect",
    description:
        "Redirect users to their intended page after a password reset. " +
        "Ensure the destination is preserved and the reset completes reliably.",
    priority: 3,
    storyPoints: 3,
    labels: ["Authentication"],
    rationale: "The request describes a login-flow issue.",
};

/** Assert the description is plain text with exactly two sentences. */
function expectPlainTwoSentenceDescription(description: string) {
    expect(description).not.toMatch(/^#{1,6}\s/m);
    expect(description).not.toContain("**");
    expect(description).not.toContain("__");
    expect(description).not.toContain("`");
    expect(description).not.toContain("```");
    // No bullets or numbered lists.
    expect(description).not.toMatch(/^\s*(?:[-*+]|\d+[.)])\s/m);
    // Exactly two sentences.
    const sentences = description
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
    expect(sentences.length).toBe(2);
    for (const sentence of sentences) {
        expect(sentence.length).toBeGreaterThan(0);
        expect(/[.!?]$/.test(sentence)).toBe(true);
    }
}

describe("parseAiDraft (labeled text)", () => {
    it("parses the labeled text format and normalises to plain text", () => {
        const draft = parseAiDraft(`TITLE: Improve card loading
PRIORITY: High
STORY POINTS: 3
LABELS: Frontend, Performance
RATIONALE: The request describes a visible card-loading problem.
DESCRIPTION:
## Overview
Keep board cards responsive while loading.
## Acceptance Criteria
- Cards remain visible during loading.
## Technical Notes
Use the existing board data query.`);

        expect(draft.title).toBe("Improve card loading");
        expect(draft.priority).toBe(3);
        expect(draft.storyPoints).toBe(3);
        expect(draft.labels).toEqual(["Frontend", "Performance"]);
        expectPlainTwoSentenceDescription(draft.description);
    });

    it("parses a description that starts with ## Overview (no DESCRIPTION label)", () => {
        const draft = parseAiDraft(`TITLE: Add dark mode
PRIORITY: Medium
## Overview
Toggle theme from settings.
## Acceptance Criteria
- Toggle persists across reloads.`);

        expect(draft.title).toBe("Add dark mode");
        expect(draft.priority).toBe(2);
        expectPlainTwoSentenceDescription(draft.description);
        expect(draft.description).not.toContain("#");
    });
});

describe("parseAiDraft (JSON)", () => {
    it("parses a structured model response, including fenced JSON", () => {
        const draft = parseAiDraft(
            `\`\`\`json\n${JSON.stringify(validDraft)}\n\`\`\``
        );
        expect(draft).toEqual(validDraft);
    });

    it("parses bare JSON", () => {
        const draft = parseAiDraft(JSON.stringify(validDraft));
        expect(draft.title).toBe(validDraft.title);
        expect(draft.priority).toBe(3);
    });

    it("recovers JSON with trailing commas", () => {
        const draft = parseAiDraft(
            '{"title":"Fix login","description":"## Overview\\nFix it.","priority":3,"labels":["Bug",],}'
        );
        expect(draft.title).toBe("Fix login");
        expect(draft.labels).toEqual(["Bug"]);
    });

    it("supplies safe defaults for missing optional fields", () => {
        const draft = parseAiDraft('{"title":"Only a title"}');
        expect(draft.title).toBe("Only a title");
        expect(draft.priority).toBe(2); // default medium
        expect(draft.labels).toEqual([]);
        expectPlainTwoSentenceDescription(draft.description);
        expect(draft.rationale).toBeTruthy();
    });

    it("clamps out-of-range priority to the default instead of rejecting", () => {
        const draft = parseAiDraftSafe(
            JSON.stringify({ ...validDraft, priority: 9 })
        );
        expect(draft.ok).toBe(true);
        if (draft.ok) {
            expect(draft.draft.priority).toBe(2);
        }
    });

    it("accepts word priorities and maps them", () => {
        const draft = parseAiDraft(
            JSON.stringify({ ...validDraft, priority: "Critical" })
        );
        expect(draft.priority).toBe(4);
    });
});

describe("parseAiDraft (recoverable / plain text)", () => {
    it("treats unstructured non-empty text as a plain description", () => {
        const result = parseAiDraftSafe("Just some free-form text with no labels.");
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.draft.description).toContain("free-form text");
            expect(result.draft.title.length).toBeGreaterThan(0);
        }
    });

    it("still rejects genuinely empty output", () => {
        expect(parseAiDraftSafe("").ok).toBe(false);
        expect(parseAiDraftSafe("   ").ok).toBe(false);
    });
});

describe("parseAiDraft (throwing wrapper)", () => {
    it("throws only when output is genuinely unusable", () => {
        expect(() => parseAiDraft("")).toThrow("could not format a draft");
    });

    it("returns a draft for recoverable input", () => {
        expect(() => parseAiDraft("some text")).not.toThrow();
    });
});

describe("parseAiDraft (compact drafting format)", () => {
    it("parses the compact plain-text format the model emits", () => {
        const draft = parseAiDraft(`TITLE: Fix the cards
PRIORITY: 2
STORY POINTS: 1
LABELS: Frontend, Bug
DESCRIPTION:
Fix layout glitches on the board cards. Cards should render cleanly without overlap.`);

        expect(draft.title).toBe("Fix the cards");
        expect(draft.priority).toBe(2);
        expect(draft.storyPoints).toBe(1);
        expect(draft.labels).toEqual(["Frontend", "Bug"]);
        expectPlainTwoSentenceDescription(draft.description);
    });

    it("does not invent technical sections for a vague prompt", () => {
        const draft = parseAiDraft(
            '{"title":"Fix the cards","description":"Fix card layout. Cards should align across sizes.","priority":2,"labels":[]}'
        );
        expect(draft.description).not.toContain("Technical Notes");
        expect(draft.description).not.toContain("Rationale");
        expect(draft.description).not.toContain("Definition of Done");
        expectPlainTwoSentenceDescription(draft.description);
    });
});

describe("normalizeDescription", () => {
    it("strips Markdown headings, bold, italics, and code fences", () => {
        const raw =
            "## Overview\n**Fix** the _cards_.\n```\ncode\n```\n" +
            "1. One.\n2. Two.\n3. Three.";
        const normalized = normalizeDescription(raw);
        expect(normalized).not.toContain("#");
        expect(normalized).not.toContain("**");
        expect(normalized).not.toContain("_cards_");
        expect(normalized).not.toContain("```");
        expectPlainTwoSentenceDescription(normalized);
    });

    it("condenses many points into exactly two sentences without dropping content", () => {
        const raw =
            "Do the thing.\n1. First.\n2. Second.\n3. Third.\n4. Fourth.\n5. Fifth.";
        const normalized = normalizeDescription(raw);
        expectPlainTwoSentenceDescription(normalized);
        // The later points are merged into the second sentence, not dropped.
        expect(normalized).toContain("Fourth");
        expect(normalized).toContain("Fifth");
    });

    it("produces two sentences from a single input sentence", () => {
        const normalized = normalizeDescription("Just one short sentence.");
        expectPlainTwoSentenceDescription(normalized);
    });

    it("does not destroy meaningful text", () => {
        const raw = "Refactor the dashboard.\n1. Split components.\n2. Add settings.\n3. Polish styling.";
        const normalized = normalizeDescription(raw);
        expect(normalized).toContain("Refactor the dashboard");
        expect(normalized).toContain("Split components");
        expect(normalized).toContain("Add settings");
        expect(normalized).toContain("Polish styling");
    });

    it("handles a long verbose paragraph by condensing to two sentences", () => {
        const raw =
            "We should refactor the dashboard. It needs to be more responsive. " +
            "Components should be split. Settings should be added. Styling should be polished.";
        const normalized = normalizeDescription(raw);
        expectPlainTwoSentenceDescription(normalized);
        // Meaning preserved: key terms survive.
        expect(normalized.toLowerCase()).toContain("refactor");
    });
});