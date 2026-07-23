# Dependency Injection

This document describes how Dependency Injection (DI) is implemented in FlowForge and establishes the conventions that every new feature must follow.

FlowForge uses the built-in Dependency Injection container provided by ASP.NET Core.

Rather than treating DI as merely a way to instantiate objects, FlowForge uses it to enforce architectural boundaries, improve testability, and keep the application loosely coupled.

---

# Table of Contents

- Overview
- Why Dependency Injection?
- Dependency Inversion Principle
- Service Registration
- Service Lifetimes
- Dependency Flow
- Application Registration
- Infrastructure Registration
- MediatR Registration
- FluentValidation Registration
- CurrentUserService
- DbContext Registration
- Feature Development
- Best Practices
- Common Mistakes
- Summary

---

# Overview

Dependency Injection allows classes to receive the dependencies they require instead of creating them directly.

Instead of this:

```csharp
var context = new ApplicationDbContext();
```

FlowForge relies on constructor injection.

```csharp
public CreateProjectHandler(
    IApplicationDbContext context,
    ProjectRules projectRules,
    ICurrentUserService currentUser)
{
}
```

The framework is responsible for creating and supplying these dependencies.

---

# Why Dependency Injection?

Dependency Injection provides several advantages.

- Loose coupling
- Easier testing
- Better maintainability
- Centralized configuration
- Clear dependency graph

Every dependency should have a clear reason for existing.

---

# Dependency Inversion Principle

FlowForge follows the Dependency Inversion Principle (DIP).

High-level modules should depend on abstractions rather than concrete implementations.

Example:

Application depends on:

```csharp
IApplicationDbContext
```

Infrastructure provides:

```csharp
ApplicationDbContext
```

The Application layer never directly references the implementation.

---

# Dependency Flow

Dependencies move inward toward the Domain.

```text
API

↓

Application

↓

Domain

↑

Infrastructure
```

Infrastructure implements abstractions.

Application consumes abstractions.

The Domain consumes neither.

---

# Service Registration

All service registration is centralized using extension methods.

Example:

```csharp
builder.Services.AddApplication();

builder.Services.AddInfrastructure(builder.Configuration);
```

Avoid placing registration code directly inside `Program.cs` whenever possible.

This keeps startup configuration clean and modular.

---

# Application Registration

The Application project registers:

- MediatR
- FluentValidation
- Pipeline Behaviors
- Shared Services

Example:

```csharp
services.AddMediatR(...);

services.AddValidatorsFromAssembly(...);

services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>)
);
```

The Application layer should not register infrastructure services.

---

# Infrastructure Registration

Infrastructure registers:

- DbContext
- Identity
- Authentication
- External Services
- Persistence
- File Storage
- Email Providers

Example:

```csharp
services.AddDbContext<ApplicationDbContext>();

services.AddIdentity<...>();

services.AddAuthentication();
```

Infrastructure owns technical implementations.

---

# Service Lifetimes

FlowForge primarily uses three service lifetimes.

---

## Singleton

Created once for the lifetime of the application.

Suitable for:

- Configuration
- Caching
- Stateless utilities

Avoid storing request-specific data in singleton services.

---

## Scoped

Created once per HTTP request.

Used for:

- DbContext
- CurrentUserService
- Business Rule classes
- Repository abstractions (if introduced)

This is the most common lifetime in FlowForge.

---

## Transient

A new instance is created every time it is requested.

Suitable for:

- Lightweight stateless services
- Pipeline Behaviors
- Utility components

---

# DbContext Registration

FlowForge exposes the database through an abstraction.

Application depends on:

```csharp
IApplicationDbContext
```

Infrastructure provides:

```csharp
ApplicationDbContext
```

Registration example:

```csharp
services.AddScoped<IApplicationDbContext>(
    provider => provider.GetRequiredService<ApplicationDbContext>()
);
```

This allows handlers to remain independent of Entity Framework Core.

---

# CurrentUserService

The current authenticated user is accessed through an abstraction.

Application depends on:

```csharp
ICurrentUserService
```

Infrastructure provides:

```csharp
CurrentUserService
```

This service exposes information such as:

- User ID
- Organization ID
- User Name
- Roles

Handlers should never access `HttpContext` directly.

---

# MediatR Registration

All commands and queries are dispatched through MediatR.

Registration is centralized.

```csharp
services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(...);
});
```

Controllers depend only on:

```csharp
IMediator
```

They do not instantiate handlers directly.

---

# FluentValidation Registration

Validators are automatically discovered.

```csharp
services.AddValidatorsFromAssembly(...);
```

No manual registration is required when adding a new validator.

---

# Pipeline Behaviors

Cross-cutting concerns are implemented as MediatR pipeline behaviors.

Current example:

```text
ValidationBehavior
```

Future behaviors may include:

- Logging
- Performance Monitoring
- Caching
- Transactions
- Auditing

This avoids duplicating infrastructure code across handlers.

---

# Feature Development

When creating a new feature:

1. Define abstractions in the Application layer.
2. Implement technical details in Infrastructure.
3. Register services in the appropriate extension method.
4. Inject dependencies through constructors.
5. Never instantiate dependencies manually.

---

# Constructor Injection

FlowForge exclusively uses constructor injection.

Preferred:

```csharp
public CreateBoardHandler(
    IApplicationDbContext context,
    BoardRules boardRules,
    ICurrentUserService currentUser)
{
}
```

Avoid:

```csharp
var db = new ApplicationDbContext();

var currentUser = new CurrentUserService();
```

Manual construction bypasses the DI container and makes testing difficult.

---

# Best Practices

✔ Depend on abstractions.

✔ Keep registration centralized.

✔ Prefer constructor injection.

✔ Use Scoped for request-based services.

✔ Use Singleton only for stateless, application-wide services.

✔ Keep Program.cs minimal.

✔ Register services close to their owning project.

---

# Common Mistakes

Avoid the following.

❌ Injecting `HttpContext` into handlers.

❌ Instantiating DbContext manually.

❌ Registering services in multiple locations.

❌ Depending on Infrastructure from the Application layer.

❌ Using Singleton for services that depend on scoped objects.

❌ Creating service locators.

---

# Summary

Dependency Injection is one of the fundamental architectural mechanisms used throughout FlowForge.

By depending on abstractions, registering services centrally, and using constructor injection consistently, FlowForge maintains clear architectural boundaries, improves testability, and keeps infrastructure concerns isolated from business logic.

Every new feature should follow these conventions to ensure consistency across the application.