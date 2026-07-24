# ✅ FlowForge WorkItems Module

WorkItems represent the fundamental unit of work within FlowForge.

Every feature in the application ultimately revolves around creating, organizing, assigning, tracking, and completing WorkItems.

Projects define business initiatives.

Boards define workspaces.

Columns define workflow.

**WorkItems represent the actual work being performed.**

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, **Entity Framework Core**, and a **Rich Domain Model**, the WorkItems module serves as the core business engine of FlowForge.

---

# 📑 Table of Contents

- Introduction
- Module Overview
- WorkItem Philosophy
- Rich Domain Model
- WorkItem Lifecycle
- Creating WorkItems
- Updating WorkItems
- WorkItem Identity
- WorkItem Properties
- Assignment
- Priority
- Status
- Due Dates
- Board Relationship
- Column Relationship

---

# 📖 Introduction

A WorkItem represents a single unit of business work.

Examples include:

```text
Bug Fix

Feature

Task

Story

Improvement

Research

Documentation
```

Unlike traditional task management systems, FlowForge intentionally uses the term **WorkItem** because it represents any form of business activity rather than only tasks.

Every WorkItem belongs to a workflow hierarchy.

```text
Organization
      │
      ▼
Project
      │
      ▼
Board
      │
      ▼
Column
      │
      ▼
WorkItem
```

This hierarchy provides context, ownership, reporting, and security.

---

# 🏛 Module Overview

The WorkItems module manages the complete lifecycle of work.

Its responsibilities include:

✔ Creating work

✔ Updating work

✔ Moving work through workflow

✔ Assignment

✔ Priority management

✔ Status tracking

✔ Due dates

✔ Business validation

✔ Activity tracking

✔ Historical preservation

Every interaction inside FlowForge eventually affects a WorkItem.

---

# 🎯 WorkItem Philosophy

FlowForge treats a WorkItem as a living business object rather than a database record.

A WorkItem has:

- Identity
- State
- Behavior
- Rules
- History
- Relationships

Instead of allowing arbitrary database updates, WorkItems expose business behaviors that control how their state changes.

For example:

```text
Assign()

Move()

Archive()

Restore()

Update()

ChangePriority()
```

This philosophy follows Domain-Driven Design by keeping business logic inside the domain model rather than scattering it across controllers and services.

---

# 🧠 Rich Domain Model

The WorkItem entity is designed as a Rich Domain Model.

Rather than acting as a passive data container, it owns its behavior.

```text
WorkItem

├── Update()
├── Move()
├── Assign()
├── ChangePriority()
├── Archive()
├── Restore()
└── Complete()
```

Each method protects the integrity of the WorkItem.

Example:

Instead of:

```csharp
workItem.Status = Done;
```

FlowForge encourages:

```csharp
workItem.Complete();
```

This ensures that every state transition follows business rules.

---

# 🔄 WorkItem Lifecycle

Every WorkItem progresses through a lifecycle.

```text
Create
   │
   ▼
Backlog
   │
   ▼
Todo
   │
   ▼
In Progress
   │
   ▼
Review
   │
   ▼
Testing
   │
   ▼
Done
   │
   ▼
Archived
```

The exact workflow depends on the board configuration.

Different boards may define different workflows while the WorkItem lifecycle remains consistent.

---

## Lifecycle Philosophy

FlowForge never assumes a single workflow.

Examples:

Software Development

```text
Backlog
↓

Sprint

↓

Development

↓

Testing

↓

Deployment
```

Marketing

```text
Ideas

↓

Draft

↓

Review

↓

Published
```

Customer Support

```text
New

↓

Assigned

↓

Investigating

↓

Waiting

↓

Resolved
```

The WorkItem simply moves between columns.

The workflow itself belongs to the board.

---

# ➕ Creating a WorkItem

Creating a WorkItem establishes a new unit of work.

The request follows the standard FlowForge processing pipeline.

```text
Create Request
      │
      ▼
Validation
      │
      ▼
Board Validation
      │
      ▼
Column Validation
      │
      ▼
WorkItemRules
      │
      ▼
WorkItem Entity
      │
      ▼
Database
```

Only after successful validation is the WorkItem persisted.

