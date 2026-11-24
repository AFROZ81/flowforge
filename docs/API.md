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

Tokens include the user id, active organization, all organization ids, active role, email, and display name.

### Auth endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/Auth/register` | Normal workspace registration or invitation registration. |
| `POST` | `/api/Auth/login` | Email/password login. |
| `POST` | `/api/Auth/refresh` | Issue a fresh token for the current identity. |

Normal registration requires `organizationId`. Invitation registration instead sends `invitationToken`; the server validates that the email matches the invitation, creates the account, accepts the invitation, and returns `accessToken` and `expiresAtUtc`.

### Organization switching

`POST /api/Organizations/switch` validates membership in the requested organization and returns a new token with that organization active.

## Authorization

Policies are registered in `Program.cs`:

- `RequireAdmin`
- `RequireMember`
- `RequireViewer`

Most resource access is scoped to the active organization in the token. Admin-only surfaces include audit logs and member/settings management.

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
| `GET` | `/api/Invitations` | Authenticated | List current-organization invitations. |
| `DELETE` | `/api/Invitations/{id}` | Admin | Revoke an invitation. |
| `POST` | `/api/Invitations/{id}/resend` | Admin | Rotate token, extend expiry, retry email. |
| `GET` | `/api/Invitations/validate?token=…` | Anonymous | Read invitation details without accepting. |
| `POST` | `/api/Invitations/accept` | Anonymous | Accept using a token. |
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
- Acceptance creates the membership with the invited role and marks the invitation accepted.
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
