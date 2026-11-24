import type { ReactNode } from "react";
import {
    Activity,
    Check,
    Copy,
    Gauge,
    LogOut,
    ShieldCheck,
    Sparkles,
    Tags,
    UsersRound,
} from "lucide-react";
import type {
    LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import ThemeSwatch from "@/components/layout/ThemeSwatch";
import { toast } from "@/lib/toast";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
    THEMES,
    familyOf,
    parseStoredTheme,
    type ThemePreference,
} from "@/lib/themes";
import { useAuthStore } from "@/stores/auth.store";
import { usePresence } from "@/features/presence";
import {
    type AiFeatureFlags,
    useAiActions,
    useAiStore,
} from "@/features/ai/useAiStore";
import {
    getSelectableProfiles,
    formatBytes,
} from "@/features/ai/modelRegistry";
import { useOrganizationOptions } from "@/features/auth/hooks/useOrganizationOptions";

import { useMembers } from "../hooks/useInvitations";

const SYSTEM_THEME: ThemePreference = "system";

const AI_OPTIONS: {
    key: keyof Pick<
        AiFeatureFlags,
        "labelSuggestions" | "priorityRecommendation" | "effortEstimation"
    >;
    title: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        key: "labelSuggestions",
        title: "Label suggestions",
        description: "Include context-based labels in generated drafts.",
        icon: Tags,
    },
    {
        key: "priorityRecommendation",
        title: "Priority recommendations",
        description: "Show a suggested priority with each draft.",
        icon: Activity,
    },
    {
        key: "effortEstimation",
        title: "Effort estimates",
        description: "Show a story-point estimate with each draft.",
        icon: Gauge,
    },
];

function SettingsSection({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "overflow-hidden rounded-xl border border-border bg-card shadow-xs",
                className
            )}
        >
            <div className="border-b border-border px-4 py-4 sm:px-5">
                <SectionHeader title={title} description={description} />
            </div>
            {children}
        </section>
    );
}

function PreferenceSwitch({
    label,
    checked,
    disabled = false,
    onChange,
}: {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-label={label}
            aria-checked={checked}
            disabled={disabled}
            onClick={onChange}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45",
                checked
                    ? "border-success bg-success"
                    : "border-destructive bg-destructive"
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white border border-black shadow-lg transition-all duration-200 ease-in-out",
                    checked ? "translate-x-[22px]" : "translate-x-[2px]"
                )}
            />
        </button>
    );
}

function FeatureToggleRow({
    title,
    description,
    icon: Icon,
    checked,
    disabled = false,
    onChange,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <PreferenceSwitch
                label={title}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
            />
        </div>
    );
}

