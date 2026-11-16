import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  /** Small label above the title — the section the page belongs to. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Rendered to the right on desktop, stacked full-width on mobile. */
  actions?: React.ReactNode
  /**
   * A view switcher that belongs on the heading line rather than in a strip
   * under it. It gets the middle column of a three-column row, so it sits
   * centred on the page instead of centred in whatever space the title and
   * the actions left over — which is how a segmented control reads.
   */
  center?: React.ReactNode
  /** Anything that isn't a primary action — filters, counts, a search box. */
  toolbar?: React.ReactNode
  /** e.g. a back link placed above the title block. */
  back?: React.ReactNode
  className?: React.ComponentProps<"div">["className"]
}

/**
 * One header for every page. Previously each page invented its own
 * (`text-4xl font-bold` here, `text-lg` there) which is the main reason
 * the app didn't read as one product.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  center,
  toolbar,
  back,
  className,
}: PageHeaderProps) {
  const hasCenter = Boolean(center)

  return (
    <header
      data-slot="page-header"
      className={cn("space-y-4", className)}
    >
      {back && <div className="-mb-1">{back}</div>}

      {/*
       * Two layouts, chosen by whether there is something to centre.
       *
       * Without it the row is the familiar title-left / actions-right flex.
       * With it the row becomes a grid whose outer columns are equal, so the
       * middle column lands on the exact centre of the page no matter how wide
       * the buttons beside it are. `minmax(0, 1fr)` matters: with plain `1fr`
       * a long button row would refuse to shrink and push the switcher off
       * centre — this way it wraps inside its own column instead.
       */}
      <div
        className={cn(
          "flex flex-col gap-4",
          hasCenter
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-6"
            : "lg:flex-row lg:items-end lg:justify-between",
        )}
      >
        <div className="min-w-0 space-y-1.5">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          )}

          <h1 className="font-heading text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-[1.75rem]">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {center && (
          <div className="min-w-0 lg:justify-self-center">{center}</div>
        )}

        {actions && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 [&>*]:grow lg:[&>*]:grow-0",
              hasCenter
                ? "lg:justify-self-end lg:justify-end"
                : "shrink-0 lg:justify-start",
            )}
          >
            {actions}
          </div>
        )}
      </div>

      {toolbar && (
        <div data-slot="page-header-toolbar" className="pt-1">
          {toolbar}
        </div>
      )}
    </header>
  )
}
