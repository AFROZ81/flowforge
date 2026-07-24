# 📚 FlowForge Project Dependencies

FlowForge is built upon Microsoft's modern .NET ecosystem and carefully selected open-source libraries that provide a solid foundation for building scalable, secure, and maintainable enterprise applications.

Rather than treating dependencies as simple NuGet packages, FlowForge considers each dependency as an architectural building block with a clearly defined responsibility.

Every library introduced into the solution must solve a specific problem, integrate cleanly with the existing architecture, and remain aligned with the project's long-term vision.

---

# 📑 Table of Contents

- Introduction
- Dependency Philosophy
- Technology Stack Overview
- .NET Platform
- ASP.NET Core
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Authentication

---

# 📖 Introduction

Modern enterprise applications rely on a collection of frameworks and libraries to solve common engineering challenges.

Instead of reinventing authentication, dependency injection, data access, validation, or API documentation, FlowForge leverages mature, well-tested components from the .NET ecosystem.

These dependencies work together to provide:

- Web API development
- Authentication and authorization
- Database access
- Object-relational mapping
- Request validation
- API documentation
- Configuration management
- Logging
- Dependency Injection

Each dependency has a clearly defined responsibility and integrates with the application's Clean Architecture.

---

# 🎯 Dependency Philosophy

FlowForge follows a simple principle regarding external libraries:

> **Every dependency must provide clear value while maintaining simplicity, maintainability, and long-term stability.**

Before introducing any new package, the following questions should be considered:

- Does the .NET platform already provide this functionality?
- Is the dependency actively maintained?
- Does it align with Clean Architecture?
- Does it introduce unnecessary complexity?
- Can it be replaced easily if required?

By limiting unnecessary dependencies, the project remains lightweight, easier to upgrade, and simpler to maintain.

---

## Design Principles

Dependencies should:

✔ Solve one specific problem.

✔ Be widely adopted.

✔ Be actively maintained.

✔ Integrate naturally with ASP.NET Core.

✔ Support long-term scalability.

Dependencies should never become tightly coupled to business logic.

---

# 🏗️ Technology Stack Overview

The primary technology stack used by FlowForge consists of:

| Technology | Responsibility |
|------------|----------------|
| .NET 10 | Application Platform |
| ASP.NET Core | Web API Framework |
| Entity Framework Core | ORM |
| SQL Server | Relational Database |
| ASP.NET Core Identity | User Management |
| JWT Bearer Authentication | Secure API Authentication |
| MediatR | CQRS Request Dispatching |
| FluentValidation | Request Validation |
| Swashbuckle | Swagger Documentation |

Together, these technologies provide a complete platform for building modern REST APIs.

---

## Architectural Integration

Each dependency supports a specific layer of the application.

```text
                Client
                   │
                   ▼
             ASP.NET Core
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
  Authentication  Validation  Routing
                   │
                   ▼
              MediatR (CQRS)
                   │
                   ▼
            Application Layer
                   │
                   ▼
          Entity Framework Core
                   │
                   ▼
              SQL Server
```

No dependency should bypass architectural boundaries.

---

# ⚙️ .NET Platform

## Framework

```text
.NET 10
```

The .NET platform serves as the runtime foundation of FlowForge.

It provides:

- Application runtime
- Base Class Library (BCL)
- Dependency Injection container
- Configuration system
- Logging infrastructure
- Asynchronous programming support
- Middleware pipeline
- Memory management

Every other dependency builds upon this foundation.

---

## Why .NET 10?

FlowForge adopts the latest modern .NET platform to benefit from:

- Improved performance
- Long-term platform evolution
- Modern language features
- Native dependency injection
- Cross-platform compatibility
- High-performance web APIs

The platform provides most foundational capabilities without requiring additional third-party libraries.

---

# 🌐 ASP.NET Core

## Namespace

```text
Microsoft.AspNetCore.*
```

ASP.NET Core is the web framework responsible for exposing FlowForge as a REST API.

It handles:

