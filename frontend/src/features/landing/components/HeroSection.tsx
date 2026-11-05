import { Link } from "react-router";
import {
    ArrowRight,
    BarChart3,
    Radio,
    Workflow,
    type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import HeroBoardVisual from "./HeroBoardVisual";

import { CONTAINER, EASE } from "../lib/landing";

/**
 * Three properties a visitor can check for themselves in a minute of use.
 * Each one is expanded by a section further down the page.
 */
const SIGNALS: Array<{ icon: LucideIcon; label: string }> = [
    { icon: Workflow, label: "Cards move by drag" },
    { icon: Radio, label: "Presence over SignalR" },
    { icon: BarChart3, label: "One snapshot dashboard" },
];

/**
 * The opening statement, and the only filled brand action on this page.
 *
 * Registration is the primary because a visitor here does not have an account
 * yet; sign-in is the default face of the same card, so the secondary needs no
 * route of its own.
 *
 * Colour is spent in three places only — the eyebrow, one word of the
 * headline, the action — and everything else is ink. That is what keeps a hero
 * legible when the same tokens have to work on white paper and on near-black.
 *
 * The band is as tall as its content. The gap to the next section is owned by
 * the page, not by padding here, which is why there is no bottom padding on
 * this element: two bands each carrying their own vertical padding is how the
 * page ended up with a gap wide enough to park a card in.
 */
export default function HeroSection() {
    const reduceMotion = useReducedMotion();

    const enter = (delay: number) => ({
        initial: reduceMotion ? false : { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: EASE },
    });

    return (
        <section
            aria-labelledby="hero-heading"
            className={cn(
                CONTAINER,
                "grid items-center gap-x-10 gap-y-10 pt-8 sm:pt-10",
                "lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-16 lg:pt-12"
            )}
        >
            {/* =====================================================
                STATEMENT
            ===================================================== */}

            <div className="max-w-[33rem]">
                <motion.p
                    {...enter(0)}
                    className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase"
                >
                    <span
                        aria-hidden="true"
                        className="h-px w-7 shrink-0 bg-primary/45"
                    />
                    Real-time Kanban workspace
                </motion.p>

                <motion.h1
                    {...enter(0.06)}
                    className="mt-4 text-[1.85rem] leading-[1.08] font-semibold tracking-[-0.026em] text-foreground sm:text-[2.4rem] lg:text-[2.85rem]"
                >
                    Project boards that{" "}
                    <span className="text-primary">update</span> as your team
                    works
                </motion.h1>

                <motion.p
                    {...enter(0.12)}
                    className="mt-4 max-w-[44ch] text-[13.5px] leading-relaxed text-muted-foreground sm:text-sm"
                >
                    FlowForge keeps software work in one place — organizations,
                    projects, boards and the cards on them. Move a card and
                    every open screen follows it: presence, comments and
                    notifications run over SignalR, and the dashboard and
                    reports read from the same data the board does.
                </motion.p>

                <motion.div
                    {...enter(0.18)}
                    className="mt-7 flex flex-wrap items-center gap-3"
                >
                    <Button render={<Link to="/login?mode=register" />}>
                        Create an account
                        <ArrowRight aria-hidden="true" />
                    </Button>

                    <Button variant="outline" render={<Link to="/login" />}>
                        Sign in
                    </Button>
                </motion.div>

                <motion.ul
                    {...enter(0.24)}
                    className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2"
                >
                    {SIGNALS.map((signal) => {
                        const Icon = signal.icon;

                        return (
                            <li
                                key={signal.label}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0 text-primary"
                                    strokeWidth={1.9}
                                />
                                {signal.label}
                            </li>
                        );
                    })}
                </motion.ul>
            </div>

            {/* =====================================================
                THE BOARD
            ===================================================== */}

            <motion.div
                {...enter(0.16)}
                className="flex justify-center lg:justify-end"
            >
                <HeroBoardVisual />
            </motion.div>
        </section>
    );
}
