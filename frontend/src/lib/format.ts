/**
 * Presentation-only formatters.
 *
 * These live outside component files because mixing non-component exports
 * into a module breaks React Fast Refresh for everything in it.
 */

/* =========================================================
   PEOPLE
   ========================================================= */

/**
 * Two-word names give two letters; a single word gives its first two.
 * Anything with no letters at all degrades to "?" rather than an empty circle.
 */
export function initialsOf(name?: string | null): string {
    const parts = (name ?? "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .split(/\s+/)
        .filter(Boolean)

    if (parts.length === 0) return "?"

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* =========================================================
    DATES
   ========================================================= */

export type DueState =
    | "none"
    | "overdue"
    | "today"
    | "soon"
    | "later"

const DAY_MS = 86_400_000

export function parseDate(value?: string | null): Date | null {
    if (!value) return null

    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Buckets a due date relative to today, ignoring the time of day so
 * "today at 23:00" isn't reported as tomorrow.
 */
export function dueStateOf(dueDate?: string | null): DueState {
    const date = parseDate(dueDate)
    if (!date) return "none"

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    const days = Math.round((date.getTime() - today.getTime()) / DAY_MS)

    if (days < 0) return "overdue"
    if (days === 0) return "today"
    if (days <= 3) return "soon"

    return "later"
}

export function formatDueDate(
    dueDate?: string | null,
    style: "short" | "long" = "short"
): string | null {
    const date = parseDate(dueDate)
    if (!date) return null

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        ...(style === "long" ? { year: "numeric" } : {}),
    })
}

export function formatDate(
    value?: string | null,
    style: "short" | "long" = "long"
): string {
    const date = parseDate(value)
    if (!date) return "—"

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(style === "short" ? {} : { weekday: "short" }),
    })
}

export function formatDateTime(value?: string | null): string {
    const date = parseDate(value)
    if (!date) return "—"

    return `${formatDate(value, "short")} · ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })}`
}

/** Compact "3h ago" style label for activity feeds. */
export function formatRelativeTime(value?: string | null): string {
    const date = parseDate(value)
    if (!date) return "—"

    const minutes = Math.round((Date.now() - date.getTime()) / 60_000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.round(hours / 24)
    if (days < 7) return `${days}d ago`

    const weeks = Math.round(days / 7)
    if (weeks < 5) return `${weeks}w ago`

    return formatDate(value, "short")
}

/* =========================================================
   NUMBERS
   ========================================================= */

const numberFormatter = new Intl.NumberFormat("en-IN")

export function formatNumber(value: number | null | undefined): string {
    return numberFormatter.format(
        Number.isFinite(Number(value)) ? Number(value ?? 0) : 0
    )
}

export function formatPercentage(value: number | null | undefined): string {
    const n = Number(value)
    if (!Number.isFinite(n)) return "0%"

    return `${Number(n.toFixed(1))}%`
}
