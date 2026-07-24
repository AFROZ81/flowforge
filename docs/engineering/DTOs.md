# 📦 FlowForge Data Transfer Objects (DTOs)

Data Transfer Objects (DTOs) define how information moves between FlowForge and its clients.

Rather than exposing internal domain entities directly, FlowForge uses dedicated request and response models that act as stable contracts between the API and external consumers.

DTOs are a fundamental part of the application's architecture and work closely with **Clean Architecture**, **CQRS**, and **Vertical Slice Architecture** to keep business logic isolated from transport concerns.

---

# 📑 Table of Contents

- Introduction
- DTO Philosophy
- Why DTOs?
- Domain Entities vs DTOs
- Request DTOs
- Response DTOs
- Commands & Queries
- Mapping Strategy

---

# 📖 Introduction

Every interaction between a client and FlowForge passes through one or more Data Transfer Objects.

Examples include:

- Creating a project
- Updating a board
- Moving a WorkItem
- Retrieving projects
- Retrieving dashboard information
- Authenticating a user

Instead of sending or receiving Domain entities directly, the API communicates through purpose-built models.

This approach provides:

- Stable API contracts
- Better security
- Clear separation of concerns
- Reduced coupling
- Easier API evolution

---

# 🎯 DTO Philosophy

The philosophy behind DTOs is straightforward:

> **Domain models represent business behavior. DTOs represent data exchanged with external systems.**

A Domain entity exists to enforce business rules and model business concepts.

A DTO exists solely to transfer information.

Keeping these responsibilities separate results in a cleaner architecture where changes to one layer do not unnecessarily impact another.

---

## One DTO, One Purpose

Every DTO should represent a single business operation.

Examples include:

```text
CreateProjectRequest

UpdateProjectRequest

ProjectResponse

BoardResponse

WorkItemResponse
```

Each DTO contains only the properties required for that specific operation.

This keeps API contracts small, explicit, and easy to understand.

---

# ❓ Why DTOs?

Without DTOs, an application may expose its internal models directly to clients.

This tightly couples the API to the persistence layer and makes future changes risky.

DTOs solve this by introducing a dedicated communication layer between the API and the Domain.

Benefits include:

- Stable contracts
- Better encapsulation
- Improved security
- Simpler versioning
- Clear ownership of exposed data

---

## Problems Without DTOs

Returning Domain entities directly can introduce several issues.

For example:

```text
Client
   │
   ▼
Controller
   │
   ▼
Domain Entity
   │
   ▼
Database
```

This approach may:

- Expose internal identifiers
- Reveal navigation properties
- Leak implementation details
- Return unnecessary data
- Couple API contracts to persistence models

Any future change to the entity may unintentionally break API consumers.

---

## Benefits of Using DTOs

FlowForge uses DTOs to establish a clear boundary between external consumers and internal business logic.

Advantages include:

- Explicit request and response contracts
- Independent API evolution
- Controlled exposure of data
- Better maintainability
- Reduced coupling between layers

DTOs ensure that only the information intended for clients is exchanged.

---

# 🏛️ Domain Entities vs DTOs

Although they may appear similar, Domain entities and DTOs serve fundamentally different purposes.

| Domain Entity | DTO |
|--------------|-----|
| Models business concepts | Models API communication |
| Contains business behavior | Contains only data |
| Lives in the Domain layer | Lives in the Application layer |
| Enforces invariants | Defines request/response contracts |
| Never exposed directly | Exchanged with clients |

A Domain entity is responsible for maintaining the integrity of business rules.

A DTO is responsible for transporting data between systems.

---

## Domain Entity Example

A `Project` entity may contain:

- Business methods
- State transitions
- Validation logic
- Domain invariants

Its purpose is to model business behavior rather than API communication.

---

## DTO Example

A project response might include:

```text
ProjectResponse

Id

Name

Description

Status

CreatedAt
```

It contains only the information that the client needs.

No business logic belongs inside the DTO.

---

# 📥 Request DTOs

Request DTOs represent information sent by the client.

In FlowForge, request models are implemented through **Commands** and **Queries**.

Examples include:

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveProjectCommand

RestoreProjectCommand

CreateBoardCommand

MoveWorkItemCommand

GetProjectsQuery

