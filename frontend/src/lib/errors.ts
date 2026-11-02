/**
 * Turns anything thrown by the API layer into copy that is safe and useful
 * to show a user.
 *
 * Raw backend text is never surfaced: an ASP.NET exception message, a
 * serialized stack, or a FluentValidation payload is noise to the person
 * reading it, and section 21 of the design brief rules it out explicitly.
 */

export type NormalizedError = {
    status?: number
    title: string
    description: string
}

const statusCopy: Record<number, { title: string; description: string }> = {
    400: {
        title: "That request wasn't valid",
        description:
            "Some of the information sent didn't match what we expected.",
    },
    401: {
        title: "Your session has ended",
        description: "Sign in again to continue where you left off.",
    },
    403: {
        title: "You don't have access to this",
        description:
            "Ask your workspace owner if you think this is a mistake.",
    },
    404: {
        title: "We couldn't find it",
        description: "It may have been deleted, or the link is out of date.",
    },
    409: {
        title: "That conflicts with something else",
        description: "Someone may have changed this at the same time.",
    },
    413: {
        title: "That file is too large",
        description: "Try a smaller file, or upload fewer at a time.",
    },
    422: {
        title: "Please check the details",
        description: "Some fields need your attention before we can continue.",
    },
    429: {
        title: "Too many requests",
        description: "Give it a moment and try again.",
    },
    500: {
        title: "Something went wrong on our side",
        description: "The issue is logged. Retrying usually helps.",
    },
    502: {
        title: "We couldn't reach the service",
        description: "The server didn't respond. Try again shortly.",
    },
    503: {
        title: "Temporarily unavailable",
        description: "We're likely mid-update. Try again in a minute.",
    },
}

const GENERIC = {
    title: "Something went wrong",
    description: "We couldn't complete that action. Please try again.",
}

const OFFLINE = {
    title: "You appear to be offline",
    description:
        "Check your connection and try again — nothing you typed has been lost.",
}

/** Looks like a transport failure rather than a server response. */
function isNetworkError(error: unknown): boolean {
    const e = error as {
        code?: string
        message?: string
        response?: unknown
    }

    if (!e || typeof e !== "object") return false
    if (e.response) return false

    return (
        e.code === "ERR_NETWORK" ||
        e.code === "ECONNABORTED" ||
        /network|timeout|failed to fetch/i.test(e.message ?? "")
    )
}

function getStatus(error: unknown): number | undefined {
    const candidate = error as
        | { response?: { status?: number }; status?: number }
        | undefined

    return candidate?.response?.status ?? candidate?.status
}

/**
 * A server-supplied `message` is only surfaced for 4xx responses, where it
 * is normally written for a human. 5xx text is never trusted.
 */
function getServerMessage(error: unknown): string | null {
    const data = (
        error as {
            response?: {
                data?: {
                    message?: string
                    title?: string
                    detail?: string
                }
            }
        }
    )?.response?.data

    if (!data || typeof data !== "object") return null

    const message = data.message ?? data.detail ?? data.title

    if (!message || typeof message !== "string") return null
    if (message.length > 240) return null

    // Reject anything that smells like a serialized exception.
    if (/at\s+[\w.]+\(|System\.|Exception|stack trace|Parameters:/i.test(message)) {
        return null
    }

    return message
}

export function normalizeError(
    error: unknown,
    fallback?: { title?: string; description?: string }
): NormalizedError {
    if (error === null || error === undefined) {
        return {
            title: fallback?.title ?? GENERIC.title,
            description: fallback?.description ?? GENERIC.description,
        }
    }

    if (isNetworkError(error)) {
        return { ...OFFLINE }
    }

    const status = getStatus(error)
    const copy = (status !== undefined && statusCopy[status]) || GENERIC
    const serverMessage = getServerMessage(error)

    const useServerMessage =
        serverMessage !== null && status !== undefined && status < 500

    return {
        status,
        title: fallback?.title ?? copy.title,
        description:
            (useServerMessage ? serverMessage : null) ??
            fallback?.description ??
            copy.description,
    }
}

/**
 * One-line form for toasts, where a title + paragraph is too much.
 */
export function errorMessage(
    error: unknown,
    fallbackText = "Something went wrong. Please try again."
): string {
    const { title, description } = normalizeError(error)

    return `${title}. ${description}`.replace(/\s+/g, " ").trim() || fallbackText
}
