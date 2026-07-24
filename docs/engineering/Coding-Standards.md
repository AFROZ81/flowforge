# 💻 FlowForge Coding Standards

This document defines the coding standards used throughout the FlowForge codebase.

The goal of these standards is to produce code that is consistent, maintainable, readable, and easy to evolve as the project grows.

Coding standards are not intended to restrict creativity. Instead, they provide a common language that enables multiple developers to work together efficiently while reducing technical debt.

Every new feature, bug fix, and enhancement should follow these conventions.

---

# 📑 Table of Contents

- Introduction
- Coding Philosophy
- General Principles
- Project Structure Standards
- Naming Conventions
- Folder & File Organization
- Class Design Guidelines
- Method Design Guidelines
- Dependency Injection
- Async Programming Standards

---

# 📖 Introduction

FlowForge is built using modern .NET development practices including:

- ASP.NET Core
- Clean Architecture
- Vertical Slice Architecture
- CQRS
- MediatR
- Entity Framework Core
- FluentValidation

As the project grows, maintaining a consistent coding style becomes increasingly important.

Consistent code provides several benefits:

- Easier maintenance
- Faster onboarding
- Better readability
- Reduced bugs
- Simpler code reviews
- Improved collaboration

These standards apply across every project in the solution.

---

# 🎯 Coding Philosophy

The FlowForge codebase is guided by several engineering principles.

---

## Readability First

Code is read far more often than it is written.

Always prioritize readability over cleverness.

Prefer:

```csharp
if (project.IsArchived)
{
    throw new ProjectArchivedException();
}
```

instead of overly compact or difficult-to-read expressions.

---

## Simplicity

Prefer the simplest solution that satisfies the business requirement.

Avoid unnecessary abstraction, premature optimization, or overly generic implementations.

Simple code is easier to test, maintain, and debug.

---

## Consistency

Similar problems should be solved in similar ways.

Examples include:

- Consistent folder structures
- Consistent naming
- Consistent API responses
- Consistent validation
- Consistent exception handling

Developers should not need to learn a different style for each feature.

---

## Separation of Concerns

Every class should have one primary responsibility.

Responsibilities should remain clearly separated between:

- API
- Application
- Domain
- Infrastructure

Mixing concerns leads to tightly coupled code that is difficult to maintain.

---

## Explicitness

Avoid hidden behavior.

Methods should clearly communicate:

- What they do
- What they return
- What exceptions may occur
- What dependencies they require

Readable code should rarely require comments to explain its purpose.

---

# 🏛️ General Principles

The following principles apply throughout the entire solution.

✔ Follow the Single Responsibility Principle.

✔ Prefer composition over inheritance.

✔ Keep classes focused.

✔ Keep methods small.

✔ Avoid duplicate logic.

✔ Write self-explanatory code.

✔ Prefer immutability where practical.

✔ Validate input early.

✔ Fail fast when business rules are violated.

✔ Keep dependencies explicit.

---

## SOLID Principles

FlowForge embraces the SOLID principles where appropriate.

- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

These principles help create flexible and maintainable software without introducing unnecessary complexity.

---

# 📁 Project Structure Standards

Every project has a clearly defined responsibility.

```text
src/

    FlowForge.API

    FlowForge.Application

    FlowForge.Domain

    FlowForge.Infrastructure
```

Responsibilities must never overlap.

| Project | Responsibility |
|----------|----------------|
| API | HTTP endpoints and application entry point |
| Application | CQRS, business workflows, validation |
| Domain | Business entities and domain rules |
| Infrastructure | EF Core, Identity, persistence, external services |

Dependencies should always follow the Clean Architecture dependency rule.

```text
API
    │
Application
    │
Domain

Infrastructure
      ▲
```

The Domain project must remain independent of infrastructure concerns.

---

# 🏷️ Naming Conventions

Consistent naming improves readability and discoverability.

---

## Classes

Use **PascalCase**.

Examples:

```csharp
Project

Board

Column

WorkItem

CreateProjectCommand

UpdateBoardHandler
```

Class names should be nouns or noun phrases.

---

## Interfaces

Prefix interfaces with **I**.

Examples:

```csharp
IApplicationDbContext

ICurrentUserService

IDateTimeProvider
```

Interfaces should describe capabilities rather than implementations.

---

## Methods

Use PascalCase.

Method names should describe actions.

Examples:

```csharp
Create()

Update()

Archive()

Restore()

SaveChangesAsync()
```

Avoid vague names such as:

```text
DoWork()

HandleStuff()

ProcessData()
```

---

## Properties

Use PascalCase.

Examples:

```csharp
Name

Description

DisplayOrder

CreatedAt

UpdatedAt

IsArchived
```

Avoid unnecessary abbreviations.

---

## Variables

Use camelCase.

Examples:

```csharp
project

board

currentUser

organizationId
```

Variable names should be descriptive without becoming excessively long.

---

## Private Fields

Use camelCase prefixed with an underscore.

Example:

