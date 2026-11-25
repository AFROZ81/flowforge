# Changelog

All notable changes are documented here. The current update summarizes the working-tree changes since commit `90de061`.

# [v0.8.0] - 2026-11-24

## Added

### Organizations, RBAC, and invitations

- Multi-organization memberships with per-organization Admin, Member, and Viewer roles.
- Organization switching with refreshed JWTs.
- Member list, role management, removal, pending invitations, resend, revoke, validate, and accept.
- Register-and-accept invitation flow with token/email validation and relational transaction handling.
- SMTP invitation delivery, retries, diagnostics, delivery status, attempt tracking, and failure persistence.
- Environment-specific invitation links for localhost and `flowforge-app.runasp.net`.

### Audit and webhooks

- Typed audit-log entity, service, filters, pagination, statistics, and admin UI.
- Webhook subscriptions, CRUD, HMAC-signed test delivery, queue worker, and failure counters.
- Domain-event contracts and post-save dispatcher infrastructure.

### Frontend platform

- Notifications inbox and admin Audit Logs page.
- Rebuilt General, Members, and Labels settings.
- Command palette, board keyboard hooks, organization switcher, accessibility announcer, shared toasts, and motion presets.
- PWA manifest, branded FlowForge icons, offline indicator, service worker, and runtime caching.
- Local on-device AI drafting with Web Worker inference, model selection, deadline, and heuristic fallback.
- Storybook setup and stories for shared primitives.

### Testing

- Backend xUnit project with 21 tests.
- Frontend Vitest unit project and Storybook browser-test configuration.

## Changed

- JWT now carries active organization, all organization ids, and active role.
- Registration supports normal workspace sign-up and invitation sign-up.
- Validation failures return HTTP 400 with field errors instead of generic 500 responses.
- API JSON enums serialize as strings.
- Added organization-creation rate limiting and expanded local CORS to ports 5173–5175.
- Added hosted webhook and scheduled-job services.
- Added local and Azure storage implementations; local disk remains the active provider.
- SignalR client now falls back through WebSockets, SSE, and Long Polling and handles role-change token refresh.
- Migrations are committed and include RBAC, invitations, audit, webhook, seed, and email-delivery changes.
- Production configuration removes the previously committed database credentials and fixes the JWT expiry key.
- Project detail pages keep the description in the header and use a full-width Recent Activity panel without duplicate details or header edit/archive actions.

## Fixed

- Pending invitations no longer disappear when the email-delivery migration is unapplied; the migration is documented and applied in the local environment.
- Duplicate invitation checks use SQL-translatable `TRIM`/`LOWER` comparison.
- Invitation creation returns the correct conflict/result behavior.
- Invitation registration uses the configured Axios API client instead of a relative request to the Vite server.
- Invitation acceptance no longer conflicts with a membership created prematurely during registration.
- Expired invitations are excluded from the pending UI list.
- Email delivery failures are reported as invitation-created-but-not-sent instead of false success.
- Invitation-list load failures now show a visible retry state.
- The organization-role correction migration no longer deletes user accounts and maps legacy roles in a single safe update.
- Removed the custom PWA install prompt and versioned the branded icon URLs to bypass stale mobile caches.

## Known boundaries

- Domain-event handlers are not registered, so automatic webhook publishing is not connected.
- The scheduler is demo-level and runs reminder/overdue jobs every minute.
- Export processing is not scheduled; Excel/PDF generation is placeholder output.
- Azure Blob Storage is not registered and its presigned-URL credentials are incomplete.
- Board realtime invalidation exists but is not mounted end to end.
- CI/CD, durable queues, and multi-instance SignalR backplane are not implemented.

# [v0.7.0] - Backend Complete

## Added

- SignalR collaboration and presence.
- Organizations, projects, boards, columns, work items, comments, notifications, and activity history.
- JWT authentication and protected endpoints.
- Clean Architecture, CQRS, EF Core, SQL Server, FluentValidation, Serilog, exception middleware, and Swagger.

# [v0.6.0] - Realtime Foundation

## Added

- SignalR infrastructure and notifier abstraction.
- User presence, board groups, organization groups, and work-item events.

# [v0.5.0] - Collaboration Foundation

## Added

- Notifications, activity history, business rules, validation, and logging improvements.

# [v0.4.0] - Work Item Management

## Added

- Work-item CRUD, assignment, status lifecycle, archive, and restore.

# [v0.3.0] - Project Management

## Added

- Projects, boards, columns, hierarchy, and board management.

# [v0.2.0] - Authentication

## Added

- User authentication, JWT generation, authorization, organization management, and user management.

# [v0.1.0] - Initial Foundation

## Added

- ASP.NET Core solution, Clean Architecture, CQRS, EF Core, SQL Server, dependency injection, and initial project structure.

# Upcoming

## v0.9.x — Production Hardening

- Durable scheduling and webhook delivery.
- Automatic domain-event handlers and audit coverage.
- Webhook organization-scope authorization.
- Mount board realtime invalidation.
- Complete Azure Blob credential handling.
- CI pipeline and deployment checks.

## v1.0.0 — Stable Release

- Final production configuration and operational runbooks.
- Performance and load verification.
- Complete export formats.
- Durable realtime/backplane strategy if multi-instance hosting is required.