- HTTP request processing
- Endpoint routing
- Middleware execution
- Authentication
- Authorization
- Model binding
- Dependency Injection
- Exception handling

Every incoming request enters the application through the ASP.NET Core pipeline.

---

## Request Pipeline

```text
HTTP Request
      │
      ▼
Middleware
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Routing
      │
      ▼
Controller
      │
      ▼
MediatR
```

Each stage performs a single responsibility before passing control to the next.

---

## Why ASP.NET Core?

FlowForge uses ASP.NET Core because it provides:

- High performance
- Cross-platform support
- Built-in Dependency Injection
- Flexible middleware architecture
- Excellent integration with modern .NET libraries
- Strong security features

It forms the presentation layer of the application.

---

# 🗄️ Entity Framework Core

## Packages

```text
Microsoft.EntityFrameworkCore

Microsoft.EntityFrameworkCore.SqlServer

Microsoft.EntityFrameworkCore.Design

Microsoft.EntityFrameworkCore.Tools
```

Entity Framework Core serves as the application's Object-Relational Mapper (ORM).

It bridges the gap between object-oriented domain models and relational database tables.

---

## Responsibilities

Entity Framework Core manages:

- Entity persistence
- Change tracking
- LINQ query translation
- Database transactions
- Relationship management
- Database migrations
- Connection management

The application's primary DbContext is:

```text
ApplicationDbContext
```

---

## Architecture

```text
Application Layer
        │
        ▼
Repository / DbContext
        │
        ▼
Entity Framework Core
        │
        ▼
SQL Server
```

Business logic remains independent of database implementation details.

---

## Why Entity Framework Core?

FlowForge benefits from:

- Strong .NET integration
- Compile-time query checking
- Powerful LINQ support
- Simplified database access
- Automatic migrations
- Provider independence

This allows developers to focus on business logic rather than SQL plumbing.

---

# 🗃️ SQL Server

## Database Platform

```text
Microsoft SQL Server
```

SQL Server is the primary persistent data store used by FlowForge.

It stores:

- Users
- Organizations
- Projects
- Boards
- WorkItems
- Application metadata
- Identity information

---

## Responsibilities

SQL Server provides:

- ACID-compliant transactions
- Relational data storage
- Indexing
- Query optimization
- Backup and recovery
- Security
- Data integrity

It acts as the system of record for all business data.

---

## Why SQL Server?

FlowForge uses SQL Server because it offers:

- Excellent EF Core support
- Enterprise-grade reliability
- Mature tooling
- High scalability
- Advanced security capabilities
- Proven performance for transactional workloads

---

# 👤 ASP.NET Core Identity

ASP.NET Core Identity provides the foundation for user and authentication management.

Rather than implementing authentication from scratch, FlowForge relies on Identity's proven infrastructure.

Identity manages:

- User registration
- User authentication
- Password hashing
- Password verification
- Identity storage
- Security tokens

---

## Current Functionality

The project currently supports:

- User Registration
- User Login
- Identity integration

Future enhancements may include:

- Email verification
- Password reset
- Two-factor authentication
- Account lockout
- External login providers

---

## Why Identity?

Identity provides several important advantages:

- Secure password hashing
- Industry-standard authentication practices
- Tight integration with ASP.NET Core
- Extensible user model
- Reduced security risks compared to custom implementations

By using Identity, FlowForge benefits from Microsoft's ongoing security improvements.

---

# 🔐 JWT Authentication

## Package

```text
Microsoft.AspNetCore.Authentication.JwtBearer
```

JWT (JSON Web Token) authentication enables secure, stateless communication between clients and the API.

After a successful login, the server issues a signed JWT that the client includes with subsequent requests.

---

## Authentication Flow

```text
User Login
      │
      ▼
Identity Verification
      │
      ▼
JWT Token Generated
      │
      ▼
Client Stores Token
      │
      ▼
Protected API Request
      │
      ▼
JWT Validation
      │
      ▼
Authorized Request
```

Because authentication is token-based, the API does not need to maintain server-side session state.

---

## Why JWT?

FlowForge uses JWT because it provides:

