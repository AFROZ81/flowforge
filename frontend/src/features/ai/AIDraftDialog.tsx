import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useAiFlag,
    useAiModelId,
} from "./useAiStore";
import {
    defaultAiService,
} from "./LocalAiService";
import type {
    AiContext,
    AiDraft,
} from "./IAiService";
import type {
    GenerationStage,
    LocalAiProgress,
} from "./localAiProtocol";

import {
    Button,
} from "@/components/ui/button";
import {
    Input,
} from "@/components/ui/input";
import {
    Textarea,
} from "@/components/ui/textarea";
import {
    FormField,
} from "@/components/ui/form-field";
import {
    Badge,
} from "@/components/ui/badge";
import {
    Sparkles,
    RefreshCw,
    Trash2,
    CheckCircle2,
    Activity,
    AlertTriangle,
    Cpu,
    Download,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import {
    toast,
} from "@/lib/toast";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDraft: (draft: Partial<AiDraft> & { labels: string[] }) => void;
    context?: AiContext;
};

type UiStage = {
    key: GenerationStage | "fallback" | "done";
    label: string;
    icon: typeof Cpu;
};

const STAGES: UiStage[] = [
    { key: "preparing", label: "Preparing AI", icon: Cpu },
    { key: "downloading", label: "Downloading model", icon: Download },
    { key: "loading", label: "Initializing model", icon: Loader2 },
    { key: "generating", label: "Generating draft", icon: Sparkles },
    { key: "validating", label: "Validating draft", icon: ShieldCheck },
];

function stageIndex(stage: GenerationStage): number {
    const index = STAGES.findIndex((s) => s.key === stage);
    return index < 0 ? 0 : index;
}

