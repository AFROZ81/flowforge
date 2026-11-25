import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import {
    Activity,
    ArrowDown,
    ArrowUp,
    Bell,
    Check,
    Command,
    CornerDownLeft,
    FolderKanban,
    LayoutDashboard,
    Moon,
    Search,
    Settings2,
    ShieldCheck,
    Sun,
} from "lucide-react";
import type {
    LucideIcon,
} from "lucide-react";
import {
    useNavigate,
} from "react-router";
import {
    useTheme,
} from "next-themes";
import {
    createPortal,
} from "react-dom";

import {
    Input,
} from "@/components/ui/input";
import {
    cn,
} from "@/lib/utils";
import {
    useCommandPaletteStore,
} from "./useCommandPaletteStore";

type CommandGroup = "Recent" | "Navigate" | "Appearance";

type CommandAction = {
    id: string;
    label: string;
    description: string;
    keywords: string[];
    group: Exclude<CommandGroup, "Recent">;
    icon: LucideIcon;
    execute: () => void;
};

const GROUPS: Exclude<CommandGroup, "Recent">[] = ["Navigate", "Appearance"];
const MAX_RECENT_COMMANDS = 3;

function commandId(id: string): string {
    return `command-option-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function actionScore(action: CommandAction, query: string): number | null {
    const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const label = action.label.toLocaleLowerCase();
    const searchable = [
        action.label,
        action.description,
        ...action.keywords,
    ].join(" ").toLocaleLowerCase();

    if (!terms.every((term) => searchable.includes(term))) {
        return null;
    }

    return terms.reduce((score, term) => {
        if (label === term) return score + 100;
        if (label.startsWith(term)) return score + 60;
        if (label.includes(term)) return score + 35;
        if (action.keywords.some((keyword) => keyword.toLocaleLowerCase().startsWith(term))) {
            return score + 20;
        }
        return score + 5;
    }, 0);
}

export function CommandPalette() {
    const { isOpen, query, close, toggle, setQuery } =
        useCommandPaletteStore();
    const navigate = useNavigate();
    const { setTheme, theme } = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const optionRefs = useRef(new Map<string, HTMLButtonElement>());
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const prefersReducedMotion = useReducedMotion();

    const runNavigation = useCallback(
        (path: string) => {
            navigate(path);
            close();
        },
        [navigate, close]
    );

    const actions: CommandAction[] = useMemo(
        () => [
            {
                id: "nav.dashboard",
                label: "Go to dashboard",
                description: "Your workspace overview",
                keywords: ["dashboard", "home", "overview", "stats"],
                group: "Navigate",
                icon: LayoutDashboard,
                execute: () => runNavigation("/dashboard"),
            },
            {
                id: "nav.projects",
                label: "Browse projects",
                description: "Projects, boards, and workspaces",
                keywords: ["projects", "boards", "workspaces"],
                group: "Navigate",
                icon: FolderKanban,
                execute: () => runNavigation("/projects"),
            },
            {
                id: "nav.notifications",
                label: "Open notifications",
                description: "Recent activity and alerts",
                keywords: ["notifications", "alerts", "activity", "inbox"],
                group: "Navigate",
                icon: Bell,
                execute: () => runNavigation("/notifications"),
            },
            {
                id: "nav.reports",
                label: "View reports",
                description: "Explore workspace insights",
                keywords: ["reports", "analytics", "insights", "charts"],
                group: "Navigate",
                icon: Activity,
                execute: () => runNavigation("/reports"),
            },
            {
                id: "nav.settings",
                label: "Open settings",
                description: "Account and workspace preferences",
                keywords: ["settings", "preferences", "account", "profile"],
                group: "Navigate",
                icon: Settings2,
                execute: () => runNavigation("/settings"),
            },
            {
                id: "nav.audit-logs",
                label: "View audit log",
                description: "Administrative activity history",
                keywords: ["audit", "logs", "admin", "security", "history"],
                group: "Navigate",
                icon: ShieldCheck,
                execute: () => runNavigation("/audit-logs"),
            },
            {
                id: "theme.light",
                label: "Use light theme",
                description: "A bright, clear workspace",
                keywords: ["theme", "light", "appearance"],
                group: "Appearance",
                icon: Sun,
                execute: () => {
                    setTheme("light");
                    close();
                },
            },
            {
                id: "theme.dark",
                label: "Use dark theme",
                description: "A low-light workspace",
                keywords: ["theme", "dark", "appearance"],
                group: "Appearance",
                icon: Moon,
                execute: () => {
                    setTheme("dark");
                    close();
                },
            },
            {
                id: "theme.system",
                label: "Use system theme",
                description: "Match your device appearance",
                keywords: ["theme", "system", "automatic", "appearance"],
                group: "Appearance",
                icon: Command,
                execute: () => {
                    setTheme("system");
                    close();
                },
            },
        ],
        [runNavigation, setTheme, close]
    );

    const filteredActions = useMemo(() => {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
            return actions;
        }

        return actions
            .map((action) => ({ action, score: actionScore(action, normalizedQuery) }))
            .filter((entry): entry is { action: CommandAction; score: number } => entry.score !== null)
            .sort((a, b) => b.score - a.score)
            .map(({ action }) => action);
    }, [actions, query]);

    const recentActions = useMemo(() => {
        if (query.trim()) return [];
        return recentIds
            .map((id) => actions.find((action) => action.id === id))
            .filter((action): action is CommandAction => action !== undefined);
    }, [actions, query, recentIds]);

    const groups = useMemo(() => {
        const result: { label: CommandGroup; actions: CommandAction[] }[] = [];
        if (recentActions.length > 0) {
            result.push({ label: "Recent", actions: recentActions });
        }

        for (const group of GROUPS) {
            const groupActions = filteredActions.filter((action) => {
                if (action.group !== group) return false;
                return !recentActions.some((recent) => recent.id === action.id);
            });
            if (groupActions.length > 0) {
                result.push({ label: group, actions: groupActions });
            }
        }
        return result;
    }, [filteredActions, recentActions]);

    const visibleActions = useMemo(
        () => groups.flatMap((group) => group.actions),
        [groups]
    );
    const activeIndex = visibleActions.length === 0
        ? -1
        : Math.min(highlightedIndex, visibleActions.length - 1);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLocaleLowerCase() === "k"
            ) {
                event.preventDefault();
                setHighlightedIndex(0);
                if (!isOpen && document.activeElement instanceof HTMLElement) {
                    previousFocusRef.current = document.activeElement;
                }
                toggle();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, toggle]);

    useEffect(() => {
        if (isOpen) {
            const frame = requestAnimationFrame(() => inputRef.current?.focus());
            return () => cancelAnimationFrame(frame);
        }

        previousFocusRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        const id = activeIndex >= 0 ? visibleActions[activeIndex]?.id : undefined;
        if (id) {
            optionRefs.current.get(id)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex, visibleActions]);

    const handleSelect = useCallback(
        (action: CommandAction) => {
            setRecentIds((current) => [
                action.id,
                ...current.filter((id) => id !== action.id),
            ].slice(0, MAX_RECENT_COMMANDS));
            action.execute();
        },
        []
    );

    const onSearchKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "ArrowDown" && visibleActions.length > 0) {
                event.preventDefault();
                setHighlightedIndex((activeIndex + 1) % visibleActions.length);
            } else if (event.key === "ArrowUp" && visibleActions.length > 0) {
                event.preventDefault();
                setHighlightedIndex((activeIndex - 1 + visibleActions.length) % visibleActions.length);
            } else if (event.key === "Enter") {
                event.preventDefault();
                const action = activeIndex >= 0 ? visibleActions[activeIndex] : undefined;
                if (action) handleSelect(action);
            }
        },
        [visibleActions, activeIndex, handleSelect]
    );

    const onPanelKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            close();
        } else if (event.key === "Tab") {
            event.preventDefault();
            inputRef.current?.focus();
        }
    }, [close]);

    const motionTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.16, ease: "easeOut" as const };

    return typeof document === "undefined"
        ? null
        : createPortal(
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: motionTransition }}
                            exit={{ opacity: 0, transition: motionTransition }}
                            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
                            style={{ position: "fixed", inset: 0, zIndex: 2147483000 }}
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -6, scale: prefersReducedMotion ? 1 : 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: motionTransition }}
                            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4, scale: prefersReducedMotion ? 1 : 0.99, transition: motionTransition }}
                            className="fixed mx-auto flex max-h-[80vh] min-h-64 flex-col overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl outline-none"
                            style={{
                                position: "fixed",
                                top: "10vh",
                                left: 0,
                                right: 0,
                                width: "min(36rem, calc(100vw - 2rem))",
                                maxHeight: "80dvh",
                                minHeight: "16rem",
                                backgroundColor: "var(--popover, white)",
                                color: "var(--popover-foreground, #111827)",
                                borderColor: "var(--border, #d1d5db)",
                                boxShadow: "0 24px 80px rgb(0 0 0 / 0.28)",
                                zIndex: 2147483001,
                            }}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={onPanelKeyDown}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="command-palette-title"
                            aria-describedby="command-palette-description"
                            tabIndex={-1}
                        >
                        <motion.div
                            className="flex min-h-0 flex-col"
                        >
                            <h2 id="command-palette-title" className="sr-only">
                                Command palette
                            </h2>
                            <p id="command-palette-description" className="sr-only">
                                Search pages and actions. Use the arrow keys to navigate and Enter to run a command.
                            </p>

                            <div className="border-b border-border/70 px-4 py-3">
                                <div
                                    role="search"
                                    className="group flex h-12 items-center gap-3 rounded-xl border border-input/80 bg-surface-muted/45 px-3.5 shadow-sm transition-colors focus-within:border-primary/45 focus-within:bg-card focus-within:ring-4 focus-within:ring-primary/10 dark:bg-surface-sunken/45 dark:focus-within:bg-surface-muted/60"
                                >
                                    <Search
                                        className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(event) => {
                                            setHighlightedIndex(0);
                                            setQuery(event.target.value);
                                        }}
                                        onKeyDown={onSearchKeyDown}
                                        placeholder="Search pages, settings, and actions..."
                                        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/70 hover:bg-transparent focus-visible:border-0 focus-visible:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent dark:focus-visible:bg-transparent"
                                        aria-label="Search commands"
                                        aria-autocomplete="list"
                                        aria-controls="command-results"
                                        aria-expanded="true"
                                        aria-activedescendant={
                                            activeIndex >= 0
                                                ? commandId(visibleActions[activeIndex].id)
                                                : undefined
                                        }
                                        role="combobox"
                                    />
                                    <kbd className="hidden shrink-0 rounded-md border border-border/80 bg-card/80 px-1.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground shadow-xs sm:inline-flex">
                                        ESC
                                    </kbd>
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex items-center justify-between px-4 pb-2 pt-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        {query.trim() ? "Search results" : "Quick actions"}
                                    </p>
                                    <span
                                        className="text-xs text-muted-foreground"
                                        aria-live="polite"
                                        aria-atomic="true"
                                    >
                                        {filteredActions.length}{" "}
                                        {filteredActions.length === 1 ? "result" : "results"}
                                    </span>
                                </div>

                                <div
                                    id="command-results"
                                    className="min-h-0 flex-1 overflow-y-auto px-2 pb-2"
                                    role="listbox"
                                    aria-label="Command results"
                                >
                                    {groups.map((group) => (
                                        <div
                                            key={group.label}
                                            role="group"
                                            aria-label={group.label}
                                            className="mb-2 last:mb-0"
                                        >
                                            <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
                                                {group.label}
                                            </div>
                                            {group.actions.map((action) => {
                                                const index = visibleActions.findIndex(
                                                    (entry) => entry.id === action.id
                                                );
                                                const active = index === activeIndex;
                                                const Icon = action.icon;
                                                const activeTheme =
                                                    action.id === "theme.light"
                                                        ? theme === "light"
                                                        : action.id === "theme.dark"
                                                          ? theme === "dark"
                                                          : action.id === "theme.system" && theme === "system";

                                                return (
                                                    <button
                                                        key={action.id}
                                                        id={commandId(action.id)}
                                                        ref={(node) => {
                                                            if (node) optionRefs.current.set(action.id, node);
                                                            else optionRefs.current.delete(action.id);
                                                        }}
                                                        type="button"
                                                        tabIndex={-1}
                                                        role="option"
                                                        aria-selected={active}
                                                        onClick={() => handleSelect(action)}
                                                        onMouseEnter={() => setHighlightedIndex(index)}
                                                        className={cn(
                                                            "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                                                            active
                                                                ? "bg-surface-muted"
                                                                : "hover:bg-surface-muted/70"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                                                active
                                                                    ? "border-border bg-card text-foreground shadow-xs"
                                                                    : "border-transparent bg-surface-muted text-muted-foreground group-hover:bg-card"
                                                            )}
                                                        >
                                                            <Icon className="size-4" aria-hidden="true" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-2">
                                                                <span className="truncate text-sm font-medium text-foreground">
                                                                    {action.label}
                                                                </span>
                                                                {activeTheme && (
                                                                    <Check
                                                                        className="size-3.5 text-primary"
                                                                        aria-label="Current theme"
                                                                    />
                                                                )}
                                                            </span>
                                                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                                {action.description}
                                                            </span>
                                                        </span>
                                                        <CornerDownLeft
                                                            className={cn(
                                                                "size-3.5 shrink-0 text-muted-foreground transition-opacity",
                                                                active ? "opacity-100" : "opacity-0"
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {visibleActions.length === 0 && (
                                        <div className="flex flex-col items-center px-6 py-10 text-center">
                                            <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground">
                                                <Search className="size-4" aria-hidden="true" />
                                            </span>
                                            <p className="text-sm font-medium text-foreground">
                                                No commands found
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Try another search term or browse the available actions.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted/50 px-4 py-2.5">
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <kbd className="rounded border border-border bg-card px-1 py-0.5">
                                            <ArrowUp className="size-2.5" aria-label="Up" />
                                        </kbd>
                                        <kbd className="rounded border border-border bg-card px-1 py-0.5">
                                            <ArrowDown className="size-2.5" aria-label="Down" />
                                        </kbd>
                                        <span className="ml-0.5">Navigate</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <kbd className="rounded border border-border bg-card px-1 py-0.5">
                                            <CornerDownLeft className="size-2.5" aria-label="Enter" />
                                        </kbd>
                                        <span>Open</span>
                                    </span>
                                </div>
                                <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
                                    Open anytime
                                    <kbd className="ml-1 rounded border border-border bg-card px-1.5 py-0.5 font-medium">
                                        {typeof navigator !== "undefined" &&
                                        /Mac|iPhone|iPad/.test(navigator.platform)
                                            ? "⌘ K"
                                            : "Ctrl K"}
                                    </kbd>
                                </span>
                            </div>
                        </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>,
            document.body
        );
}
