import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CONTAINER, EASE } from "../lib/landing";

/**
 * The five persisted levels, outermost first.
 *
 * These are the entities the application actually models — each one owns the
 * next — and the chain stops at the work item because that is the thing a
 * board is made of. Labels and comments are attributes of a work item rather
 * than levels of the hierarchy, so they are not drawn as if they were.
 *
 * The notes are kept to one short line each. In an even grid the widest note
 * sets how tall every cell has to be, so a note that wraps once makes the
 * whole chain taller to say nothing new.
 */
const LEVELS = [
    { name: "Organization", note: "The top-level scope" },
    { name: "Project", note: "Boards under a key" },
    { name: "Board", note: "Five columns to start" },
    { name: "Column", note: "A stage, in order" },
    { name: "Work item", note: "The card that moves" },
];

/**
 * The hierarchy as a chain rather than as a diagram.
 *
 * A grid, because the cells have to be equal and a row of flex items sized by
 * their own text is the opposite of that: the chip holding "One workflow,
 * five columns to start" was visibly wider than the one holding "The card
 * that moves", which made five levels of the same model look like five
 * unrelated callouts. `grid-cols-5` at `lg` and `grid-cols-2` below it give
 * every level the same measure by construction, and the odd fifth item simply
 * starts its own row rather than stretching to fill one.
 *
 * The connector lives in the column gap rather than in the flow. It used to be
 * a sibling of each chip, so the first cell — the only one with no arrow
 * before it — kept the width the other four had paid to the arrow. Here it is
 * a box the exact width of the gap, parked on that gap and centred inside it,
 * so it costs the cells nothing.
 *
 * Both read one custom property, `--chain-gap`, rather than each quoting
 * `1.75rem`. Two numbers that have to agree is a bug waiting for the day one
 * of them is edited.
 */
export default function DomainTrail() {
    const reduceMotion = useReducedMotion();

    return (
        <section aria-labelledby="structure-heading" className={CONTAINER}>
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2"
            >
                <h2
                    id="structure-heading"
                    className="text-[1.4rem] leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-[1.55rem]"
                >
                    How work is organized
                </h2>
            </motion.div>

            <motion.ol
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="
                    mt-6 grid gap-x-(--chain-gap) gap-y-3
                    [--chain-gap:0.75rem] sm:grid-cols-2
                    lg:grid-cols-5 lg:[--chain-gap:1.75rem] lg:gap-y-0
                "
            >
                {LEVELS.map((level, index) => (
                    <li key={level.name} className="relative">
                        {index > 0 ? (
                            <span
                                aria-hidden="true"
                                className="
                                    pointer-events-none absolute inset-y-0
                                    -left-(--chain-gap) hidden
                                    w-(--chain-gap) items-center
                                    justify-center lg:flex
                                "
                            >
                                <ChevronRight
                                    className="size-3.5 text-muted-foreground/60"
                                    strokeWidth={2}
                                />
                            </span>
                        ) : null}

                        <div className="
                            h-full rounded-lg border bg-card px-3.5 py-2
                            shadow-xs
                        ">
                            <p className="truncate text-[13px] leading-tight font-semibold text-foreground">
                                {level.name}
                            </p>

                            <p className="mt-1 truncate text-[11px] leading-tight text-muted-foreground">
                                {level.note}
                            </p>
                        </div>
                    </li>
                ))}
            </motion.ol>
        </section>
    );
}
