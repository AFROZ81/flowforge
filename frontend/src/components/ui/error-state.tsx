import * as React from "react"
import { TriangleAlert, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { normalizeError } from "@/lib/errors"

/* =========================================================
   ERROR STATE

   Copy rules live in lib/errors — raw backend text is never
   rendered here, only a title, an explanation, and a way forward.
   ========================================================= */

type ErrorStateProps = {
  error?: unknown
  title?: string
  description?: string
  /** Rendered when the failure was caused by an action rather than a load. */
  action?: React.ReactNode
  icon?: LucideIcon
  className?: React.ComponentProps<"div">["className"]
}

const DefaultAlertIcon = TriangleAlert

/**
 * Inline error panel — used inside a page region where a reload is silly
 * but the user still needs to know what happened and what to do.
 */
export function ErrorState({
  error,
  title,
  description,
  action,
  icon: Icon,
  className,
}: ErrorStateProps) {
  const copy = normalizeError(error, { title, description })

  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-danger/20 bg-danger-subtle p-4 sm:flex-row sm:items-center",
        className
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger-foreground">
        {Icon ? (
          <Icon className="size-[18px]" strokeWidth={2} />
        ) : (
          <DefaultAlertIcon className="size-[18px]" strokeWidth={2} />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-danger-foreground">
          {copy.title}
        </p>
        <p className="text-sm leading-relaxed text-danger-foreground/80">
          {copy.description}
        </p>
      </div>

      {action && <div className="shrink-0 self-stretch sm:self-auto">{action}</div>}
    </div>
  )
}

/** Full-region error — the state you land on when a page can't load at all. */
export function ErrorStateBlock({
  error,
  title,
  description,
  action,
  icon,
  className,
}: ErrorStateProps) {
  const copy = normalizeError(error, {
    title: title ?? "We couldn't load this",
    description,
  })

  return (
    <div
      data-slot="error-state-block"
      role="alert"
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-xs",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl border border-danger/20 bg-danger-subtle text-danger-foreground">
        {icon ? (
          React.createElement(icon, { className: "size-6", strokeWidth: 1.75 })
        ) : (
          <DefaultAlertIcon className="size-6" strokeWidth={1.75} />
        )}
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {copy.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {copy.description}
        </p>
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
