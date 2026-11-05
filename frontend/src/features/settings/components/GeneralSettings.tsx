import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import PillGroup from "@/components/ui/pill-group";
import ThemeSwatch from "@/components/layout/ThemeSwatch";
import { usePresence } from "@/features/presence";
import { useOrganizationOptions } from "@/features/auth/hooks/useOrganizationOptions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
    THEMES,
    familyOf,
    parseStoredTheme,
    type ThemePreference,
} from "@/lib/themes";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";

const SYSTEM_VALUE: ThemePreference = "system";

/* -------------------------------------------------------------------------- */
/* Layout pieces                                                              */
/* -------------------------------------------------------------------------- */

function SettingsCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <div className="border-b px-4 py-4 sm:px-5">
                <SectionHeader title={title} description={description} />
            </div>
            <div className="divide-y divide-border">{children}</div>
        </section>
    );
}

/** Label and explanation on the left, the control on the right. */
function SettingRow({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-5">
            <div className="max-w-md min-w-0">
                <div className="text-sm font-medium text-foreground">{title}</div>
                {hint ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {hint}
                    </p>
                ) : null}
            </div>
            {/*
             * Full width and scrollable on a phone, fixed to the right edge from
             * sm up. A `shrink-0` control here would be clipped outright by the
             * layout's overflow-x-hidden, leaving options nobody can reach.
             */}
            <div className="w-full min-w-0 sm:w-auto sm:shrink-0">{children}</div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    "min-w-0 max-w-full truncate text-sm font-medium tabular-nums text-foreground",
                    mono && "font-mono text-xs"
                )}
            >
                {value ?? "—"}
            </dd>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export default function GeneralSettings() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const activeTheme = parseStoredTheme(theme);

    const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
    const setSidebarCollapsed = useUiStore(
        (state) => state.setSidebarCollapsed
    );

    const user = useAuthStore((state) => state.user);
    const expiresAtUtc = useAuthStore((state) => state.expiresAtUtc);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const { data: members } = useWorkspaceMembers();
    const { data: workspaces } = useOrganizationOptions(true);
    const { onlineUserIds } = usePresence();

    const workspace =
        workspaces?.find((option) => option.id === user?.organizationId) ?? null;

    /*
     * Counted from the roster rather than from the presence feed alone: the feed
     * lists everybody the server sees as online, including people outside this
     * workspace.
     */
    const onlineCount = (members ?? []).filter((member) =>
        onlineUserIds.includes(member.id)
    ).length;

    /* The same primitive the landing header uses, in its labeled variant: a
       settings row has the width for the name, a header does not. */
    const themeOptions = [
        {
            id: SYSTEM_VALUE,
            label: "System",
            preview: <ThemeSwatch themeId={SYSTEM_VALUE} className="size-4" />,
        },
        ...THEMES.map((descriptor) => ({
            id: descriptor.id as ThemePreference,
            label: descriptor.label,
            preview: <ThemeSwatch themeId={descriptor.id} className="size-4" />,
        })),
    ];

    return (
        <div className="space-y-5">
            <SettingsCard
                title="Interface"
                description="How FlowForge looks and behaves in this browser."
            >
                <SettingRow
                    title="Colour theme"
                    hint={
                        activeTheme === SYSTEM_VALUE
                            ? `Following your operating system, currently ${
                                  familyOf(resolvedTheme) === "dark"
                                      ? "dark"
                                      : "light"
                              }.`
                            : "Applies immediately and is remembered for this browser."
                    }
                >
                    <PillGroup
                        label="Colour theme"
                        value={activeTheme}
                        options={themeOptions}
                        onChange={(next) => setTheme(next)}
                    />
                </SettingRow>

                <SettingRow
                    title="Sidebar"
                    hint="Compact keeps only the icons; labels appear when you hover the rail."
                >
                    <PillGroup
                        label="Sidebar width"
                        value={sidebarCollapsed ? "compact" : "expanded"}
                        options={[
                            { id: "expanded", label: "Expanded" },
                            { id: "compact", label: "Compact" },
                        ]}
                        onChange={(next) =>
                            setSidebarCollapsed(next === "compact")
                        }
                    />
                </SettingRow>
            </SettingsCard>

            <SettingsCard
                title="Account"
                description="Details come from your sign-in token and are managed by your administrator."
            >
                <dl className="divide-y divide-border">
                    <InfoRow label="Name" value={user?.fullName ?? null} />
                    <InfoRow label="Email" value={user?.email ?? null} />
                    <InfoRow label="User ID" value={user?.id ?? null} mono />
                </dl>
            </SettingsCard>

            <SettingsCard
                title="Workspace"
                description="The workspace your account belongs to."
            >
                <dl className="divide-y divide-border">
                    <InfoRow label="Name" value={workspace?.name ?? null} />
                    <InfoRow label="URL slug" value={workspace?.slug ?? null} mono />
                    <InfoRow
                        label="Members"
                        value={
                            members
                                ? `${members.length} in this workspace`
                                : null
                        }
                    />
                    <InfoRow
                        label="Online now"
                        value={
                            members && members.length > 0
                                ? `${onlineCount} of ${members.length}`
                                : null
                        }
                    />
                </dl>
            </SettingsCard>

            <SettingsCard
                title="Session"
                description="Your sign-in expires on its own; signing out here ends it immediately."
            >
                <SettingRow
                    title="Expires"
                    hint={
                        expiresAtUtc
                            ? "Tokens are not renewed automatically."
                            : undefined
                    }
                >
                    <span className="text-sm font-medium tabular-nums text-foreground">
                        {expiresAtUtc ? formatDateTime(expiresAtUtc) : "—"}
                    </span>
                </SettingRow>

                <SettingRow
                    title="Sign out"
                    hint="Clears the stored token in this browser."
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            logout();
                            navigate("/login", { replace: true });
                        }}
                    >
                        <LogOut />
                        Sign out
                    </Button>
                </SettingRow>
            </SettingsCard>
        </div>
    );
}