---

## Responsibilities

Creating a WorkItem includes:

- Validating input
- Validating board
- Validating column
- Creating entity
- Saving database changes
- Returning response DTO

---

# ✏ Updating a WorkItem

Business requirements change over time.

A WorkItem may be updated throughout its lifecycle.

Typical updates include:

- Title
- Description
- Priority
- Due Date
- Assignee
- Labels
- Metadata

Updates preserve identity while modifying business information.

---

# 🆔 WorkItem Identity

Every WorkItem possesses a unique identity.

```text
WorkItem Id

Board Id

Column Id

Project Id

Organization Id
```

These relationships ensure that a WorkItem can always be traced back to its originating project.

Identity never changes, even when the WorkItem moves between columns.

---

# 📝 WorkItem Properties

A WorkItem typically contains:

```text
Title

Description

Priority

Status

Column

Board

Project

Assignee

Reporter

Due Date

Created At

Updated At

Archived

Labels
```

Additional properties may be introduced as the platform evolves.

---

# 👤 Assignment

WorkItems can be assigned to users.

Assignment defines ownership and accountability.

```text
Unassigned
      │
      ▼
Assigned
      │
      ▼
Completed
```

Future enhancements may include:

- Multiple assignees
- Watchers
- Followers
- Teams
- Departments

---

# 🚩 Priority

Priority determines execution order.

Typical priorities include:

```text
Low

Medium

High

Critical
```

Priority influences planning, reporting, and dashboards but does not dictate workflow transitions.

---

# 📊 Status

The current status of a WorkItem is derived from its workflow position.

Examples include:

```text
Todo

In Progress

Testing

Done
```

Rather than storing independent workflow states, FlowForge derives status from the current column whenever appropriate, reducing redundancy and ensuring consistency.

---

# 📅 Due Dates

Due dates help teams manage commitments and monitor deadlines.

They enable:

- Upcoming work views
- Overdue reports
- Calendar integrations
- Reminder notifications
- SLA monitoring

Future versions may include recurring work, milestone dependencies, and automated reminders.

---

# 🔗 Board Relationship

Every WorkItem belongs to exactly one board.

```text
Board
    │
    ├── WorkItem
    ├── WorkItem
    └── WorkItem
```

The board provides the collaborative workspace in which the WorkItem is managed.

---

# 📂 Column Relationship

Every WorkItem belongs to one workflow column at any point in time.

```text
Column
     │
     ├── WorkItem
     ├── WorkItem
     └── WorkItem
```

Moving a WorkItem between columns represents progress through the workflow while preserving its identity, history, and relationships.

---

# 🔄 Moving Between Columns

One of the most common operations performed on a WorkItem is moving it from one workflow stage to another.

A WorkItem never changes its identity when it moves.

Only its workflow position changes.

```text
Backlog
    │
    ▼
Todo
    │
    ▼
In Progress
    │
    ▼
Review
    │
    ▼
Testing
    │
    ▼
Done
```

Moving a WorkItem represents business progress rather than data modification.

---

## Workflow Transition Philosophy

FlowForge intentionally separates business identity from workflow state.

A WorkItem remains the same object throughout its lifecycle.

Only its current Column changes.

This allows:

- Accurate reporting
- Historical tracking
- Workflow flexibility
- Future workflow customization

The move operation is therefore considered a business behavior rather than a simple property update.

Example:

```csharp
workItem.Move(destinationColumnId);
```

instead of

```csharp
workItem.ColumnId = destinationColumnId;
```

This ensures every workflow transition passes through business rules.

---

# 📦 Archiving a WorkItem

Completed work is valuable.

Rather than permanently deleting WorkItems, FlowForge archives them.

Archived WorkItems:

- Remain searchable
- Preserve history
- Support reporting
- Maintain audit trails
- Can be restored

```text
Active WorkItem
        │
        ▼
Archive Request
        │
        ▼
Business Rules
        │
        ▼
Archive()
        │
        ▼
Archived WorkItem
```

This approach aligns with enterprise data retention practices.

---

# ♻️ Restoring a WorkItem

Archived WorkItems may be restored whenever business requirements change.

