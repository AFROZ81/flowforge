# 📁 FlowForge Projects Module

Projects are the central organizational unit within FlowForge.

Every piece of work performed inside the platform ultimately belongs to a project. Boards, WorkItems, reports, and future collaboration features all derive their context from the project they belong to.

The Projects module is therefore one of the most important business modules in the entire application.

Built using **CQRS**, **Vertical Slice Architecture**, **Clean Architecture**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, this module provides complete lifecycle management for projects while ensuring security, consistency, and scalability.

---

# 📑 Table of Contents

- Introduction
- Module Overview
- Project Philosophy
- Project Lifecycle
- Creating a Project
- Updating a Project
- Archiving a Project
- Restoring a Project
- Project Status
- Project Ownership
- Organization Relationship

---

# 📖 Introduction

A Project represents a collection of related work.

Instead of treating individual WorkItems as isolated tasks, FlowForge organizes work hierarchically.

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
WorkItem
```

This hierarchy keeps business data organized while enabling collaboration, reporting, and future expansion.

Without Projects, there would be no logical grouping for boards or WorkItems.

---

# 🏛️ Module Overview

The Projects module acts as the foundation for nearly every business feature within FlowForge.

Current capabilities include:

- Creating projects
- Retrieving projects
- Viewing project details
- Updating projects
- Archiving projects
- Restoring archived projects

Rather than permanently deleting business data, FlowForge preserves project history by supporting archival and restoration.

---

## Responsibilities

The module is responsible for:

✔ Managing project lifecycle

✔ Maintaining project information

✔ Validating ownership

✔ Enforcing business rules

✔ Providing project data to dependent modules

✔ Serving as the parent entity for boards

The module intentionally focuses only on project management.

Board management and WorkItem management belong to their respective modules.

---

# 🎯 Project Philosophy

FlowForge treats a Project as a long-lived business workspace rather than a temporary container.

Projects should represent meaningful business initiatives, products, departments, or customer engagements.

Examples include:

```text
Website Redesign

Mobile Banking Platform

Customer Portal

Marketing Campaign

ERP Implementation
```

Everything associated with these initiatives remains grouped within the project throughout its lifecycle.

---

## Why Projects Exist

Projects provide:

- Business organization
- Ownership boundaries
- Reporting scope
- Collaboration context
- Board grouping
- Future analytics

Without projects, related work would become fragmented across the system.

---

# 🔄 Project Lifecycle

Projects follow a predictable lifecycle.

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

Projects remain in the database throughout their lifecycle.

Archiving changes the operational state rather than deleting business information.

---

## Lifecycle Philosophy

FlowForge favors preserving business history.

Instead of deleting projects, archived projects remain available for:

- Historical reporting
- Audit trails
- Future restoration
- Data integrity

This approach protects business information while reducing accidental data loss.

---

# ➕ Creating a Project

Creating a project establishes a new workspace inside an organization.

A successful project creation performs several coordinated operations.

```text
Create Project Request
        │
        ▼
Validation
        │
        ▼
Business Rules
        │
        ▼
Project Entity Created
        │
        ▼
Database
        │
        ▼
Response DTO
```

Each stage has a clearly defined responsibility.

---

## Responsibilities

Creating a project involves:

- Validating request data
- Verifying organization ownership
- Checking duplicate names
- Creating the Project entity
- Persisting the project
- Returning a response

Only after all validations succeed is the project stored.

---

# ✏️ Updating a Project

Projects evolve throughout their lifetime.

Authorized users may update project information while preserving its identity.

Typical updates include:

- Name
- Description
- Metadata
- Configuration

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
ProjectRules
      │
      ▼
Load Project
      │
      ▼
Update Entity
      │
      ▼
Save Changes
```

Business rules ensure that invalid updates cannot be persisted.

---

# 📦 Archiving a Project

Projects are archived instead of deleted.

Archiving indicates that active work has concluded while preserving all associated business data.

Archived projects:

- Remain in the database
- Preserve relationships
- Maintain reporting history
- Can be restored later

This approach supports enterprise audit and compliance requirements.

---

## Archive Workflow

```text
Active Project
      │
      ▼
Archive Request
      │
      ▼
Business Validation
      │
      ▼
Archive()
      │
      ▼
Archived Project
```

