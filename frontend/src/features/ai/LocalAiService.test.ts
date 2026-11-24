import { describe, expect, it } from "vitest";

import { parseAiDraft } from "./LocalAiService";

// Description already in normalised plain-text (two-sentence) form so JSON
// round-trips equal.
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

describe("parseAiDraft", () => {
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
- Loading state clears after the response.
- Errors can be retried.
## Technical Notes
Use the existing board data query.
## Definition of Done
- Verify loading and error states.`);

        expect(draft.title).toBe("Improve card loading");
        expect(draft.priority).toBe(3);
        expect(draft.storyPoints).toBe(3);
        expect(draft.labels).toEqual(["Frontend", "Performance"]);
        // Plain text, no Markdown, exactly two sentences.
        expect(draft.description).not.toContain("#");
        expect(draft.description).not.toContain("**");
        const sentences = draft.description
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
        expect(sentences.length).toBe(2);
    });

    it("parses a structured model response, including fenced JSON", () => {
        const draft = parseAiDraft(`\`\`\`json\n${JSON.stringify(validDraft)}\n\`\`\``);

        expect(draft).toEqual(validDraft);
    });

    it("recovers usable output instead of rejecting when fields are missing", () => {
        // Missing rationale/description still yields a usable draft (safe defaults).
        const draft = parseAiDraft(`{"title":"Add caching","priority":3}`);
        expect(draft.title).toBe("Add caching");
        expect(draft.description).toBeTruthy();
        expect(draft.rationale).toBeTruthy();
    });

    it("clamps out-of-range priorities instead of fabricating a rejection", () => {
        const draft = parseAiDraft(JSON.stringify({ ...validDraft, priority: 5 }));
        expect(draft.priority).toBe(2); // clamped to default medium
    });

    it("throws only when output is genuinely empty", () => {
        expect(() => parseAiDraft("")).toThrow("could not format a draft");
    });
});