# 📋 FlowForge Columns Module

Columns define the workflow stages through which WorkItems progress within a board.

While Projects organize business initiatives and Boards provide collaborative workspaces, Columns establish the workflow that guides work from creation to completion.

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, the Columns module provides flexible workflow management while maintaining consistency, scalability, and clear business boundaries.

---

# 📑 Table of Contents

- Introduction
- Module Overview
- Column Philosophy
- Why Columns Exist
- Workflow Organization
- Column Lifecycle
- Standard Workflow
- Creating a Column
- Updating a Column
- Reordering Columns
- Archiving Columns
- Restoring Columns
- Board Relationship
- WorkItems Relationship

---

# 📖 Introduction

A Column represents a stage within a board's workflow.

Every WorkItem belongs to exactly one column at any given moment, and moving a WorkItem between columns reflects its progress through the workflow.

The relationship between the core business entities is:

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

This hierarchy enables FlowForge to organize work in a structured, visual, and scalable manner.

---

# 🏛️ Module Overview

The Columns module manages the workflow stages inside a board.

Each board contains one or more columns representing different phases of work.

Typical capabilities include:

- Creating columns
- Updating column information
- Reordering columns
- Retrieving board columns
- Archiving columns
- Restoring archived columns

The module is intentionally focused on workflow organization rather than work execution.

---

## Responsibilities

The Columns module is responsible for:

✔ Managing workflow stages

✔ Maintaining column order

✔ Organizing WorkItems

✔ Supporting visual workflow management

✔ Preserving workflow consistency

✔ Providing the foundation for future automation

Columns do not contain business work themselves.

Instead, they provide the workflow structure within which WorkItems move.

---

# 🎯 Column Philosophy

Projects define business goals.

Boards define workspaces.

Columns define workflow.

Each column represents a meaningful stage in the execution of work.

For example:

```text
Backlog

Todo

In Progress

Testing

Review

Done
```

Rather than storing workflow information inside individual WorkItems, FlowForge models workflow as a first-class business concept through Columns.

This keeps workflows flexible and easy to evolve.

---

## Why Columns Exist

Columns provide:

- Workflow visibility
- Progress tracking
- Team coordination
- Visual organization
- Operational consistency
- Flexible process design

Without columns, teams would have no standardized method of tracking the progression of work.

---

# 🔄 Workflow Organization

Columns are displayed sequentially within a board.

Their order defines the natural flow of work.

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
Testing
    │
    ▼
Review
    │
    ▼
Done
```

Teams may customize this workflow to match their business processes.

Examples include:

Software Development

```text
Backlog
→ Sprint
→ Development
→ Testing
→ Deployment
→ Done
```

Marketing

```text
Ideas
→ Draft
→ Review
→ Approval
→ Published
```

Customer Support

```text
New
→ Assigned
→ Investigating
→ Waiting
→ Resolved
```

FlowForge treats these workflows as configurable rather than hardcoded.

---

# 🔄 Column Lifecycle

Columns follow a predictable lifecycle.

```text
Create
   │
   ▼
Active
   │
   ▼
Updated
   │
   ▼
Archived
   │
   ▼
Restored
```

Columns are archived rather than permanently deleted, preserving workflow history and WorkItem relationships.

---

## Lifecycle Philosophy

Workflow structures often evolve over time.

Instead of removing historical columns, FlowForge archives them to preserve:

- Historical reporting
- Audit trails
- Existing WorkItem relationships
- Workflow consistency

This approach prevents accidental data loss and supports long-term reporting.

---

# ➕ Creating a Column

Creating a column adds a new workflow stage to a board.

The process follows the standard FlowForge request pipeline.

```text
Create Column Request
        │
        ▼
Validation
        │
        ▼
Board Validation
        │
        ▼
ColumnRules
        │
        ▼
Column Entity Created
        │
        ▼
Database
        │
        ▼
Response DTO
```

Only after successful validation is the new column persisted.

---

## Responsibilities

Creating a column involves:

- Validating request data
- Verifying board existence
- Ensuring board accessibility
- Checking duplicate column names
- Determining display order
- Creating the Column entity
- Saving changes
- Returning a response

---

# ✏️ Updating a Column

Columns may evolve as workflows change.

Typical updates include:

- Name
- Description
- Color (future)
- WIP limit (future)
- Metadata

The update process preserves the column's identity while allowing workflow refinement.

---

## Update Workflow

```text
Update Request
      │
      ▼
