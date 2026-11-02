import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ProgressBar, type ProgressTone } from "@/components/ui/progress";

export type DistributionRow = {
  name: string;
  count: number;
  percentage: number;
};

type Props = {
  items: DistributionRow[];
  /** Maps a bucket name to a tone so status colors stay consistent. */
  toneFor: (name: string) => ProgressTone;
  /** Animate the fill on mount — respects prefers-reduced-motion globally. */
  animate?: boolean;
  className?: string;
};

const dotTone: Record<ProgressTone, string> = {
  brand: "bg-primary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-foreground/50",
};

/**
 * Ranked category list with a share bar — the shape both the status and
 * priority widgets needed, previously written twice with different palettes.
 */
export function DistributionList({
  items,
  toneFor,
  animate = true,
  className,
}: Props) {
  // Largest share first: the eye should meet the dominant bucket immediately
  const ordered = [...items].sort((a, b) => b.count - a.count);
  const total = ordered.reduce((sum, item) => sum + item.count, 0);

  return (
    <ul className={cn("space-y-4", className)}>
      {ordered.map((item, index) => {
        const tone = toneFor(item.name);

        return (
          <li key={item.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    dotTone[tone]
                  )}
                />
                <span className="truncate text-[13px] font-medium text-foreground">
                  {item.name}
                </span>
              </span>

              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {item.count}
                </span>
                {" · "}
                {Math.round(item.percentage)}%
              </span>
            </div>

            {animate ? (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                  ease: [0.32, 0.72, 0, 1],
                }}
                style={{ transformOrigin: "left" }}
              >
                <ProgressBar value={item.percentage} tone={tone} size="sm" />
              </motion.div>
            ) : (
              <ProgressBar value={item.percentage} tone={tone} size="sm" />
            )}
          </li>
        );
      })}

      {total === 0 && (
        <li className="text-xs text-muted-foreground">
          Nothing recorded yet.
        </li>
      )}
    </ul>
  );
}
