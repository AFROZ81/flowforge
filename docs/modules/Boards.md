# 📋 FlowForge Boards Module

Boards provide the operational workspace where teams organize, track, and execute work within a project.

While Projects represent business initiatives, Boards define how work is structured and progresses. Every board belongs to exactly one project and inherits its organizational context, security boundaries, and business ownership.

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, the Boards module provides complete lifecycle management while maintaining consistency, scalability, and security across the platform.

---

# 📑 Table of Contents

- Introduction
- Module Overview
- Board Philosophy
- Board Lifecycle
- Creating a Board
- Updating a Board
- Archiving a Board
- Restoring a Board
- Board Status
- Project Relationship
- WorkItems Relationship

---

# 📖 Introduction

A board represents a workspace inside a project.

It provides the environment where WorkItems are organized, prioritized, assigned, and tracked throughout their lifecycle.

The relationship between the major business entities is:

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
WorkItems
```

Every WorkItem exists because of a board, and every board exists because of a project.

This hierarchy creates a clear structure for organizing business activities.

---

# 🏛️ Module Overview

The Boards module is responsible for managing the complete lifecycle of boards within a project.

Current capabilities include:

- Creating boards
- Retrieving boards
- Viewing board details
- Updating boards
- Archiving boards
- Restoring archived boards

The module ensures that every board remains associated with a valid project and organization.

---

## Responsibilities

The Boards module is responsible for:

✔ Creating project workspaces

✔ Managing board information

✔ Enforcing project ownership

✔ Validating business rules

✔ Organizing WorkItems

✔ Supporting future workflow customization

The module does not manage WorkItems directly.

Instead, it provides the structure within which WorkItems operate.

---

# 🎯 Board Philosophy

Projects answer:

> **What are we working on?**

Boards answer:

> **How are we organizing that work?**

A project may contain multiple boards, each representing a different workflow, department, sprint, or operational area.

Examples include:

```text
Development

Testing

Marketing

Sprint Planning

Product Backlog

Customer Support
```

Each board provides a focused workspace while remaining connected to its parent project.

---

## Why Boards Exist

Boards provide:

- Workflow organization
- Visual work management
- Team collaboration
- Progress tracking
- Department separation
- Flexible work structures

Without boards, WorkItems would have no meaningful workflow context.

---

# 🔄 Board Lifecycle

Boards follow a predictable lifecycle.

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

Throughout this lifecycle, the board remains associated with its parent project.

Historical information is preserved through archival rather than deletion.

---

## Lifecycle Philosophy

FlowForge favors preserving business history over permanent deletion.

Archived boards:

- Remain in the database
- Preserve WorkItem relationships
- Support reporting
- Can be restored
- Protect historical records

This approach improves traceability and reduces accidental data loss.

---

# ➕ Creating a Board

Creating a board establishes a new workspace inside an existing project.

Before a board is created, several validations occur.

```text
Create Board Request
        │
        ▼
Request Validation
        │
        ▼
Project Validation
        │
        ▼
BoardRules
        │
        ▼
Board Entity Created
        │
        ▼
Database
        │
        ▼
Response DTO
```

Only after all validations succeed is the board persisted.

---

## Responsibilities

Creating a board includes:

- Validating request data
- Verifying project existence
- Ensuring the project is active
- Checking duplicate board names
- Creating the Board entity
- Saving changes
- Returning a response

Every board is linked to its parent project during creation.

---

# ✏️ Updating a Board

Boards evolve alongside the project they support.

Authorized users may update board information while preserving its identity and relationships.

Typical updates include:

- Name
- Description
- Configuration
- Metadata

The update process follows the same architectural pipeline used throughout FlowForge.

---

## Update Workflow

```text
Update Request
      │
      ▼
Validation
      │
      ▼
BoardRules
      │
      ▼
Load Board
      │
      ▼
Update Entity
      │
      ▼
