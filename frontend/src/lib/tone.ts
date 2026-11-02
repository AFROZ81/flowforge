/**
 * The palette of semantic tones available to badges, bars and dots.
 * Declared here (rather than in a component) so `lib` never depends on
 * the component layer.
 */
export type Tone =
    | "brand"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";

/**
 * Tone mapping for domain labels.
 *
 * Comes from the API as free text ("Completed", "Critical", …) in some
 * endpoints and as enum numbers in others; both are handled so a bucket
 * gets the same color wherever it appears.
 */

const STATUS_TONES: Record<string, Tone> = {
    "1": "info",
    "2": "success",
    "3": "danger",

    active: "info",
    todo: "neutral",
    "to do": "neutral",
    inprogress: "info",
    "in progress": "info",
    done: "success",
    completed: "success",
    blocked: "danger",
    archived: "neutral",
    unknown: "neutral",
};

const PRIORITY_TONES: Record<string, Tone> = {
    "1": "neutral",
    "2": "info",
    "3": "warning",
    "4": "danger",

    low: "neutral",
    medium: "info",
    high: "warning",
    critical: "danger",
    none: "neutral",
    unset: "neutral",
};

function lookup(
    table: Record<string, Tone>,
    key: string | number | null | undefined
): Tone {
    if (key === null || key === undefined) return "neutral";

    return table[String(key).trim().toLowerCase()] ?? "neutral";
}

export function statusTone(
    status: string | number | null | undefined
): Tone {
    return lookup(STATUS_TONES, status);
}

export function priorityTone(
    priority: string | number | null | undefined
): Tone {
    return lookup(PRIORITY_TONES, priority);
}
