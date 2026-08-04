# 🏗 Architecture

## Overview

FlowForge is designed as a modern, scalable project management platform following **Clean Architecture**, **CQRS (Command Query Responsibility Segregation)**, and **Vertical Slice Architecture**.

The primary goal is to keep the application modular, maintainable, testable, and easy to extend as new features are introduced.

Rather than organizing code by technical layers (Controllers, Services, Repositories), FlowForge organizes application logic around individual features, allowing each feature to evolve independently while maintaining a consistent architecture.

---

# Design Principles

The architecture is based on the following principles:

- Separation of concerns
- Single responsibility
- Dependency inversion
- Feature-first organization
- Domain-driven design concepts
- Realtime-first collaboration

These principles help keep business logic independent from infrastructure and external technologies.

---

# Architecture Overview

```
                 Client Applications
          (React, Mobile, Future Clients)
                       │
                       ▼
                ASP.NET Core API
                       │
              Authentication & Middleware
                       │
                       ▼
                 Application Layer
              (CQRS + Business Logic)
                ▲                  │
                │                  ▼
           Domain Layer      Infrastructure Layer
                │                  │
                └──────────► SQL Server
                               SignalR
                               Logging
                               External Services
```

---

# Clean Architecture

FlowForge follows Clean Architecture to ensure business rules remain independent from frameworks, databases, and user interfaces.

The solution is divided into four main projects.

| Layer | Responsibility |
|--------|----------------|
| **API** | HTTP endpoints, middleware, authentication and request handling. |
| **Application** | Business logic, CQRS handlers, validation and application services. |
| **Domain** | Core business entities, enums and domain rules. |
| **Infrastructure** | Database access, SignalR, logging and external integrations. |

Dependencies always point inward, ensuring that business logic remains independent of implementation details.

---

# Vertical Slice Architecture

Instead of grouping code by controllers, services and repositories, FlowForge groups application logic by feature.

Example:

```
Features
│
├── Projects
├── Boards
├── Columns
├── WorkItems
├── Comments
└── Notifications
```

Each feature contains its own commands, queries, validators and handlers, making the codebase easier to navigate and maintain.

---

# CQRS

FlowForge separates operations into two categories.

### Commands

Commands modify application state.

Examples:

- Create Project
- Create Board
- Move Work Item
- Add Comment

### Queries

Queries retrieve data without modifying it.

Examples:

- Get Board
- Get Projects
- Get Work Items
- Get Comments

This separation keeps request handling simple, predictable and easier to test.

---

# Request Flow

A typical request follows this path:

```
HTTP Request
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Command / Query Handler
      │
      ▼
Business Rules
      │
      ▼
Infrastructure
      │
      ▼
Database
      │
      ▼
HTTP Response
```

For realtime features, SignalR notifications are published after successful database updates.

---

# Dependency Flow

Project references follow a strict one-way dependency.

```
API
 │
 ▼
Application
 │
 ▼
Domain

Infrastructure
      │
      └────────► Application
```

The Domain project has no dependency on any other project, allowing business rules to remain isolated from implementation details.

---

# Why This Architecture?

This architecture provides several advantages:

- Clear separation of responsibilities
- Better maintainability
- Easier testing
- Feature-based organization
- Scalable project structure
- Independent business logic
- Support for realtime collaboration

It also allows new features to be introduced with minimal impact on the existing codebase.

---

# Summary

FlowForge combines Clean Architecture, CQRS and Vertical Slice Architecture to create a modular backend capable of supporting enterprise-scale project management features while remaining easy to understand and extend.