Save Changes
```

Business rules ensure that only valid updates are persisted.

---

# 📦 Archiving a Board

Boards are archived instead of deleted.

Archiving indicates that the board is no longer active while preserving its relationship with the project and its WorkItems.

Archived boards:

- Remain available
- Preserve historical data
- Can be restored
- Continue supporting reporting

This approach aligns with FlowForge's philosophy of protecting business history.

---

## Archive Workflow

```text
Active Board
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
Archived Board
```

The Board entity controls its own state transitions through its domain behavior.

---

# ♻️ Restoring a Board

Archived boards may be restored whenever work needs to resume.

```text
Archived Board
        │
        ▼
Restore Request
        │
        ▼
BoardRules
        │
        ▼
Restore()
        │
        ▼
Active Board
```

Restoration reactivates the original board without recreating its data or relationships.

---

# 📊 Board Status

Throughout its lifecycle, a board typically exists in one of two operational states.

```text
Active

Archived
```

Future versions may introduce additional states such as:

```text
Draft

Completed

Read Only

Template
```

The Board entity remains responsible for managing valid state transitions.

---

# 🔗 Project Relationship

Every board belongs to exactly one project.

```text
Project
      │
      ├────────────► Board A
      │
      ├────────────► Board B
      │
      └────────────► Board C
```

A project may contain many boards.

A board cannot exist without a project.

Before any board operation executes, FlowForge validates:

- Project existence
- Project status
- Organization ownership
- User authorization

This guarantees consistency across all business operations.

---

# 📝 WorkItems Relationship

Boards serve as the parent entity for WorkItems.

```text
Board
    │
    ├────────────► WorkItem
    ├────────────► WorkItem
    └────────────► WorkItem
```

Every WorkItem belongs to a board.

The board determines the workflow context within which WorkItems are created, assigned, prioritized, and completed.

By separating project organization from board workflow, FlowForge provides a flexible and scalable model for managing work.

---

# ⚖️ Business Rules

Business rules enforce the operational integrity of the Boards module.

Unlike request validation, which verifies whether incoming data is structurally correct, business rules determine whether an operation is permitted according to the application's domain policies.

FlowForge centralizes these rules within the `BoardRules` class.

---

## Responsibilities

The `BoardRules` class is responsible for validating conditions such as:

- Project existence
- Project active status
- Board existence
- Board archive status
- Duplicate board names within the same project
- Organization ownership
- Authorization to access the parent project

By centralizing these checks, handlers remain focused on orchestrating business workflows rather than implementing validation logic.

---

## Validation vs Business Rules

Validation answers:

> "Is the request structurally valid?"

Business Rules answer:

> "Is this operation allowed?"

Examples:

Validation:

- Board name is required.
- Name length is within allowed limits.

Business Rules:

- Parent project must exist.
- Parent project must not be archived.
- Board name must be unique within the project.
- User must belong to the owning organization.

Separating these responsibilities improves maintainability and simplifies testing.

---

# ✔️ Validation

FlowForge uses **FluentValidation** to validate incoming commands before business logic executes.

Dedicated validators ensure that requests contain valid data before they reach their handlers.

Current validators include:

```text
CreateBoardValidator

UpdateBoardValidator
```

Typical validation includes:

- Required fields
- Maximum lengths
- Valid identifiers
- Acceptable value ranges

Validation failures prevent the request from progressing any further.

---

## Validation Flow

```text
HTTP Request
      │
      ▼
CreateBoardCommand
      │
      ▼
CreateBoardValidator
      │
      ▼
Valid Request
      │
      ▼
Board Handler
```

This consistent validation pipeline ensures predictable request processing across the application.

---

# 🌐 API Endpoints

The Boards module exposes RESTful endpoints for each supported operation.

---

## Create Board

```http
POST /api/boards
```

Creates a new board within a project.

---

## Get Boards

```http
GET /api/boards
```

Returns all boards accessible to the authenticated user's organization.

---

## Get Board By Id

```http
GET /api/boards/{id}
```

Returns detailed information about a specific board.

---

## Update Board

```http
PUT /api/boards/{id}
```

Updates board information.

---

## Archive Board

```http
PATCH /api/boards/{id}/archive
```

Archives an active board.

---

## Restore Board

```http
PATCH /api/boards/{id}/restore
```

Restores a previously archived board.

---

# 🔄 Request Lifecycle

Every request follows the same architectural pipeline.

```text
HTTP Request
      │
      ▼
