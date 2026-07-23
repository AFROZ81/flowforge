# Command Query Responsibility Segregation (CQRS)

This document describes how FlowForge implements the **Command Query Responsibility Segregation (CQRS)** pattern.

CQRS is one of the core architectural patterns used throughout the application. Every feature in FlowForge follows this pattern to provide clear separation between operations that modify data and operations that retrieve data.

---

# Table of Contents

- Overview
- Why CQRS?
- Commands
- Queries
- Command Flow
- Query Flow
- Folder Structure
- Validation
- Business Rules
- MediatR Integration
- Benefits
- Best Practices
- Summary

---

# What is CQRS?

CQRS stands for **Command Query Responsibility Segregation**.

Instead of treating every operation as a generic service method, CQRS separates operations into two categories.

- Commands
- Queries

Each category has a single responsibility.

---

# Commands

Commands modify application state.

Examples include:

- Create Project
- Update Project
- Archive Project
- Restore Project
- Create Board
- Update Board

Commands should never return large datasets.

A command typically returns:

- Success indicator
- Created identifier
- Small response DTO
- Error information

---

# Queries

Queries retrieve data.

Examples include:

- Get Project
- Get Projects
- Get Board
- Get Boards

Queries never modify data.

A query should always be free of side effects.

---

# Why CQRS?

Without CQRS, applications often evolve into large service classes containing unrelated methods.

Example:

```text
ProjectService

Create()

Update()

Delete()

Archive()

Restore()

Get()

GetAll()

Search()

Sort()

Filter()
```

As the application grows, these services become increasingly difficult to maintain.

CQRS avoids this by giving each operation its own implementation.

---

# FlowForge Feature Structure

Every feature follows the same organization.

Example:

```text
Projects

├── Commands
│
│   ├── CreateProject
│   ├── UpdateProject
│   ├── ArchiveProject
│   └── RestoreProject
│
├── Queries
│
│   ├── GetProjectById
│   └── GetProjects
│
├── Rules
│
└── DTOs
```

Boards, Columns, Tasks, and future modules follow the same convention.

---

# Command Flow

A command travels through several stages before reaching the database.

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Command
      │
      ▼
FluentValidation
      │
      ▼
Handler
      │
      ▼
Business Rules
      │
      ▼
Domain Entity
      │
      ▼
DbContext
      │
      ▼
Database
```

Each stage has a single responsibility.

---

# Query Flow

Queries follow a simpler pipeline.

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Query
      │
      ▼
Handler
      │
      ▼
DbContext
      │
      ▼
Database
      │
      ▼
Response DTO
```

Queries do not execute business state transitions.

---

# MediatR

FlowForge uses MediatR to dispatch every command and query.

Example:

```csharp
await _mediator.Send(command);
```

The controller does not know how the request is processed.

It simply sends the request to MediatR.

---

# Validation

Every command has its own validator.

Example:

```text
CreateProjectValidator

UpdateProjectValidator

CreateBoardValidator
```

Validation occurs before the handler executes.

Only input validation belongs here.

Business rules belong elsewhere.

---

# Business Rules

Business rules are enforced after validation.

Examples:

- Duplicate project names
- Archived entities
- Organization ownership
- Parent existence

These rules are implemented using dedicated rule classes.

Example:

```text
ProjectRules

BoardRules
```

---

# Handler Responsibilities

Handlers coordinate the workflow.

A handler should:

- Retrieve required entities
- Invoke business rules
- Call entity methods
- Persist changes
- Return a response

Handlers should **not** contain business policies.

---

# Response Objects

Every operation returns a dedicated response object.

Example:

```text
CreateProjectResponse

GetProjectsResponse

UpdateBoardResponse
```

This keeps API contracts explicit and avoids leaking domain entities.

---

# Folder Convention

Every command follows the same layout.

```text
CreateProject

├── CreateProjectCommand.cs
├── CreateProjectHandler.cs
├── CreateProjectValidator.cs
└── CreateProjectResponse.cs
```

Queries follow a similar convention.

---

# Benefits

Using CQRS provides several advantages.

- Smaller classes
- Better separation of concerns
- Easier testing
- Better discoverability
- Consistent feature organization
- Independent evolution of read and write operations

---

# Best Practices

✔ One handler per command.

✔ One handler per query.

✔ Keep handlers focused on orchestration.

✔ Keep controllers thin.

✔ Validate requests before execution.

✔ Encapsulate business logic in the domain.

✔ Return DTOs instead of domain entities.

✔ Maintain consistent folder structure.

---

# Common Mistakes

Avoid the following patterns.

❌ Combining reads and writes in the same handler.

❌ Returning entities directly from the API.

❌ Placing business rules inside validators.

❌ Using handlers as service classes.

❌ Injecting unnecessary dependencies.

---

# Summary

CQRS is one of the foundational architectural patterns used throughout FlowForge.

By separating commands from queries, FlowForge keeps write operations, read operations, validation, business rules, and request handling clearly organized.

Every feature in the application should follow this pattern to ensure consistency, maintainability, and scalability.