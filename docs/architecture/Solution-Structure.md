# 🏗️ FlowForge Solution Structure

This document describes how the FlowForge solution is organized and explains the purpose and responsibility of every project, folder and feature.

The solution structure is designed to maximize clarity, maintainability and scalability by combining **Clean Architecture** with **Vertical Slice Architecture**.

Rather than organizing code by technical layers alone, FlowForge organizes business capabilities into self-contained feature slices while maintaining strict architectural boundaries between projects.

---

# 📑 Table of Contents

- Introduction
- Solution Overview
- Repository Layout
- Solution Projects
- Project Responsibilities
- Solution Dependency Graph
- Internal Folder Structure

---

# 📖 Introduction

As enterprise applications grow, maintaining a predictable and scalable project structure becomes increasingly important.

A poorly organized solution often results in:

- Large service classes
- Difficult navigation
- Tight coupling
- Duplicate code
- Inconsistent feature implementation

FlowForge avoids these problems by organizing the solution around clearly defined responsibilities.

Each project has a single purpose.

Each feature follows the same implementation pattern.

Each dependency follows the rules established by the architecture.

This consistency allows new developers to understand the project quickly while enabling the application to grow without unnecessary complexity.

---

# 🌐 Solution Overview

FlowForge is divided into multiple projects, each representing a specific architectural layer.

```text
FlowForge.sln
│
├── src
│   ├── FlowForge.API
│   ├── FlowForge.Application
│   ├── FlowForge.Domain
│   └── FlowForge.Infrastructure
│
├── frontend
│
├── tests
│
├── docs
│
└── database
```

This separation ensures that:

- Business logic remains independent.
- Infrastructure can evolve without affecting the Domain.
- Features remain modular.
- Dependencies remain predictable.
- Testing is simplified.

---

# 📂 Repository Layout

The repository is organized into several top-level directories.

---

## 📦 src

Contains the application's source code.

```text
src/
├── FlowForge.API
├── FlowForge.Application
├── FlowForge.Domain
└── FlowForge.Infrastructure
```

These projects collectively implement the application's business functionality.

---

## 🎨 frontend

Contains the client-side application.

Future implementations may include:

- React
- Next.js
- Mobile applications

The frontend communicates exclusively through the REST API.

---

## 🧪 tests

Contains automated tests.

Examples include:

- Unit Tests
- Integration Tests
- API Tests

Keeping tests separate from production code improves organization and maintainability.

---

## 📚 docs

Contains all project documentation.

Examples include:

- Foundation
- Architecture
- Engineering
- Modules

Documentation evolves alongside the implementation.

---

## 🗄️ database

Contains database-related resources.

Examples include:

- SQL Scripts
- Seed Data
- Migrations
- Backup Scripts

This directory centralizes database artifacts outside of the application projects.

---

# 🏢 Solution Projects

FlowForge consists of four primary application projects.

```text
FlowForge.sln

│
├── FlowForge.API
├── FlowForge.Application
├── FlowForge.Domain
└── FlowForge.Infrastructure
```

Each project has a single architectural responsibility.

---

# 🌐 FlowForge.API

The API project is the application's entry point.

It exposes REST endpoints and translates HTTP requests into application requests.

---

## Responsibilities

- Configure ASP.NET Core
- Configure Dependency Injection
- Configure Authentication
- Configure Authorization
- Configure Middleware
- Configure Swagger
- Expose REST Endpoints
- Return API Responses

---

## Typical Structure

```text
FlowForge.API

├── Controllers
├── Middleware
├── Extensions
├── Configuration
└── Program.cs
```

The API project intentionally avoids implementing business rules.

Its primary responsibility is communication with external clients.

---

# ⚙️ FlowForge.Application

The Application project coordinates business use cases.

It acts as the bridge between the API and the Domain.

Business workflows are implemented using CQRS and MediatR.

---

## Responsibilities

- Commands
- Queries
- Handlers
- Validators
- DTOs
- Behaviors
- Interfaces
- Application Services

---

## Typical Structure

```text
FlowForge.Application

├── Features
├── Common
├── Interfaces
├── Behaviors
└── Shared
```

The Application layer coordinates work but delegates business decisions to the Domain.

---

# ❤️ FlowForge.Domain

The Domain project contains the business model.

It represents the heart of the application and remains completely independent of external technologies.

---

## Responsibilities

