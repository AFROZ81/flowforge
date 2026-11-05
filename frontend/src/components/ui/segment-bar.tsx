import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export type Segment = {
    /** Names the slice in the `title` hint, so a bar never asks "which colour?". */
    label: string;
    value: number;
    /** A `bg-*` utility. The caller owns which hue means what. */
    className: string;
};

type SegmentBarProps = {
    segments: Segment[];
    /**
     * What a full track stands for.
     *
     * Omit it to spread the segments across the whole track, which encodes
     * composition only. Set it to the largest value in a column of bars and the
     * *length* compares the rows as well - a project that is half the size of
     * the biggest one draws half the track, whatever is inside it.
     */
    total?: number;
    /** Track height and any width constraint, so a column of bars lines up. */
    className?: string;
};

/**
 * One bar, split into the states its count is made of.
 *
 * A single fill answers "how much"; segments answer "how much of what", which
 * is the question a column of bars is actually read for. The two proportions
 * nest rather than fight: the outer width is the row against `total`, the inner
 * flex weights are the row's own make-up.
 *
 * A slice with nothing in it is not drawn at all. An explicit zero-width slice
 * still costs its share of the gap between segments, so it would show as a
 * sliver of track and read as a rounding artefact; absence is the honest mark
 * of zero, and the legend beside every user of this prints the number anyway.
 *
 * The track is `foreground/10`, not `surface-sunken`. Sunken sits *below* the
 * card colour in the dark themes, so an empty track there rendered as a dark
 * smudge that read as a rendering artefact; a translucent ink tint is visible
 * against every surface in all four themes.
 */
export default function SegmentBar({
    segments,
    total,
    className,
}: SegmentBarProps) {
    const filled = segments.filter((segment) => segment.value > 0);

    const sum = filled.reduce(
        (accumulator, segment) => accumulator + segment.value,
        0
    );

    /* A caller-supplied total below the sum would clip the bar, and a sum is
       never wrong about its own composition, so the larger of the two wins. */
    const scale = Math.max(total ?? sum, sum);

    const length = scale > 0 ? (sum / scale) * 100 : 0;

    return (
        <div
            className={cn(
                "flex h-2 w-full items-center overflow-hidden rounded-full bg-foreground/10",
                className
            )}
        >
            <div
                className="flex h-full items-stretch gap-px transition-[width] duration-200 ease-out"
                style={{ width: `${length}%` }}
            >
                {filled.map((segment) => (
                    <span
                        key={segment.label}
                        title={`${segment.label}: ${formatNumber(segment.value)}`}
                        className={cn(
                            "min-w-0 rounded-full",
                            segment.className
                        )}
                        style={{ flexGrow: segment.value }}
                    />
                ))}
            </div>
        </div>
    );
}
