import { useState } from "react";
import { Link } from "react-router";
import { BarChart3, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import CreateProjectDialog from "@/features/projects/components/CreateProjectDialog";
import { useAuthStore } from "@/stores/auth.store";

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";

    return "Good evening";
}

/**
 * The dashboard's opening band.
 *
 * Replaces the large white card with two blurred color blobs and an emoji.
 * The greeting now carries the person's name and the date, and the primary
 * action opens the real create-project dialog instead of quietly navigating
 * to a list page.
 */
export default function DashboardHero() {
    const [createOpen, setCreateOpen] = useState(false);
    const reduceMotion = useReducedMotion();

    const fullName = useAuthStore((s) => s.user?.fullName);
    const firstName = fullName?.trim().split(/\s+/)[0];

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <section className="relative overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            {/* Depth comes from a single low-contrast wash, not from blobs */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary/40 via-brand-indigo/25 to-transparent"
            />

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                className="
                    relative flex flex-col gap-4 p-5 sm:p-6
                    lg:flex-row lg:items-center lg:justify-between lg:gap-6
                "
            >
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                        {today}
                    </p>

                    <h1 className="mt-1.5 font-heading text-xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-2xl">
                        {greeting()}
                        {firstName ? (
                            <span>, {firstName}</span>
                        ) : null}
                    </h1>

                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Here&rsquo;s what&rsquo;s moving across your workspace.
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 [&>*]:grow lg:[&>*]:grow-0">
                    <Button
                        variant="outline"
                        /*
                         * This Button renders a router Link, so it is not a
                         * native button — base-ui needs to be told, otherwise
                         * it logs a warning on every mount and keeps the
                         * native-button assumptions.
                         */
                        nativeButton={false}
                        render={
                            <Link to="/reports" />
                        }
                    >
                        <BarChart3 />
                        Reports
                    </Button>

                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus />
                        New Project
                    </Button>
                </div>
            </motion.div>

            <CreateProjectDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </section>
    );
}
