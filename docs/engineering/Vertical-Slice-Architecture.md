# 🧩 FlowForge Vertical Slice Architecture

Vertical Slice Architecture (VSA) is one of the foundational architectural patterns used throughout FlowForge.

Unlike traditional layered architectures that organize code by technical responsibilities, Vertical Slice Architecture organizes the application around **business capabilities**.

Each feature contains everything required to implement a complete business operation, making the codebase easier to navigate, maintain, and extend.

Together with **Clean Architecture** and **CQRS**, Vertical Slice Architecture forms the foundation of FlowForge's application layer.

---

# 📑 Table of Contents

- Introduction
- Vertical Slice Philosophy
- Why Vertical Slice Architecture?
- Traditional Layered Architecture
- Vertical Slice Architecture
- Feature-Based Organization
- Folder Structure
- Anatomy of a Slice

---

# 📖 Introduction

As enterprise applications grow, organizing code becomes increasingly important.

Traditional applications often separate code into technical layers such as:

- Controllers
- Services
- Repositories
- DTOs
- Validators

While technically organized, this approach often scatters a single business feature across many different folders.

FlowForge instead organizes code around business capabilities.

Examples include:

- Authentication
- Organizations
- Projects
- Boards
- Columns
- WorkItems

Each feature becomes a self-contained unit that is easier to understand, develop, and maintain.

---

# 🎯 Vertical Slice Philosophy

The central idea behind Vertical Slice Architecture is simple:

> **Organize code by what the business does, not by what the code is.**

Instead of asking:

> "Where are all the services?"

developers ask:

> "Where is the Projects feature?"

Everything required for that feature lives together.

This significantly reduces the cognitive effort required to understand a feature.

---

## A Slice Represents a Business Capability

Each slice represents one business capability.

Examples:

```text
Projects

Boards

Columns

WorkItems

Authentication
```

Within each feature, operations are further organized into:

- Commands
- Queries
- Rules
- DTOs

Each operation is responsible for a single business action.

---

# ❓ Why Vertical Slice Architecture?

FlowForge uses Vertical Slice Architecture because it scales better than traditional layered approaches.

As applications grow, developers spend more time navigating the project than writing business logic.

Vertical Slice Architecture minimizes this problem by keeping related code together.

Benefits include:

- Better discoverability
- Reduced coupling
- Faster onboarding
- Easier maintenance
- Independent feature evolution
- Clear ownership of business capabilities

---

## The Problem with Layered Architecture

Consider implementing **Create Project** in a traditional application.

You may need to modify:

```text
Controllers/
    ProjectsController.cs

Services/
    ProjectService.cs

Repositories/
    ProjectRepository.cs

DTOs/
    ProjectDto.cs

Validators/
    ProjectValidator.cs
```

Although technically separated, the feature itself is fragmented across multiple directories.

Understanding one business operation requires navigating many unrelated folders.

---

# 🏛️ Traditional Layered Architecture

Traditional enterprise applications are typically organized like this:

```text
Controllers/

Services/

Repositories/

DTOs/

Validators/

Models/
```

Responsibilities are grouped by technical concern rather than business capability.

Advantages:

- Familiar structure
- Clear technical separation
- Easy for small projects

Disadvantages:

- Business features become fragmented
- Navigation becomes difficult
- Generic services grow excessively
- High coupling between layers

As projects evolve, service classes often become large and difficult to maintain.

---

# 🧩 Vertical Slice Architecture

Vertical Slice Architecture reorganizes the same application around features.

Example:

```text
Features/

├── Authentication

├── Organizations

├── Projects

├── Boards

├── Columns

└── WorkItems
```

Each feature contains everything required to implement that business capability.

Developers rarely need to leave the feature they are working on.

---

## Inside a Feature

Example:

```text
Projects

├── Commands

├── Queries

├── Rules

└── DTOs
```

Commands represent write operations.

Queries represent read operations.

Rules encapsulate business-specific validation.

DTOs define the contracts exchanged between the API and clients.

---

# 📁 Feature-Based Organization

Every feature follows the same internal structure.

Example:

```text
Projects

├── Commands

├── Queries

├── Rules

└── DTOs
```

Boards:

```text
Boards

├── Commands

├── Queries

├── Rules

└── DTOs
```

Columns:

```text
Columns

├── Commands

├── Queries

├── Rules

└── DTOs
```

This consistency allows developers to quickly locate code regardless of the feature being modified.

---

## Independent Features

Each feature should remain as self-contained as possible.

Changes to **Projects** should rarely require modifications to:

- Boards
- Columns
- WorkItems

Feature independence improves maintainability and reduces unintended side effects.

---

# 📂 Folder Structure

Within the Application project, FlowForge follows a feature-first layout.

```text
Application/

└── Features/

    ├── Authentication

    ├── Organizations

    ├── Projects

    ├── Boards

    ├── Columns

    └── WorkItems
```

Every feature uses the same conventions.

This predictable structure simplifies navigation across the solution.

---

# 🔬 Anatomy of a Slice

Each business operation is implemented as an individual slice.

Example:

```text
Projects/

└── Commands/

    └── CreateProject/

        ├── CreateProjectCommand.cs

        ├── CreateProjectHandler.cs

        ├── CreateProjectValidator.cs

        └── CreateProjectResponse.cs
```

Each file has a clearly defined responsibility.

### Command

Contains the data required to perform the operation.

---

### Validator

Validates incoming requests using FluentValidation.

---

### Handler

Coordinates the workflow by:

- Loading data
- Executing business rules
- Calling domain behavior
- Persisting changes
- Returning the response

---

### Response

