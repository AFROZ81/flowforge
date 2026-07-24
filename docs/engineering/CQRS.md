# ⚖️ FlowForge Command Query Responsibility Segregation (CQRS)

Command Query Responsibility Segregation (CQRS) is one of the fundamental architectural patterns used throughout FlowForge.

Rather than treating every operation as a generic service method, CQRS separates application behavior into **commands** that modify state and **queries** that retrieve data.

This separation improves maintainability, scalability, readability, and testability while aligning naturally with **Vertical Slice Architecture**, **Clean Architecture**, and **MediatR**.

---

# 📑 Table of Contents

- Introduction
- CQRS Philosophy
- Why CQRS?
- Traditional CRUD vs CQRS
- Commands
- Queries
- MediatR Integration
- Request Lifecycle

---

# 📖 Introduction

Every business capability in FlowForge is implemented using CQRS.

Examples include:

- Create Project
- Update Project
- Archive Board
- Restore Column
- Move WorkItem
- Get Projects
- Get Boards
- Get WorkItems

Rather than grouping all operations into one service class, every operation becomes its own independent request.

This results in:

- Smaller classes
- Clear responsibilities
- Easier navigation
- Better scalability
- Simpler testing

---

# 🎯 CQRS Philosophy

The central idea behind CQRS is simple:

> **Commands change the system. Queries read the system. They should never do both.**

Every request has exactly one responsibility.

Instead of creating large service classes, FlowForge models business operations as individual requests.

This approach makes the intent of every operation immediately obvious.

---

## One Request, One Responsibility

Examples of commands:

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveBoardCommand

MoveWorkItemCommand
```

Examples of queries:

```text
GetProjectsQuery

GetProjectByIdQuery

GetBoardsQuery

GetWorkItemsQuery
```

Every request has:

- One purpose
- One handler
- One validator (if applicable)
- One response model

---

# ❓ Why CQRS?

As applications grow, traditional CRUD services often become large and difficult to maintain.

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

Export()
```

Over time, these service classes accumulate unrelated responsibilities.

CQRS avoids this problem by giving each operation its own implementation.

Instead of one large class, FlowForge has many small, focused request handlers.

---

## Benefits of Separation

Separating reads from writes provides several advantages:

- Easier reasoning about code
- Better separation of concerns
- Independent evolution of operations
- Reduced class complexity
- More focused testing
- Improved discoverability

Each request becomes easier to understand because it performs exactly one task.

---

# 🏛️ Traditional CRUD vs CQRS

Traditional CRUD architecture often routes every request through the same service.

```text
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

As the application grows, the service layer often becomes increasingly complex.

CQRS separates reads and writes into independent execution paths.

```text
                Controller
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Command                Query
          │                     │
          ▼                     ▼
     Validator            Query Handler
          │                     │
          ▼                     ▼
   Command Handler         Database
          │                     │
          ▼                     ▼
      Database            Response DTO
```

Each side evolves independently while remaining easy to understand.

---

# ✍️ Commands

Commands represent operations that modify application state.

Examples include:

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveProjectCommand

RestoreProjectCommand

CreateBoardCommand

MoveWorkItemCommand
```

Commands should:

- Represent one business action
- Contain only required input
- Never return large datasets
- Express intent clearly

Typical command responses include:

- Success indicator
- Created identifier
- Small response DTO
- Validation errors
- Business error messages

Commands should never return entire domain entities.

---

## Command Characteristics

A command:

✔ Changes application state.

✔ May create data.

✔ May update data.

✔ May archive data.

✔ May trigger business rules.

✔ May publish domain events in the future.

A command should never behave like a query.

---

# 🔍 Queries

Queries retrieve information without modifying application state.

Examples include:

```text
GetProjectsQuery

GetProjectByIdQuery

GetBoardsQuery

GetColumnsQuery

GetWorkItemsQuery
```

Queries should:

- Be side-effect free
- Return DTOs
- Never change data
- Never invoke business state transitions

Queries should focus exclusively on efficient data retrieval.

---

## Query Characteristics

A query:

✔ Reads data.

✔ Returns DTOs.

✔ Does not modify entities.

✔ Does not execute business workflows.

✔ Can be optimized independently of commands.

Keeping queries read-only simplifies both reasoning and testing.

---

