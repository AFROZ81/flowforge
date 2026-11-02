import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type Tone = "neutral" | "brand"

type EmptyStateProps = {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** The one action that resolves the emptiness — e.g. "Create project". */
  action?: React.ReactNode
  /** Secondary escape hatch, e.g. "Browse templates". */
  secondaryAction?: React.ReactNode
  tone?: Tone
  size?: "sm" | "md" | "lg"
  className?: React.ComponentProps<"div">["className"]
}

const sizes = {
  sm: { wrapper: "gap-3 px-4 py-8", icon: "size-9 rounded-lg", text: "text-sm" },
  md: { wrapper: "gap-4 px-6 py-12", icon: "size-12 rounded-xl", text: "text-sm" },
  lg: { wrapper: "gap-5 px-6 py-16", icon: "size-14 rounded-xl", text: "text-base" },
}

/**
 * An empty state is a signed post, not a blank page:
 * mark → title → why → what to do next.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tone = "neutral",
  size = "md",
  className,
}: EmptyStateProps) {
  const scale = sizes[size]

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        scale.wrapper,
        className
      )}
    >
      {Icon && (
        <div
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center border",
            scale.icon,
            tone === "brand"
              ? "border-primary/15 bg-primary-subtle text-primary"
              : "border-border bg-surface-muted text-muted-foreground"
          )}
        >
          <Icon className="size-[46%]" strokeWidth={1.75} />
        </div>
      )}

      <div className="max-w-md space-y-1.5">
        <h3
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>

        {description && (
          <p className={cn("leading-relaxed text-muted-foreground", scale.text)}>
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

/** Empty state pre-framed as a card body — the common list/table case. */
export function EmptyStateCard({ className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state-card"
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs",
        className
      )}
    >
      <EmptyState {...props} />
    </div>
  )
}
