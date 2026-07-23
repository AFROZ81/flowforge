# Projects Module

The Projects module is responsible for managing projects within an organization.

A project acts as the top-level business entity that groups related boards and serves as the starting point for organizing work in FlowForge.

The module follows the CQRS pattern and is implemented using MediatR, FluentValidation, Entity Framework Core, and ASP.NET Core Web API.

---

# Table of Contents

- Overview
- Features
- Project Lifecycle
- Module Structure
- Entity
- Business Rules
- Commands
- Queries
- Validation
- API Endpoints
- Request Flow
- Response Models
- Dependencies
- Summary

---

# Overview

Projects represent the primary workspace within an organization.

Every board belongs to a project, making the project the parent entity for subsequent business modules.

The Projects module provides complete lifecycle management including creation, retrieval, updating, archiving, and restoring.

---

# Features

The Projects module currently supports:

- Create Project
- Get All Projects
- Get Project By Id
- Update Project
- Archive Project
- Restore Project

---

# Project Lifecycle

A project progresses through the following lifecycle.

```text
Create
   │
   ▼
Active
   │
   ├──────────────► Update
   │
   ▼
Archive
   │
   ▼
Restore
   │
   ▼
Active
```

Projects are archived instead of permanently deleted.

---

# Module Structure

The module is organized as follows.

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
├── DTOs
│
└── Rules
```

---

# Entity

The primary entity of this module is:

```text
Project
```

The Project entity contains the project's business data and exposes methods to manage its state.

Current entity behavior includes:

- Update()
- Archive()
- Restore()

These methods encapsulate the project's state transitions.

---

# Business Rules

Business rules are implemented in:

```text
ProjectRules
```

The rule class is responsible for validating business-specific conditions before changes are persisted.

Examples include:

- Project existence
- Archived status validation
- Duplicate project name validation
- Organization ownership validation

Separating these checks from handlers keeps request processing clean and consistent.

---

# Commands

The module currently implements the following commands.

---

## Create Project

Purpose

Creates a new project.

Responsibilities

- Validate request
- Verify business rules
- Create project entity
- Save changes
- Return response

---

## Update Project

Purpose

Updates an existing project.

Responsibilities

- Load project
- Validate ownership
- Update entity
- Save changes

---

## Archive Project

Purpose

Marks an active project as archived.

Archived projects remain in the database and can be restored later.

---

## Restore Project

Purpose

Restores a previously archived project.

---

# Queries

The module currently implements the following queries.

---

## Get Projects

Returns the list of projects available to the current organization.

---

## Get Project By Id

Returns the details of a single project.

---

# Validation

Request validation is performed using FluentValidation.

Current validators include:

```text
CreateProjectValidator

UpdateProjectValidator
```

Validation checks request data before executing business logic.

Business-specific validation remains inside ProjectRules.

---

# API Endpoints

The Projects module exposes the following endpoints.

---

## Create Project

```http
POST /api/projects
```

---

## Get Projects

```http
GET /api/projects
```

---

## Get Project By Id

```http
GET /api/projects/{id}
```

---

## Update Project

```http
PUT /api/projects/{id}
```

---

## Archive Project

```http
PATCH /api/projects/{id}/archive
```

---

## Restore Project

```http
PATCH /api/projects/{id}/restore
```

---

# Request Flow

Every request follows the same execution path.

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
Validator
      │
      ▼
Handler
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
API Response
```

---

# Response Models

Each endpoint returns a dedicated response model.

Examples include:

```text
CreateProjectResponse

UpdateProjectResponse

GetProjectByIdResponse

GetProjectsResponse

ArchiveProjectResponse

RestoreProjectResponse
```

Responses are returned using the shared API response format used throughout the application.

---

# Module Dependencies

The Projects module depends on:

- Entity Framework Core
- SQL Server
- MediatR
- FluentValidation
- ProjectRules
- ASP.NET Core Web API
- Current User Service

---

# Relationships

The Projects module is the parent module for Boards.

Relationship

```text
Project
    │
    ▼
Board
```

A board cannot exist without an associated project.

---

# Summary

The Projects module provides complete lifecycle management for projects within FlowForge.

It serves as the foundation for organizing work by allowing authenticated users to create, retrieve, update, archive, and restore projects. The module follows the CQRS pattern, applies request validation using FluentValidation, enforces business rules through ProjectRules, and persists data using Entity Framework Core.