Validation
      │
      ▼
ColumnRules
      │
      ▼
Load Column
      │
      ▼
Update Entity
      │
      ▼
Save Changes
```

All updates are validated before persistence.

---

# ↕️ Reordering Columns

Workflow order is fundamental to visual task management.

Each column has a position within its board.

Example:

```text
1. Backlog

2. Todo

3. In Progress

4. Testing

5. Done
```

Changing the order modifies the workflow presentation without affecting WorkItem ownership.

Future versions may support drag-and-drop reordering with automatic position recalculation.

---

# 📦 Archiving Columns

Columns are archived instead of deleted.

Archiving preserves:

- Workflow history
- Existing WorkItems
- Reporting consistency
- Audit information

```text
Active Column
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
Archived Column
```

This ensures historical integrity across the system.

---

# ♻️ Restoring Columns

Archived columns may be restored whenever required.

```text
Archived Column
        │
        ▼
Restore Request
        │
        ▼
ColumnRules
        │
        ▼
Restore()
        │
        ▼
Active Column
```

The original column is reactivated without recreating its associated data.

---

# 🔗 Board Relationship

Columns belong to exactly one board.

```text
Board
    │
    ├── Column 1
    ├── Column 2
    ├── Column 3
    └── Column 4
```

A board may contain many columns.

A column cannot exist independently of a board.

This relationship ensures that workflow definitions remain scoped to the appropriate workspace.

---

# 📝 WorkItems Relationship

Columns organize WorkItems according to workflow stage.

```text
Column
    │
    ├── WorkItem
    ├── WorkItem
    └── WorkItem
```

Moving a WorkItem between columns represents progress through the workflow.

The column determines the current stage of execution while the WorkItem retains its business identity.

---

# ⚖️ Business Rules

Business rules protect the integrity of workflow management.

Unlike request validation, which verifies whether incoming data is structurally correct, business rules determine whether an operation is allowed according to FlowForge's domain policies.

All business-specific rules are centralized within the `ColumnRules` class.

---

## Responsibilities

The `ColumnRules` class is responsible for validating conditions such as:

- Board existence
- Board active status
- Column existence
- Duplicate column names within the same board
- Valid column ordering
- Organization ownership
- Authorization to access the parent board
- Restrictions on archiving columns containing active WorkItems (future)

By centralizing these policies, handlers remain focused on coordinating the request rather than enforcing business logic.

---

## Validation vs Business Rules

Validation answers:

> "Is the request structurally valid?"

Business Rules answer:

> "Should this operation be allowed?"

Examples:

Validation:

- Column name is required.
- Column name length is valid.
- BoardId is provided.

Business Rules:

- The parent board must exist.
- The board must belong to the current organization.
- Column names must be unique within the board.
- The board must not be archived.
- Column position must be valid.

Separating these concerns improves readability, maintainability, and testability.

---

# ✔️ Validation

FlowForge uses **FluentValidation** to validate incoming commands before they reach the application layer.

Each command has a dedicated validator.

Typical validators include:

```text
CreateColumnValidator

UpdateColumnValidator

ReorderColumnsValidator
```

Validation responsibilities include:

- Required fields
- Maximum lengths
- Valid identifiers
- Position ranges
- Request consistency

Invalid requests are rejected immediately, preventing unnecessary database operations.

---

## Validation Pipeline

```text
HTTP Request
      │
      ▼
CreateColumnCommand
      │
      ▼
CreateColumnValidator
      │
      ▼
Valid Request
      │
      ▼
Handler
```

This pipeline is consistent across all FlowForge modules.

---

# 🌐 API Endpoints

The Columns module exposes RESTful endpoints for managing workflow stages.

---

## Create Column

```http
POST /api/columns
```

Creates a new column within a board.

---

## Get Columns

```http
GET /api/columns
```

Returns all columns belonging to a board.

---

## Get Column By Id

```http
GET /api/columns/{id}
```

Returns details for a single column.

---

## Update Column

```http
PUT /api/columns/{id}
```

Updates column information.

---

## Reorder Columns

```http
PATCH /api/columns/reorder
```

Updates the display order of one or more columns.

---

## Archive Column

```http
PATCH /api/columns/{id}/archive
```

Archives an active column.

---

## Restore Column

```http
PATCH /api/columns/{id}/restore
```

Restores a previously archived column.

---

# 🔄 Request Lifecycle

Every request follows the same execution pipeline.

```text
HTTP Request
      │
      ▼