```text
Archived WorkItem
        │
        ▼
Restore Request
        │
        ▼
WorkItemRules
        │
        ▼
Restore()
        │
        ▼
Active WorkItem
```

Restoration preserves:

- Original identity
- Activity history
- Relationships
- Attachments
- Comments

No business information is recreated.

---

# ⚖️ Business Rules

Business rules ensure that WorkItems always remain in a valid business state.

These rules are centralized within the `WorkItemRules` class.

Typical responsibilities include:

- Project existence validation
- Board existence validation
- Column existence validation
- Organization ownership validation
- WorkItem existence validation
- Archive status validation
- Valid workflow transitions
- Assignment validation
- Due date validation

Keeping these policies centralized improves consistency across the application.

---

## Validation vs Business Rules

Validation answers:

> "Is the request structurally valid?"

Business Rules answer:

> "Is this business operation allowed?"

Examples

Validation

- Title is required.
- Title length is valid.
- Due date format is correct.

Business Rules

- Parent project must exist.
- Board must belong to the project.
- Column must belong to the board.
- User must belong to the organization.
- Archived WorkItems cannot be modified.
- Invalid workflow transitions are not permitted.

Separating these responsibilities simplifies maintenance and testing.

---

# ✔️ Validation

FlowForge uses **FluentValidation** to validate incoming commands before business logic executes.

Dedicated validators exist for each command.

Examples include:

```text
CreateWorkItemValidator

UpdateWorkItemValidator

MoveWorkItemValidator

AssignWorkItemValidator

ArchiveWorkItemValidator
```

Typical validation includes:

- Required fields
- Maximum lengths
- Valid identifiers
- Priority values
- Due date ranges
- Request consistency

Validation failures immediately terminate request processing.

---

## Validation Pipeline

```text
HTTP Request
      │
      ▼
CreateWorkItemCommand
      │
      ▼
CreateWorkItemValidator
      │
      ▼
Valid Request
      │
      ▼
Handler
```

Every command follows this pipeline before business rules execute.

---

# 📦 Commands (CQRS)

Commands represent operations that modify application state.

Typical commands include:

```text
CreateWorkItemCommand

UpdateWorkItemCommand

MoveWorkItemCommand

AssignWorkItemCommand

ChangePriorityCommand

ArchiveWorkItemCommand

RestoreWorkItemCommand
```

Each command has:

- Request
- Validator
- Handler
- Response DTO

This structure keeps responsibilities isolated and promotes maintainability.

---

# 📖 Queries (CQRS)

Queries retrieve information without modifying state.

Typical queries include:

```text
GetWorkItemsQuery

GetWorkItemByIdQuery

GetBoardWorkItemsQuery

GetAssignedWorkItemsQuery

GetArchivedWorkItemsQuery
```

Queries return optimized read models tailored to client requirements.

---

# 🌐 API Endpoints

The WorkItems module exposes RESTful endpoints for managing work.

---

## Create WorkItem

```http
POST /api/workitems
```

Creates a new WorkItem.

---

## Get WorkItems

```http
GET /api/workitems
```

Returns a collection of WorkItems.

---

## Get WorkItem By Id

```http
GET /api/workitems/{id}
```

Returns detailed information for a specific WorkItem.

---

## Update WorkItem

```http
PUT /api/workitems/{id}
```

Updates WorkItem information.

---

## Move WorkItem

```http
PATCH /api/workitems/{id}/move
```

Moves a WorkItem to another column.

---

## Assign WorkItem

```http
PATCH /api/workitems/{id}/assign
```

Assigns the WorkItem to a user.

---

## Archive WorkItem

```http
PATCH /api/workitems/{id}/archive
```

Archives the WorkItem.

---

## Restore WorkItem

```http
PATCH /api/workitems/{id}/restore
```

Restores a previously archived WorkItem.

---

# 🔄 Request Lifecycle

Every request follows the same architectural pipeline.

```text
HTTP Request
      │
      ▼
WorkItemsController
      │
      ▼
MediatR
      │
      ▼
Command / Query
      │
      ▼
FluentValidation
      │
      ▼
WorkItemRules
      │
      ▼
WorkItem Entity
      │
      ▼
ApplicationDbContext
      │
      ▼
SQL Server
      │
      ▼
Response DTO
      │
      ▼
API Response
```

