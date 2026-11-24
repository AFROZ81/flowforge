import {
    create,
} from "zustand";

import {
    persist,
    createJSONStorage,
} from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { DEFAULT_MODEL_ID } from "./modelRegistry";

export type AiFeatureFlags = {
    draftWithAi: boolean;
    labelSuggestions: boolean;
    duplicateDetection: boolean;
    effortEstimation: boolean;
    priorityRecommendation: boolean;
    assigneeSuggestion: boolean;
};

export type AiProvider = "local" | "noop" | "openai" | "ollama";

type AiState = {
    enabled: boolean;
    flags: AiFeatureFlags;
    provider: AiProvider;
    apiKey: string | null;
    /** Selected local model profile id (must be a verified profile). */
    modelId: string;
    setEnabled: (enabled: boolean) => void;
    setFlag: (key: keyof AiFeatureFlags, value: boolean) => void;
    setProvider: (provider: AiProvider) => void;
    setApiKey: (key: string | null) => void;
    setModelId: (modelId: string) => void;
    isFeatureEnabled: (key: keyof AiFeatureFlags) => boolean;
};

const DEFAULT_FLAGS: AiFeatureFlags = {
    draftWithAi: false,
    labelSuggestions: false,
    duplicateDetection: false,
    effortEstimation: false,
    priorityRecommendation: false,
    assigneeSuggestion: false,
};

export const useAiStore =
    create<AiState>()(
        persist(
            (set, get) => ({

                enabled: false,

                flags: { ...DEFAULT_FLAGS },

                provider: "local",

                apiKey: null,

                modelId: DEFAULT_MODEL_ID,

                setEnabled: (enabled) => {
                    set({ enabled });
                },

                setFlag: (key, value) => {
                    set((state) => ({
                        flags: {
                            ...state.flags,
                            [key]: value,
                        },
                    }));
                },

                setProvider: (provider) => {
                    set({ provider });
                },

                setApiKey: (key) => {
                    set({ apiKey: key });
                },

                setModelId: (modelId) => {
                    set({ modelId });
                },

                isFeatureEnabled: (key) => {
                    return get().enabled && get().flags[key];
                },

            }),
            {
                name: "flowforge-ai",
                storage: createJSONStorage(() => localStorage),
            }
        )
    );

export function useAiEnabled() {
    return useAiStore((state) => state.enabled);
}

export function useAiFlag(key: keyof AiFeatureFlags) {
    return useAiStore((state) => state.isFeatureEnabled(key));
}

export function useAiProvider() {
    return useAiStore((state) => state.provider);
}

export function useAiApiKey() {
    return useAiStore((state) => state.apiKey);
}

export function useAiModelId() {
    return useAiStore((state) => state.modelId);
}

export function useAiActions() {
    return useAiStore(useShallow((state) => ({
        setEnabled: state.setEnabled,
        setFlag: state.setFlag,
        setProvider: state.setProvider,
        setApiKey: state.setApiKey,
        setModelId: state.setModelId,
    })));
}
