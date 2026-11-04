import { cn } from "@/lib/utils";

type MeterProps = {
    value: number;
    total: number;
    /** Which measure the fill represents. */
    tone?: "primary" | "success";
    /**
     * Print the exact percentage beside the bar. Turn it off when `total` is
     * not a whole the value belongs to - a bar comparing people to the busiest
     * member is not a percentage of anything a reader could verify.
     */
    showValue?: boolean;
    /** Width of the track, so a column of meters lines up. */
    className?: string;
};

function share(value: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
}

/**
 * A bar with its exact percentage beside it.
 *
 * The bar is for scanning a column at a glance; the number is for reading it
 * precisely. Neither alone is enough, which is why they ship as one component.
 *
 * The track is `foreground/10`, not `surface-sunken`. Sunken sits *below* the
 * card colour in the dark themes, so an empty track there rendered as a dark
 * smudge that read as a rendering artefact; a translucent ink tint is visible
 * against every surface in all four themes.
 */
export default function Meter({
    value,
    total,
    tone = "primary",
    showValue = true,
    className,
}: MeterProps) {
    const percentage = share(value, total);

    return (
        <div className={cn("flex min-w-28 items-center gap-2", className)}>
            <div className="h-1.5 flex-1 rounded-full bg-foreground/10">
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-200 ease-out",
                        tone === "success" ? "bg-success" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue ? (
                <span className="w-11 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {Number(percentage.toFixed(1))}%
                </span>
            ) : null}
        </div>
    );
}
