# Authentication Module

The Authentication module is responsible for user registration, user login, authentication, and authorization within FlowForge.

It uses ASP.NET Core Identity together with JWT (JSON Web Tokens) to provide secure access to protected API endpoints.

---

# Table of Contents

- Overview
- Features
- Technologies Used
- Authentication Flow
- Registration
- Login
- JWT Authentication
- Authorization
- Current User Service
- API Endpoints
- Request Flow
- Security
- Summary

---

# Overview

Authentication is the first module executed by every user interacting with the FlowForge API.

After successful authentication, a JWT access token is issued. This token is then used to access protected resources throughout the application.

The module integrates ASP.NET Core Identity with JWT Bearer Authentication to provide a secure and scalable authentication mechanism.

---

# Features

The Authentication module currently provides the following functionality:

- User Registration
- User Login
- JWT Token Generation
- Protected API Authentication
- Current Authenticated User Access
- Organization-aware Authorization

---

# Technologies Used

The module is built using:

- ASP.NET Core Identity
- JWT Bearer Authentication
- Entity Framework Core
- SQL Server
- MediatR
- FluentValidation

---

# Authentication Flow

The authentication process follows the sequence below.

```text
User
    │
    ▼
Register / Login
    │
    ▼
Authentication Handler
    │
    ▼
ASP.NET Core Identity
    │
    ▼
JWT Token Generated
    │
    ▼
Client Stores Token
    │
    ▼
Authorization Header
    │
    ▼
Protected API Endpoint
```

---

# Registration

User registration creates a new Identity user.

The registration process performs:

- Request validation
- User creation
- Password hashing
- Identity persistence

A successful registration stores the user in the database using ASP.NET Core Identity.

---

# Login

The login process validates the supplied credentials.

On successful authentication:

- User credentials are verified.
- A JWT access token is generated.
- The token is returned to the client.

The client uses this token when calling protected endpoints.

---

# JWT Authentication

FlowForge uses JWT Bearer Authentication.

Authenticated requests include the following HTTP header.

```http
Authorization: Bearer <access_token>
```

The API validates the token before processing protected requests.

---

# Authorization

Protected endpoints require a valid authenticated user.

Authorization is enforced before executing business operations.

Only authenticated users can access protected resources.

Additionally, business logic validates organization ownership before allowing access to organization-specific data.

---

# Current User Service

FlowForge uses a Current User Service to access information about the authenticated user.

The service provides commonly required information such as:

- User Identifier
- Organization Identifier
- User Name
- User Roles

Handlers access the authenticated user through this service rather than interacting directly with the HTTP context.

---

# API Endpoints

The Authentication module currently exposes endpoints for:

## Register

```http
POST /api/auth/register
```

Purpose

Creates a new user account.

---

## Login

```http
POST /api/auth/login
```

Purpose

Authenticates an existing user and returns a JWT access token.

---

# Request Flow

Every authenticated request follows the same process.

```text
Client Request
      │
      ▼
JWT Bearer Authentication
      │
      ▼
Authentication Middleware
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
Business Logic
      │
      ▼
API Response
```

---

# Security

The Authentication module provides the following security features.

- Password hashing through ASP.NET Core Identity
- JWT-based authentication
- Protected API endpoints
- Authorization before request execution
- Organization-aware access control

---

# Module Dependencies

The Authentication module depends on:

- ASP.NET Core Identity
- Entity Framework Core
- SQL Server
- MediatR
- FluentValidation
- JWT Bearer Authentication

---

# Summary

The Authentication module provides secure access to the FlowForge API.

It is responsible for user registration, login, token generation, and authentication of protected endpoints. All business modules rely on this module to identify the current user and enforce authorization throughout the application.