# 📬 MediatR Integration

FlowForge uses **MediatR** to dispatch every command and query.

Controllers remain extremely lightweight.

Typical controller behavior:

```csharp
await _mediator.Send(command);
```

The controller does not know:

- Which handler executes
- How validation occurs
- How business rules are enforced
- How persistence is performed

It simply forwards the request to the mediator.

This keeps controllers clean and focused on HTTP concerns.

---

## Benefits of MediatR

Using MediatR provides:

- Reduced coupling
- Clear request dispatching
- Easier testing
- Consistent request pipeline
- Better separation of concerns

Every request follows the same execution model regardless of feature.

---

# 🔄 Request Lifecycle

Every CQRS request follows the same execution pipeline.

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
Command / Query
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
Entity Framework Core
      │
      ▼
SQL Server
      │
      ▼
ApiResponse<T>
      │
      ▼
HTTP Response
```

This consistent lifecycle ensures that every request is validated, processed, and returned using the same architectural conventions.

---

## Example Request

Creating a project follows this flow:

```text
POST /api/projects
        │
        ▼
CreateProjectCommand
        │
        ▼
CreateProjectValidator
        │
        ▼
CreateProjectHandler
        │
        ▼
Project Entity
        │
        ▼
Database
        │
        ▼
CreateProjectResponse
```

Each stage has a clearly defined responsibility and contributes to a predictable execution pipeline.

---

# ✅ Validation Pipeline

Before any command reaches its handler, FlowForge validates the incoming request using **FluentValidation**.

Validation is responsible only for ensuring that the request is structurally correct.

Typical validation includes:

- Required fields
- Maximum and minimum lengths
- String formats
- Numeric ranges
- Collection constraints
- Basic input consistency

Example:

```text
CreateProjectCommand
        │
        ▼
CreateProjectValidator
        │
        ▼
Valid Request
        │
        ▼
CreateProjectHandler
```

If validation fails, the request never reaches the handler.

This prevents unnecessary processing and keeps handlers focused on business workflows.

---

## Validation vs Business Rules

Validation answers the question:

> **"Is the request valid?"**

Examples:

✔ Project name is required.

✔ Name must be fewer than 100 characters.

✔ OrganizationId is provided.

✔ StartDate is a valid date.

Business rules answer a different question:

> **"Is the requested operation allowed?"**

Examples:

✔ Project name must be unique within the organization.

✔ Archived projects cannot be updated.

✔ A board cannot be created for an archived project.

✔ A WorkItem cannot be moved to a completed column.

Keeping these responsibilities separate results in simpler validators and cleaner handlers.

---

# 🏛️ Business Rules

Business rules enforce the policies that govern how the system behaves.

Unlike validators, business rules usually require access to existing application state.

Examples include:

- Duplicate project detection
- Organization ownership checks
- Archived entity restrictions
- Parent-child relationship validation
- Permission verification

FlowForge encapsulates these policies inside dedicated rule classes whenever appropriate.

Example:

```text
ProjectRules

BoardRules

ColumnRules

WorkItemRules
```

Handlers coordinate these rules rather than implementing all of the business logic directly.

---

## Handler Responsibilities

Handlers orchestrate the execution of a request.

A typical handler should:

- Retrieve required entities
- Execute business rules
- Invoke domain behavior
- Persist changes
- Return a response model

Handlers should **not** become large service classes or contain unrelated business logic.

---

# 📦 Response Models

Every request returns a dedicated response model.

Examples include:

```text
CreateProjectResponse

UpdateProjectResponse

GetProjectsResponse

GetBoardResponse

MoveWorkItemResponse
```

Using dedicated response models provides several benefits:

- Stable API contracts
- Explicit responses
- Better API documentation
- No exposure of internal domain entities

Domain entities remain internal to the application and are never returned directly to API consumers.

---

## Why Not Return Entities?

Returning entities directly can:

- Leak internal implementation details
- Expose sensitive properties
- Create unnecessary coupling
- Make future changes difficult

Instead, handlers return response models designed specifically for the API.

---

# 🧩 Relationship with Vertical Slice Architecture

CQRS and Vertical Slice Architecture are closely related, but they solve different problems.

| Vertical Slice Architecture | CQRS |
|----------------------------|------|
| Organizes code by feature | Organizes requests by responsibility |
| Groups related files | Separates reads from writes |
| Improves discoverability | Improves request design |
| Defines folder structure | Defines request types |

For example:

```text
Projects