The Project entity controls its own state transition through the `Archive()` behavior.

---

# ♻️ Restoring a Project

Archived projects may be returned to active use.

Restoration reverses the archived state while preserving all historical information.

```text
Archived Project
        │
        ▼
Restore Request
        │
        ▼
Business Rules
        │
        ▼
Restore()
        │
        ▼
Active Project
```

No project data is recreated.

The original project simply resumes active status.

---

# 📊 Project Status

Throughout its lifecycle, a project exists in one of several operational states.

Typical states include:

```text
Active

Archived
```

Future versions may introduce additional lifecycle states such as:

```text
Draft

Completed

On Hold

Cancelled
```

The Project entity remains responsible for managing valid state transitions.

---

# 👥 Project Ownership

Every project belongs to a single organization.

Ownership determines:

- Visibility
- Authorization
- Data isolation
- Reporting boundaries

Users can only interact with projects belonging to their organization.

This ensures strong tenant separation across the application.

---

# 🏢 Organization Relationship

Projects exist within an organization.

The relationship is straightforward.

```text
Organization
      │
      ▼
Project
```

An organization may contain many projects.

A project belongs to exactly one organization.

This relationship enables organization-aware authorization throughout the application.

Business rules ensure that users cannot create, update, or retrieve projects outside their own organization.

---

# 📋 Boards Integration

Projects serve as the parent entity for all boards within FlowForge.

A board cannot exist independently—it must always belong to a project.

This relationship establishes a clear hierarchy for organizing work and ensures that all boards inherit the context of their parent project.

```text
Project
    │
    ├──────────────► Board A
    │
    ├──────────────► Board B
    │
    └──────────────► Board C
```

Because boards are project-scoped, every board operation implicitly operates within the boundaries of its associated project.

---

## Why Boards Belong to Projects

Keeping boards inside projects provides several advantages.

- Logical grouping of work
- Consistent ownership
- Easier reporting
- Simpler authorization
- Better scalability

Projects define the business context, while boards define the workflow within that context.

---

# 📝 WorkItems Integration

WorkItems represent individual units of work.

Every WorkItem belongs to a board, which in turn belongs to a project.

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
WorkItem
```

This hierarchy ensures that every WorkItem can always be traced back to its project and organization.

---

## Why This Hierarchy Matters

The hierarchical structure enables:

- Organization-wide reporting
- Project-level dashboards
- Board-specific workflows
- Consistent authorization
- Simplified filtering

It also prevents orphaned business records by ensuring every WorkItem exists within a valid project context.

---

# ⚖️ Business Rules

Business rules enforce conditions that go beyond simple input validation.

Within the Projects module, these rules are centralized in the `ProjectRules` class.

Typical responsibilities include:

- Project existence validation
- Duplicate project name checks
- Archived state validation
- Organization ownership verification
- Permission checks

By separating business rules from handlers, FlowForge maintains a clean separation of responsibilities.

---

## Why Separate Business Rules?

Validation answers:

> "Is this request structurally valid?"

Business rules answer:

> "Is this business operation allowed?"

For example:

Validation:

- Name is required.
- Description length is valid.

Business Rules:

- Project name must be unique within the organization.
- Archived projects cannot be updated.
- Users cannot access projects outside their organization.

This separation improves readability, testing, and maintainability.

---

# ✔️ Validation

Request validation is handled using **FluentValidation**.

Each command has a dedicated validator responsible for verifying request data before the handler executes.

Examples include:

```text
CreateProjectValidator

UpdateProjectValidator
```

Typical validation checks include:

- Required fields
- Maximum length
- Valid identifiers
- Acceptable value ranges

Validation failures immediately stop request processing and return a consistent API response.

---

# 🌐 API Endpoints

The Projects module exposes RESTful endpoints for each supported operation.

---

## Create Project

```http
POST /api/projects
```

Creates a new project.

---

## Get Projects

```http
GET /api/projects
```

Returns all projects available to the authenticated user's organization.

---

## Get Project By Id

```http
GET /api/projects/{id}
```

Returns the details of a specific project.

---

## Update Project

```http
PUT /api/projects/{id}
```

Updates project information.

---

## Archive Project

```http
PATCH /api/projects/{id}/archive
```

Archives an active project.

---

## Restore Project

```http
PATCH /api/projects/{id}/restore
```

Restores a previously archived project.

---

# 🔄 Request Lifecycle

Every request handled by the Projects module follows the same processing pipeline.

```text
HTTP Request
      │
      ▼
