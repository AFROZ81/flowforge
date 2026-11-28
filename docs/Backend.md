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
- JWT access tokens are issued at login, refresh, organization switch, workspace creation, and invitation acceptance.
- Account-only tokens carry identity claims; organization tokens add `organizationId`, `membershipId`, `tokenVersion`, and the current role.
- `CurrentUserService` reconstructs an `AuthenticatedUser` from claims, while `OrganizationSessionValidator` reloads authoritative membership, organization state, role, owner state, and token version from the database.
- Stale organization claims are stripped without rejecting account authentication, allowing refresh to recover.
- Workspace creation is authenticated and atomic; the public organization-options route has been removed.
- Invitation validation is anonymous; invitation acceptance requires an authenticated account and a matching normalized email.

## Invitation registration

`POST /api/Auth/register` supports two modes:

- **Normal registration:** accepts account fields only and creates no membership. It returns an account-only session.
- **Invitation registration:** requires `invitationToken`; validates the token, expiry, acceptance state, and email match; creates the account; accepts the invitation through MediatR; and returns an organization session.

For relational databases, invitation registration and acceptance share a transaction so a failed acceptance does not leave a partial account.

## Organization lifecycle

`OrganizationUser` uses a surrogate `Id`, `IsOwner`, `TokenVersion`, and a rowversion concurrency token. Filtered unique indexes allow one active membership per user/organization and one active Owner per organization. Role changes, removal, leave, rejoin, ownership transfer, archive/restore, and delete invalidate affected sessions.

Owners are Admin members with `IsOwner = true`. Owners cannot be demoted, removed, or leave without transferring ownership. Demotion, removal, and leave preserve at least one active Admin. Archive freezes organization access and revokes pending invitations; restore is Owner-only; terminal delete requires an archived organization and exact slug confirmation. Lifecycle mutations are transactional, audited, concurrency-protected, and emit membership events.

## Infrastructure services

| Service | Implementation | Notes |
| --- | --- | --- |
| `IAuthService` | `AuthService` | Registration, login, refresh. |
| `ICurrentUserService` | `CurrentUserService` | Claims-to-user context. |
| `IUserLookupService` | `UserLookupService` | Identity lookups for handlers. |
| `IOrganizationSessionService` | `OrganizationSessionService` | Issues account or organization sessions from active DB memberships. |
| `OrganizationSessionValidator` | `OrganizationSessionValidator` | Validates membership, organization state, role, owner state, and token version per request. |
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
- The reminder job intentionally scans due reminders every minute, persists and broadcasts in-app notifications, emails the assignee through `IEmailService`, and uses `ReminderNotifiedAt` for once-only delivery; the overdue job still runs on every check rather than its commented cron schedule.
- Export processing is not invoked by the runner.
- Excel/PDF export generation is placeholder output; CSV generation is implemented.

Treat this as demo scheduling, not a production cron system.

## Testing

From the repository root:

```powershell
dotnet test backend/src/FlowForge/FlowForge.Tests/FlowForge.Tests.csproj
```

The current suite contains 72 tests covering account-first registration/login/refresh, stale-session rejection, organization policies and isolation, membership invariants, invitation email binding and rejoin, ownership transfer, archive/restore/delete, migration/model invariants, exception mapping, SMTP behavior, invitation creation and rate limits, RBAC enforcement, presence, reminders, soft-delete retention/restoration, global query filters, and relational transaction rollback.
