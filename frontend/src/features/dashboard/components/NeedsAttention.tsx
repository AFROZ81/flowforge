import { Ban, CalendarClock, Inbox, TriangleAlert } from "lucide-react";

import { formatNumber } from "@/lib/format";

import FigureStrip from "@/components/ui/figure-strip";

import type { MyWorkSummary } from "../types/dashboard.types";

/**
 * The four numbers that decide what to do next, all scoped to the signed-in
 * user. Nothing here is a workspace total - those live in the sections below,
 * where they can be labelled as what they are.
 *
 * The bars share one denominator, `open`, so the three warning figures can be
 * compared against each other at a glance, and each tile states that
 * denominator rather than leaving the reader to guess what a count is a count
 * of.
 *
 * When there is no work at all the strip collapses to a single line. Four
 * tiles each showing a large zero is the most expensive way on the page to say
 * "nothing to see", and it is the first thing anybody meets on a fresh
 * workspace.
 *
 * Rendered as four separate cards rather than one hairline-ruled strip: every
 * other block on this page is a card, and a strip joined by 1px seams read as
 * a table row the page had accidentally grown.
 *
 * The four hues are a severity ramp, not decoration - grey is nothing yet,
 * amber is already late, red is stuck, and teal is the whole they are all
 * measured against. Overdue and Blocked were both danger before, which made
 * two of the four tiles say different things in the same colour.
 *
 * "Due in 7 days" is deliberately grey rather than info-blue: in the dark and
 * onyx schemes --primary sits at hue 256 and 232 while --info sits at 240, so
 * a blue tile beside the teal one is an eight-degree difference and the
 * original complaint would simply have moved to a different pair.
 */
export default function NeedsAttention({ summary }: { summary: MyWorkSummary }) {
    const open = summary.open;

    if (open === 0) {
        return (
            <section
                aria-label="Needs your attention"
                className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card px-4 py-3.5 shadow-xs"
            >
                <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-foreground">
                    <Inbox
                        className="size-4 shrink-0 text-success"
                        aria-hidden="true"
                    />
                    Nothing is assigned to you right now
                </span>

                <span className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-muted-foreground">
                    {[
                        ["Open", summary.open],
                        ["Overdue", summary.overdue],
                        ["Due in 7 days", summary.dueSoon],
                        ["Blocked", summary.blocked],
                    ].map(([label, value]) => (
                        <span key={label as string}>
                            {label}
                            {" "}
                            <span className="font-semibold text-foreground">
                                {formatNumber(value as number)}
                            </span>
                        </span>
                    ))}
                </span>
            </section>
        );
    }

    /* One shared denominator, said once per tile rather than assumed. */
    const share = (value: number) => value / open;
    const of = (value: number) =>
        `${Math.round((value / open) * 100)}% of your ${formatNumber(open)} open`;

    return (
        <section aria-labelledby="needs-attention-heading" className="space-y-2">
            <h2
                id="needs-attention-heading"
                className="px-1 text-xs leading-none font-semibold tracking-[0.08em] text-muted-foreground uppercase"
            >
                Needs your attention
            </h2>

            <FigureStrip
                figures={[
                    {
                        label: "Open",
                        value: formatNumber(summary.open),
                        icon: Inbox,
                        /* Full by definition - it is the denominator the other
                           three are measured against, and drawing it as such
                           makes the comparison read without a legend. */
                        share: 1,
                        caption: "assigned to you",
                    },
                    {
                        label: "Overdue",
                        value: formatNumber(summary.overdue),
                        tone: summary.overdue > 0 ? "warning" : "default",
                        share: share(summary.overdue),
                        icon: TriangleAlert,
                        caption:
                            summary.overdue > 0
                                ? of(summary.overdue)
                                : "none past their due date",
                    },
                    {
                        label: "Due in 7 days",
                        value: formatNumber(summary.dueSoon),
                        tone: summary.dueSoon > 0 ? "neutral" : "default",
                        share: share(summary.dueSoon),
                        icon: CalendarClock,
                        caption:
                            summary.dueSoon > 0
                                ? of(summary.dueSoon)
                                : "nothing landing this week",
                    },
                    {
                        label: "Blocked",
                        value: formatNumber(summary.blocked),
                        tone: summary.blocked > 0 ? "danger" : "default",
                        share: share(summary.blocked),
                        icon: Ban,
                        caption:
                            summary.blocked > 0
                                ? of(summary.blocked)
                                : "nothing waiting",
                    },
                ]}
            />
        </section>
    );
}