ProjectsController
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
ProjectRules
      │
      ▼
Project Entity
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

This consistent flow ensures that every operation follows the same architectural standards used throughout FlowForge.

---

# 🔒 Security & Authorization

Security is enforced at multiple levels.

Authentication confirms the user's identity.

Authorization verifies that the user is allowed to interact with the requested project.

Current authorization includes:

- Authenticated user verification
- Organization ownership validation
- Protected API endpoints

Business operations execute only after all authorization checks succeed.

---

## Organization-Aware Access

Projects are isolated by organization.

```text
Organization A

    Projects A1
    Projects A2

Organization B

    Projects B1
    Projects B2
```

Users from one organization cannot access projects belonging to another organization.

This organization-aware approach forms the basis of FlowForge's multi-tenant architecture.

---

# 📊 Response Models

Each endpoint returns a dedicated response model tailored to its specific operation.

Examples include:

```text
CreateProjectResponse

UpdateProjectResponse

GetProjectByIdResponse

GetProjectsResponse

ArchiveProjectResponse

RestoreProjectResponse
```

Responses are wrapped using the shared `ApiResponse<T>` format to ensure consistency across the platform.

---

# 📦 Module Dependencies

The Projects module depends on the following components.

- ASP.NET Core Web API
- MediatR
- FluentValidation
- Entity Framework Core
- SQL Server
- ProjectRules
- Current User Service

Each dependency has a clearly defined responsibility and integrates cleanly within the overall architecture.

---

# ⭐ Best Practices

Follow these practices when extending the Projects module.

✔ Keep project operations independent.

✔ Place business rules in `ProjectRules`.

✔ Keep handlers focused on orchestration.

✔ Validate requests before executing business logic.

✔ Archive projects instead of deleting them.

✔ Return dedicated response DTOs.

✔ Enforce organization ownership on every operation.

✔ Preserve project history whenever possible.

---

# 💼 Common Business Scenarios

The Projects module supports several common workflows.

---

## Creating a New Project

```text
Organization
      │
      ▼
Create Project
      │
      ▼
Project Ready
      │
      ▼
Boards Can Be Added
```

---

## Updating an Existing Project

```text
Project
    │
    ▼
Update Request
    │
    ▼
Validation
    │
    ▼
Updated Project
```

---

## Archiving a Project

```text
Active Project
      │
      ▼
Archive
      │
      ▼
Historical Storage
```

---

## Restoring a Project

```text
Archived Project
        │
        ▼
Restore
        │
        ▼
Active Project
```

These workflows preserve business continuity while maintaining historical records.

---

# 🚀 Future Enhancements

The Projects module is designed to evolve alongside the platform.

Potential future capabilities include:

```text
Project Templates

Project Categories

Project Labels

Project Favorites

Project Analytics

Project Activity Timeline

Project Members

Project Permissions

Project Dashboard

Completion Metrics
```

Each enhancement can be added without disrupting the existing architecture because responsibilities remain clearly separated.

---

# 📖 Summary

The Projects module is the foundation of work organization within FlowForge.

It is responsible for:

- Creating projects
- Managing project lifecycle
- Organizing boards
- Establishing ownership
- Enforcing business rules
- Supporting organization-aware authorization

Built using **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **FluentValidation**, and **Entity Framework Core**, the module provides a scalable and maintainable foundation for organizing work across the platform.

As additional modules such as Boards, WorkItems, Members, and Reporting are introduced, they will build upon the Projects module while preserving the same architectural principles and business consistency.

---

<div align="center">

# 📁 FlowForge Projects Module

### Organizing Business Work Through Structured, Secure, and Scalable Project Management

*"Projects provide context, boards provide workflow, and WorkItems represent execution. Together they form the foundation upon which every business activity in FlowForge is organized, tracked, and delivered."*

</div>