# API

## Overview

FlowForge exposes an ASP.NET Core REST API at `api/[controller]`. Swagger is available in Development and is the executable reference for request and response models.

- Local API: `http://localhost:5045/api`
- Production API: `https://flowforge-app.runasp.net/api`
- SignalR hub: `/hubs/notifications`

JSON enum values are serialized as strings, such as `"Member"` and `"Active"`.

## Authentication

JWT bearer tokens are required for protected endpoints:

```http
Authorization: Bearer <access_token>
```

Account-only tokens contain identity claims and no organization context. Organization tokens add `organizationId`, `membershipId`, `tokenVersion`, and the current role. On every authenticated request, `OnTokenValidated` reloads the membership, organization state, role, owner flag, and token version from the database; stale organization context is stripped while the account remains authenticated so refresh can recover.

### Auth endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/Auth/register` | Create an account only, or create an account and accept an invitation atomically. |
| `POST` | `/api/Auth/login` | Email/password login. |
| `POST` | `/api/Auth/refresh` | Reload authoritative memberships and issue an organization or account-only session. |

Normal registration accepts only account fields and never accepts `organizationId`. It returns an account-only session. Invitation registration sends `invitationToken`; the server validates the token and email, creates the account, accepts the invitation, and returns an organization session. Login returns an organization session when an active membership exists, otherwise an account-only session.

### Organizations and switching

`GET /api/Organizations/mine` is the client's membership directory. It returns database-backed names, slugs, roles, active state, and owner state, including archived workspaces but excluding terminally deleted organizations. The former public `GET /api/Organizations/options` route has been removed.

`POST /api/Organizations/switch` validates an active membership and returns a fresh organization session.

| Method | Route | Policy | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/Organizations/mine` | `RequireAccount` | List the caller's memberships. |
| `POST` | `/api/Organizations` | `RequireAccount` | Atomically create a workspace and Owner/Admin membership. |
| `POST` | `/api/Organizations/switch` | `RequireAccount` | Switch to an active membership. |
| `GET` | `/api/Organizations/{organizationId}` | `RequireOrganizationSession` | Read the active organization profile. |
| `PUT` | `/api/Organizations/{organizationId}` | `RequireAdmin` | Update name, description, and logo URL; slug is immutable. |
| `GET` | `/api/Organizations/{organizationId}/members` | `RequireOrganizationSession` | List members with owner state. |
| `PUT` | `/api/Organizations/{organizationId}/members/{userId}/role` | `RequireAdmin` | Change a non-owner member's role. |
| `DELETE` | `/api/Organizations/{organizationId}/members/{userId}` | `RequireAdmin` | Soft-delete a non-owner membership. |
| `POST` | `/api/Organizations/{organizationId}/leave` | `RequireOrganizationSession` | Leave after owner and last-Admin checks. |
| `POST` | `/api/Organizations/{organizationId}/transfer-ownership` | `RequireOwner` | Promote a member to Owner/Admin and demote the former Owner. |
| `POST` | `/api/Organizations/{organizationId}/archive` | `RequireOwner` | Archive the workspace and revoke pending invitations. |
| `POST` | `/api/Organizations/{organizationId}/restore` | `RequireAccount` | Owner-only restore of an archived workspace. |
| `DELETE` | `/api/Organizations/{organizationId}` | `RequireAccount` | Owner-only terminal soft delete after archive and slug confirmation. |

Session-changing organization responses include `accessToken`, `expiresAtUtc`, and nullable `organizationId`. Route IDs must match the validated session organization; mismatches return `404`.

## Authorization

Policies are registered in `Program.cs`:

- `RequireAccount` — any authenticated account, including accounts with zero memberships.
- `RequireOrganizationSession` — authenticated account plus a DB-validated active membership, active organization, matching membership token version, and current DB role.
- `RequireViewer`, `RequireMember`, and `RequireAdmin` — hierarchical policies over the validated organization session.
- `RequireOwner` — validated organization session plus the DB-backed owner flag.

Signed role and `orgIds` claims are never authorization authority. `OrganizationUser` is the sole membership authority; legacy `ApplicationUser.OrganizationId` and `ApplicationUser.Role` are not used for authorization.

## Response formats

The API uses a mix of:

- bare DTOs and lists from many MediatR endpoints
- `ApiResponse<T>` envelopes from authentication
- paged results for audit logs
- file responses for exports and attachment downloads

Client helpers normalize the known envelope and bare-payload cases.

Errors use a common shape with `success`, `message`, `traceId`, and optional `errors`.

## Status codes

| Status | Meaning |
| --- | --- |
| 200 | Successful read/update/acceptance. |
| 201 | Resource created. |
| 204 | Successful delete/revoke/removal. |
| 400 | Invalid request, validation failure, or invalid lifecycle transition. |
| 401 | Missing, invalid, or expired authentication. |
| 403 | Authenticated but not allowed. |
| 404 | Resource or invitation token not found. |
| 409 | Duplicate invitation, existing member/email, rate limit, or resend cooldown. |
| 410 | Reserved for expired invitation responses in controller metadata; current handler uses 400 for expiry. |
| 429 | Request rate limit exceeded. |
| 500 | Unexpected server error. |

## Invitations

### Endpoints

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/Invitations` | Admin | Create an invitation. |
| `GET` | `/api/Invitations` | Admin | List current-organization invitations. |
| `DELETE` | `/api/Invitations/{id}` | Admin | Revoke an invitation. |
| `POST` | `/api/Invitations/{id}/resend` | Admin | Rotate token, extend expiry, retry email. |
| `GET` | `/api/Invitations/validate?token=…` | Anonymous | Read invitation details without accepting. |
| `POST` | `/api/Invitations/accept` | Authenticated account | Accept using a token bound to the authenticated email. |
| `GET` | `/api/Invitations/smtp-diagnostics` | Admin | Test SMTP connectivity without sending to a recipient. |

