# 🏛️ FlowForge Architecture

> *"Architecture is the set of decisions that are difficult to change."*  
> — Martin Fowler

This document describes the architectural foundation of FlowForge and explains how multiple architectural patterns work together to create a scalable, maintainable and production-ready enterprise application.

Rather than relying on a single design pattern, FlowForge combines several complementary approaches to ensure that business logic remains protected while allowing the application to evolve with minimal technical debt.

---

# 📑 Table of Contents

- Introduction
- Architectural Goals
- Architecture at a Glance
- High-Level Architecture
- Architectural Principles
- Layer Responsibilities
- Dependency Rule
- Clean Architecture
- Vertical Slice Architecture

---

# 📖 Introduction

FlowForge is designed as a production-quality enterprise application rather than a traditional CRUD application.

Many business applications begin with a clean structure but gradually become difficult to maintain as features are added. Controllers become larger, business logic spreads across multiple layers, dependencies become tightly coupled and changes become increasingly risky.

FlowForge is intentionally designed to avoid these problems.

From the beginning, every architectural decision has been made with long-term maintainability in mind.

The architecture focuses on:

- Clear separation of concerns
- Explicit business rules
- Independent business modules
- Low coupling
- High cohesion
- Framework-independent domain logic
- Predictable feature organization

Instead of organizing the application around technical components such as Controllers, Services and Repositories, FlowForge organizes the codebase around business capabilities while maintaining clear architectural boundaries.

---

# 🎯 Architectural Goals

The architecture of FlowForge is designed to satisfy several long-term objectives.

---

## Maintainability

Every feature should remain easy to understand, modify and extend.

New functionality should integrate naturally into the existing codebase without requiring major restructuring.

---

## Scalability

The architecture should support continuous growth.

Adding new modules should primarily involve introducing new business slices rather than modifying existing ones.

---

## Testability

Business logic should remain isolated from infrastructure concerns.

This enables reliable unit testing without depending on databases, web servers or external services.

---

## Separation of Concerns

Each architectural layer has a clearly defined responsibility.

Presentation, application coordination, business logic and infrastructure remain independent of one another.

---

## Business-Centric Design

Business rules are treated as the most valuable part of the system.

They belong in the Domain layer where they remain reusable, explicit and independent of frameworks.

---

## Long-Term Evolution

The architecture should become easier—not harder—to extend over time.

Every new feature should strengthen the existing architecture rather than introduce unnecessary complexity.

---

# 🏗️ Architecture at a Glance

FlowForge combines several architectural patterns that complement one another.

| Pattern | Responsibility |
|----------|----------------|
| Clean Architecture | Defines dependency boundaries |
| Vertical Slice Architecture | Organizes features by business capability |
| CQRS | Separates reads from writes |
| Rich Domain Model | Encapsulates business behavior |
| FluentValidation | Validates requests |
| MediatR | Dispatches commands and queries |
| Entity Framework Core | Data persistence |
| ASP.NET Identity | Authentication and authorization |

Each pattern addresses a specific architectural concern while working together as part of a unified system.

---

# 🌐 High-Level Architecture

FlowForge follows the principles of Clean Architecture.

```text
                    Client
                       │
                       ▼
              ASP.NET Core API
                       │
                       ▼
              Application Layer
                       │
                       ▼
                 Domain Layer
                       ▲
                       │
             Infrastructure Layer
```

The API receives incoming requests.

The Application layer coordinates business use cases.

The Domain layer contains business knowledge.

The Infrastructure layer provides technical implementations such as database access and authentication.

Each layer has a single responsibility and communicates through well-defined abstractions.

---

# 🧭 Architectural Principles

Several principles guide every implementation within FlowForge.

---

## Single Responsibility

Every component should have one clearly defined purpose.

Controllers handle HTTP concerns.

Handlers coordinate use cases.

Entities enforce business behavior.

Infrastructure manages technical implementation.

---

## Explicit Business Logic

Business rules should never be hidden inside controllers or persistence code.

Instead, they are implemented within the Domain layer or dedicated rule classes.

---

## Framework Independence

The Domain layer should not depend on:

- ASP.NET Core
- Entity Framework Core
- SQL Server
- MediatR
- Identity

This allows the business model to remain portable and independently testable.

---

## Predictable Structure

Every feature follows the same implementation pattern.

Developers should immediately know where to find:

- Commands
- Queries
- Validators
- Handlers
- DTOs
- Business Rules

Consistency reduces maintenance costs and improves onboarding.

---

## Incremental Growth

New features should extend the architecture rather than modify it.

The architecture is designed to evolve one business capability at a time while preserving existing functionality.

---

# 🏢 Layer Responsibilities

FlowForge separates responsibilities into four primary layers.

---

## 🌐 API Layer

The API layer serves as the entry point into the application.

Responsibilities include:

- HTTP endpoints
- Authentication
- Authorization
- Model binding
- Request routing
- Response formatting

The API layer should never contain business rules.

Its responsibility is limited to translating HTTP requests into application requests.

---

## ⚙️ Application Layer

The Application layer coordinates business use cases.

Responsibilities include:

