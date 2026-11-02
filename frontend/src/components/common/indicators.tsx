import * as React from "react"
import {
  AlertOctagon,
  CalendarClock,
  Check,
  CircleDashed,
  Minus,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { dueStateOf, formatDueDate, type DueState } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

/**
 * Single source of truth for how a work item's state and urgency look.
 *
 * Previously the mapping was copy-pasted per component (`getStatusClasses`
 * in WorkItemCard, inline ternaries in DueWorkItems, `P{priority}` chips in
 * the board) and they disagreed — so "Blocked" could read red in one place
 * and gray in another.
 */

/* =========================================================
   STATUS
   ========================================================= */

type StatusTone = {
  label: string
  variant: "softInfo" | "softSuccess" | "softDanger" | "softNeutral"
  icon: LucideIcon
}

const STATUS_BY_VALUE: Record<string, StatusTone> = {
  "1": { label: "Active", variant: "softInfo", icon: CircleDashed },
  "2": { label: "Completed", variant: "softSuccess", icon: Check },
  "3": { label: "Blocked", variant: "softDanger", icon: AlertOctagon },

  active: { label: "Active", variant: "softInfo", icon: CircleDashed },
  todo: { label: "To do", variant: "softNeutral", icon: CircleDashed },
  inprogress: { label: "In progress", variant: "softInfo", icon: TrendingUp },
  done: { label: "Done", variant: "softSuccess", icon: Check },
  completed: { label: "Completed", variant: "softSuccess", icon: Check },
  blocked: { label: "Blocked", variant: "softDanger", icon: AlertOctagon },
  archived: { label: "Archived", variant: "softNeutral", icon: Minus },
}

const UNKNOWN_STATUS: StatusTone = {
  label: "Unknown",
  variant: "softNeutral",
  icon: CircleDashed,
}

function resolveStatus(status: string | number | undefined | null): StatusTone {
  if (status === undefined || status === null) return UNKNOWN_STATUS
  return STATUS_BY_VALUE[String(status).trim().toLowerCase()] ?? UNKNOWN_STATUS
}

export function WorkItemStatusBadge({
  status,
  className,
}: {
  status: string | number | undefined | null
  className?: React.ComponentProps<typeof Badge>["className"]
}) {
  const tone = resolveStatus(status)
  const Icon = tone.icon

  return (
    <Badge variant={tone.variant} className={className}>
      <Icon aria-hidden="true" />
      {tone.label}
    </Badge>
  )
}

/* =========================================================
   PRIORITY
   ========================================================= */

type PriorityTone = {
  label: string
  variant: "softNeutral" | "softInfo" | "softWarning" | "softDanger"
  /** A compact form for dense tables and board cards. */
  short: string
}

const PRIORITY_BY_VALUE: Record<string, PriorityTone> = {
  "1": { label: "Low", variant: "softNeutral", short: "Low" },
  "2": { label: "Medium", variant: "softInfo", short: "Med" },
  "3": { label: "High", variant: "softWarning", short: "High" },
  "4": { label: "Critical", variant: "softDanger", short: "Critical" },

  low: { label: "Low", variant: "softNeutral", short: "Low" },
  medium: { label: "Medium", variant: "softInfo", short: "Med" },
  high: { label: "High", variant: "softWarning", short: "High" },
  critical: { label: "Critical", variant: "softDanger", short: "Critical" },
}

const UNKNOWN_PRIORITY: PriorityTone = {
  label: "Unset",
  variant: "softNeutral",
  short: "—",
}

function resolvePriority(priority: string | number | undefined | null): PriorityTone {
  if (priority === undefined || priority === null) return UNKNOWN_PRIORITY
  return PRIORITY_BY_VALUE[String(priority).trim().toLowerCase()] ?? UNKNOWN_PRIORITY
}

export function WorkItemPriorityBadge({
  priority,
  compact = false,
  className,
}: {
  priority: string | number | undefined | null
  /** Abbreviates the label for narrow columns and card headers. */
  compact?: boolean
  className?: React.ComponentProps<typeof Badge>["className"]
}) {
  const tone = resolvePriority(priority)

  return (
    <Badge variant={tone.variant} className={className}>
      {compact ? tone.short : tone.label}
    </Badge>
  )
}

/** Square glyph variant for board cards, where words cost too much width. */
export function PriorityFlag({
  priority,
  className,
}: {
  priority: string | number | undefined | null
  className?: React.ComponentProps<"span">["className"]
}) {
  const tone = resolvePriority(priority)

  const bar: Record<PriorityTone["variant"], { height: string; color: string }> = {
    softNeutral: { height: "h-1", color: "bg-muted-foreground/40" },
    softInfo: { height: "h-1.5", color: "bg-info" },
    softWarning: { height: "h-2", color: "bg-warning" },
    softDanger: { height: "h-2.5", color: "bg-danger" },
  }

  const shape = bar[tone.variant]

  return (
    <span
      role="img"
      aria-label={`${tone.label} priority`}
      className={cn("inline-flex h-2.5 items-center", className)}
    >
      <span
        aria-hidden="true"
        className={cn("w-1 rounded-full", shape.height, shape.color)}
      />
    </span>
  )
}

/* =========================================================
   DUE DATE
   ========================================================= */

const DUE_TONES: Record<Exclude<DueState, "none" | "later">, string> = {
  overdue: "text-danger-foreground font-semibold",
  today: "text-warning-foreground font-semibold",
  soon: "text-warning-foreground/90",
}

/**
 * Due dates are the one field a scanning user must catch at a glance,
 * so lateness is carried by color + weight rather than by an extra word.
 */
export function DueDateChip({
  dueDate,
  completed = false,
  prefix = "Due",
  className,
}: {
  dueDate?: string | null
  /** A completed item is never overdue — drop the alarm styling. */
  completed?: boolean
  prefix?: string | null
  className?: React.ComponentProps<"span">["className"]
}) {
  const label = formatDueDate(dueDate)
  if (!label) return null

  const state = completed ? "later" : dueStateOf(dueDate)
  const tone =
    state === "overdue" || state === "today" || state === "soon"
      ? DUE_TONES[state]
      : "text-muted-foreground"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-xs whitespace-nowrap tabular-nums",
        tone,
        className
      )}
    >
      <CalendarClock className="size-3.5 opacity-70" aria-hidden="true" />
      {prefix && <span className="opacity-70">{prefix}</span>}
      <span>{label}</span>
      {state === "overdue" && <span className="sr-only">(overdue)</span>}
    </span>
  )
}

/* =========================================================
   STATUS DOT
   ========================================================= */

/** Non-textual state marker for dense rows and column headers. */
export function StatusDot({
  status,
  className,
}: {
  status: string | number | undefined | null
  className?: React.ComponentProps<"span">["className"]
}) {
  const tone = resolveStatus(status)

  const color: Record<StatusTone["variant"], string> = {
    softInfo: "bg-info",
    softSuccess: "bg-success",
    softDanger: "bg-danger",
    softNeutral: "bg-muted-foreground/50",
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full ring-2 ring-card",
        color[tone.variant],
        className
      )}
    />
  )
}