BoardsController
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
BoardRules
      │
      ▼
Board Entity
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

Every component has a clearly defined responsibility.

This predictable request lifecycle keeps the module consistent with the rest of FlowForge.

---

# 🔒 Security & Authorization

Every board operation is protected by authentication and authorization.

Before any business operation executes, FlowForge verifies:

- The user is authenticated.
- The JWT token is valid.
- The user belongs to the owning organization.
- The associated project is accessible.
- The requested board belongs to that project.

Only after these checks succeed is business logic executed.

---

## Organization-Aware Access

Boards inherit the organization context from their parent project.

```text
Organization A

    Project A
        │
        ├── Board A1
        └── Board A2

Organization B

    Project B
        │
        ├── Board B1
        └── Board B2
```

Users cannot access boards that belong to projects owned by another organization.

This organization-aware model provides strong tenant isolation throughout the application.

---

# 📊 Response Models

Each endpoint returns a dedicated response model.

Examples include:

```text
CreateBoardResponse

UpdateBoardResponse

GetBoardByIdResponse

GetBoardsResponse

ArchiveBoardResponse

RestoreBoardResponse
```

All responses follow the shared `ApiResponse<T>` format used consistently throughout FlowForge.

This provides a predictable API experience for client applications.

---

# 📦 Module Dependencies

The Boards module depends on:

- ASP.NET Core Web API
- MediatR
- FluentValidation
- Entity Framework Core
- SQL Server
- BoardRules
- Current User Service

Each dependency serves a specific purpose and integrates within the application's Clean Architecture.

---

# ⭐ Best Practices

When extending the Boards module, follow these guidelines.

✔ Keep board operations independent.

✔ Validate requests before business rules execute.

✔ Place business policies inside `BoardRules`.

✔ Keep handlers focused on orchestration.

✔ Archive boards instead of deleting them.

✔ Return dedicated response DTOs.

✔ Validate project ownership before every board operation.

✔ Preserve historical information wherever possible.

Following these practices keeps the module maintainable and consistent with the rest of the platform.

---

# 💼 Common Business Scenarios

The Boards module supports several common workflows.

---

## Creating a Board

```text
Project
    │
    ▼
Create Board
    │
    ▼
Board Ready
    │
    ▼
WorkItems Can Be Added
```

---

## Updating a Board

```text
Board
   │
   ▼
Update Request
   │
   ▼
Validation
   │
   ▼
Updated Board
```

---

## Archiving a Board

```text
Active Board
      │
      ▼
Archive
      │
      ▼
Historical Storage
```

---

## Restoring a Board

```text
Archived Board
        │
        ▼
Restore
        │
        ▼
Active Board
```

These workflows preserve business continuity while maintaining historical data.

---

# 🚀 Future Enhancements

The Boards module has been designed for future growth.

Potential enhancements include:

```text
Board Templates

Custom Workflows

Custom Columns

Swimlanes

Automation Rules

Board Analytics

Board Activity Timeline

Board Permissions

Sprint Boards

Kanban Boards
```

These features can be introduced without changing the module's core architecture because responsibilities remain well separated.

---

# 📖 Summary

The Boards module provides structured workspaces for organizing and managing work within projects.

It is responsible for:

- Creating boards
- Managing board lifecycle
- Organizing WorkItems
- Enforcing business rules
- Validating project ownership
- Supporting organization-aware authorization

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, the module provides a secure and scalable foundation for workflow management.

Together with the **Projects** module, it establishes the hierarchy that supports all work execution within FlowForge.

---

<div align="center">

# 📋 FlowForge Boards Module

### Organizing Workflow Through Structured, Secure, and Scalable Board Management

*"Projects define the business objective. Boards define the workflow. WorkItems represent execution. Together they create a structured system that enables teams to organize, collaborate, and deliver work efficiently while preserving consistency across the entire FlowForge platform."*

</div>