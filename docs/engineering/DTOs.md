# Data Transfer Objects (DTOs)

This document describes how Data Transfer Objects (DTOs) are used throughout FlowForge.

DTOs define the data exchanged between the API and its clients. They help keep the Domain layer isolated while providing clear and stable contracts for requests and responses.

---

# Table of Contents

- Overview
- Why DTOs?
- Request DTOs
- Response DTOs
- DTO Organization
- Commands & Queries
- API Contracts
- Best Practices
- Summary

---

# Overview

A Data Transfer Object (DTO) is an object used to transfer data between different layers of the application.

In FlowForge, DTOs are primarily used to:

- Receive client requests.
- Return API responses.
- Prevent direct exposure of domain entities.
- Keep API contracts stable.

---

# Why DTOs?

Domain entities represent business concepts and contain business behavior.

DTOs represent only the data required for communication.

Separating these responsibilities improves maintainability and prevents unnecessary data from being exposed through the API.

---

# Request DTOs

Request data is received through Commands and Queries.

Examples include:

```text
CreateProjectCommand

UpdateProjectCommand

CreateBoardCommand

UpdateBoardCommand

GetProjectsQuery

GetBoardByIdQuery
```

Each request object contains only the information required for that specific operation.

---

# Response DTOs

Every endpoint returns a dedicated response object.

Examples:

```text
CreateProjectResponse

UpdateProjectResponse

GetProjectByIdResponse

GetProjectsResponse

CreateBoardResponse

UpdateBoardResponse

GetBoardByIdResponse

GetBoardsResponse
```

Each response is designed specifically for its endpoint.

---

# DTO Organization

DTOs are organized within each feature.

Example:

```text
Projects

├── Commands

├── Queries

├── DTOs

└── Rules
```

The same organization is followed for other features such as:

```text
Authentication

Organizations

Projects

Boards
```

---

# Commands & Queries

In FlowForge, request DTOs are implemented as Commands and Queries.

Examples

Commands

```text
CreateProjectCommand

UpdateProjectCommand

ArchiveProjectCommand

RestoreProjectCommand
```

Queries

```text
GetProjectByIdQuery

GetProjectsQuery

GetBoardByIdQuery

GetBoardsQuery
```

This keeps the API request models closely aligned with the CQRS pattern.

---

# API Contracts

DTOs define the contract between the API and the client.

For example, creating a project expects a request similar to:

```json
{
  "name": "FlowForge",
  "description": "Enterprise Project Management Platform"
}
```

A successful response returns:

```json
{
  "success": true,
  "message": "Project created successfully.",
  "data": {
    "id": "..."
  }
}
```

The exact structure depends on the endpoint, but every endpoint returns a consistent API response.

---

# Validation

Incoming request DTOs are validated using FluentValidation.

Validation ensures that:

- Required fields are present.
- Length limits are respected.
- Invalid values are rejected.

Business rules are handled separately after validation.

---

# Mapping

Handlers are responsible for converting request data into domain entities and constructing response DTOs.

This keeps the API layer independent from the Domain layer.

---

# Best Practices

✔ Create a dedicated request object for each operation.

✔ Create a dedicated response object for each endpoint.

✔ Keep DTOs simple.

✔ Expose only the data required by the client.

✔ Do not expose domain entities directly.

✔ Keep DTOs independent of database concerns.

---

# Summary

DTOs provide a clear boundary between the API and the application's business logic.

By using dedicated request and response models for each endpoint, FlowForge maintains consistent API contracts while keeping the Domain layer protected from external consumers.