# 💉 FlowForge Dependency Injection

Dependency Injection (DI) is one of the core architectural mechanisms used throughout FlowForge.

Rather than allowing classes to create their own dependencies, FlowForge relies on the built-in ASP.NET Core Dependency Injection container to supply the services each component requires.

Dependency Injection is more than a technique for object creation—it is the foundation that enables **Clean Architecture**, **CQRS**, **Vertical Slice Architecture**, and **testability** throughout the application.

---

# 📑 Table of Contents

- Introduction
- Dependency Injection Philosophy
- Why Dependency Injection?
- Dependency Inversion Principle
- Constructor Injection
- Service Lifetimes
- Dependency Registration
- Layered Registration

---

# 📖 Introduction

Every feature in FlowForge depends on services provided by other parts of the application.

Examples include:

- Database access
- Current user information
- Authentication
- Business rules
- Validation
- Logging
- File storage
- External services

Rather than creating these dependencies manually, FlowForge allows the Dependency Injection container to construct and supply them automatically.

Instead of this:

```csharp
var context = new ApplicationDbContext();

var currentUser = new CurrentUserService();

var projectRules = new ProjectRules();
```

FlowForge uses constructor injection.

```csharp
public CreateProjectHandler(
    IApplicationDbContext context,
    ProjectRules projectRules,
    ICurrentUserService currentUser)
{
    _context = context;
    _projectRules = projectRules;
    _currentUser = currentUser;
}
```

The framework creates these objects and injects them when the handler is instantiated.

---

# 🎯 Dependency Injection Philosophy

The philosophy behind Dependency Injection is simple:

> **Classes should declare what they need, not create what they need.**

Every class should focus exclusively on its own responsibility.

Object creation is delegated to the Dependency Injection container.

This results in:

- Loose coupling
- Better separation of concerns
- Easier testing
- Simpler maintenance
- More flexible architecture

---

## Responsibilities

A class should:

✔ Declare its dependencies.

✔ Use its dependencies.

✔ Never create infrastructure objects directly.

The Dependency Injection container is responsible for:

- Creating objects
- Managing lifetimes
- Resolving dependencies
- Supplying implementations

---

# ❓ Why Dependency Injection?

Without Dependency Injection, every class becomes responsible for constructing the objects it depends upon.

Example:

```csharp
public class CreateProjectHandler
{
    public void Handle()
    {
        var context = new ApplicationDbContext();

        var currentUser = new CurrentUserService();

        var rules = new ProjectRules();
    }
}
```

Problems with this approach include:

- Tight coupling
- Difficult unit testing
- Duplicate object creation
- Hidden dependencies
- Hard-coded implementations

Dependency Injection eliminates these problems by centralizing object creation.

---

## Benefits

Using Dependency Injection provides several advantages.

### Loose Coupling

Classes depend on abstractions rather than concrete implementations.

---

### Easier Testing

Dependencies can easily be replaced with mocks or test doubles.

---

### Better Maintainability

Changing an implementation rarely requires changes to consuming classes.

---

### Centralized Configuration

Object creation is configured in one place instead of being scattered throughout the application.

---

### Improved Scalability

As new features are introduced, the container manages increasingly complex dependency graphs without requiring changes to existing classes.

---

# 🏛️ Dependency Inversion Principle

Dependency Injection supports one of the SOLID principles:

**Dependency Inversion Principle (DIP).**

The principle states:

> **High-level modules should depend on abstractions rather than concrete implementations.**

In FlowForge, the Application layer depends on interfaces.

Example:

```csharp
IApplicationDbContext
```

The Infrastructure layer provides the implementation.

```csharp
ApplicationDbContext
```

The Application layer never references Entity Framework Core directly.

This preserves the dependency direction required by Clean Architecture.

---

## Dependency Flow

Dependencies always move inward.

```text
Presentation

↓

Application

↓

Domain

↑

Infrastructure
```

Infrastructure implements abstractions.

Application consumes abstractions.

The Domain layer depends on neither.

This keeps business logic independent of infrastructure concerns.

---

# 🏗️ Constructor Injection

FlowForge exclusively uses constructor injection.

Example:

```csharp
public CreateProjectHandler(
    IApplicationDbContext context,
    ProjectRules projectRules,
    ICurrentUserService currentUser)
{
    _context = context;
    _projectRules = projectRules;
    _currentUser = currentUser;
}
```

The constructor clearly communicates every dependency required by the handler.

No hidden dependencies exist.

---

## Why Constructor Injection?

Constructor injection offers several advantages.

- Dependencies are explicit.
- Objects are fully initialized before use.
- Required services cannot be forgotten.
- Testing becomes significantly easier.
- Immutability is encouraged.

Constructor injection is the preferred approach throughout the entire FlowForge solution.

---