Every layer has a clearly defined responsibility, ensuring consistency throughout FlowForge.

---

# 🔒 Security & Authorization

Every WorkItem operation is protected by authentication and authorization.

Before any operation executes, FlowForge verifies:

- The user is authenticated.
- The JWT token is valid.
- The user belongs to the organization.
- The project is accessible.
- The board belongs to the project.
- The column belongs to the board.
- The WorkItem belongs to the specified workflow.

This layered validation ensures strong tenant isolation and prevents unauthorized access.

---

# 📊 Response Models

Each endpoint returns a dedicated response model.

Examples include:

```text
CreateWorkItemResponse

UpdateWorkItemResponse

MoveWorkItemResponse

AssignWorkItemResponse

GetWorkItemResponse

GetWorkItemsResponse

ArchiveWorkItemResponse

RestoreWorkItemResponse
```

All responses follow the shared `ApiResponse<T>` format, providing a consistent contract across the API.

---

# 📦 Module Dependencies

The WorkItems module depends on:

- ASP.NET Core Web API
- MediatR
- FluentValidation
- Entity Framework Core
- SQL Server
- WorkItemRules
- Current User Service
- Projects Module
- Boards Module
- Columns Module

Each dependency contributes a specific responsibility while preserving the principles of Clean Architecture.

---

# 📎 Attachments

Business work rarely exists in isolation.

Most WorkItems require supporting documents, images, specifications, spreadsheets, contracts, screenshots, or design assets.

The Attachments feature enables WorkItems to become a complete source of business information.

Examples include:

```text
Design Mockups

Requirement Documents

Contracts

Invoices

Screenshots

Error Logs

PDF Specifications

Architecture Diagrams
```

Attachments remain associated with the WorkItem throughout its lifecycle.

---

## Attachment Relationship

```text
WorkItem
     │
     ├── Attachment
     ├── Attachment
     ├── Attachment
     └── Attachment
```

Each attachment belongs to exactly one WorkItem.

Future implementations may support:

- Versioning
- Preview generation
- Virus scanning
- Cloud storage
- File size restrictions
- File type validation

---

# 💬 Comments

Comments provide collaborative communication around a WorkItem.

Rather than exchanging information through emails or messaging platforms, discussions remain attached to the work itself.

Typical uses include:

- Questions
- Clarifications
- Progress updates
- Technical discussions
- Decisions
- Customer feedback

---

## Comment Relationship

```text
WorkItem
     │
     ├── Comment
     ├── Comment
     ├── Comment
     └── Comment
```

Future enhancements may include:

- Threaded discussions
- User mentions
- Rich text editing
- Emoji reactions
- File attachments
- Comment editing history

---

# 🏷️ Labels

Labels provide flexible categorization.

Unlike workflow columns, labels are non-hierarchical and may be applied across multiple WorkItems.

Examples:

```text
Bug

Urgent

Backend

Frontend

Database

Security

Customer Request

Enhancement
```

Labels improve:

- Filtering
- Searching
- Reporting
- Dashboard metrics
- Analytics

Unlike priority, labels describe the nature of the work rather than its urgency.

---

# 📜 Activity History

Every significant business action performed on a WorkItem should be recorded.

Typical events include:

- WorkItem created
- Title updated
- Description modified
- Assignment changed
- Priority changed
- Column changed
- Comment added
- Attachment uploaded
- Archived
- Restored

---

## Activity Timeline

```text
09:00 Created

09:15 Assigned

10:40 Moved to In Progress

13:10 Priority Updated

15:45 Comment Added

17:20 Completed
```

Maintaining an activity timeline improves transparency, accountability, and auditing.

---

# ⚡ Performance Considerations

As the number of WorkItems grows, efficient data access becomes increasingly important.

Recommended strategies include:

### Database Indexing

Create indexes for frequently queried fields such as:

- ProjectId
- BoardId
- ColumnId
- AssigneeId
- Priority
- Archived
- CreatedAt
- DueDate

---

### Pagination

Large datasets should be retrieved using pagination rather than loading all records.

Example:

