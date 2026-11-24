import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

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
  lg: "px-3 py-1 text-sm",
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

/**
 * A solid, color-tinted tile that carries a label's chosen hue.
 *
 * Unlike {@link LabelSwatch} — the chip used wherever a label rides inline next
 * to text — this is the tile the management grid is built around: the color is
 * the hero, the name is supporting copy. The tint is mixed from the user's own
 * hex toward the card, so it stays legible in every theme without hand-picking
 * a background per hue.
 */
export function LabelSwatchTile({
  color,
  size = "md",
  className,
}: {
  color?: string | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const accent = color?.trim() || "var(--muted-foreground)";
  const dimension = size === "lg" ? "size-14 rounded-2xl" : "size-11 rounded-xl";
  const glyph = size === "lg" ? "size-6" : "size-5";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center border",
        dimension,
        className
      )}
      style={{
        color: accent,
        borderColor: `color-mix(in srgb, ${accent} 24%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} 13%, var(--surface))`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={glyph}
      >
        <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
        <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

/* =========================================================
   SUGGESTED PALETTE
   A curated set of accessible hues for the create / edit picker.
   The native color input stays available for an exact match.
   ========================================================= */

export const LABEL_COLOR_PALETTE = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#64748B",
] as const;