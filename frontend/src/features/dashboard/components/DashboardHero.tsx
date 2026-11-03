import { motion, useReducedMotion } from "framer-motion";

import { useAuthStore } from "@/stores/auth.store";

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";

    return "Good evening";
}

/**
 * The dashboard's opening band: the date, the greeting, nothing else.
 *
 * The Reports and New Project buttons were removed. Reports is a sidebar
 * destination, and creating a project belongs on /projects where the list
 * it adds to sits — repeating both here just competed with the content.
 */
export default function DashboardHero() {
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
                className="relative p-5 sm:p-6"
            >
                <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    {today}
                </p>

                <h1 className="mt-1.5 font-heading text-xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-2xl">
                    {greeting()}
                    {firstName ? <span>, {firstName}</span> : null}
                </h1>
            </motion.div>
        </section>
    );
}
