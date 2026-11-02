import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Skeletons mirror the geometry of the content they replace, so the
 * layout doesn't jump when data arrives. Prefer composing these
 * (`<SkeletonVariant.Card />`) over ad-hoc `animate-pulse` divs.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-surface-sunken",
        className
      )}
      {...props}
    />
  )
}

/** Text line — fills its container width by default. */
function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div
      data-slot="skeleton-text"
      aria-hidden="true"
      className={cn("space-y-2", className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-3 rounded-md bg-surface-sunken",
            // Last line shorter — mimics real ragged text
            index === lines - 1 && lines > 1 && "w-2/3"
          )}
        />
      ))}
    </div>
  )
}

/** A KPI/summary tile. */
function SkeletonStatCard({ className }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-stat-card"
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-3 w-20 rounded-md bg-surface-sunken" />
          <div className="h-7 w-16 rounded-md bg-surface-sunken" />
          <div className="h-3 w-24 rounded-md bg-surface-sunken/70" />
        </div>
        <div className="size-10 shrink-0 rounded-lg bg-surface-sunken" />
      </div>
    </div>
  )
}

/** A table body — keeps row count so the container height is stable. */
function SkeletonTable({
  className,
  rows = 6,
  cols = 5,
}: React.ComponentProps<"div"> & { rows?: number; cols?: number }) {
  return (
    <div
      data-slot="skeleton-table"
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="flex h-10 items-center gap-4 border-b border-border bg-surface-muted px-4">
        {Array.from({ length: cols }).map((_, index) => (
          <div
            key={index}
            className="h-2.5 w-16 rounded-md bg-surface-sunken"
          />
        ))}
      </div>

      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex h-12 items-center gap-4 px-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "h-3 rounded-md bg-surface-sunken",
                  colIndex === 0 ? "w-1/3" : "flex-1 opacity-70"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A generic content panel — charts, lists, report bodies. */
function SkeletonPanel({
  className,
  height = "h-64",
}: React.ComponentProps<"div"> & { height?: string }) {
  return (
    <div
      data-slot="skeleton-panel"
      aria-hidden="true"
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs",
        className
      )}
    >
      <div className="space-y-3">
        <div className="h-3.5 w-32 rounded-md bg-surface-sunken" />
        <div className={cn("w-full rounded-lg bg-surface-sunken/60", height)} />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonStatCard,
  SkeletonTable,
  SkeletonPanel,
}
