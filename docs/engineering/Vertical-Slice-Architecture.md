# Vertical Slice Architecture

This document explains how FlowForge implements **Vertical Slice Architecture (VSA)** and why it was chosen over traditional layered architectures.

Vertical Slice Architecture is one of the core architectural patterns used throughout FlowForge. It organizes the application around **business capabilities** rather than technical concerns, making features easier to understand, maintain, and evolve.

---

# Table of Contents

- Overview
- Why Vertical Slice Architecture?
- Traditional Layered Architecture
- Vertical Slice Architecture
- Feature Organization
- Folder Structure
- Request Lifecycle
- Relationship with CQRS
- Benefits
- Best Practices
- Common Mistakes
- Summary

---

# Overview

Vertical Slice Architecture organizes code around **features** instead of **technical layers**.

Each feature contains everything required to implement a specific business capability, including:

- Commands
- Queries
- Handlers
- Validators
- Response DTOs
- Business Rules

Instead of navigating multiple folders to understand one feature, developers can work almost entirely within a single feature module.

---

# Why Vertical Slice Architecture?

As applications grow, traditional folder structures become difficult to navigate.

A single business operation may require visiting:

- Controllers
- Services
- Repositories
- DTOs
- Validators
- Mappings

This separation by technical responsibility increases cognitive load.

Vertical Slice Architecture keeps related code together.

---

# Traditional Layered Architecture

Traditional applications often look like this:

```text
Controllers/
Services/
Repositories/
DTOs/
Validators/
Models/
```

For example, implementing "Create Project" requires touching several unrelated folders.

```text
Controllers
    └── ProjectsController

Services
    └── ProjectService

Repositories
    └── ProjectRepository

Validators
    └── ProjectValidator

DTOs
    └── ProjectDto
```

Although technically organized, the feature itself is scattered.

---

# Vertical Slice Architecture

FlowForge organizes code by business feature.

Example:

```text
Features

└── Projects

    ├── Commands

    │   ├── CreateProject
    │   ├── UpdateProject
    │   ├── ArchiveProject
    │   └── RestoreProject

    ├── Queries

    │   ├── GetProjectById
    │   └── GetProjects

    ├── Rules

    └── DTOs
```

Everything related to Projects lives together.

The same convention is followed for Boards, Columns, Tasks, and every future module.

---

# Feature Independence

Each feature should be as self-contained as possible.

For example, the **Create Project** feature contains:

```text
CreateProject/

├── CreateProjectCommand.cs
├── CreateProjectHandler.cs
├── CreateProjectValidator.cs
└── CreateProjectResponse.cs
```

A developer implementing or debugging this feature rarely needs to leave this directory.

---

# Folder Structure

FlowForge follows this layout inside the Application project:

```text
Features/

├── Authentication
├── Organizations
├── Projects
├── Boards
├── Columns
├── Tasks
└── Dashboard
```

Each feature contains its own commands, queries, rules, and DTOs.

---

# Request Lifecycle

Every request follows the same high-level flow.

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
Feature
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
Persistence
      │
      ▼
HTTP Response
```

Vertical Slice Architecture defines **where** code lives, while CQRS defines **how** requests are separated.

---

# Relationship with CQRS

CQRS and Vertical Slice Architecture complement each other.

- **CQRS** separates reads from writes.
- **Vertical Slice Architecture** groups code by business capability.

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

CQRS defines the structure **inside** each feature.

Vertical Slice Architecture defines the organization **between** features.

---

# Shared Code

Not everything belongs inside a feature.

Reusable components should live in shared locations.

Examples include:

- ApiResponse
- Pagination
- Sorting
- Behaviors
- Interfaces
- Exceptions
- Constants

Feature-specific logic should never be moved into shared folders unless it is genuinely reusable.

---

# Benefits

Using Vertical Slice Architecture provides several advantages.

## Better Discoverability

Developers can locate everything related to a feature in one place.

---

## Reduced Coupling

Features evolve independently with minimal impact on other modules.

---

## Easier Maintenance

Changes usually affect a single feature rather than multiple technical layers.

---

## Improved Scalability

Adding new features does not require expanding generic service or repository classes.

---

## Better Onboarding

New developers can understand the project one feature at a time.

---

# Best Practices

✔ Organize code by business capability.

✔ Keep features self-contained.

✔ Follow consistent folder structures.

✔ Share only truly reusable components.

✔ Keep handlers focused on orchestration.

✔ Keep business logic in the Domain and Rule classes.

✔ Avoid creating feature-specific utilities in shared folders.

---

# Common Mistakes

Avoid the following patterns.

❌ Creating large service classes shared across unrelated features.

❌ Introducing generic repositories for every entity.

❌ Moving feature-specific code into Common or Shared.

❌ Breaking established folder conventions.

❌ Mixing multiple business operations into a single handler.

---

# Example: Create Project

The implementation of the Create Project feature demonstrates the complete Vertical Slice approach.

```text
Projects

└── Commands

    └── CreateProject

        ├── CreateProjectCommand.cs
        ├── CreateProjectHandler.cs
        ├── CreateProjectValidator.cs
        └── CreateProjectResponse.cs
```

This slice contains everything necessary for creating a project.

No unrelated code is required to understand or modify the feature.

---

# Evolution of the Project

As FlowForge grows, new features are added as new slices.

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

Tasks

↓

Comments

↓

Attachments

↓

Dashboard
```

Each slice follows the same architectural conventions, resulting in a predictable and scalable project structure.

---

# Summary

Vertical Slice Architecture is one of the key architectural decisions behind FlowForge.

By organizing the application around business capabilities instead of technical layers, FlowForge achieves:

- Better maintainability
- Easier navigation
- Reduced coupling
- Improved scalability
- Consistent feature development

Together with Clean Architecture and CQRS, Vertical Slice Architecture forms the foundation of FlowForge's overall design.