# Architecture

> "Architecture is the set of decisions that are difficult to change."

This document describes the architectural principles used throughout FlowForge and explains how different architectural patterns work together to create a maintainable, scalable, and testable application.

---

# Table of Contents

- Overview
- Architectural Goals
- High-Level Architecture
- Clean Architecture
- Vertical Slice Architecture
- CQRS
- Rich Domain Model
- Business Rules Pattern
- Dependency Direction
- Request Lifecycle
- Benefits
- Design Decisions

---

# Overview

FlowForge is designed as a production-quality enterprise application rather than a traditional CRUD application.

The architecture prioritizes:

- Maintainability
- Scalability
- Testability
- Separation of Concerns
- Explicit Business Logic
- Long-term Evolution

Rather than organizing code around technical layers such as *Controllers*, *Services*, and *Repositories*, FlowForge organizes code around business capabilities while keeping responsibilities clearly separated.

---

# Architectural Goals

The architecture aims to achieve the following goals:

## Maintainability

Features should be easy to understand, modify, and extend without affecting unrelated parts of the system.

---

## Scalability

The project structure should support hundreds of features without becoming difficult to navigate.

---

## Testability

Business logic should be isolated from infrastructure so that it can be tested independently.

---

## Loose Coupling

Each layer should depend only on abstractions and never on implementation details.

---

## Business-Centric Design

Business rules should live close to the domain rather than being scattered across controllers or infrastructure.

---

# High-Level Architecture

FlowForge follows **Clean Architecture**.

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

Each layer has a clearly defined responsibility.

---

# Layer Responsibilities

## API Layer

Responsible for:

- HTTP
- Authentication
- Authorization
- Model Binding
- Returning Responses

The API layer should never contain business logic.

---

## Application Layer

Responsible for:

- Use Cases
- CQRS
- Validation
- Orchestration
- DTOs

The Application layer coordinates work but does not implement business rules.

---

## Domain Layer

The Domain layer is the heart of the application.

Responsibilities include:

- Entities
- Value Objects (future)
- Business Rules
- Domain Behavior

The Domain layer has no knowledge of:

- Entity Framework
- SQL Server
- ASP.NET Core
- MediatR
- Controllers

---

## Infrastructure Layer

Infrastructure implements technical concerns such as:

- Database
- Identity
- EF Core
- File Storage
- External Services

Infrastructure depends on every other layer, but no other layer depends on Infrastructure.

---

# Clean Architecture

FlowForge follows the Dependency Rule.

Dependencies always point inward.

```text
API
 │
 ▼
Application
 │
 ▼
Domain

Infrastructure ───────────────┘
```

The Domain layer is independent.

It does not reference any external framework.

This makes the business model portable and easy to test.

---

# Vertical Slice Architecture

Instead of grouping code by technical type:

```text
Controllers/
Services/
Repositories/
DTOs/
Validators/
```

FlowForge groups code by business feature.

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

    Rules/
    DTOs/
```

Every feature contains everything required for its implementation.

Benefits include:

- Better discoverability
- Lower coupling
- Easier feature maintenance
- Independent evolution of modules

---

# CQRS

FlowForge separates commands from queries.

## Commands

Commands change application state.

Examples:

- Create Project
- Update Project
- Archive Board

Commands:

- Validate input
- Execute business logic
- Persist changes

---

## Queries

Queries return data.

Examples:

- Get Projects
- Get Board
- Get Dashboard

Queries never modify state.

---

# Rich Domain Model

Entities encapsulate business behavior.

Instead of exposing mutable state, entities provide meaningful methods.

Example:

```csharp
project.Update(...)

project.Archive()

project.Restore()
```

This prevents invalid state transitions and keeps business behavior inside the domain.

---

# Business Rules Pattern

Complex business rules are extracted into dedicated rule classes.

Example:

```text
ProjectRules

BoardRules
```

Responsibilities include:

- Duplicate detection
- Organization validation
- Archived entity checks
- Ownership validation

This keeps handlers focused on orchestration rather than business policy.

---

# Dependency Direction

Dependencies always flow toward the Domain.

```text
API
 │
 ▼
Application
 │
 ▼
Domain

Infrastructure
     │
     └──────────────▶ Domain
```

The Domain layer never references:

- EF Core
- ASP.NET Core
- SQL Server
- MediatR
- Identity

This minimizes framework coupling.

---

# Request Lifecycle

The following diagram illustrates how a typical request flows through the application.

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
Validator
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
SQL Server
      │
      ▼
Response
```

Each component has a single responsibility.

---

# Example: Create Project

```text
POST /api/projects

        │

        ▼

Controller

        │

        ▼

CreateProjectCommand

        │

        ▼

FluentValidation

        │

        ▼

CreateProjectHandler

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

Database
```

The handler coordinates the workflow.

Business decisions remain inside the domain and rule classes.

---

# Why No Repository Pattern?

FlowForge intentionally does **not** implement a generic repository layer.

Entity Framework Core already provides:

- Unit of Work
- Repository behavior
- Change Tracking
- Query Translation

Adding another generic repository would introduce an unnecessary abstraction without solving a real problem.

Instead, the application depends directly on an abstraction (`IApplicationDbContext`) that exposes only the operations the application requires.

This keeps the architecture simpler while preserving testability.

---

# Benefits

This architecture provides:

- Clear separation of concerns
- Scalable project structure
- Easier testing
- Explicit business rules
- Better maintainability
- Consistent feature development
- Framework-independent domain model

---

# Architectural Principles

Every new feature added to FlowForge should follow these principles:

- Follow Clean Architecture.
- Follow Vertical Slice Architecture.
- Separate Commands from Queries.
- Keep business logic inside the Domain.
- Keep handlers thin.
- Keep controllers thinner.
- Extract reusable business rules.
- Validate requests before execution.
- Document architectural decisions.

---

# Summary

FlowForge combines several complementary architectural patterns rather than relying on a single approach.

- **Clean Architecture** defines the dependency boundaries.
- **Vertical Slice Architecture** organizes the codebase by business capability.
- **CQRS** separates reads from writes.
- **Rich Domain Models** encapsulate business behavior.
- **Business Rules** centralize domain policies.

Together, these patterns create a codebase that is easier to understand, extend, test, and maintain as the application grows.