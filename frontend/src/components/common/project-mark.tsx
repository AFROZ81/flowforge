import { cn } from "@/lib/utils"

type Size = "sm" | "md" | "lg"

const sizes: Record<Size, string> = {
  sm: "size-7 text-[11px] rounded-lg",
  md: "size-9 text-xs rounded-lg",
  lg: "size-11 text-sm rounded-xl",
}

type Props = {
  /** Project accent color, as stored on the project. */
  color?: string | null
  /** Emoji chosen at project creation. */
  icon?: string | null
  /** Fallback glyph when a project has no icon. */
  keyName?: string | null
  size?: Size
  className?: string
}

/**
 * The project's visual identity mark.
 *
 * Previously inlined in four places with four different tinting
 * formulas (`${color}20`, `${color}18`, a plain swatch, a border), so the
 * same project looked subtly different in the table, the header and the
 * dashboard. This is the single version.
 */
export function ProjectMark({
  color,
  icon,
  keyName,
  size = "md",
  className,
}: Props) {
  const accent = color?.trim() || "var(--primary)"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center border font-bold tracking-tight uppercase select-none",
        sizes[size],
        className
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 12%, var(--surface))`,
        borderColor: `color-mix(in srgb, ${accent} 26%, transparent)`,
        color: accent,
      }}
    >
      {icon || (keyName?.slice(0, 3).toUpperCase() ?? "?")}
    </span>
  )
}
