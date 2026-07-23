# API Design

This document defines the API design principles and standards used throughout FlowForge.

The objective is to provide a consistent, predictable, and developer-friendly REST API that follows modern HTTP conventions while remaining easy to maintain as the application grows.

---

# Table of Contents

- Overview
- Design Principles
- REST Conventions
- URL Structure
- HTTP Methods
- Request Format
- Response Format
- ApiResponse Pattern
- Error Handling
- Validation
- Pagination
- Searching
- Sorting
- Authentication
- Authorization
- Status Codes
- API Versioning
- Best Practices
- Summary

---

# Overview

FlowForge exposes a RESTful API built with ASP.NET Core.

The API follows consistent naming conventions, standardized responses, and clear separation between commands (write operations) and queries (read operations).

Every endpoint should behave predictably regardless of the module it belongs to.

---

# Design Principles

The API is designed around the following principles:

- Consistency
- Simplicity
- Predictability
- Discoverability
- Explicit error handling
- Secure by default

---

# Base URL

Development

```text
https://localhost:5001/api
```

Example

```text
/api/projects
/api/boards
/api/columns
/api/tasks
```

---

# Resource Naming

Resources use plural nouns.

Examples

```text
/projects

/boards

/columns

/tasks

/organizations
```

Avoid verbs in URLs.

✔ Good

```text
GET /projects

POST /projects

PUT /projects/{id}

PATCH /projects/{id}/archive
```

✘ Bad

```text
/createProject

/getAllProjects

/updateBoard
```

---

# HTTP Methods

## GET

Retrieve data.

Examples

```http
GET /projects

GET /projects/{id}
```

Safe and idempotent.

---

## POST

Create a new resource.

```http
POST /projects
```

---

## PUT

Replace or update an existing resource.

```http
PUT /projects/{id}
```

---

## PATCH

Perform a partial update or state transition.

Examples

```http
PATCH /projects/{id}/archive

PATCH /projects/{id}/restore
```

---

## DELETE

Reserved for permanent deletion.

FlowForge currently prefers archiving over deletion.

---

# URL Structure

Nested resources should reflect ownership.

Example

```text
Organizations

↓

Projects

↓

Boards

↓

Columns

↓

Tasks
```

Typical endpoints

```http
GET /projects

GET /projects/{id}

GET /boards

GET /boards/{id}
```

Avoid deeply nested URLs unless they provide meaningful context.

---

# Request Format

Commands receive strongly typed request models.

Example

```json
{
  "name": "Website Redesign",
  "description": "Q4 redesign initiative"
}
```

Validation occurs before the handler executes.

---

# Response Format

Every endpoint returns a consistent response structure.

Example

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "..."
  }
}
```

This consistency simplifies frontend development and error handling.

---

# ApiResponse Pattern

FlowForge wraps responses using a common response model.

Example

```csharp
ApiResponse<T>
```

Typical properties

```text
Success

Message

Data

Errors
```

Benefits

- Consistent API shape
- Easier client integration
- Centralized error handling
- Predictable responses

---

# Error Handling

Errors should provide meaningful information without exposing internal implementation details.

Example

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    "Project name is required."
  ]
}
```

Do not expose:

- Stack traces
- SQL errors
- Internal exceptions
- Sensitive configuration

---

# Validation

Validation is implemented using FluentValidation.

Validation occurs before the request reaches the handler.

Typical validations

- Required fields
- Maximum length
- Minimum length
- Invalid formats
- Business-independent rules

Business rules remain outside validators.

---

# Pagination

Collection endpoints should support pagination.

Typical request

```http
GET /projects?page=1&pageSize=10
```

Typical response

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 150,
  "totalPages": 15
}
```

FlowForge uses a shared pagination model across all modules.

---

# Searching

Collection endpoints may support keyword searching.

Example

```http
GET /projects?search=Website
```

Searching should be case-insensitive where practical.

---

# Sorting

Collection endpoints may support sorting.

Example

```http
GET /projects?sortBy=name&sortDirection=asc
```

Supported directions

```text
asc

desc
```

Invalid sorting parameters should fall back to a sensible default.

---

# Authentication

Protected endpoints require a valid JWT access token.

Example

```http
Authorization: Bearer <token>
```

Authentication is configured using ASP.NET Identity and JWT Bearer authentication.

---

# Authorization

Authorization is enforced at multiple levels.

Examples

- Authenticated user
- Organization ownership
- Resource access
- Business rules

Only users belonging to the owning organization may access its resources.

---

# Status Codes

FlowForge uses standard HTTP status codes.

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error (optional) |
| 500 | Internal Server Error |

---

# API Versioning

The initial release does not use explicit API versioning.

Future versions may adopt URL-based versioning.

Example

```text
/api/v1/projects

/api/v2/projects
```

Introducing versioning should be considered only when breaking changes become necessary.

---

# Best Practices

✔ Use nouns instead of verbs.

✔ Keep endpoints predictable.

✔ Return consistent response models.

✔ Validate requests before execution.

✔ Return appropriate HTTP status codes.

✔ Avoid exposing implementation details.

✔ Keep controllers thin.

✔ Delegate business logic to the Application layer.

✔ Follow CQRS for write and read operations.

---

# Example Endpoint

Create Project

```http
POST /api/projects
```

Request

```json
{
  "name": "FlowForge",
  "description": "Enterprise Project Management Platform"
}
```

Response

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "0f4e4b9d..."
  }
}
```

---

# Summary

The FlowForge API is designed to be predictable, consistent, and easy to consume.

By following standardized URL conventions, response models, validation strategies, and HTTP semantics, every module provides a uniform developer experience while remaining flexible enough to support future growth.