```csharp
private readonly IApplicationDbContext _context;

private readonly ILogger<CreateProjectHandler> _logger;
```

---

## Constants

Use PascalCase.

Example:

```csharp
DefaultPageSize

MaximumProjectNameLength

MinimumPasswordLength
```

---

## Enums

Use singular PascalCase names.

Example:

```csharp
ProjectStatus

WorkItemPriority

BoardType
```

Enum members should also use PascalCase.

---

# 📂 Folder & File Organization

Features follow Vertical Slice Architecture.

Example:

```text
Projects

├── Commands
├── Queries
├── Rules
└── DTOs
```

Each operation receives its own folder.

Example:

```text
CreateProject

├── CreateProjectCommand.cs
├── CreateProjectHandler.cs
├── CreateProjectValidator.cs
├── CreateProjectResponse.cs
```

Keeping related files together improves discoverability and reduces navigation time.

---

# 🧩 Class Design Guidelines

Every class should have one clear responsibility.

Examples include:

- Command
- Query
- Handler
- Validator
- Domain Entity
- Rule
- Response Model

Avoid creating classes that perform multiple unrelated tasks.

---

## Keep Classes Small

Large classes are harder to understand and maintain.

As a guideline:

- Controllers should remain thin.
- Handlers should coordinate workflows.
- Validators should only validate.
- Entities should contain business behavior.
- Services should encapsulate reusable operations.

If a class grows excessively, consider splitting responsibilities.

---

## Prefer Composition

Prefer composing behavior through smaller classes rather than relying on deep inheritance hierarchies.

Composition generally results in:

- Better flexibility
- Easier testing
- Reduced coupling

---

# ⚙️ Method Design Guidelines

Methods should perform a single well-defined task.

Good methods are:

- Small
- Descriptive
- Focused
- Easy to test

Prefer:

```csharp
project.Archive();

await _context.SaveChangesAsync(cancellationToken);
```

over methods that perform several unrelated operations.

---

## Early Returns

Reduce unnecessary nesting by returning early when appropriate.

Example:

```csharp
if (project.IsArchived)
{
    return;
}

project.Archive();
```

Early returns improve readability and reduce cognitive complexity.

---

## Keep Parameters Limited

Methods should accept only the parameters they genuinely require.

Large parameter lists often indicate misplaced responsibilities.

Consider encapsulating related values into request models or value objects when appropriate.

---

# 💉 Dependency Injection

FlowForge relies on constructor injection for dependencies.

Example:

```csharp
public sealed class CreateProjectHandler
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateProjectHandler> _logger;

    public CreateProjectHandler(
        IApplicationDbContext context,
        ILogger<CreateProjectHandler> logger)
    {
        _context = context;
        _logger = logger;
    }
}
```

Avoid:

- Service locators
- Static dependencies
- Manual service resolution

Constructor injection makes dependencies explicit and improves testability.

---

# ⚡ Async Programming Standards

Use asynchronous APIs whenever I/O operations are involved.

Examples include:

- Database access
- File operations
- HTTP requests
- External services

Async methods should use the `Async` suffix.

Examples:

```csharp
GetByIdAsync()

SaveChangesAsync()

CreateProjectAsync()
```

Always propagate the provided `CancellationToken` through asynchronous operations when supported.

Avoid blocking calls such as:

```csharp
.Result

.Wait()
```

These can lead to deadlocks and reduced scalability.

---

# 📨 Commands, Queries & Handlers

FlowForge follows the **CQRS (Command Query Responsibility Segregation)** pattern.

Every operation should clearly belong to either a **Command** or a **Query**.

---

## Commands

Commands modify application state.

Examples:

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveBoardCommand

MoveWorkItemCommand
```

Commands should:

- Represent a single business operation
- Contain only the data required for that operation
- Never return domain entities directly
- Be immutable where practical

Commands should not contain business logic.

---

## Queries

Queries retrieve information.

Examples:

```text
GetProjectsQuery

GetProjectByIdQuery

GetBoardsQuery

GetWorkItemsQuery
```

Queries must never modify application state.

They should focus exclusively on data retrieval.

---

## Handlers

Handlers coordinate application workflows.

Typical responsibilities include:

- Load data
- Validate business conditions
- Execute domain behavior
- Persist changes
- Return response models

Example flow:

```text
Command
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
Entity
      │
      ▼
Database
```

Handlers should remain concise and easy to understand.

---

# ✅ Validation Standards

Input validation is performed using **FluentValidation**.

Validators are responsible only for validating request models.

Typical validation includes:

- Required fields
- Maximum length
- Minimum length
- String format
- Numeric ranges
- Enumeration values

Example:

```csharp
RuleFor(x => x.Name)
    .NotEmpty()
    .MaximumLength(100);
```

Validators should **not**:

- Query the database
- Enforce business rules
- Modify data
- Throw business exceptions

Business rules belong in the Domain layer or dedicated rule classes.

---

# 🏗️ Entity Design

Entities represent business concepts.

Examples:

```text
Organization

Project

Board

Column

