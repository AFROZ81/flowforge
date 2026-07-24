# 🌐 FlowForge API Design

The FlowForge API provides a consistent and secure interface for clients to interact with the application's business capabilities.

Built using **ASP.NET Core Web API**, the API follows REST principles while integrating seamlessly with **Clean Architecture**, **Vertical Slice Architecture**, and **CQRS**.

Every endpoint is designed to be predictable, discoverable, and independent of internal implementation details.

---

# 📑 Table of Contents

- Introduction
- API Philosophy
- REST Principles
- API Architecture
- URL Design
- HTTP Methods
- Request Lifecycle
- Request & Response Format

---

# 📖 Introduction

The API serves as the communication layer between external clients and the FlowForge application.

Clients may include:

- Web applications
- Mobile applications
- Third-party integrations
- Automation tools
- Future desktop applications

Regardless of the client, every request follows the same execution pipeline and returns a standardized response.

The API exposes business capabilities without exposing internal implementation details.

---

# 🎯 API Philosophy

The FlowForge API is designed around several core principles.

---

## Consistency

Every endpoint follows the same conventions for:

- URL structure
- HTTP methods
- Validation
- Error handling
- Authentication
- Response formatting

Consistency reduces the learning curve for developers consuming the API.

---

## Predictability

Clients should be able to predict endpoint behavior without consulting implementation details.

For example:

```http
GET    /api/projects

POST   /api/projects

PUT    /api/projects/{id}

PATCH  /api/projects/{id}/archive

PATCH  /api/projects/{id}/restore
```

Every resource follows the same pattern.

---

## Separation of Concerns

Controllers do not contain business logic.

Instead they:

- Receive requests
- Dispatch commands or queries
- Return standardized responses

Business behavior is delegated to the Application and Domain layers.

---

## Secure by Default

Protected resources require authentication.

Authorization is enforced before business operations execute.

Security is considered a fundamental design principle rather than an optional feature.

---

# 🌍 REST Principles

FlowForge follows the principles of Representational State Transfer (REST).

REST emphasizes resources rather than actions.

Resources include:

```text
Organizations

Projects

Boards

Columns

WorkItems
```

Each resource is identified by a unique URI.

Clients manipulate resources using standard HTTP methods rather than custom endpoint names.

---

## Resource-Oriented Design

Good examples:

```http
GET    /api/projects

POST   /api/projects

PUT    /api/projects/{id}

PATCH  /api/projects/{id}/archive
```

Poor examples:

```http
POST /CreateProject

GET  /GetProjects

POST /UpdateBoard
```

URLs should identify resources—not operations.

---

## Stateless Communication

Every request contains all information required for processing.

The server does not rely on previous requests.

Benefits include:

- Better scalability
- Simpler deployments
- Easier load balancing
- Improved reliability

---

# 🏗️ API Architecture

The API integrates directly with the architectural patterns used throughout FlowForge.

```text
Client
      │
      ▼
HTTP Request
      │
      ▼
ASP.NET Core Controller
      │
      ▼
MediatR
      │
      ▼
Command / Query
      │
      ▼
Handler
      │
      ▼
Domain
      │
      ▼
Infrastructure
      │
      ▼
SQL Server
```

Each layer performs a single responsibility.

---

## Controller Responsibilities

Controllers are intentionally lightweight.

Responsibilities include:

- Receive HTTP requests
- Validate routing information
- Dispatch MediatR requests
- Return HTTP responses

Controllers should never:

- Contain business rules
- Access Entity Framework directly
- Manipulate domain entities
- Implement workflow logic

---

## CQRS at the API Layer

The API reflects the CQRS architecture used internally.

Commands modify application state.

Examples:

```text
Create Project

Update Board

Archive Column

Move WorkItem
```

Queries retrieve information.

Examples:

```text
Get Projects

Get Boards

Get Columns

Get WorkItems
```

This separation improves maintainability and makes endpoint behavior easier to understand.

---

# 🔗 URL Design

FlowForge follows predictable URL conventions.

Base development URL:

```text
https://localhost:5001/api
```

Typical endpoints:

```http
GET  /api/projects

GET  /api/projects/{id}

POST /api/projects

PUT  /api/projects/{id}

PATCH /api/projects/{id}/archive

PATCH /api/projects/{id}/restore
```

