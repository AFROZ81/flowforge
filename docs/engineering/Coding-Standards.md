# Coding Standards

This document defines the coding standards followed throughout the FlowForge project.

The purpose of these standards is to maintain consistency, improve readability, reduce bugs, and make collaboration easier.

Every feature added to FlowForge should follow these conventions.

---

# Table of Contents

- General Principles
- Naming Conventions
- File Organization
- Classes
- Methods
- Properties
- Variables
- Commands & Queries
- Handlers
- Validators
- Controllers
- Entities
- Business Rules
- API Responses
- Error Handling
- Comments
- Summary

---

# General Principles

FlowForge follows these principles:

- Write readable code.
- Prefer clarity over cleverness.
- Keep classes focused.
- Follow the Single Responsibility Principle.
- Avoid unnecessary abstractions.
- Keep methods short and meaningful.

---

# Naming Conventions

## Classes

Use PascalCase.

Examples

```csharp
Project

Board

CreateProjectCommand

UpdateBoardHandler
```

---

## Interfaces

Prefix interfaces with **I**.

Examples

```csharp
IApplicationDbContext

ICurrentUserService
```

---

## Methods

Use PascalCase.

Methods should describe an action.

Examples

```csharp
Create()

Update()

Archive()

Restore()

SaveChangesAsync()
```

---

## Properties

Use PascalCase.

Examples

```csharp
Name

Description

CreatedAt

UpdatedAt
```

---

## Variables

Use camelCase.

Examples

```csharp
project

board

currentUser
```

---

## Constants

Use PascalCase.

Examples

```csharp
DefaultPageSize

MaxProjectNameLength
```

---

# File Organization

Each feature follows the same folder structure.

Example

```text
Projects

Commands

Queries

Rules

DTOs
```

Each command has its own folder.

Example

```text
CreateProject

CreateProjectCommand.cs

CreateProjectHandler.cs

CreateProjectValidator.cs

CreateProjectResponse.cs
```

---

# Classes

Each class should have a single responsibility.

Examples

- Command
- Query
- Handler
- Validator
- Response

Avoid combining multiple responsibilities into one class.

---

# Methods

Methods should:

- Perform one task.
- Have descriptive names.
- Return early when appropriate.
- Avoid unnecessary nesting.

Example

```csharp
project.Archive();

board.Update();

await context.SaveChangesAsync();
```

---

# Properties

Entity properties should use meaningful names.

Examples

```csharp
Name

Description

IsArchived

CreatedAt
```

Avoid abbreviations.

---

# Commands

Commands represent write operations.

Examples

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveBoardCommand
```

Commands should contain only the data required for that operation.

---

# Queries

Queries represent read operations.

Examples

```text
GetProjectsQuery

GetBoardByIdQuery
```

Queries should never modify data.

---

# Handlers

Handlers coordinate a request.

Responsibilities include:

- Load data
- Execute business rules
- Call entity methods
- Save changes
- Return a response

Handlers should remain focused and easy to read.

---

# Validators

Validation is implemented using FluentValidation.

Validators are responsible for validating incoming requests.

Examples

```text
Required fields

Maximum length

Minimum length

Invalid formats
```

Business rules belong in Rule classes, not validators.

---

# Controllers

Controllers act as the entry point for HTTP requests.

Responsibilities include:

- Receive requests
- Call MediatR
- Return responses

Controllers should not contain business logic.

---

# Entities

Entities represent business concepts.

Examples

```text
Organization

Project

Board
```

Behavior should be implemented through methods.

Examples

```csharp
Update()

Archive()

Restore()
```

---

# Business Rules

Business rules are implemented using dedicated rule classes.

Examples

```text
ProjectRules

BoardRules
```

Typical responsibilities include:

- Duplicate validation
- Archived checks
- Organization ownership
- Parent existence

---

# API Responses

Every endpoint returns a strongly typed response.

Examples

```text
CreateProjectResponse

UpdateBoardResponse

GetProjectsResponse
```

This keeps API contracts explicit and consistent.

---

# Error Handling

Use meaningful exception messages.

Do not expose:

- SQL errors
- Stack traces
- Internal implementation details

Return consistent API responses for errors.

---

# Comments

Write comments only when they add value.

Good examples:

- Explain business reasoning.
- Explain complex algorithms.
- Explain non-obvious decisions.

Avoid comments that simply repeat the code.

Bad

```csharp
// Set Name
project.Name = name;
```

Good

```csharp
// Prevent duplicate project names within the same organization.
```

---

# Summary

Following consistent coding standards improves readability, simplifies maintenance, and makes the project easier to extend.

Every new feature should follow these conventions to keep the FlowForge codebase clean, predictable, and easy to navigate.