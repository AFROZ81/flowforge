#!/usr/bin/env node
/*
 * FlowForge demo seed.
 *
 * Everything is created through the public API rather than by inserting rows,
 * so the data obeys the same rules the application enforces: boards get their
 * five default columns, DisplayOrder is assigned by the ordering service, and
 * completing or blocking an item writes the same status the handlers write.
 *
 * The one exception is time. Nothing in the API accepts a CreatedAt, and
 * without one the whole dataset lands on today, which leaves the fourteen-day
 * throughput chart as a single spike. Nor does anything accept a due date in
 * the past - both validators reject it, correctly for a form and fatally for a
 * seed - so this script also emits backdate.sql, an UPDATE over CreatedAt,
 * UpdatedAt and DueDate for exactly the ids it created and no others.
 *
 *   node tools/seed/seed.mjs
 *   sqlcmd -S localhost\\SQLEXPRESS01 -d FlowForgeDb -E -i tools/seed/backdate.sql
 *
 * Requires the API to be running. Safe to re-run: work is keyed on project key
 * and board name, and a board that already holds items is left alone.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = process.env.FLOWFORGE_API ?? "http://localhost:5045";
const HERE = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(HERE, "seed-state.json");
const SQL_FILE = join(HERE, "backdate.sql");

const DEMO_PASSWORD = "Seed2026pass";

/* Teammates. Registered into the existing organization so they appear in the
   member list, the workload table and every assignee dropdown. */
const TEAM = [
    { fullName: "Priya Raghavan", email: "priya@afrozlabs.test" },
    { fullName: "Daniel Okafor", email: "daniel@afrozlabs.test" },
    { fullName: "Mei-Lin Chen", email: "mei@afrozlabs.test" },
    { fullName: "Samuel Adeyemi", email: "samuel@afrozlabs.test" },
    { fullName: "Ana Ferreira", email: "ana@afrozlabs.test" },
];

/* The account whose dashboard is actually looked at. Whatever is assigned to
   this user drives "Needs your attention" and "My open work", so it is given a
   heavier share than the rest of the team. */
const PRIMARY_EMAIL_HINT = "test@";

