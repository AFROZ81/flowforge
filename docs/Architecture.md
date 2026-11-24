# Architecture

## Overview

FlowForge follows **Clean Architecture**, **CQRS**, and **Vertical Slice Architecture**. Business rules stay in the Application and Domain layers; ASP.NET Core, EF Core, Identity, SMTP, SignalR, storage, and webhook delivery remain infrastructure concerns.

## Projects

```text
Browser / PWA
   │ REST + SignalR
   ▼
FlowForge.API
   │ Controllers, middleware, hubs, composition root
   ▼
FlowForge.Application ─────────► FlowForge.Domain
        ▲                           ▲
        │ implements contracts      │
FlowForge.Infrastructure ──────────┘
        │
        ▼
   SQL Server

FlowForge.Tests
   └── xUnit tests for handlers, services, and middleware
```

The solution file is `backend/src/FlowForge/FlowForge.slnx`. The test project is `backend/src/FlowForge/FlowForge.Tests`.

## Dependency rule

- `Domain` has no project dependencies.
- `Application` depends on `Domain` and declares infrastructure contracts.
- `Infrastructure` implements those contracts and depends on `Application` and `Domain`.
- `API` composes both layers and contains transport concerns.
- `FlowForge.Tests` references the application projects for isolated tests.

## Request flow

```text
HTTP request
  → Controller
  → Authentication / authorization
  → IMediator.Send
  → ValidationBehavior
  → Command or query handler
  → Domain rules + infrastructure services
  → EF Core SaveChanges
  → Domain-event dispatch
  → HTTP result
  → ExceptionMiddleware on failure
```

`ValidationBehavior` runs registered FluentValidation validators. `ExceptionMiddleware` maps domain exceptions to HTTP responses, including `ValidationException` to 400 with an `errors` array and `ConflictException` to 409.

## Identity and organization scoping

A user can belong to multiple organizations through `OrganizationUser`. JWTs carry:

- `NameIdentifier` — user id
- `organizationId` — active organization
- `orgIds` — all organization ids for the user
- `ClaimTypes.Role` — role in the active organization
- email and display-name claims

`CurrentUserService` reconstructs this context for handlers. Organization switching validates membership and issues a new token with the selected organization and its role. Most resource queries derive organization scope from the token rather than trusting a route id.

## Vertical slices

Each operation owns a folder under `Features/<area>/<verb>`. Examples:

- `Organizations/Invitations/Create`
- `Organizations/Invitations/Accept`
- `Organizations/Members/ChangeRole`
- `AuditLogs/GetAuditLogs`
- `Webhooks/CreateWebhook`

A slice contains its request/command, handler, validator when needed, and response DTO. Controllers stay thin.

## Domain events

Entities can record domain events. `ApplicationDbContext.SaveChangesAsync` dispatches recorded events after a successful save through `IDomainEventDispatcher`.

Current boundary:

- Event contracts and a dispatcher exist.
- No concrete `IDomainEventHandler<T>` implementations are currently registered.
- Audit entries are written explicitly by services/handlers where coverage exists.
- The webhook queue and hosted dispatcher exist, but domain-event-to-webhook publishing is not wired yet.

## Frontend structure

```text
frontend/src
├── app             router and providers
├── layouts         application shell
├── routes          public, protected, and admin guards
├── components      shared UI primitives and accessibility helpers
├── features        api, hooks, components, pages, and types per domain
├── stores          Zustand auth, AI, and UI state
├── lib             Axios client, errors, toasts, PWA, motion, formatting
└── styles          theme tokens
```

Key client concerns:

- TanStack Query owns server cache and invalidation.
- Zustand persists auth in `sessionStorage` and AI preferences in local storage.
- `PresenceProvider` owns the shared SignalR connection.
- AI inference runs in a Web Worker and is loaded only when used.
- The Vite PWA plugin generates the manifest and service worker.

## Testing architecture

- Backend: xUnit with EF Core InMemory and fake services for deterministic handler tests.
- Frontend: Vitest unit tests for AI and utility behavior.
- Storybook stories cover shared primitives; browser tests are configured separately.
- No CI pipeline is configured yet, so verification remains a local pre-commit step.
