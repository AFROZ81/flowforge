# ✨ Local AI Drafting (FlowForge AI 2.0)

FlowForge can turn a plain-language prompt into a work-item draft using an
**open model that runs entirely on the user's device**. There are no API keys, no
cloud calls and no paid services — inference happens in the browser via
[Transformers.js](https://huggingface.co/docs/transformers.js) (`@huggingface/transformers`).

This document covers what the feature does, how it is put together, and how to
tune and test it.

---

## What it does

- **Draft a work item** from a prompt: a short title + a **two-sentence plain-text
  description** (sentence 1 = the task, sentence 2 = the expected outcome).
- **Suggest labels, priority and story points** from heuristics (no model needed).
- **Runs local and free.** The model downloads once, then stays resident.
- **Degrades gracefully.** If the model is unavailable, too slow, or produces
  unusable output, a built-in heuristic engine produces a compact draft instead.

Output is **plain text**, not Markdown — no headings, bullets, tables or code
fences. Example for *"Add dark mode"**:

```text
Add a dark mode option to improve usability in low-light environments. Ensure the selected theme persists across sessions.
```

---

## Architecture at a glance

```text
CreateWorkItemDialog ──▶ AIDraftDialog ──▶ LocalAiService (main thread)
                                                │  postMessage / correlate by id
                                                ▼
                                         localAi.worker  (Web Worker, off main thread)
                                                │
                       ┌────────────────────────┼────────────────────────┐
                       ▼                        ▼                         ▼
                ModelManager              generationConfig          parseAiDraft
             (load + reuse model)        (prompt + token budget)    (normalise to 2 sentences)
                       │                        │                         │
                       ▼                        ▼                         ▼
              Transformers.js pipeline   generationDeadline (20 s)   NoopAiService (fallback)
```

| Module | Responsibility |
| --- | --- |
| `IAiService.ts` | Provider-neutral contract (`AiDraft`, `AiContext`, feature methods). |
| `LocalAiService.ts` | Main-thread bridge: owns the single `Worker`, correlates requests by id, enforces the outer safety timeout, exposes cancellation. Also exposes the heuristic helpers directly. |
| `localAi.worker.ts` | Off-main-thread engine: serialises generation, races the generator against the deadline, validates output, falls back. |
| `modelManager.ts` | Downloads + loads a model **once** and reuses it; picks WebGPU or WASM; recovers WebGPU → WASM. |
| `modelRegistry.ts` | Catalogue of models (id, repo, quantisation, size, verified flag). |
| `generationConfig.ts` | System prompt, token budget, and `GENERATION_DEADLINE_MS`. Single source of truth. |
| `generationDeadline.ts` | `raceWithDeadline()` — bounds an (uninterruptible) generation promise. |
| `parseAiDraft.ts` | Robust parser + **plain-text normaliser** (condenses to exactly two sentences). |
| `NoopAiService.ts` | Heuristic fallback engine (also powers labels/priority/effort/dupes/assignee). |
| `useAiStore.ts` | Zustand store (persisted): enable flag, feature flags, selected model. |
| `AIDraftDialog.tsx` | The "Draft with AI" dialog UI. |
| `aiBenchmark.ts` | Dev-only benchmarking harness. |

The inference pipeline is **code-split**: `@huggingface/transformers` and the
worker load only when AI is actually used.

---

## Models

| Model id | Size | Role |
| --- | --- | --- |
| `qwen2.5-0.5b-instruct` | ~380 MB (q4) | **Default.** Baseline quality, good instruction-following. |
| `smollm2-360m-instruct` | ~260 MB (q4) | Smallest/fastest verified option. |

Experimental profiles (Qwen3, Llama 3.2, Gemma 3) are catalogued but **not
selectable** until their browser ONNX exports are verified.

- The user picks a verified model in **Settings → General**; the choice persists
  in the `flowforge-ai` store.
- Models are **never downloaded until AI is enabled and a draft is requested.**
- Only one model is resident at a time; switching models reloads once.

---

## Generation settings

Defined in `generationConfig.ts`:

| Setting | Value | Why |
| --- | --- | --- |
| `maxNewTokens` | `90` | Fits the JSON wrapper + a two-sentence description; prevents runaway output. |
| `doSample` | `false` | Greedy decoding → deterministic, fast, parseable. |
| `temperature` | `0.2` | Only relevant if sampling is ever enabled. |
| `returnFullText` | `false` | Return only the completion. |
| `GENERATION_DEADLINE_MS` | `20_000` | Neural generation deadline (see below). |

The **system prompt** is deliberately short: role + "do not invent technical
details" + the exact JSON schema + "two plain-text sentences (task, then
outcome)" + "no Markdown". Input context is trimmed to the column and a few
existing labels (titles are dropped) to keep the prompt small.

---

## Latency & the generation deadline

Latency has two very different parts:

1. **First use (cold):** one-time model **download + initialisation**. This can
   take minutes on a slow connection and is *not* bounded by the 20 s deadline.
   Download progress is shown and the user can cancel.
2. **Generation (warm):** once loaded, the model is reused for every later draft.

The **20-second deadline applies only to neural generation**, never to the
download. It is enforced *inside the worker* by `raceWithDeadline()`:

- If generation finishes in time → the draft is validated and returned.
- If it exceeds 20 s → the worker **immediately** delivers the heuristic
  fallback (`fallbackReason: "timeout"`), discards the late result safely, and
  leaves the queue free for the next request. A timed-out request never blocks
  future ones.

### What was slow, and why

- The 0.5B model on **WASM (CPU)** is the common path on machines without a
  usable WebGPU adapter — token-by-token decoding is the dominant warm cost.
- **WebGPU** is preferred when an adapter exists; if WebGPU init fails, the
  manager records `webGpuBroken` and permanently uses WASM for the session, so it
  never wastes time retrying WebGPU.
- Inference is **serialised**: the next request waits for any in-flight generator
  to settle, because Transformers.js cannot run two generations on one pipeline.
  This wait never blocks the user (their request already has its fallback).

---

## Fallback

`NoopAiService` is an independent, model-free engine. It produces a title, a
two-sentence plain-text description, priority, labels and effort estimates from
keyword heuristics. It is used when:

- the model is unavailable or still downloading,
- generation exceeds the 20 s deadline,
- neural output cannot be parsed into a usable draft.

The dialog shows a subtle notice (distinct for the timeout case):
*"Draft prepared using the built-in assistant because local AI generation took
too long."* The draft is always editable and is **never auto-submitted**.

---

## Plain-text normalisation

`parseAiDraft.normalizeDescription()` cleans any model output before display:

- strips Markdown (headings, bold/italic, inline code, fences, tables, blockquotes);
- splits the text into sentence/point units;
- **condenses to exactly two sentences** — if the model produced more, the tail is
  merged into the second sentence (nothing is dropped); if fewer, a sensible
  outcome sentence is added.

The parser itself is tolerant: JSON (strict + trailing-comma repair), fenced JSON,
labelled text, and free-form text are all accepted. Genuinely empty output is the
only thing rejected — and that triggers the fallback.

---

## Feature flags & opt-in

AI is **off by default**. In **Settings → General** the user enables AI and the
individual features: `draftWithAi`, `labelSuggestions`, `duplicateDetection`,
`effortEstimation`, `priorityRecommendation`, `assigneeSuggestion`. The model is
only ever downloaded after AI is enabled and a draft is requested — nothing is
fetched in the background.

---

## Testing

Unit tests use Vitest (`node` environment, `src/**/*.test.ts(x)`):

```powershell
cd frontend
npx vitest run --project unit     # 85 tests across 9 files
npm run build                     # tsc -b && vite build
```

Coverage includes: two-sentence plain-text output, Markdown stripping,
intelligent condense, the 20 s generation deadline, timeout fallback, late-result
isolation, post-timeout recovery, model reuse, parser robustness, and heuristic
fallback compactness.

### Manual benchmark

`aiBenchmark.ts` runs the local pipeline over a fixed prompt set and records
`initMs`, `generationMs`, `outputChars` and `backend` per prompt:

```ts
const { runAiBenchmark } = await import("/src/features/ai/aiBenchmark.ts");
console.table(await runAiBenchmark({ modelId: "qwen2.5-0.5b-instruct" }));
```

Use it to measure real warm/cold timings and to compare Qwen2.5 vs SmolLM2 on the
target hardware before changing the default model.

---

## Limitations

- **Cold start** is bounded by the one-time download + init; it cannot be
  guaranteed under a fixed time on slow connections.
- One failed WebGPU init on first load before falling back to WASM.
- An abandoned (timed-out) generator still occupies the model until it settles;
  the next neural attempt waits for it (its own 20 s deadline still applies).
- The heuristic fallback is keyword-based — compact and editable, but it does not
  infer genuine technical specifics by design.