Every endpoint represents a business resource.

---

## Naming Rules

Use:

- Plural nouns
- Lowercase URLs
- Resource identifiers
- Hierarchical ownership where appropriate

Examples:

```text
/projects

/boards

/columns

/workitems

/organizations
```

Avoid:

- Verbs
- RPC-style URLs
- Technology-specific naming

---

## Nested Resources

Nested resources should only be used when ownership adds meaningful context.

Example:

```http
GET /api/projects/{projectId}/boards
```

Avoid unnecessary nesting that makes endpoints difficult to understand.

---

# ⚡ HTTP Methods

FlowForge uses standard HTTP verbs according to their intended semantics.

---

## GET

Retrieves data without modifying server state.

Examples:

```http
GET /api/projects

GET /api/projects/{id}
```

Characteristics:

- Safe
- Idempotent
- Cacheable

---

## POST

Creates a new resource.

Example:

```http
POST /api/projects
```

Typical response:

```http
201 Created
```

---

## PUT

Replaces or updates an existing resource.

Example:

```http
PUT /api/projects/{id}
```

PUT requests are expected to be idempotent.

---

## PATCH

Performs partial updates or business state transitions.

Examples:

```http
PATCH /api/projects/{id}/archive

PATCH /api/projects/{id}/restore

PATCH /api/workitems/{id}/move
```

PATCH is particularly useful for workflow-driven operations.

---

## DELETE

Reserved for permanent deletion.

FlowForge currently favors **archiving** over physical deletion to preserve business history.

---

# 🔄 Request Lifecycle

Every API request follows a predictable execution pipeline.

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
FluentValidation
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
ApiResponse<T>
      │
      ▼
HTTP Response
```

This consistent pipeline ensures that every request is validated, authorized and processed using the same architectural conventions.

---

# 📨 Request & Response Format

Commands receive strongly typed request models.

Example request:

```json
{
  "name": "Website Redesign",
  "description": "Enterprise UI modernization project"
}
```

Validation occurs before the handler executes.

Successful operations return standardized responses rather than raw entities.

Example response:

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "3dfef4d5-42a5-4e48-a6f5-fd6f7f6b0f31"
  }
}
```

A consistent response structure simplifies client development and ensures predictable API behavior across all modules.

---

# 📦 ApiResponse<T>

Every successful API operation returns a standardized response model.

Rather than exposing raw entities or inconsistent payloads, FlowForge wraps responses inside a generic response object.

```csharp
ApiResponse<T>
```

A typical response contains:

```text
Success

Message

Data

Errors
```

Example:

```json
{
    "success": true,
    "message": "Project created successfully.",
    "data": {
        "id": "3dfef4d5-42a5-4e48-a6f5-fd6f7f6b0f31",
        "name": "Website Redesign"
    },
    "errors": null
}
```

Benefits include:

- Consistent response structure
- Simplified frontend integration
- Predictable error handling
- Easier debugging
- Improved API documentation

Every module returns responses using the same pattern.

---

# ❌ Error Handling

Errors should communicate meaningful information without exposing implementation details.

A failed request should clearly explain:

- What went wrong
- Why it failed
- What the client can correct

Example:

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": [
        "Project name is required.",
        "Description cannot exceed 500 characters."
    ]
}
```

The API intentionally hides:

- Stack traces
- SQL exceptions
- Internal server implementation
- Connection strings
- Sensitive configuration

Unexpected exceptions are handled globally to ensure consistent responses.

---

# 📊 HTTP Status Codes

FlowForge uses standard HTTP status codes.

| Code | Meaning | Typical Usage |
|------:|---------|---------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 204 | No Content | Successful request without response body |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Business conflict (e.g. duplicate name) |
| 422 | Unprocessable Entity *(optional)* | Validation failure |
| 500 | Internal Server Error | Unexpected server error |

Using standard status codes allows client applications to react consistently across all endpoints.

---

# 🔐 Authentication

Protected endpoints require authentication using **JWT Bearer Tokens**.

Example:

```http
Authorization: Bearer <access_token>
```

Authentication is provided through:

- ASP.NET Identity
- JWT Bearer Authentication

Typical authentication flow:

```text
User Login
      │
      ▼
