import { useRef, useState, type ReactNode } from "react";

import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from "framer-motion";
import { useTheme } from "next-themes";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import PillGroup from "@/components/ui/pill-group";
import { cn } from "@/lib/utils";
import {
    THEMES,
    parseStoredTheme,
    type ThemePreference,
} from "@/lib/themes";

import ThemeSwatch from "./ThemeSwatch";

const SYSTEM_VALUE: ThemePreference = "system";

const GROUP_ID = "theme-options";

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * The theme switch, folded into one button until it is opened.
 *
 * Five swatches is a lot of header for a page that has not been read yet, so
 * the control starts as a single outline button and the options appear beside
 * it on demand. It is a disclosure rather than a popover: the group is a
 * `role="group"` inline in the bar, which is why nothing here measures
 * position, why there is no focus trap, and why clicking elsewhere does not
 * close it — a disclosure that shuts itself when the visitor looks at
 * something else is the annoying version of this widget. Escape closes it and
 * puts the cursor back on the button it came from.
 *
 * The same `PillGroup` and `ThemeSwatch` Settings draws, in the compact
 * variant, writing the same `flowforge.theme` key — so a choice made here is
 * still made when the visitor signs in.
 *
 * `aria-controls` is only present while the group exists. Pointing at an id
 * that is not in the document is the one accessibility attribute that is
 * worse than none.
 */
export default function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const reduceMotion = useReducedMotion();

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const active = parseStoredTheme(theme);

    const options: Array<{
        id: ThemePreference;
        label: string;
        preview: ReactNode;
    }> = [
        ...THEMES.map((descriptor) => ({
            id: descriptor.id as ThemePreference,
            label: descriptor.label,
            preview: <ThemeSwatch themeId={descriptor.id} className="size-5" />,
        })),
        {
            id: SYSTEM_VALUE,
            label: "System",
            preview: <ThemeSwatch themeId={SYSTEM_VALUE} className="size-5" />,
        },
    ];

    return (
        <div
            className={cn("flex min-w-0 items-center gap-2", className)}
            onKeyDown={(event) => {
                if (event.key !== "Escape" || !open) return;

                event.stopPropagation();
                setOpen(false);
                triggerRef.current?.focus();
            }}
        >
            <AnimatePresence initial={false}>
                {open ? (
                    <motion.div
                        key={GROUP_ID}
                        initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                            reduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, x: -6 }
                        }
                        transition={{ duration: 0.2, ease: EASE }}
                        className="min-w-0"
                    >
                        <PillGroup
                            id={GROUP_ID}
                            label="Colour theme"
                            value={active}
                            options={options}
                            variant="icon"
                            onChange={(next) => setTheme(next)}
                        />
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <Button
                ref={triggerRef}
                variant="outline"
                size="icon"
                aria-label="Colour theme"
                aria-expanded={open}
                aria-controls={open ? GROUP_ID : undefined}
                onClick={() => setOpen((previous) => !previous)}
                className="shrink-0"
                title="Colour theme"
            >
                <Palette aria-hidden="true" />
            </Button>
        </div>
    );
}
