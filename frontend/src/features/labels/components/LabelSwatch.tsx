import { cn } from "@/lib/utils";

type Size = "sm" | "md";

type Props = {
  name: string;
  /** Arbitrary user-chosen hex — this is data, so it can't be a token class. */
  color?: string | null;
  size?: Size;
  /** Leading dot reinforces the color for anyone who can't distinguish it. */
  dot?: boolean;
  /** Hidden text alternative when the chip sits inside a button. */
  srLabel?: string;
  className?: string;
  title?: string;
}

const sizes: Record<Size, string> = {
  sm: "px-1.5 py-0.5 text-[10.5px]",
  md: "px-2 py-0.5 text-xs",
};

/**
 * A label chip.
 *
 * Written five different ways before (in the picker, the board card, the
 * watcher menu, the history row and the reports table), each mixing the
 * color slightly differently — so the same label looked different per screen.
 */
export function LabelSwatch({
  name,
  color,
  size = "md",
  dot = false,
  srLabel,
  className,
  title,
}: Props) {
  const accent = color?.trim() || "var(--muted-foreground)";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        sizes[size],
        className
      )}
      title={title ?? name}
      style={{
        color: accent,
        borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} 10%, var(--surface))`,
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}

      <span className="min-w-0 truncate">{name}</span>

      {srLabel && <span className="sr-only">{srLabel}</span>}
    </span>
  );
}
