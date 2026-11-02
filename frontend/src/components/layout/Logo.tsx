import logoMark from "@/assets/logo-mark.png"

import { cn } from "@/lib/utils"

type LogoProps = {
  /** `mark` renders the glyph alone — collapsed sidebar, compact menus. */
  variant?: "full" | "mark"
  /** `xl` is for the sign-in brand band, where the mark carries the page. */
  size?: "sm" | "md" | "lg" | "xl"
  /** Set false to get the glyph on its own. */
  showWordmark?: boolean
  tagline?: string | null
  className?: React.ComponentProps<"div">["className"]
}

/*
 * Rendered edges of the mark. The glyph carries its own blue→purple gradient,
 * so it sits unframed — the old tinted box behind it would fight the artwork.
 */
const box = {
  sm: "size-8",
  md: "size-9",
  lg: "size-12",
  xl: "size-14",
}

const wordmark = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-xl",
  xl: "text-[28px] tracking-[-0.028em]",
}

/**
 * The FlowForge lockup: brand glyph as artwork, the name as live text.
 *
 * The wordmark is deliberately not taken from the supplied logo image. That
 * file sets "Flow" in near-white — invisible on the light sidebar — and raster
 * text goes soft at 2× on the larger sizes. Keeping the name in Geist means it
 * inherits whatever colour the surrounding theme asks for, and the lockup
 * stays one asset instead of two that disagree.
 */
export default function Logo({
  variant = "full",
  size = "md",
  showWordmark = true,
  tagline = "Enterprise Workspace",
  className,
}: LogoProps) {
  const standalone = variant === "mark" || !showWordmark

  const mark = (
    <img
      src={logoMark}
      /*
       * Named when it stands alone — the collapsed rail has no text beside it,
       * and an empty alt there would leave the product unnamed. Decorative
       * otherwise, since the wordmark already says it.
       */
      alt={standalone ? "FlowForge" : ""}
      width={160}
      height={160}
      draggable={false}
      className={cn(
        "shrink-0 select-none object-contain",
        box[size],
        standalone && className
      )}
    />
  )

  if (standalone) return mark

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {mark}

      <span className="min-w-0 overflow-hidden">
        <span
          className={cn(
            "block truncate font-heading leading-tight font-bold tracking-[-0.02em] text-foreground",
            wordmark[size]
          )}
        >
          FlowForge
        </span>

        {tagline && size !== "sm" && (
          <span className="block truncate text-[11px] leading-tight text-muted-foreground">
            {tagline}
          </span>
        )}
      </span>
    </div>
  )
}