- Commands
- Queries
- Handlers
- DTOs
- Validation
- Application orchestration

This layer coordinates work but intentionally avoids implementing business policies.

Business decisions belong in the Domain layer.

---

## ❤️ Domain Layer

The Domain layer represents the heart of the application.

Responsibilities include:

- Entities
- Domain behavior
- Business rules
- Domain services (future)
- Value objects (future)

The Domain layer contains no knowledge of frameworks or infrastructure.

It defines the business model independently of how the application is implemented.

---

## 🗄️ Infrastructure Layer

The Infrastructure layer provides technical implementations required by the application.

Responsibilities include:

- Entity Framework Core
- SQL Server
- ASP.NET Identity
- File storage
- External services
- Persistence

Infrastructure depends on abstractions defined by the Application layer but is never referenced directly by the Domain.

---

# 🔄 Dependency Rule

FlowForge follows the fundamental rule of Clean Architecture:

> **Dependencies always point inward.**

```text
API
 │
 ▼
Application
 │
 ▼
Domain

Infrastructure ─────────────► Domain
              └────────────► Application
```

The Domain layer sits at the center of the architecture.

Everything else depends on it.

Nothing inside the Domain depends on external frameworks or technologies.

This ensures that business logic remains stable even if implementation details change.

---

# 🧱 Clean Architecture

Clean Architecture provides the structural foundation of FlowForge.

Its primary objective is to protect business logic from external concerns.

Each layer communicates only with layers closer to the Domain.

### Dependency Direction

```text
Presentation
      │
      ▼
Application
      │
      ▼
Domain

Infrastructure
      │
      └────────────► Application
                    ► Domain
```

This architecture offers several important advantages:

- Independent business model
- Easier testing
- Reduced framework coupling
- Better maintainability
- Clear separation of responsibilities
- Long-term scalability

By keeping dependencies directed toward the Domain, FlowForge ensures that business knowledge remains the most stable part of the application.

---

# 📦 Vertical Slice Architecture

While Clean Architecture defines **layer boundaries**, Vertical Slice Architecture defines **how features are organized**.

Instead of grouping code by technical type:

```text
Controllers/
Services/
Repositories/
DTOs/
Validators/
```

FlowForge groups related code by business capability.

Example:

```text
Projects/

    Commands/
        Create/
        Update/
        Archive/
        Restore/

    Queries/
        GetById/
        GetProjects/

    DTOs/
    Rules/
```

Each feature contains everything required for its implementation, making it self-contained and easier to understand.

### Benefits

- Better feature discoverability
- Independent feature evolution
- Lower coupling
- Improved maintainability
- Simplified onboarding
- Predictable project structure

Clean Architecture defines **where code belongs**.

Vertical Slice Architecture defines **how code is organized**.

Together, they provide a scalable foundation for enterprise software.

---

# ⚡ Command Query Responsibility Segregation (CQRS)

FlowForge adopts **Command Query Responsibility Segregation (CQRS)** to clearly separate operations that modify application state from those that retrieve data.

Rather than implementing large service classes containing mixed responsibilities, each use case is represented as an independent request.

---

## Commands

Commands perform actions that change the state of the system.

Examples include:

- Create Project
- Update Board
- Archive Column
- Restore Work Item

A command typically performs the following steps:

```text
Command
      │
      ▼
Validation
      │
      ▼
Business Rules
      │
      ▼
Domain Entity
      │
      ▼
Persistence
```

Commands never return complex datasets.

Their primary responsibility is to execute business behavior safely.

---

## Queries

Queries retrieve information without modifying application state.

Examples include:

- Get Projects
- Get Boards
- Get Columns
- Get Work Items

Queries are optimized for reading and remain free from business side effects.

---

## Why CQRS?

CQRS provides several advantages:

- Clear separation of responsibilities
- Smaller handlers
- Easier testing
- Independent optimization
- Better feature organization
- Improved maintainability

Every business feature within FlowForge follows this pattern consistently.

---

# ❤️ Rich Domain Model

FlowForge follows the Rich Domain Model pattern.

Business entities are responsible for protecting their own consistency.

Instead of exposing mutable properties, entities provide meaningful business operations.

Example:

```csharp
project.Update(...);

project.Archive();

project.Restore();

board.Rename(...);

workItem.Move(...);
```

This prevents invalid state transitions and keeps business behavior close to the data it governs.

The Domain layer represents the source of truth for business logic.

---

# 📏 Business Rules Pattern

Business rules that involve validation beyond simple input constraints are extracted into dedicated rule classes.

Examples include:

- Duplicate project names
- Duplicate board names
- Duplicate column names
- Organization ownership validation
- Archived entity restrictions
- Workflow ordering validation

Typical structure:

```text
Projects/
    Rules/
        ProjectRules.cs

Boards/
    Rules/
        BoardRules.cs

Columns/
    Rules/
        ColumnRules.cs

WorkItems/
    Rules/
        WorkItemRules.cs
```

Keeping these rules separate allows handlers to remain focused on application orchestration rather than business policy.

---

# 🔄 Request Lifecycle

Every request in FlowForge follows a predictable execution pipeline.

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
ApplicationDbContext
      │
      ▼
