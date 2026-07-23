# Boards Module

The Boards module is responsible for managing boards within a project.

A board represents a workspace inside a project where work is organized. Every board belongs to a single project and inherits its organization context.

The module follows the CQRS pattern and is implemented using MediatR, FluentValidation, Entity Framework Core, and ASP.NET Core Web API.

---

# Table of Contents

- Overview
- Features
- Board Lifecycle
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
- Relationships
- Summary

---

# Overview

Boards are child entities of Projects.

Every board belongs to exactly one project.

Before any board operation is performed, the application validates the associated project and ensures the current user has access to it.

The Boards module provides complete lifecycle management for boards, including creation, retrieval, updating, archiving, and restoring.

---

# Features

The Boards module currently supports:

- Create Board
- Get All Boards
- Get Board By Id
- Update Board
- Archive Board
- Restore Board

---

# Board Lifecycle

A board progresses through the following lifecycle.

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

Boards are archived instead of permanently deleted.

---

# Module Structure

The module is organized as follows.

```text
Boards

├── Commands
│
│   ├── CreateBoard
│   ├── UpdateBoard
│   ├── ArchiveBoard
│   └── RestoreBoard
│
├── Queries
│
│   ├── GetBoardById
│   └── GetBoards
│
├── DTOs
│
└── Rules
```

---

# Entity

The primary entity of this module is:

```text
Board
```

The Board entity contains the board's business data and exposes methods to manage its state.

Current entity behavior includes:

- Update()
- Archive()
- Restore()

These methods encapsulate the board's state transitions.

---

# Business Rules

Business rules are implemented in:

```text
BoardRules
```

The rule class is responsible for validating business-specific conditions before changes are persisted.

Current responsibilities include:

- Validate project existence
- Ensure project is not archived
- Validate board existence
- Validate board archive status
- Prevent duplicate board names within a project
- Validate organization ownership

These checks are executed before any state changes occur.

---

# Commands

The module currently implements the following commands.

---

## Create Board

Purpose

Creates a new board within a project.

Responsibilities

- Validate request
- Verify project
- Verify business rules
- Create board
- Save changes
- Return response

---

## Update Board

Purpose

Updates an existing board.

Responsibilities

- Load board
- Validate ownership
- Update entity
- Save changes

---

## Archive Board

Purpose

Marks an active board as archived.

Archived boards remain available for future restoration.

---

## Restore Board

Purpose

Restores a previously archived board.

---

# Queries

The module currently implements the following queries.

---

## Get Boards

Returns the list of boards accessible to the current organization.

---

## Get Board By Id

Returns the details of a single board.

---

# Validation

Request validation is implemented using FluentValidation.

Current validators include:

```text
CreateBoardValidator

UpdateBoardValidator
```

Validation checks request data before business rules are executed.

Business-specific validation is handled by BoardRules.

---

# API Endpoints

The Boards module exposes the following endpoints.

---

## Create Board

```http
POST /api/boards
```

---

## Get Boards

```http
GET /api/boards
```

---

## Get Board By Id

```http
GET /api/boards/{id}
```

---

## Update Board

```http
PUT /api/boards/{id}
```

---

## Archive Board

```http
PATCH /api/boards/{id}/archive
```

---

## Restore Board

```http
PATCH /api/boards/{id}/restore
```

---

# Request Flow

Every request follows the same execution path.

```text
HTTP Request
      │
      ▼
BoardsController
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
BoardRules
      │
      ▼
Board Entity
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
CreateBoardResponse

UpdateBoardResponse

GetBoardByIdResponse

GetBoardsResponse

ArchiveBoardResponse

RestoreBoardResponse
```

Responses follow the common API response format used throughout FlowForge.

---

# Module Dependencies

The Boards module depends on:

- Entity Framework Core
- SQL Server
- MediatR
- FluentValidation
- BoardRules
- ASP.NET Core Web API
- Current User Service

---

# Relationships

The Boards module depends on the Projects module.

Relationship

```text
Project
    │
    ▼
Board
```

A board cannot exist without an associated project.

The module validates the parent project before allowing board creation or modification.

---

# Summary

The Boards module manages the complete lifecycle of boards within a project.

It provides functionality to create, retrieve, update, archive, and restore boards while enforcing business rules through BoardRules. Every board belongs to a project, and all operations are validated against the current authenticated user's organization before being persisted to the database.