- Entities
- Domain Behavior
- Business Rules
- Domain Exceptions
- Value Objects (Future)
- Domain Services (Future)

---

## Example Structure

```text
FlowForge.Domain

├── Entities
├── Rules
├── Exceptions
└── Common
```

The Domain project contains no references to:

- ASP.NET Core
- Entity Framework Core
- SQL Server
- MediatR
- ASP.NET Identity

This independence ensures that business logic remains portable and easy to test.

---

# 🗄️ FlowForge.Infrastructure

The Infrastructure project provides technical implementations required by the application.

It is responsible for persistence and integration with external systems.

---

## Responsibilities

- Entity Framework Core
- SQL Server
- ASP.NET Identity
- Persistence
- File Storage
- Email Services
- External APIs
- Logging

---

## Typical Structure

```text
FlowForge.Infrastructure

├── Persistence
├── Identity
├── Services
├── DependencyInjection
└── Configurations
```

Infrastructure implements interfaces defined by the Application layer while remaining isolated from business logic.

---

# 🔗 Solution Dependency Graph

Project dependencies follow the principles established by Clean Architecture.

```text
             FlowForge.API
                    │
                    ▼
         FlowForge.Application
                    │
                    ▼
            FlowForge.Domain
                    ▲
                    │
      FlowForge.Infrastructure
```

### Allowed Dependencies

- API → Application
- Application → Domain
- Infrastructure → Application
- Infrastructure → Domain

### Prohibited Dependencies

- Domain → API
- Domain → Infrastructure
- Domain → ASP.NET Core
- Application → API

These dependency rules ensure that the Domain remains the most stable and independent part of the application.

---

# 📁 Internal Folder Structure

Within each project, folders are organized according to their responsibility.

```text
src/

FlowForge.API
│
├── Controllers
├── Middleware
├── Extensions
└── Program.cs

FlowForge.Application
│
├── Features
├── Common
├── Interfaces
├── Behaviors
└── Shared

FlowForge.Domain
│
├── Entities
├── Rules
├── Exceptions
└── Common

FlowForge.Infrastructure
│
├── Persistence
├── Identity
├── Services
├── Configurations
└── DependencyInjection
```

Each project maintains a predictable internal structure, making navigation easier as the solution grows.

---

# 📦 Feature Organization

FlowForge organizes business logic by **feature** rather than by technical component.

Instead of placing all controllers, services and repositories into separate folders, each business capability owns everything required for its implementation.

This approach is known as **Vertical Slice Architecture**.

Example:

```text
Features
│
├── Organizations
├── Projects
├── Boards
├── Columns
└── WorkItems
```

Each feature evolves independently while following the same internal conventions.

This improves discoverability and reduces coupling between unrelated business capabilities.

---

# 🧩 Internal Feature Structure

Every feature follows a predictable layout.

Example:

```text
Projects
│
├── Commands
│   ├── Create
│   ├── Update
│   ├── Archive
│   └── Restore
│
├── Queries
│   ├── GetById
│   └── GetProjects
│
├── DTOs
│
├── Rules
│
└── Validators
```

The **Boards**, **Columns** and **WorkItems** modules follow the same structure.

Consistency is intentionally prioritized over creativity.

Developers should immediately know where every component belongs.

---

# ⚡ Command Structure

Every command represents a single business action.

Commands contain everything required to execute that operation.

Example:

```text
CreateProject
│
├── CreateProjectCommand.cs
├── CreateProjectHandler.cs
├── CreateProjectValidator.cs
└── CreateProjectResponse.cs
```

Responsibilities:

- Accept user intent
- Validate input
- Coordinate business rules
- Persist changes
- Return a standardized response

Commands never retrieve large datasets or implement unrelated business behavior.

---

# 🔍 Query Structure

Queries retrieve information without modifying application state.

Each query remains independent of every other query.

Example:

```text
GetProjects
│
├── GetProjectsQuery.cs
├── GetProjectsHandler.cs
└── GetProjectsResponse.cs
```

Queries focus on:

- Reading data
- Filtering
- Pagination
- Searching
- Sorting
- Mapping to DTOs

Keeping queries independent allows them to evolve without affecting command behavior.

---

# 🧱 Shared Components

Some functionality is reused across multiple features.

Shared components are placed in dedicated common folders rather than duplicated.

Examples include:

