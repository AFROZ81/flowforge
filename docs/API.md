# 🌐 API

## Overview

FlowForge exposes a RESTful API built with **ASP.NET Core**. The API serves as the communication layer between client applications and the backend, handling authentication, validation, business operations, and realtime collaboration.

Interactive API documentation is available through **Swagger** during development.

---

# API Design

The API follows standard REST principles.

- Resource-based endpoints
- Appropriate HTTP methods
- JSON request and response bodies
- Stateless communication
- Consistent status codes

Each endpoint delegates business logic to the Application layer through MediatR, keeping controllers lightweight and focused on request handling.

---

# Authentication

Authentication is implemented using **JSON Web Tokens (JWT)**.

After a successful login, clients receive a JWT access token that must be included in subsequent requests.

```
Authorization: Bearer <access_token>
```

Protected endpoints require a valid token before access is granted.

---

# Authorization

FlowForge uses role and organization-based authorization.

Requests are validated to ensure users can only access resources belonging to their own organization.

Authorization is enforced before business logic is executed.

---

# Request Processing

A typical API request follows this flow.

```
HTTP Request
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Command / Query Handler
      │
      ▼
Business Rules
      │
      ▼
Database
      │
      ▼
HTTP Response
```

Realtime events are published through SignalR after successful state changes when applicable.

---

# Validation

Incoming requests are validated using **FluentValidation** before reaching the application logic.

Invalid requests return descriptive validation errors without executing business operations.

---

# Error Handling

The API uses centralized exception handling to provide consistent error responses.

Common HTTP status codes include:

| Status | Description |
|---------|-------------|
| **200 OK** | Request completed successfully. |
| **201 Created** | Resource created successfully. |
| **400 Bad Request** | Validation or request error. |
| **401 Unauthorized** | Authentication required or invalid token. |
| **403 Forbidden** | Access denied. |
| **404 Not Found** | Requested resource does not exist. |
| **500 Internal Server Error** | Unexpected server error. |

---

# API Documentation

Swagger is integrated into the application for interactive API exploration and testing.

It provides:

- Available endpoints
- Request models
- Response models
- Authentication support
- Endpoint testing

Swagger serves as the primary API reference, eliminating the need to manually document every endpoint.

---

# Summary

The FlowForge API is designed to be lightweight, secure, and consistent. Controllers remain minimal by delegating business logic to the Application layer, while authentication, validation, and error handling are applied consistently across the application.