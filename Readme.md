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
| **Run on** | Production `https://flowforge-app.runasp.net` · local API `http://localhost:5045` · client `http://localhost:5173` |
| **Surface** | 22 controllers · multi-organization RBAC · invitations with email delivery tracking · audit logs · webhooks · PWA · on-device AI drafting |
| **License** | MIT — see [LICENSE](LICENSE) |
| **Not there yet** | CI, Docker, large-scale load testing — see [Known gaps](#known-gaps) |

**Contents** · [Features](#features) · [Stack](#stack) · [Architecture](#architecture) ·
[Domain](#domain-model) · [Setup](#setup) · [Using the app](#using-the-app) ·
[Demo data](#demo-data) · [API](#api-overview) · [Realtime](#realtime) ·
[Configuration](#configuration) · [Commands](#commands) · [Troubleshooting](#troubleshooting) ·
[Gaps](#known-gaps) · [Docs](#documentation) · [Contributing](#contributing)

---

## Features

| Area | What works |
| --- | --- |
| Authentication | JWT access tokens (8 h default), ASP.NET Core Identity, refresh, and multi-organization switching |
| Roles (RBAC) | Admin / Member / Viewer roles per organization, enforced with `RequireAdmin` / `RequireMember` / `RequireViewer` policies |
| Invitations | Email invitations with delivery status, retry, resend, revoke, validate, accept, and register-and-accept; member role management |
| Structure | Organizations, projects, boards, columns, work items |
| Work items | Create, rename, edit, assign, move, complete, block, activate, archive, restore, Admin-only soft delete |
| Item detail | Checklists, labels, attachments, comments, watchers, reminder, activity history |
| Boards | Five default columns, Admin-only create/edit/archive/delete, HTML5 drag-and-drop ordering, live board presence, keyboard-first navigation |
| AI drafting | On-device AI turns a prompt into a title + two-sentence description (local, free, no API keys) — see [docs/AI-Drafting.md](docs/AI-Drafting.md) |
| Dashboard | One composed snapshot: own workload, status mix, priority mix, project health, team workload, throughput, recent activity |
| Reports | Work items, projects, team, labels, productivity + XLSX export |
| Audit & webhooks | Typed audit trail (filterable) and outbound webhook subscriptions with HMAC-signed test delivery; automatic event publishing is not wired yet |
| Realtime | Notification inbox, unread count, online presence, board roster — over one hub |
| Client | Sidebar + mobile drawer shell, command palette (⌘K), four themes plus system, PWA (installable, offline indicator), accessible toasts |

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
| Client extras | framer-motion 12, sonner toasts, lucide-react icons, next-themes, Geist font, Vite PWA, Transformers.js |
| Email & storage | SMTP invitation delivery with status tracking; local attachment storage by default, Azure Blob implementation available but not active |
| Testing | xUnit backend suite (43 tests), Vitest unit project (87 tests), Storybook stories and browser-test configuration |

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
  the interfaces it needs (`IApplicationDbContext`, `IAuthService`, `IEmailService`,
  `IAuditLogService`, `IWebhookService`, storage and realtime contracts); Infrastructure
  implements them; the API composes and holds no logic.
- **Request flow.** Action → authentication/authorization → `Send()` →
  `ValidationBehavior` → feature handler → EF Core → post-save domain-event dispatch →
  result. `ExceptionMiddleware` maps validation and domain exceptions to 4xx responses;
  unexpected failures return a generic 500 with a trace id.
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
├── OrganizationUser        membership + UserRole (Admin · Member · Viewer)
├── OrganizationInvitation   email · token · expiry · acceptance · SMTP delivery status
├── AuditLog                 typed audit trail (AuditLogType)
├── WebhookSubscription      outbound event subscriptions (WebhookEventType)
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
`DueDate` plus `ReminderDate` on the item. Users may belong to multiple organizations; the
JWT's `organizationId` selects the active workspace and `orgIds` lists all memberships.

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

### 2. Apply migrations

Migrations are committed under `FlowForge.Infrastructure/Migrations` and
`FlowForge.Infrastructure/Infrastructure/Persistence/Migrations`. A fresh clone can create
or update the database directly:

```powershell
dotnet tool install --global dotnet-ef
cd backend/src/FlowForge
dotnet ef database update --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef migrations list --project FlowForge.Infrastructure --startup-project FlowForge.API
```

This creates the application and Identity tables and applies the RBAC, invitation, audit,
webhook, seed, and invitation-email delivery migrations. Add a new migration only after a
model change; do not recreate `InitialCreate` on an existing clone.

### 3. Signing key

`Jwt:Key` in `appsettings.json` is a placeholder. Replace it before anything leaves your
machine:

```powershell
cd backend/src/FlowForge/FlowForge.API
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<at least 32 random characters>"
```

`Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryInMinutes`,
`ConnectionStrings__DefaultConnection`, and `Frontend__BaseUrl` work as environment
variables too. SMTP settings use `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (or
`SMTP_KEY`), `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `SMTP_TIMEOUT_SECONDS`, and
`SMTP_ENABLE_SSL`.

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

### 6. First account — and the workspace it needs

Registration requires an `organizationId`, so **a brand-new database has nothing to
sign up into**. The form resolves that itself: when the workspace list comes back
empty it shows a **Workspace name** field in place of the dropdown, creates that
workspace, and registers you inside it. `GET /api/Organizations/options` and
`POST /api/Organizations` are both anonymous, which is what lets a signed-out page
chain the two.

Choose **Create account** on http://localhost:5173 and fill it in. Identity requires
8+ characters with a digit, an uppercase and a lowercase letter; emails are unique.
Once the workspace exists the field is a dropdown again for everyone after you, and
you land on the dashboard — add a project, then a board, and the five default
columns are created for you.

To make the workspace by hand instead — a headless box, or you would rather use the
API — `POST /api/Organizations` takes no token:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5045/api/Organizations `
  -ContentType "application/json" `
  -Body '{"name":"My Company","slug":"my-company","description":null}'
```

---

## Using the app

| Screen | What you do there |
| --- | --- |
| `/` landing | Signed-out intro; theme switch, links to sign in and register |
| `/login` | One card, two faces. Invitation links open the original registration face with a validated invite token. The session token is kept in `sessionStorage` under `flowforge-auth` — survives a refresh, not a browser restart |
| `/accept-invitation` | Legacy invitation links; signed-out visitors are redirected to the original registration face with the invite token |
| **Dashboard** | Everything from **one** `GET /api/Dashboard`, timestamped and refreshable; a failed refresh keeps the last numbers with a warning. Panels: needs attention and my open work · status mix and priority mix · project health and team workload · throughput and recently updated |
| **Projects** | Cards with an Active / Archived badge, colour, icon, board counts, recent activity. Create asks for name (unique per organization), key (derived, editable, unique per organization at the database level), colour, icon, description; edit and archive available, and archiving offers undo |
| **Board** | The working surface — see below. Everyone viewing it shows in its presence strip |
| Work item dialog | Fields and assignee, lifecycle actions, checklist, attachments, comments, watchers, reminder, activity history |
| **Reports** | Five URL-addressable views — work items, projects, team, labels, productivity — each a figure strip over a table, plus XLSX export |
| **Notifications** | Dedicated inbox with unread state, read/unread, mark-all-read, refresh, and delete |
| **Audit logs** | Admin-only, filterable timeline with statistics and expandable record details |
| **Settings** | General (theme, account/workspace/session, AI), Members (roster, roles, invitations), and Labels |

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

Controllers (22); Swagger UI is the complete list.

| Controller | Covers |
| --- | --- |
| `Auth` | register (normal or invitation), login, refresh |
| `Organizations` | public workspace options, create; switch active workspace; members (list, change role, remove) |
| `Invitations` | create, list, resend, revoke, validate, accept, SMTP diagnostics |
| `AuditLogs` | filterable, paginated audit trail and statistics (Admin) |
| `Webhooks` | CRUD subscriptions + test delivery |
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
- Response shapes are intentionally mixed: many handlers return bare DTOs/lists, Auth uses
  `ApiResponse<T>`, audit logs use paged results, and exports/downloads return files. Client
  helpers normalize the known envelope and bare-payload cases.
- Status codes come from the exception type: validation/bad request 400, unauthorized 401,
  forbidden 403, not found 404, conflict 409, rate limit 429, anything else 500 with a generic
  message and the correlation id in `traceId`. Validation failures include an `errors` array.
- `[Authorize]` per controller, with role policies (`RequireAdmin`, `RequireMember`,
  `RequireViewer`) on sensitive actions. Register, login, organization options/create, and
  invitation validate/accept are anonymous; invitation acceptance is secured by its token.
- `X-Correlation-ID` is honoured inbound, always emitted, assigned to
  `HttpContext.TraceIdentifier` and pushed into the Serilog context.
- Rate limits: 600/min per authenticated user, 30/min per anonymous IP, 5 logins/min per IP,
  and 5 organization creations/hour per IP; rejections are 429 with `Retry-After: 60`.
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
| `WorkItemMoved` / `WorkItemDeleted` | `board:{id}` | drag · soft delete |
| `ProjectDeleted` | `organization:{id}` | soft project delete |
| `BoardDeleted` | `board:{id}` | soft board delete |
| `CommentAdded` / `Updated` / `Deleted` | `board:{id}` | comment handlers |
| `TypingStarted` / `TypingStopped` | `board:{id}` except sender | `StartTyping` / `StopTyping` — no caller |

The client listens through one shared `PresenceContext` with automatic reconnect and a
WebSockets → SSE → Long Polling fallback chain. Work-item/comment broadcasts are converted to
window events; `BoardRealtimeListener` contains invalidation logic but is not mounted yet, so
live board refetch is not fully wired. Typing events are subscribed but not sent by the UI.
`RealtimeEvents.BoardUpdated` is never sent and `NotifyOrganizationAsync` has no caller.

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
| `Email:*` / `SMTP_*` | config / environment | invitation delivery and diagnostics |
| `Frontend:BaseUrl` | `appsettings*.json` | Development uses localhost; Production uses `https://flowforge-app.runasp.net`; override with `Frontend__BaseUrl` |
| `VITE_API_URL` | `frontend/.env` | local API URL; production uses `/api` |
| `flowforge-auth` | `sessionStorage` | token, expiry, decoded user |
| `flowforge.theme` | `localStorage` | `light` · `parchment` · `dark` · `onyx` · `system` |
| `FLOWFORGE_API` | environment | overrides the seed script's target |

---

## Commands

From the repository root, PowerShell.

```powershell
# API
dotnet build backend/src/FlowForge/FlowForge.slnx
dotnet test backend/src/FlowForge/FlowForge.Tests/FlowForge.Tests.csproj
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
npx vitest run --project unit   # frontend unit tests (AI feature et al.)
npm run storybook              # shared-component workbench

# Diagrams — the .drawio files are hand-written XML, so geometry is checked
node tools/drawio-fit.mjs   # reports labels that overflow their shape, and boxes or
                            # connectors that land on top of each other
```

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Sign-up asks for a workspace name instead of a dropdown | Normal on a fresh database — nothing exists to choose yet, so the form creates the workspace for you |
| `database update` applies nothing | Check `dotnet ef migrations list`; migrations are committed and should appear before the update |
| CORS errors in the browser | Development allows localhost ports 5173, 5174, and 5175; production is same-origin |
| "Failed to determine the https port for redirect" | Harmless on the `http` profile; use `--launch-profile https` for TLS |
| 401 on requests that worked earlier | Token expired, or clock skew — `ClockSkew` is zero. Sign in again |
| 429 while testing | Real limits: 5 logins/min per IP, 30 anonymous/min. Wait 60 s or sign in |
| SignalR won't connect | Needs `?access_token=…`; the hub URL is the API origin without `/api` |
| Invitation returns 500 | Check the email-delivery migration is applied and inspect `Logs/log-*.txt` for SQL translation/schema errors |
| Invitation email failed | The invitation still exists; configure SMTP and use Resend |
| Invitation link points to localhost | Run with the expected environment or set `Frontend__BaseUrl`; resend old invitations |
| Dashboard looks stale | It is one snapshot; use the refresh in the page header |

---

## Known gaps

Recorded so nobody searches the code for a thing that does not exist.

| Gap | Detail |
| --- | --- |
| Demo scheduler | `ScheduledJobRunner` checks every minute but currently runs reminder/overdue jobs every check; export processing is not invoked |
| Automatic webhooks | Subscription CRUD, queue, and test delivery exist; domain-event handlers/publishers are not connected |
| Azure storage | Implementation exists but is not registered; presigned-URL credentials are placeholder code |
| Board realtime invalidation | SignalR events reach the client, but `BoardRealtimeListener` is not mounted end to end |
| Anonymous organization create | Anyone reaching the API can `POST /api/Organizations`; first-run sign-up depends on it |
| Search is API-only | `GET /api/Search/workitems` exists; the command palette searches pages/actions rather than work items |
| Typing indicators are backend-only | The client subscribes, but no UI invokes `StartTyping` / `StopTyping` |
| `ReminderOverview` unused | The component is written; no page imports it — reminders are set in the item dialog |
| CI | Backend (43 tests) and frontend unit suites (87 tests) exist, but no CI pipeline is configured |
| AI cold start | First draft downloads the model (one-time, can take minutes); the 20 s deadline covers generation only — see [docs/AI-Drafting.md](docs/AI-Drafting.md) |
| No Docker or Redis | Not started. Hosting is one MonsterASP.NET site serving API and SPA from the same origin — see [docs/Deployment.md](docs/Deployment.md) |

---

## Documentation

This README and `docs/` describe the v0.8.0 implementation. Swagger remains the executable endpoint reference.

| Document | Subject |
| --- | --- |
| [docs/README.md](docs/README.md) | index and reading order |
| [docs/Architecture.md](docs/Architecture.md) | layers, principles, structure |
| [docs/Backend.md](docs/Backend.md) | projects, layers, request flow |
| [docs/Database.md](docs/Database.md) | entities, relationships, migrations |
| [docs/API.md](docs/API.md) | conventions, authentication, responses, errors |
| [docs/Realtime.md](docs/Realtime.md) | hub, events, notifications, presence |
| [docs/Platform-Enhancements.md](docs/Platform-Enhancements.md) | RBAC, invitations, audit logs, webhooks, domain events, jobs, storage, frontend UX |
| [docs/AI-Drafting.md](docs/AI-Drafting.md) | local on-device AI drafting: models, settings, deadline, fallback, tests |
| [docs/Development.md](docs/Development.md) | setup, conventions, workflow |
| [docs/Deployment.md](docs/Deployment.md) | going live at $0: one MonsterASP.NET free site serving API and SPA from the same origin |
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
5. Before opening a pull request: `npm run build`, `npm run lint`, `dotnet build`,
   `dotnet test`, the frontend unit tests, and an API exercise — realtime behaviour with two
   browsers when affected.
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