ColumnsController
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
ColumnRules
      │
      ▼
Column Entity
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

Each layer has a single responsibility, ensuring consistency throughout the application.

---

# 🔒 Security & Authorization

Every column operation is protected through authentication and authorization.

Before any operation executes, FlowForge verifies:

- The user is authenticated.
- The JWT token is valid.
- The user belongs to the owning organization.
- The requested board belongs to the organization.
- The column belongs to the specified board.

Only after these checks succeed is the requested operation executed.

---

## Organization-Aware Access

Columns inherit their organization context through the board and project hierarchy.

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
```

This inheritance ensures strong tenant isolation without storing redundant organization information on every entity.

---

# 📊 Response Models

Each endpoint returns a dedicated response model.

Examples include:

```text
CreateColumnResponse

UpdateColumnResponse

GetColumnResponse

GetColumnsResponse

ReorderColumnsResponse

ArchiveColumnResponse

RestoreColumnResponse
```

Responses are wrapped using the shared `ApiResponse<T>` format, providing a predictable and consistent API contract.

---

# 📦 Module Dependencies

The Columns module depends on:

- ASP.NET Core Web API
- MediatR
- FluentValidation
- Entity Framework Core
- SQL Server
- ColumnRules
- Current User Service

Each dependency plays a specific role while preserving the principles of Clean Architecture.

---

# ⭐ Best Practices

Follow these practices when extending the Columns module.

✔ Keep columns lightweight.

✔ Never hardcode workflow stages.

✔ Allow workflows to remain configurable.

✔ Validate board ownership before every operation.

✔ Preserve column order consistently.

✔ Archive columns instead of deleting them.

✔ Keep business rules inside `ColumnRules`.

✔ Return dedicated response DTOs.

✔ Keep handlers focused on orchestration.

Following these practices ensures scalability and maintainability.

---

# 💼 Common Business Scenarios

## Creating a Workflow

```text
Board
   │
   ▼
Create Columns
   │
   ▼
Workflow Ready
```

---

## Moving Work Through a Workflow

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
Testing
    │
    ▼
Done
```

---

## Reordering Workflow

```text
Before

Todo
In Progress
Testing

↓

After

Todo
Development
Testing
Review
Done
```

Workflow changes affect presentation without altering WorkItem identity.

---

## Archiving a Column

```text
Column
   │
   ▼
Archive
   │
   ▼
Historical Workflow
```

This preserves workflow history while preventing new WorkItems from being placed into inactive stages.

---

# 🚀 Future Enhancements

The Columns module has been designed for future growth.

Potential enhancements include:

```text
Custom Colors

Column Icons

Work In Progress (WIP) Limits

Automatic Workflow Rules

Conditional Transitions

Required Approvals

Column Templates

Swimlanes

Time Tracking

Workflow Analytics

Cycle Time Metrics

Lead Time Reports

Automation Triggers
```

These features can be introduced without changing the module's architectural foundation.

---

# 📖 Summary

The Columns module provides the workflow foundation for all work execution within FlowForge.

It is responsible for:

- Creating workflow stages
- Organizing WorkItems
- Managing workflow order
- Supporting customizable processes
- Enforcing business rules
- Maintaining organization-aware security

Working alongside the **Projects** and **Boards** modules, Columns complete the structural hierarchy that enables teams to organize work in a flexible, visual, and scalable manner.

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, the module provides a robust foundation for workflow management while remaining adaptable to future business needs.

---

<div align="center">

# 📋 FlowForge Columns Module

### Building Flexible Workflows Through Structured, Configurable, and Scalable Column Management

*"Projects define the destination. Boards provide the workspace. Columns define the journey. Together they transform business processes into structured workflows, enabling teams to collaborate effectively while maintaining clarity, consistency, and scalability."*

</div>