## Avoid Manual Instantiation

Avoid creating dependencies manually.

```csharp
var context = new ApplicationDbContext();

var currentUser = new CurrentUserService();
```

Manual construction:

- Bypasses the DI container
- Makes testing difficult
- Breaks centralized configuration
- Couples code to implementations

Always request dependencies through the constructor.

---

# ⏳ Service Lifetimes

ASP.NET Core provides three primary service lifetimes.

FlowForge uses each according to its intended purpose.

---

## Singleton

A Singleton service is created once for the lifetime of the application.

```text
Application Starts

↓

Singleton Created

↓

Same Instance Used Everywhere

↓

Application Stops
```

Suitable for:

- Application configuration
- Stateless utilities
- Shared caches
- Global services

Avoid storing request-specific information inside Singleton services.

---

## Scoped

A Scoped service is created once per HTTP request.

```text
HTTP Request

↓

Scoped Service Created

↓

Shared Within Request

↓

Disposed
```

This is the most common lifetime in FlowForge.

Examples include:

- ApplicationDbContext
- CurrentUserService
- Business rule classes
- Request-specific services

Scoped services ensure that each request has its own isolated dependencies.

---

## Transient

Transient services are created every time they are requested.

```text
Request Service

↓

New Instance

↓

Request Service Again

↓

Another New Instance
```

Suitable for:

- Lightweight stateless services
- Utility components
- MediatR pipeline behaviors
- Helper services

Because a new instance is created each time, transient services should remain lightweight.

---

# 🧩 Dependency Registration

All dependency registration is centralized using extension methods.

Instead of placing dozens of registrations inside `Program.cs`, FlowForge groups registrations by architectural layer.

Example:

```csharp
builder.Services.AddApplication();

builder.Services.AddInfrastructure(builder.Configuration);
```

This keeps application startup clean, readable, and modular.

---

## Why Centralize Registration?

Centralized registration provides several advantages.

- Easier maintenance
- Better discoverability
- Layer ownership is preserved
- Cleaner startup configuration
- Simpler onboarding for new developers

Every service should be registered close to the layer that owns it.

---

# 🏛️ Layered Registration

Each architectural layer is responsible for registering its own services.

### Application Layer

Registers:

- MediatR
- FluentValidation
- Pipeline Behaviors
- Application services
- Rule classes

---

### Infrastructure Layer

Registers:

- Entity Framework Core
- Identity
- Authentication
- Authorization
- External providers
- File storage
- Email services
- Persistence implementations

---

### Presentation Layer

Configures:

- Controllers
- Swagger
- Middleware
- Routing
- CORS
- API behaviors

Each layer owns its own registrations, keeping responsibilities clearly separated.

---

# 🚀 MediatR Registration

FlowForge uses **MediatR** to dispatch every command and query.

Rather than controllers creating handlers directly, they send requests to the mediator.

```csharp
await _mediator.Send(command);
```

MediatR locates the appropriate handler through the Dependency Injection container.

This approach provides:

- Loose coupling
- Automatic handler resolution
- Simplified controllers
- Consistent request processing

---

## Registration

The Application layer is responsible for registering MediatR.

Example:

```csharp
services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(ApplicationAssemblyMarker).Assembly);
});
```

All handlers contained within the Application assembly are discovered automatically.

No manual registration is required when adding new features.

---

# ✅ FluentValidation Registration

FlowForge uses **FluentValidation** for request validation.

Validators are automatically discovered during application startup.

Example:

```csharp
services.AddValidatorsFromAssembly(
    typeof(ApplicationAssemblyMarker).Assembly);
```

Whenever a new validator is added to the Application layer, it becomes available without additional configuration.

---

## Pipeline Behaviors

Cross-cutting concerns are implemented using MediatR pipeline behaviors.

Current example:

```text
ValidationBehavior
```

Future behaviors may include:

- Logging
- Performance monitoring
- Caching
- Transactions
- Auditing
- Exception handling

Pipeline behaviors execute before and after handlers, allowing infrastructure concerns to remain separate from business logic.

---

# 🗄️ Database Context Registration

The Application layer depends only on an abstraction.

```csharp
IApplicationDbContext
```

The Infrastructure layer provides the implementation.

```csharp
ApplicationDbContext
```

Registration example:

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
});

services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());
```

Handlers never instantiate or depend directly on `ApplicationDbContext`.

This keeps the Application layer independent of Entity Framework Core.

---

# 🔐 Authentication & JWT Registration

Authentication services are registered by the Infrastructure layer.

Typical registrations include:

- ASP.NET Identity
- JWT Bearer Authentication
- Authorization Policies
- Token Validation

Example:

```csharp
services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // JWT configuration
    });

