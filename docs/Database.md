# Database

## Overview

FlowForge uses **Microsoft SQL Server** with **Entity Framework Core 10** and code-first migrations. ASP.NET Core Identity tables live in the same database.

## Core entities

| Entity | Purpose |
| --- | --- |
| `ApplicationUser` | Identity account, email, password hash, display name. |
| `Organization` | Workspace boundary. |
| `OrganizationUser` | Surrogate membership key, user/organization pair, role, Owner flag, token version, concurrency token, and soft-delete state. |
| `OrganizationInvitation` | Email invitation, token, expiry, acceptance, and delivery status. |
| `Project` | Group of boards within an organization. |
| `Board` | Kanban board within a project. |
| `Column` | Ordered workflow column. |
| `WorkItem` | Task with status, priority, assignee, dates, and ordering. |
| `Comment` | Work-item discussion. |
| `Attachment` | Uploaded file metadata. |
| `ChecklistItem` | Work-item checklist entry. |
| `Label` / `WorkItemLabel` | Workspace labels and item assignments. |
| `WorkItemWatcher` | Users watching an item. |
| `WorkItemHistory` | Item activity history. |
| `Notification` | User notification inbox. |
| `AuditLog` | Typed administrative/audit record. |
| `WebhookSubscription` | Outbound webhook endpoint and event selection. |

## Relationships

```text
ApplicationUser
  └── OrganizationUser ──< Organization
                                ├── OrganizationInvitation
                                ├── AuditLog
                                ├── WebhookSubscription
                                └── Project
                                      └── Board
                                            └── Column
                                                  └── WorkItem
                                                        ├── Comment
                                                        ├── Attachment
                                                        ├── ChecklistItem
                                                        ├── WorkItemLabel ── Label
                                                        ├── WorkItemWatcher
                                                        ├── WorkItemHistory
                                                        └── Notification
```

## Multi-organization model

A user is not limited to one organization. `OrganizationUser` is the sole membership authority and uses inherited `Id` as its primary key. It stores `Role`, `IsOwner`, `TokenVersion`, and a SQL Server `rowversion`. An Owner is an Admin membership with `IsOwner = true`.

Filtered unique indexes enforce one active row per `(UserId, OrganizationId)` and one active Owner per organization. Removal and leave soft-delete membership rows; invitation rejoin restores the same historical row, assigns the invited role, clears ownership, and increments the existing token version. Legacy `ApplicationUser.OrganizationId` and `ApplicationUser.Role` remain only for migration compatibility and are not authorization sources.

Resource authorization uses active DB membership, current DB role, organization state, and token version. Client workspace lists come from `GET /api/Organizations/mine`, not JWT `orgIds`.

## Invitation data

`OrganizationInvitation` stores:

- email, role, secure token, expiry
- organization and inviter
- acceptance state, acceptor, and acceptance time
- soft-delete state
- email delivery status: `NotSent`, `Sent`, or `Failed`
- delivery error, attempt count, last attempt time, and sent time

An active duplicate is defined as an invitation that is not deleted, not accepted, unexpired, in the same organization, and matches the normalized email. The SQL query uses `TRIM` plus `LOWER` because EF Core SQL Server cannot translate `string.Equals(..., StringComparison)`.

## Audit and soft deletion

Most domain entities inherit audit and soft-delete fields from `EntityBase`. `ApplicationDbContext.SaveChangesAsync` stamps:

- `CreatedAt`, `CreatedBy` on added rows
- `UpdatedAt`, `UpdatedBy` on modified rows
- `IsDeleted = false` on added rows

Anonymous writes are supported, so author fields can remain null. `ApplicationDbContext` installs global `!IsDeleted` query filters for every `EntityBase` entity. Restore handlers use `IgnoreQueryFilters()` with explicit organization scoping, and work-item restoration also restores its soft-deleted dependents.

## Migrations

Migrations are committed. They are split across:

- `FlowForge.Infrastructure/Migrations` — original schema history
- `FlowForge.Infrastructure/Infrastructure/Persistence/Migrations` — organization, RBAC, invitation, audit, webhook, and email-delivery additions

Important recent migrations:

- `20261116063651_AddRoleColumn`
- `20261117045050_AddOrganizationUser`
- `20261117053824_AddWebhookSubscription`
- `20261117115201_AddAuditLog`
- `20261118094916_SeedOrganizationUsersData`
- `20261118104242_FixOrganizationUsersRoles`
- `20261124055305_AddInvitationEmailDeliveryStatus`
- `20261128120000_AddReminderNotifiedAt`
- `20261128130000_AddOrganizationManagement`

Back up the database before applying `20261128130000_AddOrganizationManagement`. It backfills membership GUIDs, replaces the composite key, adds Owner/token/rowversion columns, fails with offending organization IDs when any non-deleted organization has no active Admin, deterministically assigns the oldest active Admin as Owner, and creates filtered indexes. Verify the generated SQL Server script and foreign keys before production deployment.

Apply migrations from `backend/src/FlowForge`:

```powershell
dotnet ef database update --project FlowForge.Infrastructure --startup-project FlowForge.API
dotnet ef migrations list --project FlowForge.Infrastructure --startup-project FlowForge.API
```

## Data integrity

- Filtered unique indexes enforce one active membership per user/organization and one active Owner per organization.
- Invitation tokens have a unique index.
- Organization/email invitation lookups are indexed.
- Organization archive uses `IsActive`; terminal delete uses `IsDeleted` and retains rows/history.
- Work-item ordering uses a gap strategy to avoid mass rewrites.
- Business rules remain in handlers; the database does not replace application validation.
- Pending-invitation uniqueness is currently enforced in application logic, not by a filtered unique index.