- Stateless authentication
- Secure API access
- Easy integration with web and mobile clients
- Scalability across distributed systems
- Standardized authentication mechanism

JWT authentication works seamlessly with ASP.NET Core Identity to provide a secure and extensible authentication solution.

---

# 🚀 MediatR

## Package

```text
MediatR
```

MediatR is the communication backbone of the Application layer.

Instead of controllers directly calling services or repositories, every request is dispatched through MediatR, allowing the application to follow the **CQRS (Command Query Responsibility Segregation)** pattern.

This creates a clear separation between request handling and business logic.

---

## Responsibilities

MediatR is responsible for:

- Dispatching Commands
- Dispatching Queries
- Invoking Request Handlers
- Executing Pipeline Behaviors
- Keeping controllers lightweight

Every request flows through a consistent pipeline before reaching its handler.

---

## Request Flow

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
Pipeline Behaviors
      │
      ▼
Command / Query Handler
      │
      ▼
Response
```

Controllers never contain business logic.

Instead, they simply forward requests to MediatR.

---

## Why MediatR?

FlowForge uses MediatR because it provides:

- Loose coupling
- Better separation of concerns
- Easier testing
- Consistent request handling
- Native support for CQRS

Every business operation becomes an isolated, independently testable feature.

---

# ✅ FluentValidation

## Package

```text
FluentValidation
```

FluentValidation is responsible for validating incoming requests before business logic executes.

Rather than placing validation inside controllers or handlers, FlowForge defines dedicated validators for each command or query.

---

## Responsibilities

Validation ensures:

- Required fields are present
- String lengths are valid
- Values fall within acceptable ranges
- Invalid requests are rejected early

Examples include:

```text
CreateProjectValidator

UpdateProjectValidator

CreateBoardValidator
```

Each validator focuses on a single request model.

---

## Validation Pipeline

```text
HTTP Request
      │
      ▼
Command
      │
      ▼
Validator
      │
      ▼
Valid Request
      │
      ▼
Handler
```

If validation fails, the handler is never executed.

This keeps business logic clean and focused.

---

## Why FluentValidation?

The project benefits from:

- Readable validation rules
- Reusable validators
- Separation of validation from business logic
- Easy unit testing
- Seamless MediatR integration

---

# 📖 Swagger

## Package

```text
Swashbuckle.AspNetCore
```

Swagger provides interactive API documentation during development.

It automatically generates documentation from the application's controllers, endpoints, and models.

---

## Capabilities

Swagger allows developers to:

- Discover available endpoints
- Inspect request models
- Inspect response models
- Test APIs interactively
- Validate endpoint behavior

This significantly improves the developer experience.

---

## Why Swagger?

FlowForge uses Swagger because it:

- Reduces onboarding time
- Simplifies API testing
- Improves API discoverability
- Generates accurate documentation
- Encourages consistent endpoint design

Swagger is intended for development and testing environments.

---

# ⚙️ Configuration & Options

Application configuration is managed through the standard ASP.NET Core configuration system.

Primary configuration files include:

```text
appsettings.json

appsettings.Development.json
```

These files contain settings such as:

- Database connection strings
- JWT configuration
- Logging settings
- Application options

---

## Configuration Flow

```text
Configuration Files
        │
        ▼
Configuration Provider
        │
        ▼
Dependency Injection
        │
        ▼
Application Services
```

Configuration values are loaded during application startup and made available through Dependency Injection.

---

## Why Centralized Configuration?

Centralized configuration provides:

- Environment-specific settings
- Easier deployment
- Cleaner code
- Improved maintainability

Configuration values should never be hardcoded inside the application.

---

# 📊 Logging & Diagnostics

FlowForge currently relies on the built-in ASP.NET Core logging infrastructure.

Logging provides visibility into application behavior and helps diagnose issues during development and production.

---

## Typical Logging Scenarios

Logs may capture:

- Application startup
- Authentication events
- Validation failures
- Unhandled exceptions
- Database operations
- Informational messages

Proper logging improves monitoring and troubleshooting.

---

## Logging Flow

```text
Application
      │
      ▼
