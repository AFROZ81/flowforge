import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorStateBlock } from "@/components/ui/error-state"
import { SkeletonPanel } from "@/components/ui/skeleton"

type EmptyCopy = {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

type PanelProps = {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode

  /** Query state — the panel owns the presentation of all four. */
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  isEmpty?: boolean
  empty?: EmptyCopy

  /** Shape the loading placeholder to the content it stands in for. */
  skeletonHeight?: string
  className?: React.ComponentProps<typeof Card>["className"]
  bodyClassName?: string
  children: React.ReactNode
}

/**
 * A titled content block with the four states every data-driven region
 * needs, decided in one place.
 *
 * Before this, each dashboard widget re-implemented its own loading card,
 * its own red-text error line and its own centered "no data" sentence —
 * all slightly different, none of them retryable.
 */
export function Panel({
  title,
  description,
  action,
  isLoading,
  error,
  onRetry,
  isEmpty,
  empty,
  skeletonHeight,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <ErrorStateBlock
        error={error}
        title={typeof title === "string" ? `We couldn't load ${title.toLowerCase()}` : "We couldn't load this"}
        action={
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Try again
            </button>
          )
        }
        className={className}
      />
    )
  }

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <SectionHeader title={title} description={description} />
        <SkeletonPanel height={skeletonHeight} className="mt-0" />
      </div>
    )
  }

  /* ---------- READY ---------- */
  return (
    <Card
      className={cn("rounded-xl shadow-xs transition-shadow hover:shadow-sm", className)}
    >
      <SectionHeader
        title={title}
        description={description}
        action={action}
      />

      <div className={cn("min-w-0 pt-1", bodyClassName)}>
        {isEmpty && empty ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            description={empty.description}
            action={empty.action}
            size="sm"
            className="py-8"
          />
        ) : (
          children
        )}
      </div>
    </Card>
  )
}
