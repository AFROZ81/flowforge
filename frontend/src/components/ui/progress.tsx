import * as React from "react"

import { cn } from "@/lib/utils"
import type { Tone } from "@/lib/tone"

export type ProgressTone = Tone

const toneFill: Record<ProgressTone, string> = {
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground/55",
}

const trackHeight = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
}

type ProgressBarProps = {
  /** 0–100. Values outside the range are clamped rather than trusted. */
  value: number
  tone?: ProgressTone
  size?: keyof typeof trackHeight
  /** Pass a color (project color) to override the tone fill. */
  color?: string | null
  /** Renders a "% done" label — announced to screen readers too. */
  label?: string
  showValue?: boolean
  className?: React.ComponentProps<"div">["className"]
}

/**
 * Progress is always announced as text: a bar alone tells a screen reader
 * nothing, and a color-only bar tells a colorblind user nothing either.
 */
export function ProgressBar({
  value,
  tone = "brand",
  size = "sm",
  color,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const safe = Number.isFinite(value) ? value : 0
  const clamped = Math.min(100, Math.max(0, safe))
  const rounded = Math.round(clamped)

  return (
    <div data-slot="progress" className={cn("w-full", className)}>
      {(showValue || label) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label && (
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {label}
            </span>
          )}

          {showValue && (
            <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
              {rounded}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${rounded}%`}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-surface-sunken",
          trackHeight[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-(--transition-slow) ease-(--ease-standard)",
            !color && toneFill[tone]
          )}
          style={{
            width: `${clamped}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  )
}

/** Slim inline variant for table cells and card footers. */
export function MiniProgress({
  value,
  tone = "brand",
  color,
  className,
}: Omit<ProgressBarProps, "size" | "label" | "showValue">) {
  return (
    <ProgressBar
      value={value}
      tone={tone}
      color={color}
      size="xs"
      className={className}
    />
  )
}
