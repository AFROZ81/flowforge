import {
    BarChart3,
    FolderKanban,
    LayoutDashboard,
    ListChecks,
    Radio,
    Users,
    type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CONTAINER, EASE } from "../lib/landing";

type Capability = {
    icon: LucideIcon;
    title: string;
    body: string;
};

/**
 * Six things that exist in the product right now.
 *
 * Each sentence was checked against the code rather than copied from the
 * README: the five default columns come from the board creation handler, the
 * drag is a real move request, the realtime claims are the SignalR hub with no
 * polling anywhere in the app, and the report list is the five views on the
 * reports page. Anything planned, partial or merely documented is left out —
 * including role based access, which the backend does not implement, and
 * search, which the API serves and the UI does not yet show.
 */
const CAPABILITIES: Capability[] = [
    {
        icon: FolderKanban,
        title: "Boards",
        body: "Every board opens with Backlog, To Do, In Progress, Review and Done. Dragging a card into another column sends a move request, so the order survives a reload.",
    },
    {
        icon: ListChecks,
        title: "Work items",
        body: "Status, priority, due date and assignee on the card itself, with checklists, labels, comments, files and a history of every change behind it.",
    },
    {
        icon: Radio,
        title: "Real-time",
        body: "Notifications, who is online, and who is already on the board you opened arrive over a SignalR hub rather than on a timer.",
    },
    {
        icon: LayoutDashboard,
        title: "Dashboard",
        body: "Your open work, project health, throughput, status and priority mix, and team workload — one snapshot, so every figure describes the same instant.",
    },
    {
        icon: BarChart3,
        title: "Reports",
        body: "Work items, projects, assignees, labels and productivity trends. Each view is addressed in the URL, so a report is a link you can send.",
    },
    {
        icon: Users,
        title: "Organizations",
        body: "All work belongs to an organization and sessions are carried by JWTs. The member list shows presence and load beside each person.",
    },
];

/**
 * The capabilities band.
 *
 * The heading and its note share a row from `sm`, with the note sitting on the
 * right like a column header. Stacking them cost a line of heading, a line of
 * note and the space between, and then the grid started — six tiles read better
 * as one block than as two blocks separated by air.
 *
 * The icon disc is `bg-primary-subtle`, the treatment the app gives its own
 * section headings, which is what makes this page and the product look like one
 * thing rather than a brochure for it.
 */
export default function CapabilityGrid() {
    const reduceMotion = useReducedMotion();

    return (
        <section aria-labelledby="capabilities-heading" className={CONTAINER}>
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="
                    flex flex-wrap items-end justify-between gap-x-8 gap-y-2
                "
            >
                <h2
                    id="capabilities-heading"
                    className="text-[1.4rem] leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-[1.55rem]"
                >
                    What is in the app
                </h2>
            </motion.div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CAPABILITIES.map((capability, index) => {
                    const Icon = capability.icon;

                    return (
                        <motion.li
                            key={capability.title}
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{
                                duration: 0.45,
                                delay: reduceMotion ? 0 : index * 0.04,
                                ease: EASE,
                            }}
                            className="
                                flex flex-col gap-3 rounded-xl border bg-card p-4
                                shadow-xs transition-[border-color,box-shadow]
                                duration-200 ease-out hover:border-border-strong
                                hover:shadow-md
                            "
                        >
                            <span
                                aria-hidden="true"
                                className="
                                    flex size-9 shrink-0 items-center
                                    justify-center rounded-lg bg-primary-subtle
                                    text-primary
                                "
                            >
                                <Icon className="size-[17px]" strokeWidth={1.9} />
                            </span>

                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {capability.title}
                                </h3>

                                <p className="mt-1.5 text-[13px] leading-[1.6] text-muted-foreground">
                                    {capability.body}
                                </p>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
        </section>
    );
}
