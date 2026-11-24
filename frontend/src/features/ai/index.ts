export {
    type AiContext,
    type AiDraft,
    type AiDuplicate,
    type AiEffortEstimate,
    type AiLabelSuggestion,
    type AiPriorityRecommendation,
    type AiAssigneeSuggestion,
    type IAiService,
} from "./IAiService";

export {
    defaultAiService,
    LocalAiService,
    parseAiDraft,
    parseAiDraftSafe,
    type DraftResult,
} from "./LocalAiService";

export {
    NoopAiService,
} from "./NoopAiService";

export {
    AIDraftDialog,
} from "./AIDraftDialog";

export {
    useAiStore,
    useAiEnabled,
    useAiFlag,
    useAiProvider,
    useAiApiKey,
    useAiModelId,
    useAiActions,
    type AiFeatureFlags,
    type AiProvider,
} from "./useAiStore";

// Model registry + capability detection + benchmark (developer-facing).
export {
    MODEL_REGISTRY,
    DEFAULT_MODEL_ID,
    getModelProfile,
    getDefaultModelProfile,
    getSelectableProfiles,
    formatBytes,
    type ModelProfile,
    type ModelBackend,
    type ModelQuantization,
    type ModelDtype,
} from "./modelRegistry";

export {
    detectCapabilities,
    hasWebGpuAdapter,
    profileFitsDevice,
    type CapabilityReport,
} from "./capabilityDetection";

export {
    runAiBenchmark,
    BENCHMARK_PROMPTS,
    type BenchmarkResult,
} from "./aiBenchmark";