export function AIDraftDialog({
    open,
    onOpenChange,
    onDraft,
    context,
}: Props) {
    const draftWithAiEnabled = useAiFlag("draftWithAi");
    const labelSuggestionsEnabled = useAiFlag("labelSuggestions");
    const effortEstimationEnabled = useAiFlag("effortEstimation");
    const priorityRecommendationEnabled = useAiFlag("priorityRecommendation");
    const modelId = useAiModelId();

    const [prompt, setPrompt] = useState("");
    const [draft, setDraft] = useState<AiDraft | null>(null);
    const [busy, setBusy] = useState(false);
    const [stage, setStage] = useState<GenerationStage>("preparing");
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [usedFallback, setUsedFallback] = useState(false);
    const [fallbackTimedOut, setFallbackTimedOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inFlight = useRef(false);

    // Reset per-open so a fresh generation starts cleanly.
    useEffect(() => {
        if (!open) {
            inFlight.current = false;
        }
    }, [open]);

    const handleProgress = useCallback((progress: LocalAiProgress) => {
        setStage(progress.stage);
        if (typeof progress.progress === "number") {
            setDownloadProgress(progress.progress);
        }
    }, []);

    const generate = useCallback(async () => {
        if (!prompt.trim() || inFlight.current) return;
        inFlight.current = true;

        setError(null);
        setDraft(null);
        setUsedFallback(false); setFallbackTimedOut(false);
        setDownloadProgress(null);
        setBusy(true);
        setStage("preparing");

        try {
            const result = await defaultAiService.draftDetailed(
                prompt,
                context,
                handleProgress,
                { modelId }
            );
            setDraft(result.draft);
            setUsedFallback(result.fallback);
            setFallbackTimedOut(result.meta?.fallbackReason === "timeout");
            setStage("ready");
            if (result.fallback) {
                const timedOut = result.meta?.fallbackReason === "timeout";
                toast.info("Draft created with the built-in assistant", {
                    description: timedOut
                        ? "Draft prepared using the built-in assistant because local AI generation took too long. You can edit it below."
                        : "The on-device model was unavailable, so a simpler draft was generated. You can edit it below.",
                });
            } else {
                toast.success("AI draft generated", {
                    description:
                        "Review the suggested title, description, and labels.",
                });
            }
        } catch (generationError) {
            const message =
                generationError instanceof Error
                    ? generationError.message
                    : "An unexpected error occurred.";
            setError(message);
            setStage("failed");
            toast.error("AI draft generation failed", { description: message });
        } finally {
            inFlight.current = false;
            setBusy(false);
        }
    }, [prompt, context, handleProgress, modelId]);

    const cancel = useCallback(() => {
        if (inFlight.current) {
            defaultAiService.cancel();
            inFlight.current = false;
        }
        setBusy(false);
        setStage("preparing");
        onOpenChange(false);
    }, [onOpenChange]);

    const clearDraft = useCallback(() => {
        setDraft(null);
        setError(null);
        setUsedFallback(false); setFallbackTimedOut(false);
    }, []);

    const applyDraft = useCallback(() => {
        if (!draft) return;
        onDraft({
            title: draft.title,
            description: draft.description,
            priority: draft.priority,
            ...(draft.storyPoints !== undefined
                ? { storyPoints: draft.storyPoints }
                : {}),
            labels: draft.labels,
        });
        onOpenChange(false);
    }, [draft, onDraft, onOpenChange]);

    const isEnabled = useMemo(() => draftWithAiEnabled, [draftWithAiEnabled]);

    const priorityLabel = useMemo(() => {
        const map: Record<number, string> = {
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Critical",
        };
        return map[draft?.priority ?? 2];
    }, [draft?.priority]);

    if (!isEnabled || !open) {
        return null;
    }

    const currentStageIndex = stageIndex(stage);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative w-full max-w-md mx-auto rounded-2xl border border-border bg-card shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">
                            Draft with AI
                        </h3>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={clearDraft}
                        disabled={busy || !draft}
                        aria-label="Clear draft"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    Describe what you need. FlowForge turns it into a structured
                    work-item draft.
                </p>

                <div className="flex items-start gap-2">
                    <FormField
                        label="Prompt"
                        htmlFor="ai-prompt"
                        hint="What should this work item cover?"
                        className="min-w-0 flex-1"
                    >
                        {({ id }) => (
                            <Input
                                id={id}
                                value={prompt}
                                onChange={(event) =>
                                    setPrompt(event.target.value)
                                }
                                placeholder="e.g. Fix the login redirect after password reset"
                                disabled={busy}
                                autoFocus
                            />
                        )}
                    </FormField>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generate}
                        disabled={busy || !prompt.trim()}
                        className="mt-5 shrink-0"
                        aria-label={draft ? "Regenerate draft" : "Generate draft"}
                        title={draft ? "Regenerate draft" : "Generate draft"}
                    >
                        {busy ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : draft ? (
                            <RefreshCw className="size-4" />
                        ) : (
                            <Sparkles className="size-4" />
                        )}
                    </Button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                    Runs on this device with an open model. The first use
                    downloads the model files; prompts are not sent to an AI
                    service.
                </p>

                {busy && (
                    <div className="mt-4 space-y-2" role="status" aria-live="polite">
                        <ul className="space-y-1.5">
                            {STAGES.map((step, index) => {
                                const Icon = step.icon;
                                const isDone = index < currentStageIndex;
                                const isActive = index === currentStageIndex;
                                return (
                                    <li
                                        key={step.key}
                                        className={
                                            "flex items-center gap-2 text-xs " +
                                            (isDone
                                                ? "text-success"
                                                : isActive
                                                  ? "text-foreground"
                                                  : "text-muted-foreground/50")
                                        }
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="size-3.5" />
                                        ) : (
                                            <Icon
                                                className={
                                                    "size-3.5 " +
                                                    (isActive
                                                        ? "animate-pulse"
                                                        : "")
                                                }
                                            />
                                        )}
                                        <span>{step.label}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        {stage === "downloading" &&
                            typeof downloadProgress === "number" && (
                                <div className="pt-1">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                                            style={{
                                                width: `${downloadProgress}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">
                                        {Math.round(downloadProgress)}%
                                    </p>
                                </div>
                            )}
                    </div>
                )}

                {error && !busy && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {draft && (
                    <div className="mt-4 space-y-4">
                        {usedFallback && (
                            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-warning-foreground">
                                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                                <span>
                                    {fallbackTimedOut
                                        ? "Draft prepared using the built-in assistant because local AI generation took too long. Review and edit before applying."
                                        : "Created with the built-in assistant (the on-device model was unavailable). Review and edit before applying."}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <FormField
                            label="Suggested title"
                            htmlFor="ai-title"
                            hideLabel
                        >
                            {({ id }) => (
                                <Input
                                    id={id}
                                    value={draft.title}
                                    onChange={(event) =>
                                        setDraft((current) => current
                                            ? { ...current, title: event.target.value }
                                            : current)
                                    }
                                    disabled={busy}
                                />
                            )}
                        </FormField>

                        {/* Description */}
                        <FormField
                            label="Suggested description"
                            htmlFor="ai-description"
                            hideLabel
                        >
                            {({ id }) => (
                                <Textarea
                                    id={id}
                                    value={draft.description}
                                    onChange={(event) =>
                                        setDraft((current) => current
                                            ? { ...current, description: event.target.value }
                                            : current)
                                    }
                                    rows={8}
                                    disabled={busy}
                                />
                            )}
                        </FormField>

                        {/* Metadata row */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            {priorityRecommendationEnabled && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Priority
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                draft.priority === 4
                                                    ? "destructive"
                                                    : draft.priority === 3
                                                      ? "secondary"
                                                      : draft.priority === 1
                                                        ? "secondary"
                                                        : "default"
                                            }
                                        >
                                            {priorityLabel}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {effortEstimationEnabled && draft.storyPoints && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Story Points
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Activity className="size-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {draft.storyPoints} pts
                                        </span>
                                    </div>
                                </div>
                            )}

                            {labelSuggestionsEnabled && draft.labels.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Suggested Labels
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {draft.labels.map((label) => (
                                            <Badge
                                                key={label}
                                                variant="outline"
                                            >
                                                {label}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rationale */}
                        <div className="flex items-start gap-2 pt-2">
                            <CheckCircle2 className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                            <span className="text-xs text-muted-foreground leading-relaxed">
                                {draft.rationale}
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-2 border-t border-border px-2 pt-4 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancel}
                        className="w-full sm:w-auto"
                    >
                        {busy ? (
                            <span className="flex items-center gap-2">
                                <RefreshCw className="size-4 animate-spin" />
                                Cancel
                            </span>
                        ) : (
                            "Close"
                        )}
                    </Button>

                    {draft && (
                        <Button
                            type="button"
                            variant="default"
                            onClick={applyDraft}
                            disabled={busy}
                            className="w-full sm:w-auto"
                        >
                            <CheckCircle2 className="size-4 mr-2" />
                            Apply to work item
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
