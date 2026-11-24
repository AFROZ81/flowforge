# FlowForge Documentation

This directory documents the current FlowForge implementation. The root [Readme.md](../Readme.md) is the quick-start and product overview; these guides provide the deeper architectural, API, data, realtime, development, and deployment context.

## Current state

- **Version:** v0.8.0 — Frontend and Platform Enhancements
- **Backend:** ASP.NET Core 10, Clean Architecture, CQRS, EF Core 10, SQL Server
- **Frontend:** React 19, TypeScript, Vite 8, TanStack Query, Zustand
- **Production site:** `https://flowforge-app.runasp.net`
- **Local API:** `http://localhost:5045`
- **Local client:** `http://localhost:5173`

## Documentation structure

| Document | Description |
| --- | --- |
| [Architecture.md](Architecture.md) | Layers, dependency rules, request flow, domain events, frontend structure. |
| [Backend.md](Backend.md) | Projects, services, authentication, validation, jobs, and testing. |
| [Database.md](Database.md) | Entities, organization scoping, invitations, audit/webhook tables, and migrations. |
| [API.md](API.md) | Endpoints, authentication, invitation lifecycle, responses, errors, and rate limits. |
| [Realtime.md](Realtime.md) | SignalR hub, groups, events, client subscriptions, and current gaps. |
| [Platform-Enhancements.md](Platform-Enhancements.md) | RBAC, multi-organization support, invitations, email delivery, audit logs, webhooks, PWA, and UX. |
| [AI-Drafting.md](AI-Drafting.md) | Local on-device AI drafting, model selection, deadlines, fallback, and tests. |
| [Development.md](Development.md) | Local setup, configuration, migrations, test commands, and workflow. |
| [Deployment.md](Deployment.md) | Production configuration and deployment to MonsterASP.NET. |
| [Changelog.md](Changelog.md) | Release history, including the changes since commit `90de061`. |
| [Roadmap.md](Roadmap.md) | Completed milestones, current hardening work, and planned features. |
| [Diagrams/](Diagrams) | Draw.io sources for architecture, authentication, and aggregates. |

## Recommended reading order

1. Architecture
2. Backend
3. Database
4. API
5. Realtime
6. Platform Enhancements
7. AI Drafting
8. Development
9. Deployment
10. Changelog and Roadmap

## Documentation conventions

- Commands are written for PowerShell from the repository root unless stated otherwise.
- Local Development configuration lives in `appsettings.Development.json`; production defaults live in `appsettings.json`.
- Secrets and machine-specific connection strings belong in user secrets or environment variables, never in committed documentation.
- Swagger is the executable endpoint reference. These guides explain behavior and cross-cutting conventions.
