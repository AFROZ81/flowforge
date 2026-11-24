# Development

## Prerequisites

- .NET SDK 10
- Node.js 22 LTS or newer
- SQL Server instance, LocalDB, or Express
- Git
- `dotnet-ef` for migration commands
- `sqlcmd` only for the optional demo-data backdate script

## Repository structure

```text
FlowForge
├── backend/src/FlowForge
│   ├── FlowForge.API
│   ├── FlowForge.Application
│   ├── FlowForge.Domain
│   ├── FlowForge.Infrastructure
│   ├── FlowForge.Tests
│   └── FlowForge.slnx
├── frontend
├── docs
└── tools
```

## Backend setup

1. Configure SQL Server in user secrets or environment variables.
2. Apply the committed migrations.
3. Set a strong JWT signing key.
4. Run the API with the `http` launch profile.

```powershell
cd backend/src/FlowForge/FlowForge.API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=<instance>;Database=FlowForgeDb;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:Key" "<at least 32 random characters>"

cd ../..
dotnet ef database update --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet run --project FlowForge.API --launch-profile http
```

Swagger: `http://localhost:5045/swagger`
Health: `http://localhost:5045/health`

## Frontend setup

Create `frontend/.env`:

```ini
VITE_API_URL=http://localhost:5045/api
```

Then:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment-specific invitation links

`appsettings.Development.json` overrides the frontend URL to localhost. `appsettings.json` defaults to the production site.

```text
Development → http://localhost:5173
Production  → https://flowforge-app.runasp.net
Override    → Frontend__BaseUrl
```

## Email configuration

SMTP settings fall back to `Email:*` in configuration. Environment variables take precedence:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS          (or SMTP_KEY)
SMTP_FROM_EMAIL
SMTP_FROM_NAME
SMTP_TIMEOUT_SECONDS
SMTP_ENABLE_SSL
```

Without SMTP configuration, invitations are still persisted with `EmailStatus = Failed` and can be resent after configuration is fixed. Admins can check connectivity at `GET /api/Invitations/smtp-diagnostics`.

## Database workflow

Migrations are committed. After changing the model:

```powershell
cd backend/src/FlowForge
dotnet ef migrations add <Name> --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef database update --project FlowForge.Infrastructure --startup-project FlowForge.API
```

Do not hand-edit generated designer files or the model snapshot.

## Verification commands

```powershell
# Backend
dotnet build backend/src/FlowForge/FlowForge.slnx
dotnet test backend/src/FlowForge/FlowForge.Tests/FlowForge.Tests.csproj

# Frontend
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend exec -- vitest run --project unit --root frontend
npm --prefix frontend run storybook
```

The backend suite currently has 21 tests. Frontend unit tests cover the local AI feature and supporting utilities.

## Coding conventions

- Keep controllers thin.
- Put each operation in a feature/verb folder.
- Validate requests with FluentValidation.
- Use organization scope from claims, not untrusted route data.
- Keep infrastructure behind Application contracts.
- Use the shared Axios client on the client; do not use relative `fetch` calls for API endpoints.
- Reuse design tokens and shared UI primitives.
- Update docs when endpoints, configuration, schema, or behavior changes.

## Pull-request checklist

- Solution and frontend build successfully.
- Backend and frontend tests pass.
- New migrations are included and applied locally.
- Invitation/email flows are exercised when affected.
- Realtime behavior is checked with two browsers when affected.
- Relevant docs and the root README are updated.
