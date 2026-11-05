# FlowForge

A real-time Kanban project management platform: an ASP.NET Core Web API built on Clean
Architecture and CQRS, and a React SPA that talks to it over REST and SignalR.

Work is organised as **Organization → Project → Board → Column → Work item**. A board is a
drag-and-drop column layout; a work item carries an assignee, labels, checklists,
attachments, comments, watchers, a reminder and an activity history.

| | |
| --- | --- |
| **API** | ASP.NET Core `net10.0` · MediatR CQRS · EF Core 10 · SQL Server · SignalR · JWT · Serilog |
| **Client** | React 19 · TypeScript · Vite 8 · Tailwind 4 · TanStack Query · Zustand · react-router 7 |
| **Run on** | API `http://localhost:5045` · client `http://localhost:5173` |
| **Surface** | 89 endpoints / 19 controllers · 17 client feature areas · 4 themes + system |
| **License** | MIT — see [LICENSE](LICENSE) |
| **Not there yet** | automated tests, CI, Docker, role-based authorization — see [Known gaps](#known-gaps) |

**Contents** · [Features](#features) · [Stack](#stack) · [Architecture](#architecture) ·
[Domain](#domain-model) · [Setup](#setup) · [Using the app](#using-the-app) ·
[Demo data](#demo-data) · [API](#api-overview) · [Realtime](#realtime) ·
[Configuration](#configuration) · [Commands](#commands) · [Troubleshooting](#troubleshooting) ·
[Gaps](#known-gaps) · [Docs](#documentation) · [Contributing](#contributing)

---

## Features

| Area | What works |
| --- | --- |
| Authentication | JWT access tokens (8 h default), ASP.NET Core Identity, one organization per account |
| Structure | Organizations, projects, boards, columns, work items |
| Work items | Create, rename, edit, assign, move, complete, block, activate, archive, restore |
| Item detail | Checklists, labels, attachments, comments, watchers, reminder, activity history |
| Boards | Five default columns, HTML5 drag-and-drop ordering, live board presence |
| Dashboard | One composed snapshot: own workload, status mix, priority mix, project health, team workload, throughput, recent activity |
| Reports | Work items, projects, team, labels, productivity + XLSX export |
| Realtime | Notification inbox, unread count, online presence, board roster — over one hub |
| Client | Sidebar + mobile drawer shell, four themes plus system, Base UI dialogs and menus |

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | ASP.NET Core `net10.0`, controllers returning MediatR results |
| Architecture | Clean Architecture, CQRS via MediatR 14.2, one vertical slice per verb |
| Persistence | EF Core 10.0.10 on SQL Server, ASP.NET Core Identity (`IdentityDbContext<…, Guid>`) |
| Auth | JWT bearer (`System.IdentityModel.Tokens.Jwt` 8.19), issuer/audience/skey validated, `ClockSkew = Zero` |
| Validation | FluentValidation 12.1 through `ValidationBehavior` |
| Realtime | SignalR hub at `/hubs/notifications`, `@microsoft/signalr` 10 on the client |
| Logging | Serilog: console + daily rolling file, correlation id enriched |
| API docs | Swashbuckle Swagger UI, Development only |
| Hardening | Rate limiting, Brotli/Gzip compression, health checks, security headers |
| Client | React 19, TypeScript ~6, Vite 8, Tailwind 4 + CVA + tailwind-merge, Base UI primitives |
| Client data | TanStack Query 5 + Table 8, Zustand 5 (`persist`), react-hook-form + Zod 4 |
| Client extras | framer-motion 12, sonner toasts, lucide-react icons, next-themes, Geist font |

---

## Architecture

```text
Browser (React SPA)
   │  REST + SignalR
   ▼
FlowForge.API            Controllers · Hubs · Middleware · Program.cs
   │  IMediator.Send()
   ▼
FlowForge.Application    Features/<area>/<verb> · Commands · Queries · Validators · Rules
   │  interfaces                    ▲
   ▼                                │ depends on
FlowForge.Infrastructure ──────────┘  EF Core · Identity · Migrations · File storage · Services
   │
   ▼
FlowForge.Domain         Entities · Enums — no dependencies
```

- **Dependency rule.** Domain knows nothing; Application depends only on Domain and declares
  the interfaces it needs (`IApplicationDbContext`, `IAuthService`, `IFileStorageService`, …);
  Infrastructure implements them; the API composes and holds no logic.
- **Request flow.** Action → `Send()` → `ValidationBehavior` runs every `IValidator<TRequest>`
  → feature handler → EF Core → `ApiResponse<T>` → `ExceptionMiddleware` maps thrown
  domain exceptions to status codes.
- **Vertical slices.** Each operation owns its folder — `Create/`, `Move/`, `Complete/`,
  `Block/`, `Assign/`, `Archive/` … — with its command, handler, validator and response.
- **Shared invariants.** `ProjectRules`, `BoardRules`, `ColumnRules`, `WorkItemRules`,
  `CommentRules`, `AttachmentRules`, `LabelRules`, `NotificationRules`, `SearchRules`,
  `ReminderRules`, `ChecklistRules`, `WorkItemWatcherRules`, `WorkItemHistoryRules`, all
  registered in `AddInfrastructure()`.
- **Ordering.** Work items use a `DisplayOrder` gap strategy
  (`WorkItemOrderingService`, `Gap = 1000`, `MinimumGap = 1`), so a drag writes one row
  instead of renumbering a column. Columns take `max + 1` on create.
- **Frontend layout.** `src/app` router and providers · `src/layouts` shell · `src/routes`
  guards · `src/components` shared primitives · `src/features/<area>` api, hooks, components,
  types · `src/stores` · `src/lib` axios client, query client, formatting, theme registry ·
  `src/styles` tokens.

---

## Domain model

```text
Organization
└── Project            name, key (≤ 10, stored upper-case), colour, icon, archived flag
    └── Board          name, description, archived flag
        └── Column     name, description, DisplayOrder, archived flag
            └── WorkItem  title, description, priority, status, due date,
                          reminder date, assignee, DisplayOrder, archived flag
                ├─ Comment · Attachment · ChecklistItem · WorkItemLabel ↔ Label
                ├─ WorkItemWatcher · WorkItemHistory · Notification
```

New boards arrive with five columns: **Backlog, To Do, In Progress, Review, Done**. Names are
unique per board; items hang off exactly one column. A reminder is not an entity — it is
`DueDate` plus `ReminderDate` on the item.

Draw.io sources for these two aggregates live in
[`docs/Diagrams`](docs/Diagrams) — `ProjectAggregate.drawio` and `BoardAggregate.drawio` carry
the field lists, unique indexes and cascade/restrict behaviour; `Architecture.drawio` and
`Authentication.drawio` cover the layers and the token path.

| Enum | Values |
| --- | --- |
| `WorkItemStatus` | Active · Completed · Blocked |
| `WorkItemPriority` | Low · Medium · High · Critical |
| `ProjectStatus` | Planning · Active · OnHold · Completed · Archived — **declared but never referenced**; a project carries `IsArchived`, and the client badge reads Active / Archived from that |
| `NotificationType` | WorkItemAssigned · WorkItemStatusChanged · CommentAdded · AttachmentAdded · LabelAssigned |
| `WorkItemHistoryAction` | Created · Assigned · StatusChanged · CommentAdded · AttachmentAdded/Removed · LabelAdded/Removed · ChecklistCompleted/Uncompleted · WatcherAdded/Removed · ReminderUpdated/Removed · Completed |

Three rules explain most behaviour:

- **Status lives on the item, not the column** — dragging into *Done* does not complete it.
- **Every query is organization-scoped** from the JWT `organizationId` claim
  (`x.Column.Board.Project.OrganizationId`), which matters more than any id in a route.
- **Soft-deleted rows are always filtered out**; archived rows appear only when a query opts
  in (`IncludeArchived`, an `IsArchived` filter) and refuse mutation. `EntityBase` stamps
  `Created*`/`Updated*` from those claims — hence a nullable current-user accessor, so
  anonymous writes such as registration can still save.

---

## Setup

### Prerequisites

**.NET SDK 10** · **Node.js 22 LTS or newer** (Vite 8 needs ≥ 20.19 / 22.12) · **SQL Server**
(instance, LocalDB or Express) · **git** · `sqlcmd` only if you want the demo data.

### 1. Database connection

Set your own instance in `backend/src/FlowForge/FlowForge.API/appsettings.json` — or better,
in `appsettings.Development.json` / user secrets, which keep machine-local values out of the
working tree:

```
Server=<your-server-instance>;Database=FlowForgeDb;Trusted_Connection=True;TrustServerCertificate=True;
```

Windows authentication as above, or add `User ID=…;Password=…`. The database is created by the
next step.

### 2. Generate and apply migrations

**Migrations are not committed** — `.gitignore` excludes
`FlowForge.Infrastructure/Migrations` because they are reproducible from the model. A fresh
clone therefore has none, and `database update` would silently apply nothing:

```powershell
dotnet tool install --global dotnet-ef
cd backend/src/FlowForge
dotnet ef migrations add InitialCreate --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef database update              --project FlowForge.Infrastructure --startup-project FlowForge.API
```

Creates the application tables and the Identity tables.

### 3. Signing key

`Jwt:Key` in `appsettings.json` is a placeholder. Replace it before anything leaves your
machine:

```powershell
cd backend/src/FlowForge/FlowForge.API
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<at least 32 random characters>"
```

`Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryInMinutes` and
`ConnectionStrings__DefaultConnection` work as environment variables too.

### 4. Run the API

```powershell
dotnet run --project backend/src/FlowForge/FlowForge.API --launch-profile http
```

| URL | |
| --- | --- |
| `http://localhost:5045/api/…` | REST API |
| `http://localhost:5045/swagger` | interactive docs (Development only; `/` redirects here) |
| `http://localhost:5045/health` | health check, includes the SQL Server probe |
| `http://localhost:5045/hubs/notifications` | SignalR hub |

Logs go to the console and to `FlowForge.API/Logs/log-YYYYMMDD.txt`, one correlation id per
request.

### 5. Run the client

Create the git-ignored `frontend/.env` with a single line, then start Vite:

```ini
VITE_API_URL=http://localhost:5045/api
```

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Keep that port: the CORS policy allows exactly that origin,
and the hub URL is this value with the trailing `/api` stripped.

### 6. First workspace, then your account

Registration requires an `organizationId`, so **a new database has nothing to sign up into** —
the form says so rather than guessing. Create one workspace once, via Swagger
(`POST /api/Organizations`, no token needed):

```json
{ "name": "My Company", "slug": "my-company", "description": null }
```

Then choose **Create account** on the client. Identity requires 8+ characters with a digit,
an uppercase and a lowercase letter; emails are unique. You land on the dashboard — add a
project, then a board, and the five default columns are created for you.

---

## Using the app

| Screen | What you do there |
| --- | --- |
| `/` landing | Signed-out intro; theme switch, links to sign in and register |
| `/login` | One card, two faces. The token is kept in `sessionStorage` under `flowforge-auth` — survives a refresh, not a browser restart |
| **Dashboard** | Everything from **one** `GET /api/Dashboard`, timestamped and refreshable; a failed refresh keeps the last numbers with a warning. Panels: needs attention and my open work · status mix and priority mix · project health and team workload · throughput and recently updated |
| **Projects** | Cards with an Active / Archived badge, colour, icon, board counts, recent activity. Create asks for name (unique per organization), key (derived, editable, unique per organization at the database level), colour, icon, description; edit and archive available, and archiving offers undo |
| **Board** | The working surface — see below. Everyone viewing it shows in its presence strip |
| Work item dialog | Fields and assignee, lifecycle actions, checklist, attachments, comments, watchers, reminder, activity history |
| **Reports** | Five URL-addressable views — work items, projects, team, labels, productivity — each a figure strip over a table, plus XLSX export |
| **Settings** | From the account menu. General: theme, sidebar width, account/workspace/session info. Members: roster with live presence and workload |

On a board:

| Action | Where |
| --- | --- |
| Add work | Compose at the bottom of a column |
| Move work | Drag the card — one `PATCH /api/WorkItems/{id}/move` |
| Comments, watchers, labels | Directly on the card |
| Edit, assign, complete, block, activate, archive | Open the card, then act in the dialog |
| Restore | The archived-items list |

Themes are four token palettes (`light`, `parchment`, `dark`, `onyx`) plus `system`, chosen on
the landing header or in Settings, stored as `flowforge.theme`, applied via `data-theme`.
Everything paints from CSS custom properties in `src/styles/theme.css`; no component hardcodes
a colour.

---

## Demo data

`tools/seed/seed.mjs` creates **5 teammates, 5 projects, 10 boards, 120 work items and 9
labels** through the public API, so every row obeys the application's own rules. Re-runnable:
projects match by key, boards by name, and a board that already holds work is skipped.

```powershell
node tools/seed/seed.mjs
sqlcmd -S <your-server-instance> -d FlowForgeDb -E -i tools/seed/backdate.sql
```

The second command exists because no endpoint accepts a timestamp and both validators reject a
past due date, so overdue work cannot be produced through the API: the script emits
`backdate.sql`, one `UPDATE` over `CreatedAt`, `UpdatedAt` and `DueDate` for exactly the ids it
created. Override the target with `FLOWFORGE_API`; the demo password sits in `DEMO_PASSWORD` at
the top of the script, and the accounts it registers are `@afrozlabs.test`. Generated
`seed-state.json` and `backdate.sql` are git-ignored. **Local demo data only** — do not run it
against anything reachable by other people.

---

## API overview

89 endpoints across 19 controllers; Swagger UI is the complete list.

| Controller | Covers |
| --- | --- |
| `Auth` | register, login (login rate limited per IP) |
| `Organizations` | public workspace options, create |
| `Users` | the organization's members |
| `Projects` · `Boards` | list, create, get, update, archive, restore (+ board details) |
| `Columns` | create, list by board, get, update (rename and reorder), archive, restore |
| `WorkItems` | create, list all / by column, get, rename, edit, move, complete, block, activate, archive, restore, assign, unassign |
| `Comments` · `Attachments` | list by item, get, add/upload, update, delete, download |
| `Labels` | workspace CRUD, list an item's labels, assign, remove |
| `Checklists` | create, list, update, complete, uncomplete, delete, reorder, progress |
| `WorkItemWatchers` · `WorkItemHistories` | list, add, remove · activity feed |
| `Reminders` · `Notifications` | set, delete, upcoming, overdue · list, unread count, get, mark read/unread, read-all, delete |
| `Dashboard` · `Reports` | one composed snapshot · five queries and an XLSX export |
| `Presence` · `Search` | who is online, is-online · work-item search |

**Conventions**

- Routes `api/[controller]`; GUIDs constrained in the route.
- Handlers return the camel-cased `ApiResponse<T>` envelope —
  `{ success, message, data, traceId, errors }` — where `data` is a DTO or a paged
  `items` result. Endpoints served by plain services (organization options and create, the
  XLSX export) return a bare payload or a file, so client helpers tolerate both shapes.
- Status codes come from the exception type: `BadRequest` 400, `Unauthorized` 401,
  `Forbidden` 403, `NotFound` 404, `Conflict` 409, anything else 500 with a generic message and
  the correlation id in `traceId`.
- `[Authorize]` per controller; `Auth` and `Organizations` carry none, so register, login,
  `GET /api/Organizations/options` and `POST /api/Organizations` are anonymous — that is what
  makes first-run bootstrap possible.
- `X-Correlation-ID` is honoured inbound, always emitted, assigned to
  `HttpContext.TraceIdentifier` and pushed into the Serilog context.
- Rate limits: 600/min per authenticated user, 30/min per anonymous IP, 5 logins/min per IP;
  rejections are 429 with `Retry-After: 60`.
- Uploads land on disk under `FlowForge.API/Storage/Attachments/<workItemId>/<guid><ext>`
  (git-ignored). Replacing `IFileStorageService` is the seam for blob storage.

---

## Realtime

One hub, `/hubs/notifications`, `[Authorize]`, with the JWT accepted as a bearer header **or**
an `access_token` query parameter — WebSocket handshakes cannot set headers. On connect the
connection joins `user:{id}` and `organization:{id}`; `JoinBoard`/`LeaveBoard` maintain
`board:{id}` and republish the roster. Online presence is tracked per user, board presence per
connection, so a second tab does not inherit the first one's board and closing one tab does not
mark the user offline.

| Event | Audience | Raised by |
| --- | --- | --- |
| `NotificationReceived` | `user:{id}` | assign, complete, block, activate, comment, attachment, label |
| `UserOnline` / `UserOffline` | all clients | hub connect / disconnect |
| `BoardPresenceChanged` | `board:{id}` | `JoinBoard` / `LeaveBoard` |
| `WorkItemCreated` | `board:{id}` | create, restore |
| `WorkItemUpdated` | `board:{id}` | rename, edit, assign, unassign, complete, block, activate |
| `WorkItemMoved` / `WorkItemDeleted` | `board:{id}` | drag · archive |
| `CommentAdded` / `Updated` / `Deleted` | `board:{id}` | comment handlers |
| `TypingStarted` / `TypingStopped` | `board:{id}` except sender | `StartTyping` / `StopTyping` — no caller |

The client listens to notifications and presence only, from one shared `PresenceContext`, with
automatic reconnect. The `WorkItem*` and `Comment*` broadcasts have no consumer yet, so another
person's card move reaches you through a refetch rather than an event. `RealtimeEvents.BoardUpdated`
is never sent and `NotifyOrganizationAsync` has no caller. `wwwroot/signalr-test.html` exercises
the hub without the client.

---

## Configuration

| Key | File / place | Purpose |
| --- | --- | --- |
| `ConnectionStrings:DefaultConnection` | `appsettings.json` | SQL Server instance and database |
| `Jwt:Key` | user secrets / env | signing key — **the shipped value is a placeholder** |
| `Jwt:Issuer` · `Jwt:Audience` | `appsettings.json` | token validation |
| `Jwt:ExpiryInMinutes` | `appsettings.json` | access-token lifetime (480) |
| `Serilog` | `appsettings.json` | console + `Logs/log-.txt`, daily roll, 30 kept |
| `AllowedHosts` | `appsettings.json` | host filtering |
| `VITE_API_URL` | `frontend/.env` | the only value the client reads |
| `flowforge-auth` | `sessionStorage` | token, expiry, decoded user |
| `flowforge.theme` | `localStorage` | `light` · `parchment` · `dark` · `onyx` · `system` |
| `FLOWFORGE_API` | environment | overrides the seed script's target |

---

## Commands

From the repository root, PowerShell.

```powershell
# API
dotnet build backend/src/FlowForge/FlowForge.slnx
dotnet run --project backend/src/FlowForge/FlowForge.API --launch-profile http
dotnet run --project backend/src/FlowForge/FlowForge.API --launch-profile https   # 7039 + 5045

# Migrations — run from backend/src/FlowForge
dotnet ef migrations add <Name> --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef database update       --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef migrations list       --project FlowForge.Infrastructure --startup-project FlowForge.API

# Client — run from frontend
npm run dev        # Vite on :5173
npm run build      # tsc -b && vite build (type-check + bundle)
npm run lint       # eslint
npm run preview    # serve the production build

# Diagrams — the .drawio files are hand-written XML, so geometry is checked
node tools/drawio-fit.mjs   # reports labels that overflow their shape, and boxes or
                            # connectors that land on top of each other
```

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Sign-up says there are no workspaces | No organization yet — `POST /api/Organizations` via Swagger, then retry |
| `database update` applies nothing | Migrations are git-ignored; add `InitialCreate` first |
| CORS errors in the browser | The API allows only `http://localhost:5173`; free that port or edit `AllowFrontend` |
| "Failed to determine the https port for redirect" | Harmless on the `http` profile; use `--launch-profile https` for TLS |
| 401 on requests that worked earlier | Token expired, or clock skew — `ClockSkew` is zero. Sign in again |
| 429 while testing | Real limits: 5 logins/min per IP, 30 anonymous/min. Wait 60 s or sign in |
| SignalR won't connect | Needs `?access_token=…`; the hub URL is the API origin without `/api` |
| A 400-worthy request returns 500 | FluentValidation failures aren't mapped — read `Logs/log-*.txt` |
| Dashboard looks stale | It is one snapshot; use the refresh in the page header |

---

## Known gaps

Recorded so nobody searches the code for a thing that does not exist.

| Gap | Detail |
| --- | --- |
| No role-based authorization | `[Authorize]` only — no roles or policies anywhere, despite older docs claiming otherwise |
| Validation failures return 500 | `ValidationBehavior` throws `FluentValidation.ValidationException`, unmapped by `ExceptionMiddleware`, so an invalid payload gives the generic 500 instead of 400 with field errors |
| Anonymous organization create | Anyone reaching the API can `POST /api/Organizations`; fine locally, not beyond |
| Search is API-only | `GET /api/Search/workitems` exists; there is no search UI |
| Entity events have no listener | `WorkItem*` and `Comment*` broadcasts are produced and never consumed; live sync is a refetch today |
| Typing indicators are backend-only | Hub methods exist; the client neither invokes nor subscribes |
| `ReminderOverview` unused | The component is written; no page imports it — reminders are set in the item dialog |
| One organization per user | `OrganizationId` is a claim on the account; no workspace switcher |
| No tests or CI | No test project and no pipeline. The safety net today is `npm run build` (runs `tsc -b`), `npm run lint`, a clean `dotnet build`, and exercising the change by hand against the API |
| Migrations and uploads uncommitted | Local state by design; a fresh clone regenerates its migration |
| `docs/` is stale | Still describes the v0.7.0 backend-only state (frontend "in progress", attachments/labels/checklists "planned") |
| No Docker, caching, jobs, email | Platform work not started |

---

## Documentation

This README is the current state; treat `docs/` as background reading until refreshed.

| Document | Subject |
| --- | --- |
| [docs/README.md](docs/README.md) | index and reading order |
| [docs/Architecture.md](docs/Architecture.md) | layers, principles, structure |
| [docs/Backend.md](docs/Backend.md) | projects, layers, request flow |
| [docs/Database.md](docs/Database.md) | entities, relationships, migrations |
| [docs/API.md](docs/API.md) | conventions, authentication, responses, errors |
| [docs/Realtime.md](docs/Realtime.md) | hub, events, notifications, presence |
| [docs/Development.md](docs/Development.md) | setup, conventions, workflow |
| [docs/Roadmap.md](docs/Roadmap.md) · [docs/Changelog.md](docs/Changelog.md) | milestones and release history |
| [docs/Diagrams/](docs/Diagrams) | architecture, authentication, aggregates (draw.io) |
| [LICENSE](LICENSE) | the MIT terms the project is released under |

---

## Contributing

1. Branch from `main` as `feat/…`, `fix/…` or `refactor/…`; one concern per branch.
2. Commit subjects follow the history: `Feat: Theme`, `Refactor: Dashboard`,
   `feat: complete reminder module`.
3. Keep the layer rules: no logic in controllers, shared invariants in a `*Rules` class, a new
   operation as a new verb folder with its command, validator and response.
4. On the client, reuse or add tokens rather than literal colours, keep the change inside the
   feature that owns it, and let the shared primitives do the styling.
5. Before opening a pull request: `npm run build`, `npm run lint`, `dotnet build`, and exercise
   the change against the API — realtime behaviour with two browsers.
6. Update `docs/` and this README when a feature, endpoint or configuration key changes.

---

## License

Released under the [MIT License](LICENSE) — Copyright (c) 2026 Afroz.

You may use, copy, modify, merge, publish, distribute, sublicense and sell copies
of the software, provided the copyright notice and the permission notice travel
with every copy or substantial portion of it. The software comes with no
warranty of any kind.

Third-party terms are unaffected. Everything the client installs is MIT except
`class-variance-authority` (Apache-2.0), `lucide-react` (ISC) and the Geist font
(SIL Open Font License 1.1) — read from each package's own manifest. The NuGet
packages the API installs each carry their own permissive terms; check the
package page if you need the exact one.
