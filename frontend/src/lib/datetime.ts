export const IST_TIME_ZONE = "Asia/Kolkata";
export const IST_UTC_OFFSET_MINUTES = 330;

const IST_OFFSET_MS = IST_UTC_OFFSET_MINUTES * 60_000;
const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const API_DATE_TIME_WITHOUT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

/**
 * API timestamps are stored in UTC, but SQL Server datetime2 values can be
 * serialized without a `Z`. Treat those values as UTC instead of inheriting
 * the browser's timezone.
 */
export function parseApiDate(value?: string | null): Date | null {
    if (!value) return null;

    const normalized =
        API_DATE_TIME_WITHOUT_ZONE.test(value) && !value.endsWith("Z")
            ? `${value}Z`
            : value;
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
}

function istParts(value: string | Date) {
    const date = value instanceof Date ? value : parseApiDate(value);
    if (!date || Number.isNaN(date.getTime())) return null;

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: IST_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const read = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value ?? "";

    return {
        year: read("year"),
        month: read("month"),
        day: read("day"),
        hour: read("hour"),
        minute: read("minute"),
    };
}

export function istDateKey(value?: string | Date | null): string | null {
    const parts = istParts(value ?? "");
    if (!parts) return null;

    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getIstHour(value?: string | Date | null): number | null {
    const parts = istParts(value ?? "");
    return parts ? Number(parts.hour) : null;
}

export function toIstDateInput(value?: string | null): string {
    return istDateKey(value) ?? "";
}

export function toIstDateTimeInput(value?: string | null): string {
    const parts = istParts(value ?? "");
    if (!parts) return "";

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function fromIstInput(
    value: string | null | undefined,
    pattern: RegExp,
    includeTime: boolean
): string | null {
    if (!value) return null;

    const match = pattern.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = includeTime ? Number(match[4]) : 0;
    const minute = includeTime ? Number(match[5]) : 0;
    const wallClockTime = Date.UTC(year, month - 1, day, hour, minute);
    const wallClockDate = new Date(wallClockTime);

    if (
        wallClockDate.getUTCFullYear() !== year ||
        wallClockDate.getUTCMonth() !== month - 1 ||
        wallClockDate.getUTCDate() !== day ||
        wallClockDate.getUTCHours() !== hour ||
        wallClockDate.getUTCMinutes() !== minute
    ) {
        return null;
    }

    return new Date(wallClockTime - IST_OFFSET_MS).toISOString();
}

/** Converts an IST calendar date to the UTC instant for that date's API value. */
export function fromIstDateInput(value?: string | null): string | null {
    return fromIstInput(value, DATE_INPUT_PATTERN, false);
}

/** Converts an IST wall-clock date and time to the UTC instant sent to the API. */
export function fromIstDateTimeInput(value?: string | null): string | null {
    return fromIstInput(value, DATE_TIME_INPUT_PATTERN, true);
}