Identity Validation
      │
      ▼
JWT Generation
      │
      ▼
Client Stores Token
      │
      ▼
Authenticated Requests
```

Only authenticated users can access protected resources.

---

# 🛡️ Authorization

Authentication verifies **who** the user is.

Authorization determines **what** the user is allowed to access.

FlowForge enforces authorization through multiple layers.

Examples include:

- Authenticated user
- Organization ownership
- Resource ownership
- Business rules

Example:

```text
Organization A

↓

Projects

↓

Boards

↓

Columns

↓

WorkItems
```

Users cannot access resources belonging to another Organization.

This ownership boundary is enforced consistently across the application.

---

# 📄 Pagination

Collection endpoints should support pagination to improve performance and reduce payload sizes.

Typical request:

```http
GET /api/projects?page=1&pageSize=10
```

Typical response:

```json
{
    "items": [],
    "page": 1,
    "pageSize": 10,
    "totalCount": 150,
    "totalPages": 15
}
```

Pagination provides:

- Faster responses
- Reduced bandwidth
- Improved scalability
- Better user experience

The same pagination model should be reused across all collection endpoints.

---

# 🔍 Filtering & Sorting

Collection endpoints may support filtering and sorting.

Filtering example:

```http
GET /api/projects?search=Website
```

Sorting example:

```http
GET /api/projects?sortBy=name&sortDirection=asc
```

Supported directions:

```text
asc

desc
```

Invalid parameters should fall back to sensible defaults rather than producing unpredictable behavior.

Filtering and sorting should remain consistent across all modules.

---

# ✅ Validation

FlowForge validates requests before business logic executes.

Validation is performed using **FluentValidation**.

Typical validation includes:

- Required fields
- Length constraints
- Format validation
- Numeric ranges
- Enumeration values

Validation responsibilities:

```text
Client
      │
      ▼
Request Model
      │
      ▼
FluentValidation
      │
      ▼
Command Handler
```

Business rules remain inside the Domain and should not be duplicated inside validators.

---

# 🔁 Idempotency

Certain HTTP methods should be idempotent.

| Method | Idempotent |
|---------|:----------:|
| GET | ✅ |
| PUT | ✅ |
| DELETE | ✅ *(if implemented)* |
| PATCH | Depends on operation |
| POST | ❌ |

Example:

Multiple requests:

```http
PUT /api/projects/{id}
```

should always leave the resource in the same final state.

Idempotent operations improve reliability when requests are retried due to network failures.

---

# 🔒 Security Best Practices

FlowForge follows several API security practices.

✔ Require authentication for protected endpoints.

✔ Enforce organization ownership.

✔ Validate all incoming requests.

✔ Never trust client input.

✔ Hide internal exception details.

✔ Use HTTPS in production.

✔ Return only necessary data.

✔ Keep JWT secrets secure.

✔ Apply authorization before business execution.

✔ Log unexpected failures for operational monitoring.

Security is considered an integral part of API design rather than an afterthought.

---

# 🚀 Future API Evolution

The current API is designed to evolve without disrupting existing clients.

Potential future enhancements include:

- URL-based versioning (`/api/v1/...`)
- OpenAPI enhancements
- Rate limiting
- Response caching
- Batch operations
- Webhooks
- Real-time SignalR endpoints
- GraphQL gateway (if appropriate)
- Public developer API
- SDK generation

These capabilities can be introduced incrementally while preserving existing architectural principles.

---

# 📖 Summary

The FlowForge API is designed to provide a predictable, secure and developer-friendly interface for interacting with the application's business capabilities.

By combining:

- REST principles
- Clean Architecture
- CQRS
- MediatR
- FluentValidation
- JWT Authentication
- Standardized `ApiResponse<T>`
- Consistent URL conventions
- Predictable HTTP semantics

the API delivers a consistent experience for both client developers and backend contributors.

As FlowForge evolves, these design principles will continue to ensure that the API remains easy to consume, secure to operate and flexible enough to support future business requirements.

---

<div align="center">

# 🌐 FlowForge API Design

### Building Consistent, Secure and Scalable APIs

*"A great API is one that feels predictable—developers should spend their time building features, not learning exceptions."*

</div>