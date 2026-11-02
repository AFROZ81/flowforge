import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  /** Small label above the title — the section the page belongs to. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Rendered to the right on desktop, stacked full-width on mobile. */
  actions?: React.ReactNode
  /** Anything that isn't a primary action — filters, tabs, counts. */
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
  toolbar,
  back,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("space-y-4", className)}
    >
      {back && <div className="-mb-1">{back}</div>}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 [&>*]:grow lg:[&>*]:grow-0">
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
