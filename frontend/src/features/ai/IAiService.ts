/**
 * IAiService — contract for AI-assisted work-item drafting.
 *
 * Provider-neutral contract for AI-assisted work-item drafting and suggestions.
 * The default draft provider runs a quantized open model in the browser.
 */

export type AiDraft = {
    title: string;
    description: string;        // markdown with Overview, AC, Technical Notes, DoD
    priority: number;           // 1 = Low ... 4 = Critical
    storyPoints?: number;       // optional Fibonacci estimate
    labels: string[];
    rationale: string;          // human-readable why this draft was suggested
};

export type AiLabelSuggestion = {
    label: string;
    confidence: "low" | "medium" | "high";
    reason: string;
};

export type AiDuplicate = {
    id: string;
    title: string;
    similarity: "possible" | "likely";
    score: number;
};

export type AiEffortEstimate = {
    storyPoints: number;
    confidence: "low" | "medium" | "high";
    reason: string;
};

export type AiPriorityRecommendation = {
    priority: number;
    confidence: "low" | "medium" | "high";
    reason: string;
};

export type AiAssigneeSuggestion = {
    userId: string;
    displayName: string;
    reason: string;
    confidence: "low" | "medium" | "high";
};

export type AiContext = {
    boardId?: string;
    columnName?: string;
    existingTitles?: string[];
    existingWorkItems?: { id: string; title: string }[];
    existingLabels?: string[];
    teamMembers?: { id: string; displayName: string; role?: number }[];
};

export interface IAiService {
    draftFromPrompt: (
        prompt: string,
        context?: AiContext
    ) => Promise<AiDraft>;

    suggestLabels: (
        content: string,
        existingLabels?: string[]
    ) => Promise<AiLabelSuggestion[]>;

    detectDuplicates: (
        title: string,
        context?: AiContext
    ) => Promise<AiDuplicate[]>;

    estimateEffort: (
        title: string,
        description: string,
        context?: AiContext
    ) => Promise<AiEffortEstimate>;

    recommendPriority: (
        title: string,
        description: string,
        context?: AiContext
    ) => Promise<AiPriorityRecommendation>;

    suggestAssignee: (
        context?: AiContext
    ) => Promise<AiAssigneeSuggestion[]>;
}
