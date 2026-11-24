# Roadmap

## Current version

**v0.8.0 — Frontend and Platform Enhancements**

The backend, React client, invitations, RBAC, audit logs, webhook management, PWA, and local AI drafting are implemented. Current work is focused on production hardening rather than missing core modules.

## Completed

### Foundation

- Clean Architecture and dependency inversion.
- Vertical slices and CQRS with MediatR.
- EF Core, SQL Server, FluentValidation, and Serilog.
- Committed migrations and backend test project.

### Authentication and organizations

- JWT authentication and refresh.
- Multi-organization memberships.
- Per-organization RBAC.
- Organization switching.
- Invitations with register-and-accept, delivery tracking, resend, and revoke.

### Core product

- Projects, boards, columns, and work-item lifecycle.
- Comments, attachments, labels, checklists, watchers, reminders, and history.
- Dashboard, reports, XLSX export, search, and notifications.
- Kanban drag-and-drop and keyboard navigation hooks.

### Platform

- Audit-log API and admin UI.
- Webhook subscription management and signed test delivery.
- Domain-event dispatcher infrastructure.
- Hosted webhook queue and demo scheduler.
- Local attachment storage with an Azure implementation seam.

### Frontend

- React router shell with public, protected, and admin routes.
- General, Members, and Labels settings.
- Command palette and organization switcher.
- Accessibility announcer and shared toast system.
- PWA install/offline support and runtime caching.
- Local on-device AI drafting.
- Storybook and Vitest tooling.

## In progress: production hardening

- Durable job scheduling and export processing.
- Automatic domain-event handlers for audit and webhooks.
- Stricter organization scoping on webhook mutation/test routes.
- End-to-end board realtime invalidation.
- Production-ready Azure Blob credentials and presigned URLs.
- CI checks for backend tests, frontend tests, lint, and build.
- Operational monitoring and deployment verification.

## Planned

### Collaboration

- Mentions and reactions.
- Complete typing-indicator UI.
- Durable realtime backplane for multi-instance hosting.

### Productivity

- Calendar view.
- Advanced saved filters.
- Complete PDF/Excel export generation.

### Platform

- Durable outbox/queue for webhooks.
- Rate-limit and abuse monitoring.
- Backup/restore runbooks.
- Container support if deployment needs change.

## Release timeline

| Version | Status | Highlights |
| --- | --- | --- |
| v0.1.x | Complete | Project foundation. |
| v0.2.x | Complete | Authentication and organizations. |
| v0.3.x | Complete | Projects and boards. |
| v0.4.x | Complete | Work-item lifecycle. |
| v0.5.x | Complete | Collaboration infrastructure. |
| v0.6.x | Complete | Realtime foundation. |
| v0.7.0 | Complete | Backend and collaboration modules. |
| v0.8.0 | Complete | Frontend, RBAC, invitations, audit, webhooks, PWA, AI, tests. |
| v0.9.x | In progress | Production hardening. |
| v1.0.0 | Target | Stable release. |

## Current progress

| Area | Status |
| --- | --- |
| Backend | Implemented; hardening in progress. |
| Frontend | Implemented. |
| Database | Migrated; migrations committed. |
| Testing | Backend and frontend suites present; CI pending. |
| Deployment | Production domain configured; operational hardening pending. |
| Documentation | Current for v0.8.0. |