### Creation rules

- Only organization admins can invite.
- The email is trimmed and normalized.
- Existing organization members are rejected.
- A pending invitation is one that is not deleted, not accepted, unexpired, in the same organization, and email-equivalent.
- Each admin may create at most 10 invitations per hour.
- The invitation record is persisted before email delivery.
- SMTP failure does not delete the invitation; delivery status becomes `Failed` and the admin can resend.

### Acceptance rules

- Tokens are secure, random, and unique.
- Standard expiry is seven days.
- Resend rotates the token, extends expiry, and enforces a five-minute cooldown.
- Acceptance derives the user from authentication and requires normalized email equality with the invitation.
- Acceptance creates or restores the historical membership row with the invited role, clears ownership, increments `TokenVersion`, and marks the invitation accepted.
- Invitation registration wraps account creation and acceptance in one relational transaction.
- A successful acceptance returns a JWT for the invited organization.

### Link configuration

New and resent invitations use `Frontend:BaseUrl`:

- Development: `http://localhost:5173`
- Production: `https://flowforge-app.runasp.net`
- Override: `Frontend__BaseUrl`

Previously emailed links do not change; resend to generate a link with the current configuration.

## Audit logs

`GET /api/AuditLogs` supports pagination, date range, type, actor, target, sensitivity, text search, and sorting. `GET /api/AuditLogs/statistics` returns totals and breakdowns. Both require `RequireAdmin` and are scoped to the active organization.

## Work item, project, and board permissions

| Resource | All authenticated roles | Member access | Admin-only access |
| --- | --- | --- | --- |
| Work items | View; set/remove reminders on Active, unarchived items | Create, move, complete, block, activate | Rename, edit, assign, unassign, archive, restore, soft delete |
| Projects | View | — | Create, update, archive, restore, soft delete |
| Boards | View | — | Create, update, archive, restore, soft delete |

Soft-delete endpoints are `DELETE /api/WorkItems/{id}`, `DELETE /api/Projects/{id}`, and `DELETE /api/Boards/{id}`. They set `IsDeleted`/`DeletedAt`; no rows or attachment files are physically removed. Global query filters hide soft-deleted entities from normal queries. Project deletion returns `409` while active boards exist; board deletion returns `409` while active columns exist. Work-item deletion also soft-deletes its dependent records in one transaction. The existing Admin-only restore endpoints can restore soft-deleted records, including work-item dependents.

Archived projects are included in `GET /api/Projects` only for Admins. `GET /api/Boards?includeArchived=true` likewise returns archived boards only for Admins; Members and Viewers always receive active boards.

Viewer accounts are read-only for work-item mutations except reminder management. Creating and moving work items, changing status, and mutating attachments, comments, labels, watchers, and checklists require `RequireMember` (which also allows Admins). Renaming/editing work-item fields and assigning/unassigning users require `RequireAdmin`. Setting and removing reminders require `RequireViewer`, so Admins, Members, and Viewers can manage them; the server rejects archived, Completed, and Blocked work items. Reminder changes never modify the work item's due date.

## Webhooks

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/Webhooks` | List active-organization subscriptions. |
| `POST` | `/api/Webhooks` | Create a subscription. |
| `PUT` | `/api/Webhooks/{id}` | Update a subscription. |
| `DELETE` | `/api/Webhooks/{id}` | Soft-delete a subscription. |
| `POST` | `/api/Webhooks/{id}/test` | Send a signed test payload. |

Automatic domain-event publishing is not connected yet; test delivery is the currently usable path.

## Rate limits and correlation

- 600 requests/minute per authenticated user
- 30 requests/minute per anonymous IP
- 5 login requests/minute per IP
- 5 organization-creation requests/hour per IP

Rejections return 429 and `Retry-After: 60`. `X-Correlation-ID` is accepted inbound, echoed, and attached to logs and error responses.

## CORS

Development allows `http://localhost:5173`, `:5174`, and `:5175`. Production is designed as one same-origin site, so no wildcard CORS origin is required.
