import {
    type AiContext,
    type AiDraft,
    type AiDuplicate,
    type AiEffortEstimate,
    type AiLabelSuggestion,
    type AiPriorityRecommendation,
    type AiAssigneeSuggestion,
    type IAiService,
} from "./IAiService";

const COMMON_LABELS = [
    { label: "Bug", keywords: ["fix", "broken", "error", "crash", "bug", "issue", "defect"] },
    { label: "Feature", keywords: ["add", "new", "implement", "feature", "support", "create"] },
    { label: "Improvement", keywords: ["improve", "enhance", "better", "refactor", "optimize", "update"] },
    { label: "Documentation", keywords: ["doc", "readme", "guide", "document", "wiki", "readme"] },
    { label: "Testing", keywords: ["test", "spec", "coverage", "qa", "jest", "cypress", "unit test"] },
    { label: "Performance", keywords: ["slow", "speed", "performance", "latency", "load time", "cache"] },
    { label: "Security", keywords: ["secure", "auth", "permission", "vulnerability", "encrypt", "oauth", "login"] },
    { label: "Maintenance", keywords: ["cleanup", "debt", "legacy", "maintain", "deprecate", "remove"] },
    { label: "Frontend", keywords: ["ui", "ux", "react", "component", "css", "page", "form", "modal"] },
    { label: "Backend", keywords: ["api", "endpoint", "server", "database", "db", "query", "sql", "service"] },
    { label: "Infrastructure", keywords: ["deploy", "ci/cd", "docker", "kubernetes", "aws", "azure", "pipeline"] },
];

const PRIORITY_KEYWORDS: Record<number, string[]> = {
    4: ["urgent", "critical", "asap", "immediately", "blocker", "emergency", "down", "outage"],
    3: ["high", "important", "soon", "priority", "needed", "required"],
    2: ["medium", "normal", "standard", "routine"],
    1: ["low", "minor", "nice-to-have", "whenever", "backlog", "later"],
};

const EFFORT_KEYWORDS: Record<number, string[]> = {
    1: ["typo", "text change", "color", "label", "rename", "small", "quick"],
    2: ["fix", "update", "change", "adjust", "tweak", "minor"],
    3: ["implement", "add", "create", "build", "feature", "integration"],
    5: ["refactor", "rewrite", "migration", "overhaul", "redesign", "architecture"],
    8: ["epic", "platform", "system", "foundation", "major", "full rewrite"],
};

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function similarity(a: string, b: string): number {
    const ta = new Set(tokenize(a));
    const tb = new Set(tokenize(b));
    if (ta.size === 0 || tb.size === 0) return 0;
    const intersection = new Set([...ta].filter((x) => tb.has(x)));
    const union = new Set([...ta, ...tb]);
    return intersection.size / union.size;
}

function findKeywordMatches(text: string, keywords: string[]): string[] {
    const tokens = new Set(tokenize(text));
    return keywords.filter((k) => tokens.has(k));
}

export class NoopAiService implements IAiService {
    async draftFromPrompt(
        prompt: string,
        _context?: AiContext
    ): Promise<AiDraft> {
        const title = this.generateTitle(prompt);
        const description = this.generateDescription(prompt);
        const priority = this.recommendPriorityFromText(prompt);
        const storyPoints = this.estimateStoryPoints(prompt);
        const labels = this.suggestLabelsFromText(prompt);
        const rationale = this.generateRationale(priority);

        return {
            title,
            description,
            priority,
            ...(storyPoints ? { storyPoints } : {}),
            labels,
            rationale,
        };
    }