GetProjectByIdQuery
```

Each request contains only the data required for that specific operation.

---

## Characteristics of Request DTOs

A request DTO should:

✔ Represent one operation.

✔ Be immutable where practical.

✔ Contain only required input.

✔ Avoid business logic.

✔ Be validated using FluentValidation.

Request DTOs should remain simple data carriers.

---

# 📤 Response DTOs

Every endpoint returns a dedicated response model.

Examples include:

```text
CreateProjectResponse

UpdateProjectResponse

ProjectResponse

BoardResponse

WorkItemResponse

DashboardResponse
```

Each response is designed specifically for the client consuming that endpoint.

---

## Characteristics of Response DTOs

A response DTO should:

✔ Contain only relevant information.

✔ Hide internal implementation details.

✔ Avoid exposing Domain entities.

✔ Remain independent of persistence concerns.

✔ Be stable across client applications.

This approach allows the internal implementation to evolve without breaking API consumers.

---

# 🔀 Commands & Queries

FlowForge implements request DTOs through CQRS.

Commands represent operations that modify application state.

Examples:

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveProjectCommand

CreateBoardCommand

MoveWorkItemCommand
```

Queries retrieve information.

Examples:

```text
GetProjectsQuery

GetProjectByIdQuery

GetBoardsQuery

GetWorkItemsQuery
```

Each request acts as both a DTO and a CQRS request model.

This keeps request contracts closely aligned with business operations.

---

# 🔄 Mapping Strategy

Handlers are responsible for transforming data between different models.

The overall flow is:

```text
HTTP Request
      │
      ▼
Request DTO
      │
      ▼
Command / Query
      │
      ▼
Handler
      │
      ▼
Domain Entity
      │
      ▼
Persistence
      │
      ▼
Response DTO
      │
      ▼
ApiResponse<T>
```

Each transformation has a clearly defined responsibility.

---

## Mapping Responsibilities

Handlers typically perform the following mappings:

- Request DTO → Domain Entity
- Domain Entity → Response DTO
- Query Result → Response DTO

Keeping mapping logic inside handlers ensures that Domain entities remain isolated from external consumers.

---

# ✅ Validation

Every incoming request DTO is validated before any business logic executes.

FlowForge uses **FluentValidation** to ensure that requests are structurally correct before they reach their handlers.

Typical validation includes:

- Required fields
- Maximum and minimum lengths
- String formats
- Numeric ranges
- Collection constraints
- Basic consistency checks

Example:

```text
HTTP Request
      │
      ▼
CreateProjectCommand
      │
      ▼
CreateProjectValidator
      │
      ▼
Valid Request
      │
      ▼
CreateProjectHandler
```

If validation fails, the request is rejected immediately and the handler is never executed.

This keeps handlers focused exclusively on business workflows.

---

## Validation vs Business Rules

Validation verifies whether the incoming request is structurally valid.

Examples:

✔ Project name is required.

✔ Name cannot exceed 100 characters.

✔ OrganizationId is provided.

✔ StartDate is a valid date.

Business rules determine whether the requested operation is permitted.

Examples:

✔ Project name must be unique.

✔ Archived projects cannot be modified.

✔ A board cannot be created for an archived project.

✔ A WorkItem cannot be moved to a completed column.

Validation belongs in validators.

Business rules belong in dedicated rule classes or the Domain layer.

---

# 🌐 API Contracts

DTOs define the contract between FlowForge and its clients.

Clients interact exclusively with request and response DTOs rather than internal Domain entities.

Example request:

```json
{
  "name": "FlowForge",
  "description": "Enterprise Project Management Platform"
}
```

Example response:

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "d3b5f4d8-7d61-4e9f-b58d-98d2a6a5c123"
  }
}
```

Every endpoint follows a consistent response structure using `ApiResponse<T>`.

This consistency simplifies client integration and improves API usability.

---

## Why Stable Contracts Matter

Stable DTO contracts provide several advantages:

- Predictable client integration
- Reduced breaking changes
- Easier documentation
- Better backward compatibility
- Independent internal evolution

Changes to Domain entities should not require changes to client applications.

---

# 🔄 Versioning Considerations

As FlowForge evolves, API contracts may require changes.

DTOs make these changes manageable because they separate public contracts from internal models.

Possible changes include:

- New optional properties
- Additional response metadata
- Improved request models
- Enhanced filtering options

Existing clients can continue using earlier DTO versions while newer clients adopt updated contracts.

This flexibility would be much harder to achieve if Domain entities were exposed directly.

---

# ⚖️ Relationship with CQRS

DTOs work closely with CQRS.

Commands and Queries act as request DTOs.

Response models act as response DTOs.

Example:

```text
Client
      │
      ▼
