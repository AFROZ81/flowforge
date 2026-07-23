# Solution Structure

This document describes how the FlowForge solution is organized and explains the responsibility of each project, folder, and feature.

The goal of the solution structure is to make the application easy to navigate, scalable as new features are added, and consistent across the entire codebase.

---

# Table of Contents

- Overview
- Solution Layout
- Project Responsibilities
- Folder Structure
- Feature Structure
- Naming Conventions
- Dependency Rules
- Adding a New Feature
- Best Practices

---

# Overview

FlowForge is organized using **Clean Architecture** and **Vertical Slice Architecture**.

At the highest level, the solution is divided into four primary projects:

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

Each project has a single, clearly defined responsibility.

---

# Project Responsibilities

## FlowForge.API

The API project is the entry point of the application.

Responsibilities:

- Configure ASP.NET Core
- Configure Dependency Injection
- Configure Authentication
- Configure Authorization
- Configure Middleware
- Configure Swagger
- Expose REST endpoints

Contains:

```text
Controllers
Extensions
Middleware
Configuration
Program.cs
```

The API project should never contain business logic.

---

## FlowForge.Application

The Application project contains all use cases.

Responsibilities:

- Commands
- Queries
- Validators
- DTOs
- Mapping
- Behaviors
- Interfaces

This layer coordinates business operations but does not implement business rules.

Typical structure:

```text
Application

Features

Shared

Common

Interfaces
```

---

## FlowForge.Domain

The Domain project contains the core business model.

Responsibilities:

- Entities
- Domain Behavior
- Business Rules
- Value Objects (future)
- Domain Exceptions

Example:

```text
Entities

Project

Board

Column

Task
```

The Domain layer is completely independent of ASP.NET Core and Entity Framework.

---

## FlowForge.Infrastructure

Infrastructure provides technical implementations.

Responsibilities:

- Entity Framework Core
- SQL Server
- Identity
- Persistence
- External Services
- File Storage
- Email
- Logging

Infrastructure implements interfaces defined by the Application layer.

---

# Folder Structure

A simplified view of the solution:

```text
src/

FlowForge.API
│
├── Controllers
├── Extensions
├── Middleware
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
└── DependencyInjection
```

---

# Feature Structure

Every business feature follows the same layout.

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
│   └── ProjectRules.cs
│
└── DTOs
```

The Board module follows exactly the same convention.

Consistency is more important than creativity.

---

# Command Structure

Each command folder contains everything required for that operation.

Example:

```text
CreateProject

CreateProjectCommand.cs

CreateProjectHandler.cs

CreateProjectValidator.cs

CreateProjectResponse.cs
```

Benefits:

- Self-contained feature
- Easy navigation
- Low coupling
- Predictable structure

---

# Query Structure

Queries follow the same organization.

Example:

```text
GetProjects

GetProjectsQuery.cs

GetProjectsHandler.cs

GetProjectsResponse.cs
```

---

# Shared Components

Common functionality lives under the Shared/Common folders.

Examples include:

- ApiResponse
- Pagination
- Sorting
- Behaviors
- Exceptions
- Interfaces
- Constants

Shared code should be generic and reusable.

Feature-specific logic should remain within its feature.

---

# Naming Conventions

## Commands

```text
CreateProjectCommand

UpdateBoardCommand

ArchiveColumnCommand
```

---

## Queries

```text
GetProjectByIdQuery

GetProjectsQuery

GetBoardQuery
```

---

## Handlers

```text
CreateProjectHandler

UpdateBoardHandler
```

---

## Validators

```text
CreateProjectValidator

UpdateBoardValidator
```

---

## Responses

```text
CreateProjectResponse

GetBoardResponse
```

---

## Rule Classes

```text
ProjectRules

BoardRules

ColumnRules
```

---

# Dependency Rules

Dependencies always move inward.

```text
API

↓

Application

↓

Domain

↑

Infrastructure
```

Allowed:

- API → Application
- Application → Domain
- Infrastructure → Application
- Infrastructure → Domain

Not Allowed:

- Domain → Infrastructure
- Domain → API
- Application → API

---

# Adding a New Feature

Every new feature should follow the same workflow.

## Step 1

Design the domain entity.

---

## Step 2

Define business rules.

---

## Step 3

Create Commands.

---

## Step 4

Create Queries.

---

## Step 5

Add Validators.

---

## Step 6

Implement Handlers.

---

## Step 7

Expose API endpoints.

---

## Step 8

Document the feature.

---

## Step 9

Test the feature.

---

## Step 10

Commit and tag the milestone.

---

# Best Practices

✔ Keep controllers thin.

✔ Keep handlers focused on orchestration.

✔ Keep business logic inside entities and rule classes.

✔ Reuse shared infrastructure where appropriate.

✔ Follow the established feature structure.

✔ Avoid introducing new patterns without a clear architectural benefit.

✔ Maintain consistency across all modules.

---

# Example Module

A completed module typically looks like this:

```text
Projects

├── Commands
│   ├── CreateProject
│   ├── UpdateProject
│   ├── ArchiveProject
│   └── RestoreProject
│
├── Queries
│   ├── GetProjectById
│   └── GetProjects
│
├── Rules
│   └── ProjectRules.cs
│
└── DTOs
```

Every future module—Boards, Columns, Tasks, Comments, and beyond—should follow the same structure unless there is a compelling architectural reason to deviate.

---

# Summary

The FlowForge solution structure is designed to maximize clarity, consistency, and scalability.

By organizing code around business capabilities rather than technical layers, developers can quickly locate related code, understand feature boundaries, and extend the application without introducing unnecessary complexity.

As the application grows, maintaining this structure will be key to preserving long-term maintainability and developer productivity.