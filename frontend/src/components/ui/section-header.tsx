import * as React from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  /** Renders the header flush inside a card, with a divider. */
  divided?: boolean
  className?: React.ComponentProps<"div">["className"]
}

/**
 * Card/panel level heading — one step below PageHeader in the scale.
 * Replaces the handful of slightly-different `<h2 className="font-semibold">`
 * variants scattered across features.
 */
export function SectionHeader({
  title,
  description,
  action,
  divided = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-4 gap-y-2",
        divided && "-mt-1 -mx-1 border-b border-border pb-3",
        className
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <h2 className="font-heading text-sm leading-snug font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>

        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