const PROJECTS = [
    {
        name: "Atlas Billing",
        key: "ATLAS",
        color: "#6366f1",
        icon: "💳",
        description: "Invoicing, payments and revenue recognition.",
        boards: [
            {
                name: "Billing Engine",
                titles: [
                    "Prorate subscription changes mid-cycle",
                    "Dunning retries after a card decline",
                    "Idempotency guard on duplicate charges",
                    "Usage meter aggregation loses sub-buckets",
                    "Tax rounding differs per jurisdiction",
                    "Grandfather legacy discount codes",
                    "Seat counting drifts on annual plans",
                    "Cancel-at-period-end semantics unclear",
                    "Wire webhook replay into staging",
                    "Payment method vault migration",
                    "Renewal anchors shift by a day",
                    "Meter backfill for suspended accounts",
                    "Currency rounding for JPY and KRW",
                    "Reconcile daily settlement batches",
                ],
            },
            {
                name: "Invoicing",
                titles: [
                    "Invoice PDF renderer drops accented names",
                    "Credit notes against open invoices",
                    "Failed invoice email alerting",
                    "Refund flow for partially used periods",
                    "Numbering sequence collides across orgs",
                    "Statement view for customer balance",
                    "Revenue recognition schedule export",
                    "Attach PDF to the reminder, not the thread",
                    "Bulk regenerate invoices for a period",
                    "Proration line reads as an error",
                    "Downgrade leaves a stale line item",
                    "Localise invoice dates per locale",
                ],
            },
        ],
    },
    {
        name: "Data Platform",
        key: "DPLT",
        color: "#0ea5e9",
        icon: "🧭",
        description: "Ingestion, modelling and the serving layer.",
        boards: [
            {
                name: "Ingestion",
                titles: [
                    "Kafka consumer lag unbounded on replay",
                    "Schema registry back-compat checks",
                    "Dead-letter queue needs a retention policy",
                    "S3 poller misses late-arriving partitions",
                    "Debezium connector restarts nightly",
                    "Dedupe window too tight for mobile batches",
                    "PII columns arrive unredacted",
                    "Watermark column missing on two sources",
                    "Ingestion metrics lack per-source split",
                    "Backfill job has no checkpoint resume",
                    "Protobuf enums coerce to zero",
                    "Source health page shows yesterday as stale",
                    "Truncate retry on oversized payloads",
                ],
            },
            {
                name: "Warehouse",
                titles: [
                    "Incremental model rebuilds the whole table",
                    "Slow query on the sessions fact",
                    "Dimension key collision after the merge",
                    "Test coverage for the customer spine",
                    "Cost report by tag, not by team",
                    "Semantic layer metrics drift from dbt",
                    "Snapshot table retains too long",
                    "Grain of the daily rollup is ambiguous",
                    "Null handling in the funnel aggregate",
                    "Partition pruning ignored on filters",
                ],
            },
        ],
    },
    {
        name: "Mobile Client",
        key: "MOBI",
        color: "#10b981",
        icon: "📱",
        description: "iOS and Android applications.",
        boards: [
            {
                name: "iOS",
                titles: [
                    "Cold start over three seconds on iPhone SE",
                    "Push token not refreshed after reinstall",
                    "Offline queue drops writes past fifty",
                    "VoiceOver skips the board toolbar",
                    "Memory spike on image grid scroll",
                    "Deep link loses the org context",
                    "Keychain access denied in background",
                    "Swipe action fires twice on iPad",
                    "Session expires mid-composer",
                    "Dark mode contrast on label chips",
                    "Crash in the date picker on iOS 17",
                    "Reduce motion ignored for card entry",
                ],
            },
            {
                name: "Android",
                titles: [
                    "Fold device layout clips the sidebar",
                    "Compose recomposes the whole column",
                    "WorkManager job never reschedules",
                    "Scoped storage blocks attachment cache",
                    "Back gesture exits the app on a dialog",
                    "Text scaling breaks the card title",
                    "Battery optimisation prompt on OEM builds",
                    "Release signing config missing a rotation",
                    "Animation jank on drag between columns",
                    "Missing string for the empty backlog",
                ],
            },
        ],
    },
    {
        name: "Design System",
        key: "DSYS",
        color: "#f59e0b",
        icon: "🎨",
        description: "Shared components, tokens and documentation.",
        boards: [
            {
                name: "Components",
                titles: [
                    "Popover traps focus on second open",
                    "Data table header not sticky in Safari",
                    "Combobox typeahead ignores diacritics",
                    "Toast stack overlaps the pagination bar",
                    "Button loading state loses its width",
                    "Tabs overflow without a scroll hint",
                    "Menu separator colour fails contrast",
                    "Calendar cell size jumps on hover",
                    "Skeleton pulse ignores reduced motion",
                    "Tooltip should not open on touch hold",
                    "Form error summary never receives focus",
                ],
            },
            {
                name: "Foundations",
                titles: [
                    "Motion tokens are shorthands, not durations",
                    "Sunken surface reads darker than card",
                    "Publish the colour contrast audit",
                    "Split layout tokens from theme tokens",
                    "Radius scale has two competing eights",
                    "Document the z-index ladder",
                    "Icon set missing a kanban glyph",
                    "Deprecate the legacy spacing helpers",
                    "Density mode for compact tables",
                ],
            },
        ],
    },
    {
        name: "Customer Portal",
        key: "PORT",
        color: "#ec4899",
        icon: "🪟",
        description: "Self-service account and support surfaces.",
        boards: [
            {
                name: "Account",
                titles: [
                    "Password reset link expires in the mail app",
                    "SSO seat limit reported after the redirect",
                    "Billing address cannot be corrected",
                    "Member invite email in wrong locale",
                    "Download invoices range capped at ninety days",
                    "Audit log retention shorter than the contract",
                    "Role change not reflected without a reload",
                    "Two-factor recovery codes unprintable",
                    "Org switcher drops the active board",
                    "Session list shows an unknown device",
                    "Deletion request has no confirmation state",
                ],
            },
            {
                name: "Support",
                titles: [
                    "Ticket form accepts a hundred megabyte paste",
                    "Internal notes visible to customers",
                    "SLA clock runs through weekends",
                    "Attachment preview fails on heic",
                    "Macro inserts the wrong product name",
                    "Escalation path unreachable from the thread",
                    "CSAT survey fires on unresolved tickets",
                    "Search returns archived tickets",
                    "Reply drafted against a stale comment",
                ],
            },
        ],
    },
];

const LABELS = [
    { name: "Bug", color: "#ef4444", description: "Something is broken." },
    { name: "Regression", color: "#f97316", description: "Worked before." },
    { name: "Performance", color: "#8b5cf6", description: null },
    { name: "Accessibility", color: "#06b6d4", description: null },
    { name: "Security", color: "#e11d48", description: null },
    { name: "Data", color: "#0ea5e9", description: null },
    { name: "Design", color: "#f59e0b", description: null },
    { name: "Docs", color: "#64748b", description: null },
    { name: "Tech debt", color: "#6b7280", description: null },
];

