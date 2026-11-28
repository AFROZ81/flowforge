import { describe, expect, it } from "vitest";

import {
    fromIstDateInput,
    fromIstDateTimeInput,
    toIstDateTimeInput,
} from "./datetime";

describe("IST input conversion", () => {
    it("converts an IST calendar date to the previous UTC day", () => {
        expect(fromIstDateInput("2026-11-28")).toBe(
            "2026-11-27T18:30:00.000Z"
        );
    });

    it("converts an IST reminder date and time to UTC", () => {
        expect(fromIstDateTimeInput("2026-11-28T17:45")).toBe(
            "2026-11-28T12:15:00.000Z"
        );
    });

    it("handles early IST times that cross the UTC date boundary", () => {
        expect(fromIstDateTimeInput("2026-11-28T02:15")).toBe(
            "2026-11-27T20:45:00.000Z"
        );
    });

    it("rejects invalid calendar values", () => {
        expect(fromIstDateInput("2026-02-30")).toBeNull();
        expect(fromIstDateTimeInput("2026-11-28T25:00")).toBeNull();
    });

    it("round-trips a UTC reminder through the IST input format", () => {
        const utcValue = "2026-11-28T12:15:00.000Z";
        const istInput = toIstDateTimeInput(utcValue);

        expect(istInput).toBe("2026-11-28T17:45");
        expect(fromIstDateTimeInput(istInput)).toBe(utcValue);
    });
});