CreateProjectCommand
      │
      ▼
Handler
      │
      ▼
Project Entity
      │
      ▼
CreateProjectResponse
      │
      ▼
Client
```

CQRS defines the request type.

DTOs define the data exchanged.

Together they create clear and explicit request contracts.

---

# 🧩 Relationship with Vertical Slice Architecture

Vertical Slice Architecture organizes DTOs by business capability.

Example:

```text
Projects

├── Commands

├── Queries

├── DTOs

└── Rules
```

Boards:

```text
Boards

├── Commands

├── Queries

├── DTOs

└── Rules
```

Each feature owns its own request and response models.

This improves discoverability and keeps related code together.

---

# 🧪 Testing Strategy

DTOs contribute to reliable API testing.

Typical tests include:

```text
Request Validation

↓

Handler Execution

↓

Response Verification
```

Tests should verify:

- Valid requests are accepted.
- Invalid requests are rejected.
- Response DTOs contain expected data.
- Sensitive information is never exposed.

Because DTOs have a single responsibility, they are straightforward to test and maintain.

---

# 📋 Best Practices

Follow these conventions throughout FlowForge.

✔ Create one request model per operation.

✔ Create one response model per endpoint.

✔ Keep DTOs small and purpose-specific.

✔ Use meaningful names.

✔ Keep DTOs free of business logic.

✔ Return DTOs instead of Domain entities.

✔ Keep request and response models separate.

✔ Design DTOs around client needs rather than database structure.

✔ Maintain consistent API response formats.

---

# ⚠️ Common Anti-Patterns

Avoid the following patterns.

---

## Returning Domain Entities

Never expose Entity Framework Core entities directly through the API.

Doing so:

- Leaks implementation details
- Couples clients to persistence models
- Exposes navigation properties
- Makes future changes difficult

Always return dedicated response DTOs.

---

## Reusing One DTO Everywhere

Avoid creating a single DTO that attempts to support multiple unrelated operations.

Instead, create focused models such as:

```text
CreateProjectRequest

UpdateProjectRequest

ProjectResponse
```

Each DTO should have one clear purpose.

---

## Business Logic Inside DTOs

DTOs are data containers.

They should never:

- Execute business logic
- Access databases
- Perform calculations
- Enforce business policies

These responsibilities belong elsewhere in the architecture.

---

## God DTOs

Avoid extremely large DTOs containing unrelated information.

Large DTOs:

- Increase coupling
- Slow API evolution
- Confuse consumers

Prefer smaller, operation-specific models.

---

## Coupling DTOs to Database Structure

DTOs should represent client requirements, not table structures.

Changes to database design should not automatically require changes to API contracts.

---

# 🚀 Future Evolution

As FlowForge grows, additional request and response models will be introduced.

Examples include:

```text
CommentResponse

NotificationResponse

AttachmentResponse

DashboardSummaryResponse

OrganizationSettingsResponse

UserProfileResponse
```

Every new DTO will follow the same principles:

- One responsibility
- Explicit contract
- No business logic
- Stable API surface
- Independent of persistence

This consistency ensures that the API remains easy to understand and evolve.

---

# 📖 Summary

Data Transfer Objects are the communication layer between FlowForge and its clients.

By separating Domain entities from API contracts, DTOs provide:

- Stable request and response models
- Better security
- Reduced coupling
- Improved maintainability
- Easier API evolution

Combined with:

- Clean Architecture
- CQRS
- Vertical Slice Architecture
- FluentValidation

DTOs ensure that every endpoint exposes only the data intended for clients while protecting the application's internal business model.

As FlowForge continues to grow, these conventions will provide a consistent, scalable, and maintainable approach to designing API contracts.

---

<div align="center">

# 📦 FlowForge Data Transfer Objects

### Stable Contracts for Clear Communication Between the API and Its Clients

*"Domain entities model business behavior. DTOs model communication. Keeping these responsibilities separate creates APIs that are secure, maintainable, and built to evolve."*

</div>