├── Commands

│   ├── CreateProject
│   ├── UpdateProject
│   └── ArchiveProject

├── Queries

│   ├── GetProjectById
│   └── GetProjects

├── Rules

└── DTOs
```

Vertical Slice Architecture determines **where** code lives.

CQRS determines **how** each request is implemented.

Together they create a predictable and scalable project structure.

---

# 🏗️ Relationship with Clean Architecture

CQRS fits naturally within the boundaries of Clean Architecture.

```text
Presentation
      │
      ▼
Application
      │
      ▼
Domain

Infrastructure
      ▲
```

The Application layer contains:

- Commands
- Queries
- Handlers
- Validators
- Response models

Handlers depend on abstractions such as `IApplicationDbContext` rather than infrastructure implementations.

This preserves the dependency direction required by Clean Architecture.

---

# 🧪 Testing Strategy

CQRS encourages focused and isolated testing.

Each request can be tested independently.

Typical tests include:

```text
CreateProject

├── Validator Tests

├── Handler Tests

└── Integration Tests
```

Validation tests verify request correctness.

Handler tests verify orchestration and business workflows.

Integration tests verify end-to-end execution against the persistence layer.

This separation results in faster and more maintainable test suites.

---

# 🌟 Benefits

Adopting CQRS throughout FlowForge provides significant advantages.

---

## Clear Responsibilities

Every request performs one business operation.

---

## Smaller Classes

Large service classes are replaced with focused handlers.

---

## Better Maintainability

Changes typically affect only one request instead of many unrelated operations.

---

## Improved Discoverability

Developers can quickly locate the implementation of a business operation.

---

## Easier Testing

Commands and queries can be tested independently.

---

## Better Scalability

As the application grows, new business capabilities are introduced as new requests rather than expanding existing services.

---

# 📋 Best Practices

Follow these practices consistently across the solution.

✔ One handler per command.

✔ One handler per query.

✔ One responsibility per request.

✔ Keep controllers thin.

✔ Validate requests before execution.

✔ Keep handlers focused on orchestration.

✔ Place business policies in rule classes or the Domain layer.

✔ Return dedicated response models.

✔ Use meaningful request names.

✔ Follow consistent folder conventions.

---

# ⚠️ Common Anti-Patterns

Avoid the following patterns.

---

## Mixing Reads and Writes

A query should never modify application state.

A command should never behave like a query.

---

## Fat Handlers

Handlers should coordinate work, not become monolithic business services.

---

## Business Logic in Validators

Validators verify request structure.

Business rules belong in rule classes or the Domain layer.

---

## Returning Domain Entities

Always return response models instead of exposing entities directly.

---

## Generic Service Classes

Avoid introducing large shared service classes that duplicate the responsibilities already provided by CQRS handlers.

---

## Excessive Dependencies

Inject only the dependencies required by a handler.

Keeping handlers lightweight improves readability and testing.

---

# 🚀 Future Evolution

As FlowForge continues to evolve, CQRS will remain the standard pattern for implementing every new business capability.

Future requests may include:

```text
CreateCommentCommand

GetNotificationsQuery

AssignWorkItemCommand

UploadAttachmentCommand

GetDashboardQuery

ArchiveOrganizationCommand
```

Every new request will follow the same conventions established throughout the application.

This consistency enables the solution to scale while remaining easy to understand.

---

# 📖 Summary

Command Query Responsibility Segregation is one of the core architectural patterns that powers FlowForge.

By separating write operations from read operations, CQRS creates a codebase that is easier to navigate, easier to test, and easier to maintain.

Combined with:

- Clean Architecture
- Vertical Slice Architecture
- MediatR
- FluentValidation
- Entity Framework Core

CQRS provides a consistent execution model for every feature in the application.

Every command, every query, and every handler follows the same architectural conventions, ensuring that FlowForge remains scalable, predictable, and maintainable as new business capabilities are introduced.

---

<div align="center">

# ⚖️ FlowForge CQRS

### Separating Reads from Writes for a Cleaner, More Maintainable Architecture

*"Every request should have one responsibility. Commands change the system. Queries understand the system."*

</div>