- ApiResponse
- Pagination
- Sorting
- Behaviors
- Interfaces
- Constants
- Exceptions
- Mapping Helpers

General rule:

- **Shared** → Generic and reusable.
- **Feature** → Business-specific.

If a component exists only to support one feature, it belongs inside that feature.

---

# 📝 Naming Conventions

FlowForge follows consistent naming conventions across the solution.

---

## Commands

```text
CreateProjectCommand

UpdateBoardCommand

ArchiveColumnCommand

RestoreWorkItemCommand
```

---

## Queries

```text
GetProjectByIdQuery

GetProjectsQuery

GetBoardQuery

GetWorkItemsQuery
```

---

## Handlers

```text
CreateProjectHandler

UpdateBoardHandler

CreateWorkItemHandler
```

---

## Validators

```text
CreateProjectValidator

UpdateBoardValidator

CreateWorkItemValidator
```

---

## DTOs

```text
ProjectDto

BoardDto

ColumnDto

WorkItemDto
```

---

## Rule Classes

```text
ProjectRules

BoardRules

ColumnRules

WorkItemRules
```

Consistent naming reduces cognitive overhead and improves code discoverability.

---

# 🔄 Request Flow Across Projects

A request passes through several projects before reaching the database.

```text
Client
      │
      ▼
FlowForge.API
      │
      ▼
FlowForge.Application
      │
      ▼
FlowForge.Domain
      │
      ▼
FlowForge.Infrastructure
      │
      ▼
SQL Server
```

Responsibilities during execution:

**API**

- Receive HTTP request
- Authenticate user
- Route endpoint
- Return response

↓

**Application**

- Dispatch command/query
- Validate request
- Coordinate workflow

↓

**Domain**

- Execute business behavior
- Enforce business rules
- Protect entity consistency

↓

**Infrastructure**

- Persist data
- Communicate with SQL Server
- Access external services

This predictable flow makes every request easier to follow and debug.

---

# ➕ Adding a New Feature

Every business module follows the same implementation process.

```text
Business Requirement
        │
        ▼
Design Domain Model
        │
        ▼
Define Business Rules
        │
        ▼
Create Commands
        │
        ▼
Create Queries
        │
        ▼
Add Validators
        │
        ▼
Implement Handlers
        │
        ▼
Expose API Endpoints
        │
        ▼
Update Documentation
        │
        ▼
Testing
        │
        ▼
Release
```

Following this workflow ensures that all features remain consistent across the entire solution.

---

# 📈 Scalability Strategy

The solution structure is designed to support long-term growth.

As new modules are introduced, existing features require little or no modification.

Future business modules may include:

```text
Comments

Attachments

Notifications

Dashboard

Reports

Labels

Sprint Planning

Time Tracking
```

Each new module simply becomes another feature slice.

No restructuring of existing projects should be required.

---

# ✅ Best Practices

Every contributor should follow these architectural guidelines.

✔ Keep controllers thin.

✔ Keep handlers focused on orchestration.

✔ Keep business logic inside the Domain.

✔ Keep rule classes reusable.

✔ Keep feature slices independent.

✔ Reuse shared components only when appropriate.

✔ Follow established naming conventions.

✔ Respect dependency boundaries.

✔ Document architectural changes.

Consistency is more valuable than introducing new patterns for individual features.

---

# 🚀 Future Expansion

The current solution structure is intentionally designed to support future growth.

Potential additions include:

- Domain Events
- Value Objects
- Background Processing
- SignalR
- Distributed Caching
- Cloud Storage
- Containerization
- Microservice Extraction (if ever required)

Because dependencies are well-defined, these enhancements can be introduced incrementally without disrupting the existing architecture.

---

# 📖 Summary

The FlowForge solution structure provides a scalable foundation for enterprise software development.

By combining **Clean Architecture** with **Vertical Slice Architecture**, the solution achieves:

- Clear project responsibilities
- Predictable feature organization
- Independent business modules
- Framework-independent business logic
- Consistent development practices
- Long-term maintainability

Every project, folder and feature has a clearly defined purpose.

As FlowForge grows, maintaining this structure will ensure that the codebase remains easy to understand, easy to extend and resilient to change.

---

<div align="center">

# 🏗️ FlowForge Solution Structure

### Organizing Enterprise Software for Long-Term Success

*"A well-structured solution doesn't just make today's code easier to write—it makes tomorrow's features easier to build."*

</div>