WorkItem
```

Entities should encapsulate business behavior.

Example:

```csharp
project.Archive();

project.Restore();

board.UpdateName(name);

workItem.MoveToColumn(columnId);
```

Avoid exposing mutable state unnecessarily.

Business behavior should be expressed through methods rather than allowing unrestricted property changes.

---

## Entity Responsibilities

Entities should:

- Protect invariants
- Enforce business rules
- Represent business concepts
- Expose meaningful behavior

Entities should not:

- Access the database
- Perform HTTP operations
- Send emails
- Read configuration
- Depend on infrastructure services

---

# 📦 DTO & Response Models

Data Transfer Objects (DTOs) define the contract between the API and its consumers.

DTOs should contain only the data required by the client.

Examples:

```text
CreateProjectResponse

ProjectSummaryDto

BoardDto

WorkItemDto
```

Avoid exposing domain entities directly through API responses.

This protects internal implementation details and allows the API contract to evolve independently of the domain model.

---

## Response Models

Every endpoint should return a strongly typed response model.

Examples:

```text
CreateProjectResponse

UpdateBoardResponse

GetProjectsResponse
```

Strongly typed responses improve:

- Readability
- Discoverability
- API documentation
- Client integration

---

# 🌐 Controller Standards

Controllers serve as the entry point for HTTP requests.

Controllers should remain thin.

Responsibilities include:

- Receive requests
- Validate route parameters
- Dispatch MediatR requests
- Return HTTP responses

Controllers should **not**:

- Implement business logic
- Access Entity Framework directly
- Instantiate services manually
- Perform validation beyond model binding

Typical controller flow:

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
Handler
      │
      ▼
HTTP Response
```

---

# ❌ Error Handling & Logging

Errors should be handled consistently across the application.

Unexpected exceptions should be managed through centralized exception handling.

Avoid exposing:

- Stack traces
- SQL exceptions
- Internal implementation details
- Sensitive configuration

Clients should receive clear, actionable error messages.

---

## Logging

Use `ILogger<T>` for application logging.

Log:

- Unexpected exceptions
- Security events
- Important business operations
- Startup and shutdown events

Avoid logging:

- Passwords
- Access tokens
- Connection strings
- Personally sensitive information

Logs should provide operational insight without exposing confidential data.

---

# 🚀 Performance Guidelines

Performance should be considered during development without sacrificing readability.

General recommendations:

✔ Use asynchronous APIs for I/O operations.

✔ Avoid unnecessary database queries.

✔ Retrieve only required data.

✔ Use pagination for collections.

✔ Minimize object allocations where practical.

✔ Avoid premature optimization.

Prefer readable and maintainable solutions unless profiling demonstrates a genuine performance bottleneck.

---

# 👀 Code Review Checklist

Every pull request should be reviewed against the following checklist.

### Architecture

- Clean Architecture respected
- Correct project boundaries
- Proper dependency direction

### Code Quality

- Single Responsibility Principle followed
- Clear naming
- Small methods
- No duplicated logic

### Validation

- Input validation implemented
- Business rules enforced appropriately

### Security

- Authorization verified
- Sensitive data protected
- No secrets committed

### Performance

- Efficient database access
- Pagination implemented where appropriate
- Async APIs used correctly

### Testing

- Existing functionality unaffected
- Edge cases considered
- Error scenarios handled

A consistent review process helps maintain code quality as the project grows.

---

# ⚠️ Common Anti-Patterns

Avoid the following patterns throughout the codebase.

---

## God Classes

Classes that perform many unrelated responsibilities.

Instead, split behavior into focused components.

---

## Fat Controllers

Controllers should not contain business logic.

Delegate all business behavior to handlers.

---

## Business Logic in Validators

Validators verify request structure.

Business rules belong in the Domain layer.

---

## Duplicate Logic

Shared behavior should be extracted into reusable components rather than copied between features.

---

## Static Dependencies

Avoid static state and service locators.

Prefer constructor injection.

---

## Deep Nesting

Prefer early returns to reduce cognitive complexity.

Example:

```csharp
if (project.IsArchived)
{
    return;
}

project.Update(name);
```

---

## Magic Numbers & Strings

Avoid hard-coded values.

Prefer:

- Constants
- Enumerations
- Configuration

---

# 📖 Summary

The FlowForge coding standards establish a consistent approach to writing maintainable, scalable, and high-quality software.

By following these conventions, contributors ensure that every feature aligns with the project's architectural principles and remains easy to understand, test, and extend.

These standards reinforce the use of:

- Clean Architecture
- Vertical Slice Architecture
- CQRS
- MediatR
- Entity Framework Core
- FluentValidation
- ASP.NET Core best practices

Consistency is one of the project's greatest strengths. Every contribution should reflect these standards so that FlowForge continues to grow as a cohesive, professional, and maintainable codebase.

---

<div align="center">

# 💻 FlowForge Coding Standards

### Writing Clean, Consistent and Maintainable Code

*"Great software is built one well-written class at a time. Consistency today prevents complexity tomorrow."*

</div>