```http
GET /api/workitems?page=1&pageSize=25
```

---

### Filtering

Support efficient filtering by:

- Project
- Board
- Column
- Priority
- Assignee
- Status
- Due Date
- Labels

---

### Sorting

Common sorting options include:

- Created Date
- Updated Date
- Priority
- Due Date
- Alphabetical
- Custom Position

---

### Searching

Search functionality should support:

- Title
- Description
- Labels
- Comments (future)
- Attachments (future)

---

# ⭐ Best Practices

When extending the WorkItems module, follow these principles.

✔ Keep business logic inside the WorkItem entity.

✔ Never update workflow state directly.

✔ Use business methods such as:

```csharp
Move()

Assign()

Archive()

Restore()

Complete()

ChangePriority()
```

✔ Validate all requests before business rules.

✔ Keep handlers lightweight.

✔ Use dedicated DTOs.

✔ Archive rather than delete.

✔ Record meaningful activity history.

✔ Maintain consistent workflow transitions.

✔ Keep WorkItems independent of presentation logic.

Following these principles ensures that the WorkItems module remains scalable, testable, and maintainable.

---

# 💼 Common Business Scenarios

---

## Creating New Work

```text
Project
      │
      ▼
Board
      │
      ▼
Column
      │
      ▼
Create WorkItem
```

---

## Assigning Work

```text
Unassigned
      │
      ▼
Assigned
      │
      ▼
Completed
```

---

## Progressing Through Workflow

```text
Todo
   │
   ▼
In Progress
   │
   ▼
Review
   │
   ▼
Testing
   │
   ▼
Done
```

---

## Reprioritizing Work

```text
Medium
      │
      ▼
High
      │
      ▼
Critical
```

Business priorities change over time while the WorkItem identity remains constant.

---

## Completing Work

```text
Created
      │
      ▼
Assigned
      │
      ▼
In Progress
      │
      ▼
Review
      │
      ▼
Done
      │
      ▼
Archived
```

The complete lifecycle preserves all historical information.

---

# 🚀 Future Enhancements

The WorkItems module has been designed to support future enterprise capabilities without requiring architectural changes.

Potential enhancements include:

```text
Sub-Tasks

Checklists

Dependencies

Recurring WorkItems

Time Tracking

Story Points

Sprint Planning

Estimations

Watchers

Followers

Approvals

Custom Fields

AI Suggestions

Automation Rules

Notifications

Calendar Integration

Gantt Charts

Burndown Charts

Kanban Metrics

SLA Monitoring

External Integrations

GitHub Integration

Azure DevOps Integration

Slack Notifications

Microsoft Teams Integration
```

Each enhancement builds upon the existing architecture while preserving the module's core responsibilities.

---

# 🌍 WorkItems in the Overall Architecture

The WorkItems module sits at the center of FlowForge's business model.

```text
                   Organization
                        │
                        ▼
                    Project
                        │
                        ▼
                     Board
                        │
                        ▼
                     Column
                        │
                        ▼
                    WorkItem
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
   Attachments      Comments         Labels
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                 Activity History
```

Every module either creates, manages, enriches, or reports on WorkItems.

This makes the WorkItems module the central business component of the platform.

---

# 📖 Summary

The WorkItems module is the core execution engine of FlowForge.

It is responsible for:

- Creating work
- Organizing work
- Managing workflow
- Tracking ownership
- Handling priorities
- Supporting collaboration
- Preserving business history
- Enforcing business rules
- Providing reporting data
- Enabling future automation

Working together with the Projects, Boards, and Columns modules, WorkItems complete the primary business hierarchy of the platform.

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, **Entity Framework Core**, and a **Rich Domain Model**, the WorkItems module provides a scalable, maintainable, and enterprise-ready foundation for managing work across organizations of any size.

---

<div align="center">

# ✅ FlowForge WorkItems Module

### Transforming Business Activities into Structured, Traceable, and Collaborative Units of Work

*"Projects establish purpose. Boards organize collaboration. Columns define workflow. WorkItems represent execution. Together they form the complete business backbone of FlowForge, enabling organizations to plan, collaborate, deliver, and continuously improve through structured work management."*

</div>