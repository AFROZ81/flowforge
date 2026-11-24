import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { raceWithDeadline } from "./generationDeadline";
import { GENERATION_DEADLINE_MS } from "./generationConfig";

describe("raceWithDeadline", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("resolves with the value when work completes before the deadline", async () => {
        const onTimeout = vi.fn();
        const work = Promise.resolve("done");
        const result = await raceWithDeadline(work, 1000, onTimeout);
        expect(result).toBe("done");
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it("resolves to undefined and calls onTimeout when the deadline expires", async () => {
        const onTimeout = vi.fn();
        // A promise that never settles within the test.
        const work = new Promise<string>(() => {});
        const pending = raceWithDeadline(work, 20_000, onTimeout);

        // Advance past the deadline.
        await vi.advanceTimersByTimeAsync(20_001);
        const result = await pending;

        expect(result).toBeUndefined();
        expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it("rejects with the work error if it rejects before the deadline", async () => {
        const onTimeout = vi.fn();
        const work = Promise.reject(new Error("boom"));
        await expect(
            raceWithDeadline(work, 1000, onTimeout)
        ).rejects.toThrow("boom");
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it("does not call onTimeout when work completes just in time", async () => {
        const onTimeout = vi.fn();
        const work = new Promise<string>((resolve) =>
            setTimeout(() => resolve("late-but-ok"), 5_000)
        );
        const pending = raceWithDeadline(work, 20_000, onTimeout);

        await vi.advanceTimersByTimeAsync(5_001);
        const result = await pending;

        expect(result).toBe("late-but-ok");
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it("the configured neural generation deadline is 20 seconds", () => {
        expect(GENERATION_DEADLINE_MS).toBe(20_000);
    });
});