Defines the API contract returned to the client.

Keeping all of these components together makes each slice easy to understand and modify without searching through unrelated parts of the solution.

---

# 🔄 Request Lifecycle

Every request in FlowForge follows a consistent execution pipeline.

Vertical Slice Architecture determines **where** the code resides, while CQRS determines **how** requests are processed.

```text
HTTP Request
      │
      ▼
ASP.NET Controller
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

Every feature follows this same execution flow regardless of the business capability being implemented.

This consistency makes debugging and onboarding significantly easier.

---

## Request Example

Consider creating a project.

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

Everything required for this operation lives inside the **CreateProject** slice.

---

# 🔀 Relationship with CQRS

Vertical Slice Architecture and CQRS complement one another.

They solve different problems.

| Vertical Slice Architecture | CQRS |
|----------------------------|------|
| Organizes features | Separates reads and writes |
| Determines folder structure | Determines request types |
| Groups related code | Separates business operations |
| Improves discoverability | Improves maintainability |

CQRS defines the internal organization of each slice.

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

Each command and query represents an independent business operation.

---

# 🏛️ Relationship with Clean Architecture

Vertical Slice Architecture works within the boundaries defined by Clean Architecture.

A slice is not a replacement for architectural layers—it exists inside them.

```text
API
        │
        ▼
Application
        │
        ▼
Domain

Infrastructure
        ▲
```

The Application layer contains the slices.

Each slice communicates with:

- Domain entities
- Domain rules
- Infrastructure abstractions

without violating dependency direction.

This allows features to remain self-contained while preserving architectural boundaries.

---

# 🧱 Shared Components

Not every class belongs inside a feature.

Reusable components should live in shared locations.

Examples include:

- ApiResponse
- Pagination
- Sorting
- Behaviors
- Interfaces
- Exceptions
- Constants
- Mapping helpers

Shared components should be:

- Generic
- Reusable
- Independent of any single feature

Avoid moving feature-specific logic into shared folders simply to reduce file count.

If code is only used by one feature, it should remain inside that feature.

---

# 🧪 Testing Strategy

One of the major advantages of Vertical Slice Architecture is improved testability.

Each slice can be tested independently.

Typical tests include:

- Validator tests
- Handler tests
- Business rule tests
- Integration tests

Example:

```text
CreateProject

├── Validator Tests

├── Handler Tests

└── Integration Tests
```

Because each slice has a clear boundary, tests remain focused and easy to understand.

---

# ✅ Benefits

Vertical Slice Architecture provides numerous advantages.

---

## Better Discoverability

Developers can locate everything related to a feature in one place.

---

## Reduced Coupling

Features evolve independently with minimal impact on unrelated modules.

---

## Improved Maintainability

Most changes affect a single feature rather than multiple technical layers.

---

## Easier Onboarding

New contributors can learn one feature at a time instead of understanding the entire solution.

---

## Improved Scalability

Adding new business capabilities requires adding new slices rather than expanding generic services.

---

## Better Ownership

Each slice has a clear responsibility and well-defined boundaries.

---

# 📋 Best Practices

Follow these practices throughout the project.

✔ Organize code by business capability.

✔ Keep slices focused on one operation.

✔ Follow consistent folder conventions.

✔ Keep handlers small.

✔ Use FluentValidation for request validation.

✔ Keep business rules in the Domain or dedicated rule classes.

✔ Return strongly typed response models.

✔ Share only genuinely reusable components.

✔ Prefer explicit code over excessive abstraction.

---

# ⚠️ Common Anti-Patterns

Avoid these common mistakes.

---

## Generic Service Classes

Avoid creating large services that manage unrelated business operations.

Instead, create focused handlers within each slice.

---

## Generic Repository Pattern

FlowForge uses `IApplicationDbContext` instead of creating repositories for every entity.

This keeps handlers simple and avoids unnecessary abstraction.

---

## Feature Leakage

Do not place feature-specific code inside shared folders.

Only extract code that is genuinely reusable.

---

## Large Handlers

Handlers should coordinate workflows, not become monolithic business services.

If a handler grows excessively, consider extracting reusable business logic into the Domain layer.

---

## Breaking Folder Conventions

Consistency is one of the strengths of Vertical Slice Architecture.

Every feature should follow the same internal structure.

---

# 🚀 Future Evolution

As FlowForge grows, new capabilities will be introduced as additional slices.

Examples include:

```text
Authentication

↓

Organizations

↓

Projects

↓

Boards

↓

Columns

↓

WorkItems

↓

Comments

↓

Attachments

↓

Notifications

↓

Dashboard
```

Each new feature follows the same conventions established by the existing slices.

This predictable structure allows the application to scale without sacrificing maintainability.

---

# 📖 Summary

Vertical Slice Architecture is one of the key architectural decisions behind FlowForge.

By organizing the Application layer around business capabilities rather than technical concerns, it creates a codebase that is easier to understand, easier to maintain, and easier to extend.

Combined with:

- Clean Architecture
- CQRS
- MediatR
- FluentValidation
- Entity Framework Core

Vertical Slice Architecture provides a consistent development experience across the entire project.

Every feature follows the same structure, every request follows the same execution pipeline, and every contributor can quickly understand where new functionality belongs.

As FlowForge continues to evolve, this architecture will remain one of its strongest foundations for building scalable and maintainable enterprise software.

---

<div align="center">

# 🧩 FlowForge Vertical Slice Architecture

### Organizing Features Around Business Capabilities

*"A feature should be easy to find, easy to understand, and easy to evolve. Vertical Slice Architecture achieves this by keeping everything a business capability needs together in one place."*

</div>