services.AddAuthorization();
```

By centralizing authentication registration, security concerns remain isolated from business features.

---

# ⚙️ Configuration Binding

FlowForge binds application settings to strongly typed configuration objects.

Instead of reading configuration values directly throughout the codebase, settings are grouped into dedicated option classes.

Example:

```csharp
services.Configure<JwtOptions>(
    configuration.GetSection("Jwt"));
```

Services consume configuration using:

```csharp
IOptions<JwtOptions>
```

Benefits include:

- Strong typing
- Centralized configuration
- Easier testing
- Compile-time safety
- Better discoverability

---

# 👤 CurrentUserService

Business features frequently require information about the authenticated user.

Rather than accessing `HttpContext` directly, FlowForge uses an abstraction.

Application depends on:

```csharp
ICurrentUserService
```

Infrastructure provides:

```csharp
CurrentUserService
```

Typical information includes:

- User ID
- Organization ID
- User Name
- Email
- Roles

Handlers remain independent of ASP.NET Core-specific APIs.

---

# 🔄 Request Lifecycle

The Dependency Injection container participates in every request processed by FlowForge.

```text
HTTP Request
      │
      ▼
ASP.NET Core
      │
      ▼
Dependency Injection Container
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
Dependencies Resolved
      │
      ▼
Business Logic
      │
      ▼
Database
      │
      ▼
HTTP Response
```

The container resolves all required services before the handler executes.

This ensures that each component receives fully configured dependencies without creating them manually.

---

# 🧪 Testing Strategy

Dependency Injection significantly improves testability.

Because handlers depend on abstractions rather than implementations, dependencies can easily be replaced with test doubles.

Example:

```text
Handler

↓

Mock IApplicationDbContext

↓

Mock CurrentUserService

↓

Execute Handler

↓

Verify Result
```

This allows business logic to be tested without requiring:

- SQL Server
- ASP.NET Core
- Entity Framework Core
- Authentication infrastructure

Unit tests remain fast, isolated, and reliable.

---

# 📋 Best Practices

Follow these conventions throughout FlowForge.

✔ Depend on abstractions instead of implementations.

✔ Prefer constructor injection.

✔ Register services in the layer that owns them.

✔ Keep `Program.cs` minimal.

✔ Use Scoped services for request-based dependencies.

✔ Use Singleton services only for application-wide stateless components.

✔ Keep constructors focused and inject only required dependencies.

✔ Use strongly typed configuration with `IOptions<T>`.

✔ Let the container create all objects.

---

# ⚠️ Common Anti-Patterns

Avoid the following patterns.

---

## Manual Object Creation

Avoid:

```csharp
var context = new ApplicationDbContext();
```

Always allow the container to resolve dependencies.

---

## Service Locator Pattern

Avoid injecting `IServiceProvider` simply to retrieve services manually.

Constructor injection is preferred because dependencies remain explicit.

---

## Injecting HttpContext

Handlers should never access `HttpContext` directly.

Use `ICurrentUserService` instead.

---

## Incorrect Service Lifetimes

Avoid registering Singleton services that depend on Scoped services.

Mismatched lifetimes can lead to runtime errors and unpredictable behavior.

---

## Excessive Constructor Injection

Large constructors often indicate that a class has too many responsibilities.

Consider refactoring if a constructor requires numerous dependencies.

---

## Registering Services in Multiple Locations

Each service should have a single registration point.

Keeping registrations centralized improves maintainability and avoids duplicate configuration.

---

# 🚀 Future Evolution

As FlowForge grows, additional infrastructure services will be introduced.

Examples include:

```text
Caching

↓

Email Services

↓

Background Jobs

↓

Distributed Messaging

↓

File Storage

↓

Search

↓

Notifications
```

Each new service will follow the same principles:

- Depend on abstractions
- Register centrally
- Inject through constructors
- Keep business logic infrastructure-agnostic

This ensures that new capabilities integrate seamlessly without compromising architectural boundaries.

---

# 📖 Summary

Dependency Injection is one of the foundational mechanisms that enables FlowForge's architecture.

By delegating object creation to the ASP.NET Core Dependency Injection container, FlowForge achieves:

- Loose coupling
- Improved testability
- Centralized configuration
- Clear architectural boundaries
- Consistent dependency management

Combined with:

- Clean Architecture
- CQRS
- Vertical Slice Architecture
- MediatR
- FluentValidation

Dependency Injection provides the infrastructure that allows every feature to remain focused on business behavior rather than object creation.

As FlowForge evolves, these conventions will continue to ensure that the application remains scalable, maintainable, and easy to extend.

---

<div align="center">

# 💉 FlowForge Dependency Injection

### Building Loosely Coupled Components Through Explicit Dependencies

*"Classes should focus on business behavior, not object creation. Dependency Injection keeps responsibilities clear, dependencies explicit, and architecture maintainable."*

</div>