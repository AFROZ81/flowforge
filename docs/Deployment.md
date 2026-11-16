# Deployment

FlowForge goes live as **one same-origin site on MonsterASP.NET's free plan**: the ASP.NET
Core API, the SignalR hub and the React bundle all served from the same IIS website, with the
MSSQL database they provide. Zero cost, no credit card, no Docker, no CI pipeline.

Facts below were checked against [their .NET 10 hosting page](https://www.monsterasp.net/.NET10-Hosting/)
and against this codebase on 2026-11-06. Provider limits move — re-read the page before you
repeat them.

---

## What the free plan gives you

| | Free plan |
| --- | --- |
| Runtime | .NET 8, 9, 10 and 11 available; IIS **InProcess** recommended (OutOfProcess works with the DLL runtime, not a custom EXE runtime) |
| Websites | **1** — which is the reason the SPA lives inside the API |
| Storage | 5 GB, real disk that **persists** across restarts |
| RAM | 256 MB dedicated per site; reaching the limit **recycles the application pool** |
| Database | 1 database, 1 GB — MSSQL 2025 |
| Domain + TLS | free `*.runasp.net` / `*.tryasp.net`, Let's Encrypt auto-renewal, HTTP/3, TLS 1.3 |
| Deploy | GitHub (they run `dotnet publish` on their server), Visual Studio Web Deploy from a downloaded publish profile, or FTP/SFTP |
| Other | daily backups, Germany or Salt Lake City, per-site environment variables applied on the next start, x86 default with an x64 switch |

---

## Shape

```text
browser ──► one IIS website  (https://<yoursite>.runasp.net)
              │
              ├── /            React bundle from wwwroot (index.html + assets)
              ├── /api/…       controllers
              ├── /hubs/…      NotificationHub over WebSocket
              └── /health      health check, includes the SQL probe
                     │
                     ├── MSSQL 2025 (1 GB, their server)
                     └── Storage/Attachments/<workItemId>/<guid><ext>  (persistent disk)
```

Everything is same-origin, so there is no CORS decision to make, no second hostname, no
second certificate, and no build-time API URL that can point somewhere wrong.

---

## Changes the code needs first

Each of these exists today and will bite in production, not locally.

### 1. Serve the SPA from the API

`Program.cs` already calls `UseDefaultFiles()` and `UseStaticFiles()`, and `wwwroot/` already
holds `signalr-test.html`, so the plumbing is half done. Three additions:

**a. Relative API URL.** Create `frontend/.env.production`:

```ini
VITE_API_URL=/api
```

Verified safe: every request goes through the axios instance in `src/lib/api.ts`, attachment
and report downloads use `responseType: "blob"`, and nothing builds an absolute URL. The hub
URL is derived by stripping the trailing `/api`, so it becomes `/hubs/notifications`.

**b. Build the bundle into the API.** `npm run build` in `frontend`, then copy
`frontend/dist/*` into `backend/src/FlowForge/FlowForge.API/wwwroot/` so that
`wwwroot/index.html` and `wwwroot/assets/*` exist. Their GitHub builder runs `dotnet publish`,
not `npm`, so the bundle has to be there before the API is built — either commit it, or upload
it with Web Deploy / FTP, which treats `wwwroot` like any other folder.

**c. Give the client-side routes back.** In `Program.cs`, **after** `MapControllers()`,
`MapHub()` and `MapHealthChecks()`:

```csharp
// Deep links such as /reports?report=labels arrive as a document request; the router owns
// them, not the file system. Registered last so /api and /hubs still match first.
app.MapFallbackToFile("index.html");
```

and make the existing root redirect Development-only, or it swallows the SPA's own entry page:

```csharp
if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/swagger"));
```

### 2. CORS stays a local concern

The policy allows exactly `http://localhost:5173`, which is what the Vite dev server needs and
nothing else requires. Leave it. Do not add the production origin — the site is same-origin,
and widening it is how a wildcard ends up in a config file.

### 3. Commit the migrations

`.gitignore` excludes `FlowForge.Infrastructure/Migrations`, which is a fine local convention
until a deploy depends on it: a checkout then has no migrations, so nothing creates the schema.
Drop that rule and commit them, then create the database either by letting the app migrate on
first start or by running, from your machine:

```powershell
cd backend/src/FlowForge
dotnet ef database update --project FlowForge.Infrastructure --startup-project FlowForge.API
```

Shared SQL servers usually restrict source IPs — add yours in the control panel first.

### 4. Secrets and the connection string

`appsettings.json` still ships a placeholder `Jwt:Key` and a Windows-authenticated local
connection string. Set these as per-site environment variables in the panel (they apply on the
next start):

| Variable | |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Jwt__Key` | 32+ random characters — HMAC-SHA256 rejects shorter keys |
| `Jwt__Issuer` · `Jwt__Audience` | `FlowForgeAPI` · `FlowForgeClient` |
| `ConnectionStrings__DefaultConnection` | SQL authentication, `Encrypt=True;TrustServerCertificate=False` |

### 5. The WebSocket pin

`PresenceContext.tsx` connects with:

```ts
transport: HttpTransportType.WebSockets,
skipNegotiation: true,
```

WebSockets are **pinned with no fallback**, so if the WebSocket protocol feature is not enabled
on their IIS, live notifications and presence never connect — there is no quiet degradation to
long polling. Confirm with support (they market Blazor Server, which needs WebSockets, but ask
rather than assume), or make the app resilient on any Windows host:

```ts
transport:
    HttpTransportType.WebSockets |
    HttpTransportType.ServerSentEvents |
    HttpTransportType.LongPolling,
```

`skipNegotiation: true` is an Azure SignalR Service setting; against a plain `NotificationHub`
it does nothing. Worth removing while you are in that call.

### 6. Small ones

- Two `console.log` calls announce the API URL on every page load (`src/lib/api.ts`,
  `PresenceContext.tsx`). Drop them before a public release.
- The Serilog file sink writing to `Logs/` is **fine here** — shared-hosting disk persists,
  and `retainedFileCountLimit: 30` bounds it. This is one place where shared hosting is
  simpler than containers.
- Choose **InProcess** in the panel. IIS then terminates TLS and passes the real client
  connection through, so `UseHttpsRedirection` behaves and the rate limiter keeps
  partitioning per visitor IP instead of everyone sharing one bucket.
- Uploads are capped at 10 MB by `UploadAttachmentValidator`, inside IIS's 30 MB default. If a
  host lowers `maxAllowedContentLength`, raise it in the generated `web.config`.

---

## Deploy

1. **Create the free account and the site.** Note the subdomain, e.g.
   `https://flowforge.runasp.net`. Pick Germany or Salt Lake City, whichever is nearer your
   users.
2. **Create the MSSQL database** from the panel and note the server address, database name,
   SQL login and password. Add your IP if migrations are applied from your machine.
3. **Make the six changes above**, then `dotnet build` the solution and `npm run build` the
   client, and copy the bundle into `wwwroot`.
4. **Apply the schema** — `dotnet ef database update`, or an idempotent
   `dotnet ef migrations script` run through their tooling.
5. **Set the environment variables** in the panel, including `Jwt__Key`.
6. **Publish.** Either connect the GitHub repository and choose *Build .NET app*, or download
   the publish profile and use Web Deploy from Visual Studio. `dotnet publish` generates the
   `web.config` the ASP.NET Core Module needs; nothing extra to write.
7. **Switch the site to x64** if the 256 MB allowance starts recycling the pool.

---

## Verify, in this order

1. `https://<yoursite>/` loads the SPA. Then **refresh while on `/reports`** — it must not 404.
   That is step 1c working.
2. `GET /health` → `Healthy`, which also proves the database answered.
3. Register the first account. With no organization in the database yet, the form shows a
   **Workspace name** field instead of a dropdown and creates the workspace for you — that is
   the bootstrap path, and it works here because `POST /api/Organizations` is anonymous. Then
   sign in.
4. **Open two browsers** and watch the presence strip fill. If it stays empty, the WebSocket
   pin is the cause — see section 5.
5. Upload a file, restart the site from the panel, download it again. It should survive; that
   persistence is the main reason to prefer this host over a container platform.
6. Sign out and in again from a fresh tab — the token lives in `sessionStorage`, so a new
   session means a new sign-in, by design.

---

## Limits, and what they mean here

| Limit | Consequence for FlowForge |
| --- | --- |
| **256 MB RAM** | EF Core + Identity + SignalR will brush it. Hitting the ceiling recycles the application pool, and because presence lives in two in-memory singletons (`OnlineUserTracker`, `BoardPresenceTracker`) a recycle wipes who-is-online and drops every open hub connection. `withAutomaticReconnect` recovers it; the first visitor after a quiet stretch pays the startup cost |
| **Idle pool recycle** | Shared hosting also recycles when nobody visits, with the same effect. Not a bug to fix — a property of the tier |
| **1 website, 1 database, 5 GB disk, 1 GB DB** | The single-site limit is what makes co-hosting the right shape rather than a compromise. Portfolio-scale data fits comfortably |
| **No scale-out** | One worker process, in-memory presence, no Redis or Azure SignalR backplane. Two instances would mean two contradictory views of who is online — this is a correctness limit, not a plan limit |
| **No background jobs** | Reminders are read on demand (`GET /api/Reminders/upcoming` and `/overdue`); nothing runs on a schedule, so there is nothing to lose from a recycled process |

---

## Updating the live site

Rebuild, copy the new `dist` into `wwwroot`, publish again — Web Deploy uploads only changed
files, and a pool recycle takes seconds. Environment variables persist across deploys; changing
one needs a restart. If a release changes the schema, apply the new migration before or with
the deploy, not after.

---

## Source

- [MonsterASP.NET — .NET 10 hosting](https://www.monsterasp.net/.NET10-Hosting/) — free plan
  limits, hosting model options, runtime versions, deployment paths, datacenter choices