/* Twelve items per board. Status lives on the item, not the column, so the
   Done column is where completed work is also parked - otherwise the board
   would read as five items in Done that are still Active. */
const COLUMN_PLAN = [
    { column: "Backlog", count: 2 },
    { column: "To Do", count: 3 },
    { column: "In Progress", count: 3 },
    { column: "Review", count: 1 },
    { column: "Done", count: 3 },
];

/* ------------------------------------------------------------------ helpers */

let requestCount = 0;

async function call(method, path, { token, body } = {}) {
    requestCount += 1;

    const response = await fetch(`${API}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const text = await response.text();

    let payload = null;
    if (text.length > 0) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = { raw: text };
        }
    }

    if (!response.ok) {
        throw new Error(
            `${method} ${path} -> ${response.status} ${
                payload?.message ?? payload?.raw ?? text
            }`
        );
    }

    return payload;
}

/* Unwrap the ApiResponse envelope where there is one; a few endpoints return
   the bare payload, so both shapes have to be tolerated. */
function unwrap(payload) {
    if (payload && typeof payload === "object" && "data" in payload) {
        return payload.data;
    }

    return payload;
}

/* Endpoints disagree on whether they page, so take whichever shape arrives. */
function listOf(payload) {
    const data = unwrap(payload);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;

    return [];
}

/* Deterministic, so a re-run produces the same dates and the same mix of
   priorities. That makes screenshots comparable across runs. */
function makeRandom(seed) {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = makeRandom(20261104);

const pick = (list) => list[Math.floor(random() * list.length)];

function shuffled(list) {
    const copy = [...list];

    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function toSqlUtc(date) {
    return (
        `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-` +
        `${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:` +
        `${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
    );
}

/* ------------------------------------------------------------------- steps */

async function resolveOrganizationId() {
    const options = unwrap(await call("GET", "/api/Organizations/options"));

    if (!Array.isArray(options) || options.length === 0) {
        throw new Error(
            "No organization is available to sign up into. Create one first."
        );
    }

    return options[0].id;
}

async function ensureUser(organizationId, { fullName, email }) {
    try {
        await call("POST", "/api/Auth/register", {
            body: {
                fullName,
                email,
                password: DEMO_PASSWORD,
                confirmPassword: DEMO_PASSWORD,
                organizationId,
            },
        });

        return "registered";
    } catch {
        /* Most likely "email already in use" from a previous run. The account
           exists, which is all the seed needs from it. */
        return "existing";
    }
}

async function login(email) {
    const payload = unwrap(
        await call("POST", "/api/Auth/login", {
            body: { email, password: DEMO_PASSWORD },
        })
    );

    return payload.accessToken;
}

async function main() {
    /* Resumable rather than repeatable: projects are matched by key, boards by
       name, and a board that already holds work is left alone. A run that
       stops half way can therefore be started again without ending up with
       two copies of the same sprint. */
    try {
        const previous = JSON.parse(readFileSync(STATE_FILE, "utf8"));

        console.log(`Resuming - an earlier seed ran at ${previous.runAtUtc}`);
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }

    const health = await call("GET", "/health").catch(() => null);

    if (health === null) {
        throw new Error(`API is not reachable at ${API}. Start it first.`);
    }

    const organizationId = await resolveOrganizationId();

    for (const member of TEAM) {
        const outcome = await ensureUser(organizationId, member);
        console.log(`  ${outcome.padEnd(10)} ${member.fullName}`);
    }

    const operator = TEAM[0];
    const token = await login(operator.email);

    const users = unwrap(await call("GET", "/api/Users", { token })) ?? [];

    const primary = users.find((user) =>
        (user.email ?? "").toLowerCase().startsWith(PRIMARY_EMAIL_HINT)
    );

    console.log(
        `  ${users.length} members in the workspace` +
            (primary
                ? `, primary "${primary.fullName}"`
                : ", no primary account found")
    );

    /* Assignee pool: everybody in the org. The primary appears twice so that
       roughly a third of assigned work lands on them - the point of the
       exercise is a personal dashboard with something on it. */
    const assignees = primary
        ? [...users.map((user) => user.id), primary.id, primary.id]
        : users.map((user) => user.id);

    /* ---- labels */

    const labelsByName = new Map();

    for (const label of LABELS) {
        const created = unwrap(
            await call("POST", "/api/Labels", { token, body: label }).catch(
                () => null
            )
        );

        if (created?.id) labelsByName.set(label.name, created.id);
    }

    /* Read the list back so labels left by an earlier run are found rather
       than silently skipped when the create was rejected as a duplicate. */
    for (const label of listOf(
        await call("GET", "/api/Labels", { token })
    )) {
        if (!labelsByName.has(label.name)) {
            labelsByName.set(label.name, label.id);
        }
    }

    const labelIds = [...labelsByName.values()];

    /* ---- projects, boards, columns */

    const projectsByKey = new Map(
        listOf(await call("GET", "/api/Projects?pageSize=100", { token })).map(
            (project) => [project.key.toUpperCase(), project.id]
        )
    );

    const items = [];
    const createdIds = { projects: [], boards: [], labels: labelIds };

    for (const project of PROJECTS) {
        const key = project.key.toUpperCase();

        let projectId = projectsByKey.get(key);

        if (projectId) {
            console.log(`  reuse    ${project.name}`);
        } else {
            const created = unwrap(
                await call("POST", "/api/Projects", {
                    token,
                    body: {
                        name: project.name,
                        key,
                        description: project.description,
                        color: project.color,
                        icon: project.icon,
                    },
                })
            );

            projectId = created.id;
            projectsByKey.set(key, projectId);
            createdIds.projects.push(projectId);
        }

        const boardsByName = new Map(
            listOf(
                await call(
                    "GET",
                    `/api/Boards?ProjectId=${projectId}&pageSize=50`,
                    { token }
                )
            ).map((board) => [board.name, board.id])
        );

        for (const board of project.boards) {
            let boardId = boardsByName.get(board.name);

            if (boardId) {
                console.log(`    reuse  ${board.name}`);
            } else {
                const created = unwrap(
                    await call("POST", "/api/Boards", {
                        token,
                        body: {
                            projectId,
                            name: board.name,
                            description: null,
                        },
                    })
                );

                boardId = created.id;
                boardsByName.set(board.name, boardId);
                createdIds.boards.push(boardId);
            }

            const columns = listOf(
                await call("GET", `/api/Columns?BoardId=${boardId}`, { token })
            );

            const byName = new Map(columns.map((c) => [c.name, c.id]));

            /* Backlog is the cheapest place to ask whether a board has been
               seeded already, because it is the one column a finished sprint
               always still has work in. */
            const alreadySeeded = listOf(
                await call(
                    "GET",
                    `/api/WorkItems/column/${byName.get("Backlog")}`,
                    { token }
                )
            ).length;

            if (alreadySeeded > 0) {
                console.log(
                    `    skip   ${board.name}: ${alreadySeeded} already in backlog`
                );

                continue;
            }

            /* Deal the titles rather than walk them in order, so a board never
               shows the same line twice and reads like a real sprint. */
            const deck = shuffled(board.titles);
            const boardItems = [];

            for (const plan of COLUMN_PLAN) {
                const columnId = byName.get(plan.column);

                if (!columnId) continue;

                for (let n = 0; n < plan.count; n += 1) {
                    const title = deck.pop() ?? `${board.name} task ${n + 1}`;

                    const isDone = plan.column === "Done";
                    const isBlocked = plan.column === "In Progress" && n === 0;

                    /* Priority mix: enough Critical/High that the severity
                       rails and the "overdue" figures mean something, without
                       looking like everything is on fire. */
                    const priority = isBlocked
                        ? 4
                        : pick([1, 2, 2, 2, 3, 3, 3, 4]);

                    /* Due dates. Done items are in the past but that is
                       harmless - overdue only counts non-completed work. */
                    const dueOffsetDays = isDone
                        ? -Math.floor(random() * 10)
                        : isBlocked
                          ? -Math.floor(random() * 8) - 1
                          : plan.column === "Review"
                            ? Math.floor(random() * 5) + 1
                            : pick([
                                  -12, -9, -6, -3, -1,
                                  1, 2, 4, 6, 11, 18, 26, 34,
                                  null, null,
                              ]);

                    /* The due date is deliberately not sent here: both the
                       create and the edit validator reject a date in the past,
                       which is right for somebody filling in a form and fatal
                       for a seed that needs overdue work. It arrives with the
                       timestamps at the end. */
                    const createdItem = unwrap(
                        await call("POST", "/api/WorkItems", {
                            token,
                            body: {
                                columnId,
                                title,
                                description: null,
                                priority,
                                dueDate: null,
                            },
                        })
                    );

                    const workItemId = createdItem.id;

                    if (isBlocked) {
                        await call(
                            "PATCH",
                            `/api/WorkItems/${workItemId}/block`,
                            { token }
                        );
                    }

                    if (random() < 0.88) {
                        const assigneeId = pick(assignees);

                        await call(
                            "PATCH",
                            `/api/WorkItems/${workItemId}/assign/${assigneeId}`,
                            { token }
                        );
                    }

                    if (labelIds.length > 0 && random() < 0.35) {
                        await call(
                            "POST",
                            `/api/Labels/workitem/${workItemId}/label/${pick(
                                labelIds
                            )}`,
                            { token }
                        );
                    }

                    const entry = {
                        id: workItemId,
                        kind: isDone
                            ? "done"
                            : isBlocked
                              ? "blocked"
                              : "open",
                        dueOffsetDays,
                    };

                    items.push(entry);
                    boardItems.push(entry);
                }
            }

            /* Completion is a separate call because status lives on the item
               rather than on the column, and it is that PATCH which gives
               UpdatedAt a value worth backdating. */
            for (const entry of boardItems) {
                if (entry.kind !== "done") continue;

                await call("PATCH", `/api/WorkItems/${entry.id}/complete`, {
                    token,
                });
            }
        }
    }

    /* ---- timestamps */

    writeFileSync(
        STATE_FILE,
        JSON.stringify(
            {
                runAtUtc: new Date().toISOString(),
                organizationId,
                api: API,
                operator: operator.email,
                password: DEMO_PASSWORD,
                ...createdIds,
                workItemCount: items.length,
            },
            null,
            4
        )
    );

    const statements = items.map((item, index) => {
        /* Cycle the day offset so every one of the fourteen days the chart
           reads gets a fair share, then push a third of the set further back
           so the window does not look manufactured. */
        let createdDaysAgo = index % 14;
        const hour = 8 + Math.floor(random() * 10);

        if (index % 3 === 0) {
            createdDaysAgo += 14 + Math.floor(random() * 20);
        }

        const createdAt = new Date(
            Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate() - createdDaysAgo,
                hour,
                Math.floor(random() * 60),
                Math.floor(random() * 60)
            )
        );

        /* Completed and blocked work moves again after it is created, and the
           throughput chart reads UpdatedAt for completions, so the two have to
           stay inside the same window and in the right order. */
        const updateGap =
            item.kind === "done"
              ? Math.floor(random() * Math.min(createdDaysAgo + 1, 4))
              : item.kind === "blocked"
                ? Math.floor(random() * 2) + 1
                : Math.floor(random() * 3);

        const updatedAt = new Date(
            createdAt.getTime() + updateGap * 86_400_000
        );

        const clamped = Math.min(updatedAt.getTime(), Date.now());

        /* Due date travels with the timestamps for the reason above. CAST on
           the null row because SQL Server takes the column type from the first
           tuple of the VALUES list. */
        const due =
            item.dueOffsetDays === null
                ? "CAST(NULL AS datetime2)"
                : `'${toSqlUtc(
                      new Date(
                          Date.now() + item.dueOffsetDays * 86_400_000
                      )
                  )}'`;

        return (
            `  (N'${item.id}', '${toSqlUtc(createdAt)}', ` +
            `'${toSqlUtc(new Date(clamped))}', ${due})`
        );
    });

    writeFileSync(
        SQL_FILE,
        `/*
  Generated by tools/seed/seed.mjs.

  Audit timestamps and due dates for the work items that run created - nothing
  else. The due date is here because the create and edit validators refuse a
  date in the past, so overdue work cannot be produced through the API at all.

  Run against the development database:
      sqlcmd -S localhost\\SQLEXPRESS01 -d FlowForgeDb -E -i ${SQL_FILE}
*/
SET XACT_ABORT ON;
BEGIN TRANSACTION;

UPDATE w
SET    w.CreatedAt = v.CreatedAt,
       w.UpdatedAt = v.UpdatedAt,
       w.DueDate   = v.DueDate
FROM   dbo.WorkItems AS w
JOIN   ( VALUES
${statements.join(",\n")}
       ) AS v (Id, CreatedAt, UpdatedAt, DueDate)
       ON w.Id = v.Id;

COMMIT;
GO
`
    );

    console.log(
        `\n${requestCount} requests, ${items.length} work items.` +
            `\nstate -> ${STATE_FILE}\ndates -> ${SQL_FILE}`
    );
}

main().catch((error) => {
    console.error(`\nSeed failed: ${error.message}\n`);
    process.exitCode = 1;
});
