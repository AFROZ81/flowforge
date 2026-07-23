# Project Dependencies

This document lists the primary frameworks, libraries, and NuGet packages currently used in FlowForge.

The purpose of this document is to provide a quick reference for the project's technology stack and explain the role of each dependency.

---

# Table of Contents

- Overview
- .NET Platform
- ASP.NET Core
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Authentication
- MediatR
- FluentValidation
- Swagger
- Configuration
- Logging
- Summary

---

# Overview

FlowForge is built using Microsoft's modern .NET ecosystem.

The project follows Clean Architecture with CQRS and Vertical Slice Architecture while leveraging several well-established libraries to simplify development.

---

# .NET Platform

Framework

```text
.NET 10
```

Role

- Application runtime
- Web API framework
- Dependency Injection
- Configuration
- Logging

---

# ASP.NET Core

Namespace

```text
Microsoft.AspNetCore.*
```

Purpose

- REST API development
- Routing
- Middleware
- Authentication
- Authorization
- Dependency Injection

Used throughout the API project.

---

# Entity Framework Core

Package

```text
Microsoft.EntityFrameworkCore
```

Additional Packages

```text
Microsoft.EntityFrameworkCore.SqlServer

Microsoft.EntityFrameworkCore.Design

Microsoft.EntityFrameworkCore.Tools
```

Purpose

- ORM
- Database access
- LINQ queries
- Entity tracking
- Database migrations

Current DbContext

```text
ApplicationDbContext
```

---

# SQL Server

Database

```text
Microsoft SQL Server
```

Purpose

- Persistent storage
- Entity Framework provider
- Relational database management

---

# ASP.NET Core Identity

Purpose

- User management
- Password hashing
- Authentication
- Authorization

Current functionality

- User Registration
- User Login
- Identity integration

---

# JWT Authentication

Packages

```text
Microsoft.AspNetCore.Authentication.JwtBearer
```

Purpose

- Token-based authentication
- Secure API access
- User authorization

JWT is used to authenticate requests to protected API endpoints.

---

# MediatR

Package

```text
MediatR
```

Purpose

- Command dispatching
- Query dispatching
- Request handling

Current usage

- Commands
- Queries
- Request handlers

MediatR is used throughout the Application layer.

---

# FluentValidation

Package

```text
FluentValidation
```

Purpose

- Request validation
- Command validation
- Query validation

Each command has its own validator.

Examples

```text
CreateProjectValidator

UpdateProjectValidator

CreateBoardValidator
```

---

# Swagger

Package

```text
Swashbuckle.AspNetCore
```

Purpose

- API documentation
- Endpoint testing
- Request inspection

Swagger is available during development to test API endpoints.

---

# Configuration

Configuration is managed through:

```text
appsettings.json

appsettings.Development.json
```

Typical configuration includes:

- Database connection string
- JWT settings
- Logging configuration

---

# Logging

FlowForge currently uses the built-in ASP.NET Core logging framework.

Logging is configured through the standard .NET logging infrastructure.

---

# Dependency Summary

| Dependency | Purpose |
|------------|---------|
| .NET 10 | Application Framework |
| ASP.NET Core | Web API Framework |
| Entity Framework Core | ORM |
| SQL Server | Database |
| ASP.NET Core Identity | User Management |
| JWT Bearer | Authentication |
| MediatR | CQRS Request Handling |
| FluentValidation | Request Validation |
| Swashbuckle | Swagger / API Documentation |

---

# Summary

FlowForge is built on the modern .NET ecosystem using well-established libraries for authentication, data access, validation, and API development.

Each dependency has a specific responsibility and contributes to keeping the project modular, maintainable, and scalable.