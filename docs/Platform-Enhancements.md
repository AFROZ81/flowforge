# Platform Enhancements

This guide covers the capabilities added after the original backend release. For everyday usage, see the root [Readme.md](../Readme.md); for local AI, see [AI-Drafting.md](AI-Drafting.md).

## 1. Multi-organization RBAC

Users belong to organizations through `OrganizationUser`, which stores a per-organization role.

| Role | Value | Capabilities |
| --- | --- | --- |
| Admin | 1 | Member/settings management, invitations, audit logs, diagnostics. |
| Member | 2 | Normal project and work-item operations. |
| Viewer | 3 | Read-only access. |

JWTs include `organizationId`, `orgIds`, and the active role. `POST /api/Organizations/switch` validates membership and returns a token for the selected workspace. The client shows an organization switcher when more than one membership exists.

## 2. Invitations and member management

### Invitation lifecycle

- Admins create invitations by email and role.
- Active duplicates are blocked case-insensitively after trimming whitespace.
- Existing members are rejected.
- Creation is limited to 10 invitations per admin per hour.
- Invitations expire after seven days.
- Resend rotates the token, extends expiry, and enforces a five-minute cooldown.
- Revoke soft-deletes the invitation.
- Validation is anonymous and does not accept the invitation.
- Acceptance creates the membership with the invited role and returns a JWT.

### Register and accept

The invitation page supports two paths:

- An authenticated user accepts directly.
- A signed-out user creates an account and accepts in one operation.

Invitation registration sends `invitationToken` to `POST /api/Auth/register`. The backend validates token state, expiry, and email match before accepting. On SQL Server, account creation and acceptance run in one transaction.

### Delivery tracking

Each invitation records:

- `EmailStatus`: `NotSent`, `Sent`, or `Failed`
- `EmailAttempts`
- `LastEmailSendAt`
- `EmailSentAt`
- `EmailError`

SMTP failure does not remove the invitation. The UI shows the failure and offers Resend. Admins can test SMTP through `GET /api/Invitations/smtp-diagnostics`.

### Member UI

The Members settings page provides:

- roster search, role filter, online-only filter, and sorting
- live presence and workload summaries
- role changes and member removal
- pending-invitation list with resend and revoke
- duplicate-invitation feedback before sending
- a visible retry state when the invitation list cannot load

## 3. Email configuration

`SmtpEmailService` reads environment variables first, then `Email:*` configuration. It supports TLS/STARTTLS, bounded timeouts, retries, sanitized logging, and invitation templates.

Invitation links use:

- Development: `http://localhost:5173`
- Production: `https://flowforge-app.runasp.net`
- Override: `Frontend__BaseUrl`

## 4. Audit logs

`AuditLog` stores typed entries with actor, target, action, description, old/new values, metadata, sensitivity, IP, and user agent.

- `GET /api/AuditLogs` supports filtering, search, sorting, and pagination.
- `GET /api/AuditLogs/statistics` provides totals and breakdowns.
- The Audit Logs page is admin-only and includes expandable details.
- `IAuditLogService` writes entries explicitly from handlers/services.

Coverage is not universal yet; do not assume every domain action currently emits an audit record.

## 5. Webhooks

`WebhookSubscription` stores endpoint URL, optional secret, event types, active state, and delivery health.

- CRUD endpoints exist under `/api/Webhooks`.
- Test delivery sends an HMAC-signed `webhook.test` payload.
- `WebhookDispatcher` is an in-memory hosted queue with retry/failure counters and disables a subscription after 10 consecutive failures.
- Automatic domain-event publishing is not connected yet, so test delivery is the currently complete path.
- Update/delete/test routes should receive stricter organization-scope authorization before broad production exposure.

## 6. Domain events

The Domain project defines event contracts such as `WorkItemCreatedEvent`, `WorkItemMovedEvent`, `ProjectArchivedEvent`, and comment events. `ApplicationDbContext` dispatches recorded events after save.

Current boundary:

- `IDomainEventDispatcher` and `DomainEventDispatcher` exist.
- No concrete domain-event handlers are registered.
- Audit logging and webhook publishing are not automatically driven by these events yet.

## 7. Background jobs

The solution includes:

- `ScheduledJobRunner`
- `ReminderJob`
- `OverdueDetectionJob`
- `ExportJobProcessor`
- `WebhookDispatcher`

Current limitations:

- The scheduler checks every minute but `IsTimeToRun` always returns true.
- Reminder and overdue jobs run every check, not on their commented cron schedules.
- Export processing is commented out in the runner.
- Excel/PDF export output is placeholder text; CSV generation is implemented.
- In-memory state is lost on process recycle.

## 8. File storage

The active `IFileStorageProvider` and attachment storage service use local disk. Files are stored under `FlowForge.API/Storage/Attachments`.

`AzureBlobStorageService` is present as an alternative but is not registered by default. Its presigned-URL credential handling is placeholder code and must be completed before use.

## 9. Frontend usability and platform

| Area | Current capability |
| --- | --- |
| Command palette | Quick navigation and actions with keyboard support. |
| Board keyboard navigation | Card selection and movement hooks. |
| Accessibility | Shared announcer, live-region toasts, focus-visible styling. |
| Organization switcher | Multi-workspace token switching. |
| Notifications | Dedicated inbox, unread state, read/unread/delete actions. |
| Audit logs | Admin-only filterable timeline. |
| Settings | General, Members, and Labels sections with URL-addressable tabs. |
| AI drafting | On-device model selection and heuristic fallback. |
| PWA | Branded FlowForge icons, offline indicator, manifest, service worker, API/image caching; no custom install prompt. |
| Motion | Shared animation presets. |
| Theming | Light, parchment, dark, onyx, and system preference. |
| Storybook | Stories for Button, Card, and Input primitives. |

## 10. Testing and tooling

- Backend: 21 xUnit tests in `FlowForge.Tests`.
- Frontend: Vitest unit project for AI and utility behavior.
- Storybook browser-test project is configured.
- `npm run build`, `npm run lint`, and `dotnet test` are the main local verification commands.
- CI is not configured yet.

## Data model additions

```text
Organization
├── OrganizationUser        membership + role
├── OrganizationInvitation   token, expiry, acceptance, delivery status
├── AuditLog                 typed audit trail
└── WebhookSubscription      outbound endpoint configuration
```

Migrations are committed under both `FlowForge.Infrastructure/Migrations` and `FlowForge.Infrastructure/Infrastructure/Persistence/Migrations`.

## Related documents

- [API.md](API.md) — endpoint and invitation details.
- [Database.md](Database.md) — schema and migrations.
- [Deployment.md](Deployment.md) — production configuration.
- [Realtime.md](Realtime.md) — SignalR behavior and gaps.
- [Changelog.md](Changelog.md) — release history.