function InfoRow({
    label,
    value,
    mono = false,
    copyValue,
}: {
    label: string;
    value: ReactNode;
    mono?: boolean;
    copyValue?: string | null;
}) {
    const copy = async () => {
        if (!copyValue) return;
        try {
            await navigator.clipboard.writeText(copyValue);
            toast.success(`${label} copied`);
        } catch (error) {
            toast.error(`Could not copy ${label.toLowerCase()}`, {
                description: error instanceof Error
                    ? error.message
                    : "Clipboard access is unavailable in this browser.",
            });
        }
    };

    return (
        <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
            <dd className="flex min-w-0 items-center gap-2 text-right">
                <span
                    className={cn(
                        "min-w-0 truncate text-sm font-medium text-foreground",
                        mono && "font-mono text-xs"
                    )}
                >
                    {value ?? "—"}
                </span>
                {copyValue ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Copy ${label.toLowerCase()}`}
                        title={`Copy ${label.toLowerCase()}`}
                        onClick={() => void copy()}
                    >
                        <Copy aria-hidden="true" />
                    </Button>
                ) : null}
            </dd>
        </div>
    );
}

function ThemeChoice({
    value,
    selected,
    description,
    onSelect,
}: {
    value: ThemePreference;
    selected: boolean;
    description: string;
    onSelect: () => void;
}) {
    const label = value === SYSTEM_THEME
        ? "System"
        : THEMES.find((theme) => theme.id === value)?.label ?? value;

    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                "flex min-h-[5.25rem] min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                selected
                    ? "border-primary bg-primary-subtle/40"
                    : "border-border bg-card hover:bg-surface-muted"
            )}
        >
            <span
                className="mt-0.5 shrink-0"
            >
                <ThemeSwatch themeId={value} className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {label}
                    </span>
                    {selected ? (
                        <Check className="size-4 shrink-0 text-primary" aria-label="Selected" />
                    ) : null}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {description}
                </span>
            </span>
        </button>
    );
}

export default function GeneralSettings() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const activeTheme = parseStoredTheme(theme);
    const user = useAuthStore((state) => state.user);
    const expiresAtUtc = useAuthStore((state) => state.expiresAtUtc);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const aiEnabled = useAiStore(
        (state) => state.enabled && state.flags.draftWithAi
    );
    const aiFlags = useAiStore((state) => state.flags);
    const aiModelId = useAiStore((state) => state.modelId);
    const { setEnabled, setFlag, setModelId } = useAiActions();
    const selectableModels = getSelectableProfiles();
    const membersQuery = useMembers(user?.organizationId ?? "");
    const { data: workspaces } = useOrganizationOptions(true);
    const { onlineUserIds } = usePresence();
    const members = membersQuery.data;
    const workspace = workspaces?.find(
        (option) => option.id === user?.organizationId
    ) ?? null;
    const onlineCount = (members ?? []).filter((member) =>
        onlineUserIds.includes(member.userId)
    ).length;

    const systemThemeDescription = `Follow your device settings (${familyOf(resolvedTheme) ?? "light"} mode).`;

    const themeChoices: {
        value: ThemePreference;
        description: string;
    }[] = [
        { value: SYSTEM_THEME, description: systemThemeDescription },
        ...THEMES.map((descriptor) => ({
            value: descriptor.id,
            description: descriptor.blurb,
        })),
    ];

    const toggleMasterAi = () => {
        const next = !aiEnabled;
        setEnabled(next);
        setFlag("draftWithAi", next);
    };

    return (
        <div className="space-y-5">
            <SettingsSection
                title="Appearance"
                description="Choose a theme and navigation layout for this browser."
            >
                <div className="space-y-5 p-4 sm:p-5">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">
                                Colour theme
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Your selection is applied immediately and follows you across this browser.
                            </p>
                        </div>
                        <div
                            role="group"
                            aria-label="Colour theme"
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
                        >
                            {themeChoices.map((choice) => (
                                <ThemeChoice
                                    key={choice.value}
                                    value={choice.value}
                                    selected={activeTheme === choice.value}
                                    description={choice.description}
                                    onSelect={() => setTheme(choice.value)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <SettingsSection
                    title="Account"
                    description="Identity details from your sign-in account."
                >
                    <div className="flex items-center gap-3 border-b border-border bg-surface-muted/30 px-4 py-4 sm:px-5">
                        <Avatar
                            name={user?.fullName}
                            size="lg"
                            decorative
                        />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {user?.fullName ?? "Account name unavailable"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {user?.email ?? "Email unavailable"}
                            </p>
                        </div>
                    </div>
                    <dl className="divide-y divide-border">
                        <InfoRow
                            label="User ID"
                            value={user?.id ?? null}
                            mono
                            copyValue={user?.id}
                        />
                        <InfoRow label="Email" value={user?.email ?? null} />
                        <InfoRow label="Role" value={user?.role ?? "—"} />
                    </dl>
                </SettingsSection>

                <SettingsSection
                    title="Workspace"
                    description="Your current workspace and live team overview."
                >
                    <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                        <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <UsersRound className="size-3.5" aria-hidden="true" />
                                Members
                            </div>
                            <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                                {membersQuery.isError
                                    ? "—"
                                    : membersQuery.isPending
                                      ? "…"
                                      : members?.length ?? 0}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Workspace roster
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Activity className="size-3.5" aria-hidden="true" />
                                Online now
                            </div>
                            <p className="mt-2 flex items-center gap-2 text-xl font-semibold tabular-nums text-foreground">
                                {membersQuery.isError || membersQuery.isPending
                                    ? "—"
                                    : onlineCount}
                                {!membersQuery.isError && !membersQuery.isPending && members && members.length > 0 ? (
                                    <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                                ) : null}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {membersQuery.isError
                                    ? "Presence unavailable"
                                    : membersQuery.isPending
                                      ? "Loading roster…"
                                      : `Of ${members?.length ?? 0} members`}
                            </p>
                        </div>
                    </div>
                    <dl className="divide-y divide-border border-t border-border">
                        <InfoRow label="Workspace" value={workspace?.name ?? null} />
                        <InfoRow
                            label="URL slug"
                            value={workspace?.slug ?? null}
                            mono
                            copyValue={workspace?.slug}
                        />
                    </dl>
                    {membersQuery.isError ? (
                        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
                            <p className="text-xs text-muted-foreground" role="status">
                                Workspace metrics could not be loaded.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void membersQuery.refetch()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : null}
                </SettingsSection>
            </div>

            <SettingsSection
                title="AI assistance"
                description="Configure on-device AI drafting and the draft details shown to your team."
            >
                <div className="border-b border-border p-4 sm:p-5">
                    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-muted/40 p-4 sm:flex-row sm:items-center">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                            <ShieldCheck className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">
                                Runs privately on this device
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                Uses Qwen2.5-0.5B-Instruct locally. The first use downloads several hundred MB; prompts are not sent to an AI service.
                            </p>
                            <a
                                href="https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                            >
                                Model details and license
                            </a>
                        </div>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
<span
    className={cn(
        "size-1.5 rounded-full",
        aiEnabled ? "bg-success" : "bg-destructive/20"
    )}
    aria-hidden="true"
/>
{aiEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                </div>

                <FeatureToggleRow
                    title="AI work-item drafts"
                    description="Generate a structured title, description, priority, and labels from a prompt."
                    icon={Sparkles}
                    checked={aiEnabled}
                    onChange={toggleMasterAi}
                />

                {aiEnabled ? (
                    <div className="border-t border-border px-4 py-4 sm:px-5">
                                        <label
                                            htmlFor="ai-model"
                                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                        >
                                            Model
                                        </label>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Runs on-device. Smaller models download faster and use less memory.
                                        </p>
                                        <select
                                            id="ai-model"
                                            value={aiModelId}
                                            onChange={(event) =>
                                                setModelId(event.target.value)
                                            }
                                            className="mt-2 h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                                        >
                                            {selectableModels.map((model) => (
                                                <option
                                                    key={model.id}
                                                    value={model.id}
                                                >
                                                    {model.displayName} · ~
                                                    {formatBytes(
                                                        model.estimatedDownloadBytes
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                ) : null}

                <div className={cn("border-t border-border", !aiEnabled && "opacity-70")}>
                    <div className="px-4 pb-1 pt-3 sm:px-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Draft options
                        </h3>
                    </div>
                    {AI_OPTIONS.map((option) => (
                        <FeatureToggleRow
                            key={option.key}
                            title={option.title}
                            description={option.description}
                            icon={option.icon}
                            checked={aiFlags[option.key]}
                            disabled={!aiEnabled}
                            onChange={() =>
                                setFlag(option.key, !aiFlags[option.key])
                            }
                        />
                    ))}
                    {!aiEnabled ? (
                        <p className="px-4 pb-4 text-xs text-muted-foreground sm:px-5">
                            Enable AI work-item drafts to configure these options.
                        </p>
                    ) : null}
                </div>
            </SettingsSection>

            <SettingsSection
                title="Session"
                description="Review this browser session or sign out when you’re finished."
            >
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                            <ShieldCheck className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Session expiration
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {expiresAtUtc
                                    ? `Access expires ${formatDateTime(expiresAtUtc)}.`
                                    : "Expiration details are unavailable."}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Signing out clears the stored token from this browser.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            logout();
                            navigate("/login", { replace: true });
                        }}
                    >
                        <LogOut aria-hidden="true" />
                        Sign out
                    </Button>
                </div>
            </SettingsSection>
        </div>
    );
}
