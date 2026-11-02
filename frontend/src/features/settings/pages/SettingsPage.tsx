import { useState } from "react";

import {
    TagsIcon,
    UserRoundIcon,
    SlidersHorizontalIcon,
    type LucideIcon,
} from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

import LabelManagement from "@/features/labels/components/LabelManagement";

type SettingsSection = "general" | "members" | "labels";

type SectionDefinition = {
    id: SettingsSection;
    label: string;
    icon: LucideIcon;
    title: string;
    description: string;
};

const SECTIONS: SectionDefinition[] = [
    {
        id: "general",
        label: "General",
        icon: SlidersHorizontalIcon,
        title: "General",
        description: "General workspace settings.",
    },
    {
        id: "members",
        label: "Members",
        icon: UserRoundIcon,
        title: "Members",
        description: "Manage workspace members and permissions.",
    },
    {
        id: "labels",
        label: "Labels",
        icon: TagsIcon,
        title: "Labels",
        description: "Create and organize the labels used across work items.",
    },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] =
        useState<SettingsSection>("labels");

    const active = SECTIONS.find((s) => s.id === activeSection)!;

    return (
        <AppLayout>
            <div className="space-y-6">

                <PageHeader
                    eyebrow="Manage"
                    title="Settings"
                    description="Configure your FlowForge workspace."
                />

                {/* =====================================================
                    SECTION SWITCHER

                    Tabs rather than a second sidebar: a nested rail inside
                    the shell rail read as two competing navigations, and a
                    240px column can't survive on a phone anyway.
                ===================================================== */}
                <nav aria-label="Settings sections">
                    <ul
                        className={cn(
                            "flex gap-1 overflow-x-auto pb-px",
                            "border-b border-border"
                        )}
                    >
                        {SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const selected = section.id === activeSection;

                            return (
                                <li key={section.id} className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveSection(section.id)
                                        }
                                        aria-current={
                                            selected ? "true" : undefined
                                        }
                                        className={cn(
                                            "relative flex h-10 items-center gap-2 rounded-t-lg px-3.5",
                                            "text-sm font-medium whitespace-nowrap",
                                            "transition-colors duration-(--transition-fast)",
                                            "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                            selected
                                                ? "text-primary"
                                                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon
                                            className="size-4"
                                            strokeWidth={selected ? 2.1 : 1.8}
                                        />
                                        {section.label}

                                        {/* Active tab underline */}
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary",
                                                "transition-opacity duration-(--transition-fast)",
                                                selected
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* =====================================================
                    PANEL
                ===================================================== */}
                <section
                    aria-label={active.title}
                    className={cn(
                        "min-h-[50vh] overflow-hidden rounded-xl border border-border bg-card shadow-xs",
                        /* The labels panel brings its own framing */
                        activeSection === "labels" && "border-none shadow-none bg-transparent"
                    )}
                >
                    {activeSection === "labels" ? (
                        <LabelManagement />
                    ) : (
                        <div className="divide-y divide-border">
                            <div className="px-5 py-5 sm:px-6">
                                <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                                    {active.title}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {active.description}
                                </p>
                            </div>

                            <div className="px-5 py-6 sm:px-6">
                                <ComingSoon section={active.label} />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

/**
 * A placeholder that says what will land here, rather than an empty
 * dashed box. Actions are intentionally absent — those features don't
 * exist yet and inventing buttons would be worse than being honest.
 */
function ComingSoon({ section }: { section: string }) {
    return (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted/60 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
                {section} settings aren&rsquo;t available yet
            </p>

            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                This area is reserved for {section.toLowerCase()} configuration
                and will appear here once it ships.
            </p>
        </div>
    );
}
