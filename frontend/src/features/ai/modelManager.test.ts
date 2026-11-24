import { describe, expect, it, vi } from "vitest";

import { ModelManager } from "./modelManager";
import type { ModelBackend } from "./modelRegistry";
import type { ModelLifecycle } from "./localAiProtocol";

/**
 * A fake pipeline factory. Each call counts as an "initialisation" so we can
 * assert the manager reuses a loaded model instead of re-downloading.
 */
function makeFakePipeline(behaviour: {
    webgpuFails?: boolean;
    wasmFails?: boolean;
}) {
    const calls: { backend: ModelBackend; modelId: string }[] = [];
    const factory = vi.fn(
        async (
            _task: "text-generation",
            modelId: string,
            options: { device: ModelBackend; dtype: string }
        ) => {
            calls.push({ backend: options.device, modelId });
            if (options.device === "webgpu" && behaviour.webgpuFails) {
                throw new Error("webgpu init failed");
            }
            if (options.device === "wasm" && behaviour.wasmFails) {
                throw new Error("wasm init failed");
            }
            // Return a fake generator that echoes a trivial output.
            const generator = async () => [
                { generated_text: [{ role: "assistant", content: "TITLE: X\nDESCRIPTION:\n## Overview\nY" }] },
            ];
            (generator as unknown as { dispose: () => void }).dispose = () => {};
            return generator as never;
        }
    );
    return { factory, calls };
}

const progress = () => {};

describe("ModelManager", () => {
    it("starts UNINITIALIZED and reports lifecycle changes", async () => {
        const lifecycles: ModelLifecycle[] = [];
        const { factory } = makeFakePipeline({});
        const manager = new ModelManager(
            factory as never,
            async () => true,
            (l) => lifecycles.push(l)
        );

        expect(manager.getLifecycle()).toBe("UNINITIALIZED");
        await manager.ensureModel(undefined, progress);

        expect(manager.getLifecycle()).toBe("READY");
        expect(lifecycles).toContain("DOWNLOADING");
        expect(lifecycles).toContain("READY");
    });

    it("reuses a loaded model instead of reinitialising", async () => {
        const { factory, calls } = makeFakePipeline({});
        const manager = new ModelManager(factory as never, async () => true, progress);

        await manager.ensureModel(undefined, progress);
        await manager.ensureModel(undefined, progress);
        await manager.ensureModel(undefined, progress);

        // Only one pipeline creation despite three ensure calls.
        expect(calls.length).toBe(1);
    });

    it("shares an in-flight load across concurrent ensure calls", async () => {
        const { factory, calls } = makeFakePipeline({});
        const manager = new ModelManager(factory as never, async () => true, progress);

        await Promise.all([
            manager.ensureModel(undefined, progress),
            manager.ensureModel(undefined, progress),
            manager.ensureModel(undefined, progress),
        ]);

        expect(calls.length).toBe(1);
    });

    it("recovers to WASM when WebGPU initialisation fails", async () => {
        const { factory, calls } = makeFakePipeline({ webgpuFails: true });
        const manager = new ModelManager(factory as never, async () => true, progress);

        const loaded = await manager.ensureModel(undefined, progress);
        expect(loaded.backend).toBe("wasm");
        // First attempt webgpu, then wasm.
        expect(calls.map((c) => c.backend)).toEqual(["webgpu", "wasm"]);
    });

    it("uses WASM directly when no WebGPU adapter exists", async () => {
        const { factory, calls } = makeFakePipeline({});
        const manager = new ModelManager(factory as never, async () => false, progress);

        const loaded = await manager.ensureModel(undefined, progress);
        expect(loaded.backend).toBe("wasm");
        expect(calls.every((c) => c.backend === "wasm")).toBe(true);
    });

    it("throws when both backends fail", async () => {
        const { factory } = makeFakePipeline({ webgpuFails: true, wasmFails: true });
        const manager = new ModelManager(factory as never, async () => true, progress);

        await expect(manager.ensureModel(undefined, progress)).rejects.toThrow();
        expect(manager.getLifecycle()).toBe("FAILED");
    });

    it("rejects unknown model ids", async () => {
        const { factory } = makeFakePipeline({});
        const manager = new ModelManager(factory as never, async () => true, progress);

        await expect(
            manager.ensureModel("not-a-real-model", progress)
        ).rejects.toThrow(/Unknown model/);
    });

    it("dispose resets to UNINITIALIZED and blocks further use", async () => {
        const { factory, calls } = makeFakePipeline({});
        const manager = new ModelManager(factory as never, async () => true, progress);

        await manager.ensureModel(undefined, progress);
        expect(calls.length).toBe(1);

        await manager.dispose();
        expect(manager.getLifecycle()).toBe("UNINITIALIZED");

        // Dispose is terminal: a disposed manager must not silently reload.
        await expect(
            manager.ensureModel(undefined, progress)
        ).rejects.toThrow(/disposed/);
    });
});