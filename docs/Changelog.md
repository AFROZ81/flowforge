# Changelog

All notable changes are documented here. The current update summarizes the working-tree changes since commit `90de061`.

# [v0.9.0] - 2026-11-28

## Added

- Account-first registration and protected `/onboarding` for workspace creation, invitation acceptance, active-workspace recovery, and archived-Owner recovery.
- Organization profile editing, ownership transfer, leave, archive/restore, and terminal soft delete with exact slug confirmation.
- Surrogate membership IDs, Owner flag, token versioning, rowversion concurrency, filtered unique indexes, and deterministic Owner migration backfill.
- Database-backed organization session validation and policies for accounts, organization sessions, roles, and Owners.
- Named workspace switcher, single-retry Axios refresh flow, shared session cache synchronization, and realtime membership/role refresh handling.
- Backend organization-management regression suite and frontend auth/onboarding/switcher/settings/route-guard tests.
- Verification totals: 72 backend tests and 107 frontend unit tests.

## Changed

- Normal registration no longer accepts `organizationId`; only workspace creation or invitation acceptance creates memberships.
- Invitation acceptance now requires authentication and normalized email equality; rejoin restores the historical membership row.
- `GET /api/Organizations/mine` replaces public organization options for client workspace discovery.
- Login, refresh, switch, and lifecycle mutations issue sessions from authoritative database state.
- Demo seeding now creates/selects a workspace through authenticated APIs and invites teammates through invitation acceptance.

## Fixed

- Removed members, changed roles, archived organizations, and terminally deleted organizations no longer retain organization access through stale signed claims.
- Owner and last-Admin invariants are enforced for role changes, removal, leave, and ownership transfer.
- Membership listings exclude terminally deleted organizations while retaining archived workspaces for Owner recovery.
- Corrected the organization-management migration's SQL Server preflight `THROW` syntax and reused the existing `IX_OrganizationUsers_OrganizationId` index instead of recreating it; the local migration now applies cleanly and its columns, filtered indexes, and Owner invariants were verified in SQL Server.
- Fixed `/api/Organizations/mine` ordering before projection so EF Core can translate it to SQL Server, and capped membership-query retries to prevent request loops during server errors.

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

- Backend xUnit project with 55 tests.
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
- Invitation emails now open the original registration card at `/login?mode=register` with the invite token; legacy acceptance links redirect there and the form prefills the invited email, hides workspace selection, and accepts the invite after account creation.
- Invitation acceptance no longer conflicts with a membership created prematurely during registration.
- Expired invitations are excluded from the pending UI list.
- Email delivery failures are reported as invitation-created-but-not-sent instead of false success.
- Invitation-list load failures now show a visible retry state.
- The organization-role correction migration no longer deletes user accounts and maps legacy roles in a single safe update.
- Removed the custom PWA install prompt and versioned the branded icon URLs to bypass stale mobile caches.
- Member roles now normalize the API's enum names before display and send role names back when updating a member.
- Search fields now take a full row on mobile across projects, members, labels, and reports instead of competing with filters for width.
- Reports and Settings navigation now use a cleaner segmented control with hidden mobile scrollbars and edge fades that make overflowing views discoverable.
- The Team report now includes every current organization member, including members with no assigned work, by reading memberships instead of the legacy primary-organization field.
- Board keyboard selection now clears when the user clicks outside the board, including any lingering DOM focus on the selected card.
- Work-item editing now prefills the saved priority whether the API returns an enum name or numeric value, and unrelated edits no longer reset it.
- Removed icon-only X controls from all shared dialogs and sheets; modals keep explicit Close/Cancel actions, and the mobile navigation drawer now has a text Close button.
- Board columns now use a predictable responsive grid: one on phones, two on small screens, three on medium, four on large, and five on extra-large screens.
- All user-facing dates and times now use IST (`Asia/Kolkata`), including date inputs, activity feeds, reminders, audit filters, reports, exports, and invitation emails; stored timestamps remain UTC.
- Invitation creation, listing, resend, and revocation are now admin-only in both the Members page UI and API authorization.
- Added Admin-only soft deletion for work items, projects, and boards with the app confirmation modal, audit logs, realtime notifications, transactional flag updates, retained dependent records/files, global query filters, restore support, and non-empty container protection.
- Project and board creation/editing are now Admin-only in both API policies and UI visibility; Viewers have read-only work-item details and cannot call work-item mutation APIs.
- Work-item field editing, rename, and assign/unassign remain Admin-only; Members retain create/move/status workflow access. All roles can set or remove reminders on Active, unarchived work items, and reminder changes no longer modify due dates.
- Project cards now expose direct Edit/Archive/Delete icons, board cards expose direct Edit/Archive/Delete icons, and soft delete is no longer hidden behind management or danger menus.
- Invitation revocation and member removal now use the app confirmation modal instead of the browser confirmation dialog; delete confirmations no longer require typing the entity name.
- Added an Admin-only board edit dialog with prefilled name/description fields on board cards.
- Admin project and board pages now show an Archived button only when archived items exist; the button opens a restore modal, while Members and Viewers continue to see active items only.
- Removed duplicate board Edit/Archive controls from the board detail columns page.
- Online presence now resolves organization membership through `OrganizationUsers`, so Admins, Members, and Viewers all see the same role-agnostic online roster.
- Fixed IST date/time input conversion so valid reminder selections convert to UTC correctly instead of being rejected as invalid.
- Due reminders now persist notifications for the assignee and watchers, broadcast `NotificationReceived` over SignalR, email the assignee through the existing SMTP service, and use `ReminderNotifiedAt` to prevent duplicate delivery.

## Known boundaries

- Domain-event handlers are not registered, so automatic webhook publishing is not connected.
- The scheduler is demo-level: reminders are scanned every minute with once-only delivery, while the overdue job still runs every check.
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
