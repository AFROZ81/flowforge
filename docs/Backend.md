# Backend

## Solution structure

```text
backend/src/FlowForge
├── FlowForge.API
├── FlowForge.Application
├── FlowForge.Domain
├── FlowForge.Infrastructure
├── FlowForge.Tests
└── FlowForge.slnx
```

## Projects

| Project | Responsibility |
| --- | --- |
| `FlowForge.API` | Controllers, authentication/authorization, middleware, SignalR hub, Swagger, dependency composition. |
| `FlowForge.Application` | CQRS features, handlers, validators, DTOs, business rules, and service contracts. |
| `FlowForge.Domain` | Entities, enums, domain events, and domain behavior. |
| `FlowForge.Infrastructure` | EF Core, Identity, SMTP, local/blob storage implementations, webhook delivery, background jobs, and SignalR implementation. |
| `FlowForge.Tests` | xUnit regression tests. |

## Request lifecycle

1. The controller receives the request and establishes transport-level identity.
2. Authorization policies and organization claims are evaluated.
3. MediatR sends a command or query to its handler.
4. `ValidationBehavior` runs registered validators.
5. The handler enforces business rules and calls infrastructure contracts.
6. EF Core persists changes and stamps audit fields.
7. Recorded domain events are dispatched after save.
8. The controller returns the result.
9. `ExceptionMiddleware` converts known exceptions to consistent JSON errors.

## Authentication

- ASP.NET Core Identity stores users and password hashes.
- JWT access tokens are issued at login, refresh, organization switch, and invitation acceptance.
- `TokenService` includes the active organization, all organization ids, and active role.
- `CurrentUserService` reconstructs an `AuthenticatedUser` from claims.
- Anonymous first-run organization creation and public organization options remain available.
- Invitation validation and acceptance are anonymous; the token identifies the invitation.

## Invitation registration

`POST /api/Auth/register` supports two modes:

- **Normal registration:** requires `organizationId` and creates the initial membership.
- **Invitation registration:** requires `invitationToken`; validates the token, expiry, acceptance state, and email match; creates the account; accepts the invitation through MediatR; and returns an access token.

For relational databases, invitation registration and acceptance share a transaction so a failed acceptance does not leave a partial account.

## Infrastructure services

| Service | Implementation | Notes |
| --- | --- | --- |
| `IAuthService` | `AuthService` | Registration, login, refresh. |
| `ICurrentUserService` | `CurrentUserService` | Claims-to-user context. |
| `IUserLookupService` | `UserLookupService` | Identity lookups for handlers. |
| `IEmailService` | `SmtpEmailService` | Invitation delivery and SMTP diagnostics. |
| `IAuditLogService` | `AuditLogService` | Explicit audit entries, filters, pagination, statistics. |
| `IWebhookService` | `WebhookService` | Subscription CRUD and test delivery. |
| `IWebhookDispatcher` | `WebhookDispatcher` | In-memory queue and hosted delivery worker. |
| `IFileStorageProvider` | `LocalFileStorageService` | Active provider registration. |
| Attachment storage | attachment local storage service | Writes under `FlowForge.API/Storage/Attachments`. |

`AzureBlobStorageService` exists as an alternative provider but is not registered by default; its presigned-url credential handling is still placeholder code.

## Time handling

- Timestamps are stored in UTC.
- `AppTime` converts calendar calculations and user-facing dates to IST (`Asia/Kolkata`, UTC+05:30).
- Due-date validation, productivity grouping, overdue detection, reminders, audit statistics, exports, and invitation expiry dates use IST calendar days.
- The frontend treats timezone-less API timestamps as UTC and converts date/time inputs and display values to IST.

## Validation and errors

FluentValidation validators are discovered from the Application assembly. Known failures map as follows:

| Exception | Status |
| --- | --- |
| `BadRequestException` / `ValidationException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ConflictException` | 409 |
| Unhandled exception | 500 |

Validation responses include an `errors` array. Unexpected failures return a generic message and a `traceId`.

## Background work

`Program.cs` registers:

- `WebhookDispatcher` as a hosted queue worker.
- `ScheduledJobRunner` as a hosted service.
- `ReminderJob`, `OverdueDetectionJob`, and `ExportJobProcessor` as scoped jobs.

Current scheduler limitations:

- The runner checks every minute, but `IsTimeToRun` currently always returns true.
- Reminder and overdue jobs therefore run on every check rather than on their commented cron schedules.
- Export processing is not invoked by the runner.
- Excel/PDF export generation is placeholder output; CSV generation is implemented.

Treat this as demo scheduling, not a production cron system.

## Testing

From the repository root:

```powershell
dotnet test backend/src/FlowForge/FlowForge.Tests/FlowForge.Tests.csproj
```

The current suite contains 43 tests covering exception mapping, SMTP behavior, invitation creation, duplicate/rate-limit rules, invitation registration and acceptance, role assignment, link generation, RBAC policy enforcement, organization isolation, Admin-only archived project/board visibility, soft-delete retention/restoration, dependent records, global query filters, and relational transaction rollback.
