import { describe, it, expect } from "vitest";

import { NoopAiService } from "./NoopAiService";
import type { AiContext } from "./IAiService";

const service = new NoopAiService();

const baseContext: AiContext = {
    boardId: "board-1",
    columnName: "Todo",
    existingTitles: ["Fix login bug", "Update README"],
    existingWorkItems: [
        { id: "1", title: "Fix login bug" },
        { id: "2", title: "Update README" },
        { id: "3", title: "Refactor dashboard" },
    ],
};

describe("NoopAiService.draftFromPrompt", () => {
    it("generates a title from the prompt", async () => {
        const draft = await service.draftFromPrompt("Fix the navbar hover state");
        expect(draft.title).toBe("Fix the navbar hover state");
    });

    it("truncates long titles at sentence boundary", async () => {
        const draft = await service.draftFromPrompt(
            "This is a very long prompt that goes on and on. It has multiple sentences."
        );
        expect(draft.title.length).toBeLessThanOrEqual(101);
    });

    it("produces a plain-text description (no Markdown headings)", async () => {
        const draft = await service.draftFromPrompt("Add dark mode toggle");
        expect(draft.description).not.toContain("#");
        expect(draft.description).not.toContain("**");
        expect(draft.description).not.toContain("```");
    });

    it("produces exactly two sentences", async () => {
        const draft = await service.draftFromPrompt("Add dark mode toggle");
        const sentences = draft.description
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
        expect(sentences.length).toBe(2);
    });

    it("starts with a short intro sentence, not a numbered point", async () => {
        const draft = await service.draftFromPrompt("Add dark mode toggle");
        const firstLine = draft.description.split("\n").map((l) => l.trim())[0];
        expect(firstLine).toBeTruthy();
        expect(/^\d+[.)]\s+/.test(firstLine)).toBe(false);
    });

    it("produces a compact description (no bloated sections)", async () => {
        const draft = await service.draftFromPrompt("Add dark mode toggle");
        // Compact plain-text format: no forced DoD / Placement / Suggested Labels /
        // Rationale / Technical Notes sections in the description body.
        expect(draft.description).not.toContain("Definition of Done");
        expect(draft.description).not.toContain("Placement");
        expect(draft.description).not.toContain("Suggested Labels");
        expect(draft.description).not.toContain("Rationale");
        expect(draft.description).not.toContain("Technical Notes");
    });

    it("omits Technical Notes for a vague prompt", async () => {
        const draft = await service.draftFromPrompt("Fix the cards");
        expect(draft.description).not.toContain("Technical Notes");
    });

    it("keeps the description short for a simple prompt", async () => {
        const draft = await service.draftFromPrompt("Fix the cards");
        // Compact plain-text draft: two sentences.
        expect(draft.description.length).toBeLessThan(300);
    });

    it("simple requests produce a short two-sentence description", async () => {
        const draft = await service.draftFromPrompt("Fix the Cards");
        const sentences = draft.description
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
        expect(sentences.length).toBe(2);
        expect(draft.description.length).toBeLessThan(300);
    });

    it("does not invent APIs, endpoints, or controllers for a vague prompt", async () => {
        const draft = await service.draftFromPrompt("Fix the Cards");
        const lower = draft.description.toLowerCase();
        expect(lower).not.toContain("endpoint");
        expect(lower).not.toContain("controller");
        expect(lower).not.toContain("api ");
        expect(lower).not.toContain("database");
    });

    it("returns rationale", async () => {
        const draft = await service.draftFromPrompt("Fix critical security bug");
        expect(draft.rationale).toBeTruthy();
    });
});

describe("NoopAiService.suggestLabels", () => {
    it("suggests Bug label for bug-related content", async () => {
        const labels = await service.suggestLabels("Fix the login crash error");
        expect(labels.some((l) => l.label === "Bug")).toBe(true);
    });

    it("suggests Frontend label for UI content", async () => {
        const labels = await service.suggestLabels("Update the react component css");
        expect(labels.some((l) => l.label === "Frontend")).toBe(true);
    });

    it("excludes existing labels", async () => {
        const labels = await service.suggestLabels("Fix login bug", ["Bug"]);
        expect(labels.some((l) => l.label === "Bug")).toBe(false);
    });

    it("returns max 5 suggestions", async () => {
        const labels = await service.suggestLabels(
            "fix bug implement feature update docs test performance security frontend backend infrastructure"
        );
        expect(labels.length).toBeLessThanOrEqual(5);
    });
});

describe("NoopAiService.detectDuplicates", () => {
    it("detects likely duplicate titles", async () => {
        const dupes = await service.detectDuplicates("Fix login bug", baseContext);
        const likely = dupes.find((d) => d.similarity === "likely");
        expect(likely).toBeDefined();
        expect(likely?.title).toBe("Fix login bug");
    });

    it("detects possible duplicates", async () => {
        const dupes = await service.detectDuplicates("Fix login issue", baseContext);
        expect(dupes.length).toBeGreaterThan(0);
    });

    it("returns empty when no matches", async () => {
        const dupes = await service.detectDuplicates("Build a spaceship", baseContext);
        expect(dupes.length).toBe(0);
    });
});

describe("NoopAiService.estimateEffort", () => {
    it("estimates low effort for trivial changes", async () => {
        const result = await service.estimateEffort("Fix typo in readme", "");
        expect(result.storyPoints).toBe(1);
    });

    it("estimates high effort for refactor", async () => {
        const result = await service.estimateEffort("Refactor entire architecture", "");
        expect(result.storyPoints).toBeGreaterThanOrEqual(5);
    });

    it("returns confidence level", async () => {
        const result = await service.estimateEffort("Fix typo", "");
        expect(["low", "medium", "high"]).toContain(result.confidence);
    });
});

describe("NoopAiService.recommendPriority", () => {
    it("recommends Critical for urgent keywords", async () => {
        const result = await service.recommendPriority("Critical outage fix now", "");
        expect(result.priority).toBe(4);
    });

    it("recommends Medium by default", async () => {
        const result = await service.recommendPriority("Update some docs", "");
        expect(result.priority).toBe(2);
    });

    it("returns confidence level", async () => {
        const result = await service.recommendPriority("Urgent fix", "");
        expect(["low", "medium", "high"]).toContain(result.confidence);
    });
});
