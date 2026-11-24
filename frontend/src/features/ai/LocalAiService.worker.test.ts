import { describe, expect, it } from "vitest";

import { LocalAiService } from "./LocalAiService";
import type { LocalAiResponse } from "./localAiProtocol";

/**
 * A controllable fake Worker. Lets us drive the service's message handling
 * deterministically: post responses, simulate crashes, and assert the service
 * correlates ids and recovers.
 */
class FakeWorker {
    onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    onmessageerror: (() => void) | null = null;
    posted: unknown[] = [];
    terminated = false;

    postMessage(message: unknown): void {
        this.posted.push(message);
    }

    terminate(): void {
        this.terminated = true;
    }

    emit(message: LocalAiResponse): void {
        this.onmessage?.({ data: message } as MessageEvent<unknown>);
    }

    crash(message: string): void {
        // ErrorEvent-like object with preventDefault, matching what the service expects.
        this.onerror?.({
            message,
            preventDefault: () => {},
        } as unknown as ErrorEvent);
    }
}

const draft = (title = "Fix cards") => ({
    title,
    description: "## Overview\nFix",
    priority: 2,
    labels: [],
    rationale: "r",
});

describe("LocalAiService worker bridge", () => {
    function setup(): { service: LocalAiService; fake: FakeWorker } {
        const fake = new FakeWorker();
        const service = new LocalAiService(() => fake as unknown as Worker);
        return { service, fake };
    }

    it("sends a draft request with the prompt and id", async () => {
        const { service, fake } = setup();

        const promise = service.draftDetailed("Fix the cards");
        await Promise.resolve();

        const posted = fake.posted[0] as { type: string; prompt: string; id: number };
        expect(posted.type).toBe("draft");
        expect(posted.prompt).toBe("Fix the cards");
        expect(typeof posted.id).toBe("number");

        fake.emit({ type: "result", id: posted.id, draft: draft() });
        const result = await promise;
        expect(result.draft.title).toBe("Fix cards");
        expect(result.fallback).toBe(false);
    });

    it("forwards progress to the onProgress callback", async () => {
        const { service, fake } = setup();
        const progressEvents: unknown[] = [];

        const promise = service.draftDetailed("Fix", undefined, (p) =>
            progressEvents.push(p)
        );
        await Promise.resolve();

        const posted = fake.posted[0] as { id: number };
        fake.emit({
            type: "progress",
            id: posted.id,
            progress: { stage: "downloading", progress: 42 },
        });

        expect(progressEvents).toContainEqual(
            expect.objectContaining({ stage: "downloading", progress: 42 })
        );

        fake.emit({ type: "result", id: posted.id, draft: draft() });
        await promise;
    });

    it("rejects when the worker reports an error", async () => {
        const { service, fake } = setup();
        const promise = service.draftDetailed("Fix");
        await Promise.resolve();

        const posted = fake.posted[0] as { id: number };
        fake.emit({ type: "error", id: posted.id, message: "boom" });

        await expect(promise).rejects.toThrow("boom");
    });

    it("rejects when the worker crashes", async () => {
        const { service, fake } = setup();
        const promise = service.draftDetailed("Fix");
        await Promise.resolve();

        fake.crash("worker died");

        await expect(promise).rejects.toThrow("worker died");
        expect(fake.terminated).toBe(true);
    });

    it("resolves fallback metadata when the worker returns a fallback result", async () => {
        const { service, fake } = setup();
        const promise = service.draftDetailed("Fix");
        await Promise.resolve();

        const posted = fake.posted[0] as { id: number };
        fake.emit({
            type: "result",
            id: posted.id,
            fallback: true,
            draft: draft(),
            meta: {
                modelId: "heuristic",
                backend: "wasm",
                initMs: 0,
                generationMs: 5,
                outputChars: 10,
                fallback: true,
            },
        });

        const result = await promise;
        expect(result.fallback).toBe(true);
        expect(result.meta?.modelId).toBe("heuristic");
    });

    it("surfaces a timeout fallback reason from the worker", async () => {
        const { service, fake } = setup();
        const promise = service.draftDetailed("Fix");
        await Promise.resolve();

        const posted = fake.posted[0] as { id: number };
        fake.emit({
            type: "result",
            id: posted.id,
            fallback: true,
            draft: draft(),
            meta: {
                modelId: "heuristic",
                backend: "wasm",
                initMs: 0,
                generationMs: 20_000,
                outputChars: 10,
                fallback: true,
                fallbackReason: "timeout",
            },
        });

        const result = await promise;
        expect(result.fallback).toBe(true);
        expect(result.meta?.fallbackReason).toBe("timeout");
    });

    it("recovers after a timed-out request (worker stays reusable)", async () => {
        const { service, fake } = setup();
        // First request: worker returns a timeout fallback.
        const first = service.draftDetailed("Fix");
        await Promise.resolve();
        const firstPosted = fake.posted[0] as { id: number };
        fake.emit({
            type: "result",
            id: firstPosted.id,
            fallback: true,
            draft: draft(),
            meta: {
                modelId: "heuristic",
                backend: "wasm",
                initMs: 0,
                generationMs: 20_000,
                outputChars: 10,
                fallback: true,
                fallbackReason: "timeout",
            },
        });
        const firstResult = await first;
        expect(firstResult.fallback).toBe(true);

        // Second request on the same service instance must still work.
        const second = service.draftDetailed("Fix again");
        await Promise.resolve();
        const secondPosted = fake.posted.find(
            (m) => (m as { type: string }).type === "draft" && m !== firstPosted
        ) as { id: number; prompt: string };
        expect(secondPosted).toBeTruthy();
        fake.emit({
            type: "result",
            id: secondPosted.id,
            fallback: false,
            draft: draft(),
        });
        const secondResult = await second;
        expect(secondResult.fallback).toBe(false);
    });

    it("cancel rejects the pending request and posts a cancel", async () => {
        const { service, fake } = setup();
        const promise = service.draftDetailed("Fix");
        await Promise.resolve();

        const posted = fake.posted[0] as { id: number };
        service.cancel(posted.id);

        await expect(promise).rejects.toThrow("cancelled");
        const cancelMsg = fake.posted.find(
            (m) => (m as { type: string }).type === "cancel"
        ) as { type: string; id?: number };
        expect(cancelMsg).toBeTruthy();
    });

    it("rejects an empty prompt without touching the worker", async () => {
        const { service, fake } = setup();
        await expect(service.draftDetailed("   ")).rejects.toThrow(
            "Describe the work item"
        );
        expect(fake.posted.length).toBe(0);
    });
});