SQL Server
      │
      ▼
API Response
```

Each component performs one well-defined responsibility, making the overall request flow easy to understand and maintain.

---

# 🚀 Feature Execution Flow

Consider the process of creating a new Work Item.

```text
POST /api/workitems
        │
        ▼
Controller
        │
        ▼
CreateWorkItemCommand
        │
        ▼
FluentValidation
        │
        ▼
CreateWorkItemHandler
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
Database
        │
        ▼
ApiResponse<WorkItemDto>
```

The handler coordinates the workflow.

Validation protects input.

Business rules enforce policies.

Entities protect domain integrity.

Persistence stores the final result.

---

# 🛡️ Cross-Cutting Concerns

Some responsibilities apply across multiple features.

Rather than duplicating them, FlowForge centralizes these concerns.

---

## Validation

All incoming commands are validated using **FluentValidation** before business logic executes.

This ensures invalid requests are rejected early.

---

## Authentication

ASP.NET Identity manages user accounts.

JWT Bearer Authentication secures protected endpoints.

---

## Authorization

Only authenticated users can access protected resources.

Business modules additionally enforce organization ownership rules.

---

## Exception Handling

Custom exception types provide consistent error handling across the application.

Examples include:

- NotFoundException
- ConflictException
- BadRequestException
- ForbiddenException
- UnauthorizedException

Global exception handling converts these exceptions into standardized API responses.

---

## API Response Standardization

Every successful request returns a consistent response structure.

```text
ApiResponse<T>
```

This improves predictability for API consumers and simplifies client-side development.

---

# ❓ Why No Repository Pattern?

FlowForge intentionally does **not** implement a generic repository layer.

Entity Framework Core already provides the capabilities commonly associated with repositories:

- Change Tracking
- Unit of Work
- Query Translation
- Entity Tracking
- CRUD Operations

Adding another abstraction would duplicate functionality without providing additional value.

Instead, FlowForge depends on an application abstraction that exposes only the operations required by the application.

---

# 🗃️ Why `IApplicationDbContext`?

Rather than depending directly on `ApplicationDbContext`, the Application layer depends on an abstraction.

```text
Application
        │
        ▼
IApplicationDbContext
        ▲
        │
ApplicationDbContext
```

This approach provides several benefits:

- Reduced coupling
- Easier testing
- Infrastructure independence
- Better dependency inversion
- Cleaner application boundaries

The Application layer knows only what it needs—not how persistence is implemented.

---

# 🏛️ Architectural Decisions

Several important architectural decisions shape FlowForge.

| Decision | Reason |
|----------|--------|
| Clean Architecture | Protect business logic from infrastructure |
| Vertical Slice Architecture | Organize code around business capabilities |
| CQRS | Separate reads from writes |
| Rich Domain Model | Keep business behavior inside entities |
| FluentValidation | Centralize request validation |
| MediatR | Decouple request dispatching |
| EF Core | Reliable ORM with change tracking |
| ASP.NET Identity | Secure authentication and authorization |
| No Generic Repository | Avoid unnecessary abstractions |
| `IApplicationDbContext` | Depend on abstractions instead of implementations |

Each decision was made to solve a practical problem rather than to follow architectural trends.

---

# ✅ Architectural Benefits

The combination of these patterns provides significant long-term advantages.

### Maintainability

Business features remain isolated and easy to modify.

---

### Scalability

New modules integrate without restructuring existing features.

---

### Testability

Business logic remains independent of infrastructure.

---

### Readability

Developers can quickly understand feature organization and request flow.

---

### Consistency

Every feature follows the same implementation pattern.

---

### Framework Independence

Business logic remains protected from technology changes.

---

### Long-Term Evolution

The architecture is designed to support continuous growth while minimizing technical debt.

---

# 🔮 Future Evolution

As FlowForge evolves, the architecture is expected to support additional capabilities without fundamental redesign.

Potential future enhancements include:

- Domain Events
- Value Objects
- Background Processing
- SignalR Integration
- Distributed Caching
- File Storage Providers
- Cloud Deployment
- Event-Driven Integrations
- Advanced Monitoring
- Modular Packages

These enhancements can be introduced incrementally because the architectural boundaries are already well defined.

---

# 📖 Summary

FlowForge combines several complementary architectural patterns to create a scalable, maintainable and production-ready application.

Each pattern has a specific responsibility:

- **Clean Architecture** defines dependency boundaries.
- **Vertical Slice Architecture** organizes business features.
- **CQRS** separates reads from writes.
- **Rich Domain Models** encapsulate business behavior.
- **Business Rules** centralize domain policies.
- **FluentValidation** validates requests.
- **MediatR** coordinates application workflows.

Together, these patterns create a codebase that is easier to understand, easier to test and easier to extend as the application grows.

The architecture is intentionally designed to support long-term evolution while keeping business logic protected from infrastructure and framework concerns.

---

<div align="center">

# 🏛️ FlowForge Architecture

### Building Enterprise Software on a Strong Architectural Foundation

*"Good architecture is not measured by how complex it is, but by how confidently software can evolve without breaking what already works."*

</div>