ILogger<T>
      │
      ▼
Logging Provider
      │
      ▼
Console / File / External System
```

The logging implementation can evolve without affecting business logic.

---

# 🏛️ Layer-wise Dependency Organization

FlowForge follows Clean Architecture principles when organizing dependencies.

Each layer references only the libraries appropriate to its responsibility.

```text
Presentation
│
├── ASP.NET Core
├── Swagger
└── Authentication

Application
│
├── MediatR
├── FluentValidation
└── DTOs

Domain
│
└── No external framework dependencies

Infrastructure
│
├── Entity Framework Core
├── SQL Server
└── ASP.NET Core Identity
```

This organization prevents infrastructure concerns from leaking into the Domain layer.

---

# 📦 Dependency Management Strategy

Dependencies should be introduced thoughtfully and maintained consistently.

General guidelines include:

- Use stable releases
- Prefer Microsoft-supported libraries where appropriate
- Remove unused packages
- Review updates before upgrading
- Keep package versions compatible

Every dependency should have a documented purpose.

---

## Updating Dependencies

When updating packages:

1. Review release notes.
2. Verify compatibility.
3. Run automated tests.
4. Validate application startup.
5. Test key business workflows.

This reduces the risk of introducing regressions.

---

# 📋 Best Practices

Follow these practices throughout the project.

✔ Add dependencies only when they solve a clear problem.

✔ Prefer built-in .NET functionality where possible.

✔ Keep packages up to date.

✔ Document why each dependency exists.

✔ Maintain compatibility between related packages.

✔ Keep dependencies isolated within the appropriate architectural layer.

✔ Remove obsolete packages promptly.

---

# ⚠️ Common Anti-Patterns

Avoid the following practices.

---

## Unnecessary Dependencies

Do not introduce packages that duplicate functionality already provided by the .NET platform.

Every additional dependency increases maintenance overhead.

---

## Tight Coupling

Business logic should never depend directly on infrastructure libraries.

Instead, depend on abstractions defined within the application's architecture.

---

## Version Mismatches

Mixing incompatible package versions can result in runtime issues and difficult debugging.

Always keep related packages aligned.

---

## Hardcoded Configuration

Avoid embedding connection strings, secrets, or environment-specific values directly in code.

Configuration should always be externalized.

---

## Ignoring Package Maintenance

Dependencies should be reviewed periodically for:

- Security updates
- Bug fixes
- Compatibility
- Long-term support

Outdated packages can introduce unnecessary risks.

---

# 🚀 Future Evolution

As FlowForge grows, additional technologies may be introduced to support new requirements.

Potential future additions include:

```text
Redis

Serilog

Health Checks

Background Job Processing

Distributed Caching

OpenTelemetry

Docker

CI/CD Tooling
```

Any new dependency should continue to follow the project's core philosophy:

- Clear responsibility
- Minimal complexity
- Strong architectural alignment
- Long-term maintainability

---

# 📖 Summary

FlowForge is built on a carefully selected set of modern technologies that work together to provide a scalable and maintainable foundation.

Each dependency contributes a specific capability:

- **.NET 10** provides the application platform.
- **ASP.NET Core** exposes the REST API.
- **Entity Framework Core** manages data persistence.
- **SQL Server** stores business data.
- **ASP.NET Core Identity** manages users and authentication.
- **JWT Bearer Authentication** secures protected endpoints.
- **MediatR** implements CQRS request handling.
- **FluentValidation** validates incoming requests.
- **Swashbuckle (Swagger)** documents and tests the API.

By assigning each technology a clearly defined responsibility and respecting architectural boundaries, FlowForge remains modular, maintainable, and prepared for future growth.

---

<div align="center">

# 📚 FlowForge Project Dependencies

### Building Enterprise Software on a Modern, Purpose-Driven Technology Stack

*"Technology is most valuable when every component has a clear responsibility. By selecting proven frameworks and integrating them through Clean Architecture, FlowForge creates a foundation that is secure, scalable, and built to evolve."*

</div>