    async suggestLabels(
        content: string,
        existingLabels?: string[]
    ): Promise<AiLabelSuggestion[]> {
        const existing = new Set((existingLabels ?? []).map((l) => l.toLowerCase()));

        const scored = COMMON_LABELS.map(({ label, keywords }) => {
            const matches = findKeywordMatches(content.toLowerCase(), keywords);
            const confidence: AiLabelSuggestion["confidence"] =
                matches.length >= 2
                    ? "high"
                    : matches.length === 1
                      ? "medium"
                      : "low";
            return {
                label,
                confidence,
                reason: matches.length
                    ? `Matched keyword${matches.length > 1 ? "s" : ""}: ${matches.join(", ")}`
                    : "No strong keyword match.",
            };
        });

        return scored
            .filter((s) => !existing.has(s.label.toLowerCase()))
            .sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 };
                return order[a.confidence] - order[b.confidence];
            })
            .slice(0, 5);
    }

    async detectDuplicates(
        title: string,
        context?: AiContext
    ): Promise<AiDuplicate[]> {
        const existing = context?.existingWorkItems ?? [];

        const matches = existing
            .map((item) => {
                const sim = similarity(title, item.title);
                return {
                    id: item.id,
                    title: item.title,
                    similarity: sim >= 0.6 ? ("likely" as const) : ("possible" as const),
                    score: sim,
                };
            })
            .filter((m) => m.score >= 0.3)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return matches.map(({ id, title, similarity, score }) => ({
            id,
            title,
            similarity,
            score,
        }));
    }

    async estimateEffort(
        title: string,
        description: string
    ): Promise<AiEffortEstimate> {
        const text = `${title} ${description}`.toLowerCase();

        let points = 3; // default medium
        let confidence: AiEffortEstimate["confidence"] = "medium";
        let reason = "Estimated as a medium-sized task based on typical work-item complexity.";
        let keywordMatched = false;

        for (const [pointsValue, keywords] of Object.entries(EFFORT_KEYWORDS)) {
            const matches = findKeywordMatches(text, keywords);
            if (matches.length > 0) {
                points = parseInt(pointsValue, 10);
                keywordMatched = true;
                confidence =
                    matches.length >= 2 ? "high" : "medium";
                reason = `Detected effort indicators: ${matches.join(", ")}.`;
                break;
            }
        }

        // Adjust based on description length. Never downgrade a clear keyword
        // signal on the basis of an empty/short description alone — an empty
        // description is normal for a terse prompt like "Refactor architecture".
        const descLength = description.length;
        if (!keywordMatched) {
            if (descLength > 500 && points < 5) {
                points = 5;
                confidence = "medium";
                reason += " Description is detailed, suggesting more work.";
            } else if (descLength > 0 && descLength < 100 && points > 2) {
                points = 2;
                confidence = "low";
                reason += " Short description suggests simpler scope.";
            }
        }

        return { storyPoints: points, confidence, reason };
    }

    async recommendPriority(
        title: string,
        description: string
    ): Promise<AiPriorityRecommendation> {
        const text = `${title} ${description}`.toLowerCase();

        for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
            const matches = findKeywordMatches(text, keywords);
            if (matches.length > 0) {
                const conf: AiPriorityRecommendation["confidence"] =
                    matches.length >= 2 ? "high" : "medium";
                return {
                    priority: parseInt(priority, 10),
                    confidence: conf,
                    reason: `Detected priority keywords: ${matches.join(", ")}.`,
                };
            }
        }

        return {
            priority: 2,
            confidence: "low",
            reason: "No urgency keywords detected; defaulting to Medium priority.",
        };
    }

    async suggestAssignee(
        context?: AiContext
    ): Promise<AiAssigneeSuggestion[]> {
        const members = context?.teamMembers ?? [];
        if (members.length === 0) return [];

        // Round-robin-ish: suggest members who aren't already overloaded.
        // In a real implementation this would query current workload per user.
        return members
            .slice(0, 3)
            .map((m) => ({
                userId: m.id,
                displayName: m.displayName,
                reason: "Available team member with capacity.",
                confidence: "low" as const,
            }));
    }

    /* ------------------------------------------------------------
       PRIVATE HELPERS
       ------------------------------------------------------------ */

    private generateTitle(prompt: string): string {
        const trimmed = prompt.trim();
        if (trimmed.length <= 100) return trimmed;

        // Try to cut at a sentence boundary
        const sentenceEnd = trimmed.match(/[.!?]\s/);
        if (sentenceEnd && sentenceEnd.index! < 100) {
            return trimmed.slice(0, sentenceEnd.index! + 1).trim();
        }

        // Fall back to word boundary near 100 chars
        const cut = trimmed.lastIndexOf(" ", 100);
        return trimmed.slice(0, cut > 0 ? cut : 100).trim() + "…";
    }

    private generateDescription(prompt: string): string {
        const task = this.summarize(prompt);
        const outcome = this.outcomeSentence(prompt);

        const parts: string[] = [];
        if (task) parts.push(task);
        parts.push(outcome);
        return parts.join(" ").trim();
    }

    /**
     * Build a short second sentence describing the expected outcome. It stays
     * generic and editable rather than inventing implementation specifics.
     */
    private outcomeSentence(prompt: string): string {
        const summary = this.summarize(prompt).replace(/\s+/g, " ").trim();
        if (summary) {
            const lower = summary.toLowerCase();
            const hasOutcomeVerb =
                /\b(ensure|verify|confirm|so that|in order to|improve|fix|add|support|allow)\b/.test(
                    lower
                );
            if (hasOutcomeVerb) {
                return "Ensure the result is reliable and fits the existing behavior.";
            }
            return "Ensure the change works as intended and fits the existing behavior.";
        }
        return "Ensure the change works as intended and fits the existing behavior.";
    }

    private summarize(text: string): string {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        if (sentences.length === 0) return text.trim();
        let summary = sentences[0].trim();
        if (!/[.!?]$/.test(summary)) summary += ".";
        // Keep the overview to one sentence for compactness; only extend to a
        // second sentence when the first is very short.
        if (sentences.length > 1 && summary.length < 60) {
            const second = sentences[1].trim();
            if (second) summary += ` ${second.replace(/\.$/, "")}.`;
        }
        return summary;
    }

    private suggestLabelsFromText(text: string): string[] {
        const matches = COMMON_LABELS.filter(({ keywords }) =>
            findKeywordMatches(text.toLowerCase(), keywords).length > 0
        );
        return matches.map((m) => m.label);
    }

    private recommendPriorityFromText(text: string): number {
        const lower = text.toLowerCase();
        for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
            if (findKeywordMatches(lower, keywords).length > 0) {
                return parseInt(priority, 10);
            }
        }
        return 2;
    }

    private estimateStoryPoints(text: string): number | undefined {
        const lower = text.toLowerCase();
        for (const [points, keywords] of Object.entries(EFFORT_KEYWORDS)) {
            if (findKeywordMatches(lower, keywords).length > 0) {
                return parseInt(points, 10);
            }
        }
        return 3;
    }

    private generateRationale(priority: number): string {
        const priorityLabels: Record<number, string> = {
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Critical",
        };
        return (
            `Drafted locally from your request (${priorityLabels[priority]} priority). ` +
            `Review and edit before applying.`
        );
    }
}

export const defaultAiService = new NoopAiService();
