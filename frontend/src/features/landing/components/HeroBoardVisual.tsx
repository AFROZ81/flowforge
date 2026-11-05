import { Hand, Kanban } from "lucide-react";

import { cn } from "@/lib/utils";

type CardSpec = {
    /** Line widths vary so the blocks read as different cards, not one repeated. */
    lead: string;
    follow: string;
    /** The stripe down the left edge, in the hues the app already uses. */
    rail: string;
};

/**
 * Three of the five real columns.
 *
 * The names are the ones `CreateBoardCommandHandler` writes into every new
 * board, so the illustration shows the product's actual workflow rather than
 * an invented one. No titles, no numbers and no people are put in it: the
 * lines are bars, because a made-up card title is exactly the dummy content
 * this page is meant to avoid.
 */
const COLUMNS: Array<{ name: string; cards: CardSpec[]; dropTarget?: boolean }> =
    [
        {
            name: "To Do",
            cards: [
                { lead: "w-[84%]", follow: "w-[52%]", rail: "bg-primary" },
                {
                    lead: "w-[68%]",
                    follow: "w-[40%]",
                    rail: "bg-muted-foreground/45",
                },
            ],
        },
        {
            name: "In Progress",
            cards: [{ lead: "w-[76%]", follow: "w-[44%]", rail: "bg-warning" }],
        },
        {
            name: "Done",
            cards: [{ lead: "w-[64%]", follow: "w-[34%]", rail: "bg-success" }],
            dropTarget: true,
        },
    ];

function CardLines({ spec, flying }: { spec: CardSpec; flying?: boolean }) {
    return (
        <div
            className={cn(
                "flex gap-1.5 rounded-md border bg-card p-1.5 shadow-xs",
                flying && "border-primary/35 shadow-lg"
            )}
        >
            <span
                aria-hidden="true"
                className={cn("w-[3px] shrink-0 rounded-full", spec.rail)}
            />

            <div className="min-w-0 flex-1">
                {/* The lines are ink over transparency, not
                    `bg-surface-sunken`. Measured: sunken sits only 1.07:1 from
                    the card in onyx, so the schematic would have drawn an
                    empty card there — the same failure that already moved the
                    meters and the share bars off that token. */}
                <span
                    className={cn(
                        "block h-1 rounded-full bg-foreground/16",
                        spec.lead
                    )}
                />

                <span
                    className={cn(
                        "mt-1 block h-1 rounded-full bg-foreground/16",
                        spec.follow
                    )}
                />

                <span className="mt-1.5 flex items-center gap-1.5">
                    <span className="h-1 w-6 rounded-full bg-primary/40" />
                    <span className="size-1 rounded-full bg-success/70" />
                </span>
            </div>
        </div>
    );
}

/**
 * The hero's focal graphic: a board, with one card on its way to another
 * column.
 *
 * It replaces the supplied `hero.png`, which is drawn in light lines on
 * transparency and therefore cannot survive a light theme — the honest way to
 * be theme-compatible is to draw the thing from tokens. Everything in it is a
 * semantic colour, so it re-skins with the rest of the page.
 *
 * The lifted card is the product's headline interaction rather than
 * decoration: a card leaves its column, crosses the gap, the column it is
 * heading for opens a dashed target, and a hand is holding it — centred on the
 * card, the way a hand actually carries one. It is hidden below `sm`, where a
 * 90-pixel column has no room for anything but the board itself.
 *
 * Sized to sit inside the hero band without stretching it. A graphic that is
 * taller than the copy beside it decides the height of the whole row, and the
 * row then has to be padded to look deliberate — which is where the page got
 * the gap this version is meant to close.
 *
 * The whole thing is `aria-hidden`: it is a picture, and a screen reader
 * reading three column names followed by nothing at all is noise.
 */
export default function HeroBoardVisual() {
    return (
        <div
            aria-hidden="true"
            className="relative w-full max-w-[27rem] lg:w-[25rem]"
        >
            {/* A tint behind the card, so the graphic sits in front of the
                page rather than on it. */}
            <div
                className="absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
                style={{
                    background:
                        "radial-gradient(60% 60% at 50% 45%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 70%)",
                }}
            />

            <div className="rounded-xl border bg-card shadow-lg">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                        <Kanban className="size-3" strokeWidth={2} />
                    </span>

                    <span className="text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                        Kanban board
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1.5 sm:gap-2 sm:p-2.5">
                    {COLUMNS.map((column) => (
                        <div
                            key={column.name}
                            className="rounded-md bg-surface-muted/70 p-1 sm:p-1.5"
                        >
                            <p className="mb-1.5 truncate px-0.5 text-[9px] font-semibold tracking-[0.05em] text-muted-foreground uppercase sm:text-[10px]">
                                {column.name}
                            </p>

                            <div className="space-y-1.5">
                                {column.cards.map((spec, index) => (
                                    <CardLines
                                        key={index}
                                        spec={spec}
                                        flying={false}
                                    />
                                ))}

                                {column.dropTarget ? (
                                    <div className="h-[2.6rem] rounded-md border-2 border-dashed border-primary/45 bg-primary/5" />
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* The card in flight, parked on the boundary between the columns
                it is leaving and joining, over the target it is heading for. */}
            <div className="absolute top-[54%] left-[50%] hidden w-[28%] rotate-3 sm:block">
                <CardLines
                    spec={{ lead: "w-[78%]", follow: "w-[50%]", rail: "bg-info" }}
                    flying
                />

                {/*
                 * Centred on the card rather than hung off its corner, because
                 * that is where a hand holds a thing: palm behind, fingertips
                 * across the middle. Filled with `--card` so it masks the two
                 * bars it covers instead of tangling with them, and lifted by
                 * an ink stroke plus one drop shadow so it reads as sitting
                 * above the card rather than printed on it.
                 *
                 * The wrapper deliberately has no `cursor-grabbing`. This
                 * graphic is `aria-hidden` and cannot be dragged, so a grabbing
                 * cursor over it would be a promise the page does not keep —
                 * the drawn hand is doing all the work on its own.
                 */}
                <Hand
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="
                        absolute top-1/2 left-1/2 size-5 -translate-x-1/2
                        -translate-y-1/2 -rotate-6 fill-card text-foreground
                        drop-shadow-sm
                    "
                />
            </div>
        </div>
    );
}
