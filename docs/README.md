# 📚 FlowForge Documentation

Welcome to the official documentation of **FlowForge**.

FlowForge is an enterprise-grade project management platform built using **ASP.NET Core**, **Clean Architecture**, **Vertical Slice Architecture**, **CQRS**, **MediatR**, **Entity Framework Core**, and **SQL Server**.

This documentation explains not only **how** FlowForge is implemented, but also **why** architectural and engineering decisions were made. Every document is written to reflect the actual implementation rather than generic concepts, making this repository a practical reference for building scalable enterprise applications.

---

# 🎯 Documentation Goals

The FlowForge documentation is designed to:

- Explain the overall architecture of the project.
- Document important engineering decisions.
- Describe implemented business modules.
- Provide development standards and conventions.
- Keep documentation synchronized with the codebase.
- Help new contributors understand the project quickly.
- Serve as a long-term technical reference.

---

# 📖 Documentation Structure

The documentation is organized into five major sections.

```text
FlowForge Documentation

│
├── Foundation
│
├── Architecture
│
├── Engineering
│
├── Modules
│
└── Future Documentation
```

Each section focuses on a specific aspect of the system.

---

# 🏗 Foundation

The Foundation section explains why FlowForge exists and where the project is heading.

| Document | Purpose |
|----------|---------|
| Project-Vision.md | Vision, philosophy and long-term goals |
| Features.md | Implemented and planned features |
| Roadmap.md | Development roadmap and milestones |

---

# 🏛 Architecture

The Architecture section explains how FlowForge is designed internally.

| Document | Purpose |
|----------|---------|
| Architecture.md | Clean Architecture overview |
| Solution-Structure.md | Solution and project organization |
| Domain-Model.md | Aggregates, entities and relationships |
| Database.md | Database schema and conventions |
| Api-Design.md | REST API design standards |

---

# ⚙ Engineering

The Engineering section documents implementation standards used throughout the project.

| Document | Purpose |
|----------|---------|
| CQRS.md | Command Query Responsibility Segregation |
| Vertical-Slice-Architecture.md | Feature-oriented project organization |
| Coding-Standards.md | Coding conventions and best practices |
| Dependency-Injection.md | Dependency registration strategy |
| DTOs.md | Request and response object guidelines |
| EF-Core-Migrations.md | Migration workflow |
| Project-Dependencies.md | External packages and libraries |

---

# 📦 Modules

Each business module has dedicated documentation describing its architecture, business rules and implementation.

| Module | Description |
|---------|-------------|
| Authentication.md | Authentication and Authorization |
| Projects.md | Project Aggregate |
| Boards.md | Boards, Columns and Work Items |

---

# 🚀 Current Implementation

FlowForge currently includes the following completed modules.

| Module | Status |
|---------|:------:|
| Authentication | ✅ Complete |
| Organizations | ✅ Complete |
| Projects | ✅ Complete |
| Boards | ✅ Complete |
| Columns | ✅ Complete |
| Work Items | ✅ Complete |

---

# 🛣 Upcoming Modules

The following modules are planned for future development.

| Module | Status |
|---------|:------:|
| Comments | 📅 Planned |
| Attachments | 📅 Planned |
| Labels | 📅 Planned |
| Activity Timeline | 📅 Planned |
| Notifications | 📅 Planned |
| Dashboard | 📅 Planned |
| Reports | 📅 Planned |

---

# 🏗 Architecture Overview

FlowForge follows **Clean Architecture** with strict dependency direction.

```text
                 FlowForge.API
                       │
                       ▼
           FlowForge.Application
                       │
                       ▼
              FlowForge.Domain
                       ▲
                       │
       FlowForge.Infrastructure
```

## Layer Responsibilities

### FlowForge.API

- REST API
- Authentication
- Authorization
- HTTP Pipeline
- Dependency Injection

---

### FlowForge.Application

- CQRS
- Commands
- Queries
- Handlers
- Validators
- DTOs

---

### FlowForge.Domain

- Aggregates
- Entities
- Value Objects
- Business Rules
- Domain Exceptions

---

### FlowForge.Infrastructure

- Entity Framework Core
- SQL Server
- ASP.NET Identity
- Persistence
- External Services

---

# 🔄 Development Workflow

Every feature implemented in FlowForge follows the same engineering workflow.

```text
Requirements
      │
      ▼
Domain Design
      │
      ▼
Application Layer
      │
      ▼
CQRS
      │
      ▼
Validation
      │
      ▼
Business Rules
      │
      ▼
Persistence
      │
      ▼
Testing
      │
      ▼
Documentation
      │
      ▼
Git Commit
```

This process ensures that every feature follows a consistent development lifecycle and remains aligned with the project's architectural principles.

---

# 📚 Documentation Principles

The documentation follows a few important principles.

## Implementation First

Documentation reflects the actual implementation instead of describing generic concepts.

---

## Explain Decisions

Each document explains not only what exists but also why it exists.

---

## Keep Documentation Current

Documentation evolves alongside the codebase and is updated whenever significant architectural or functional changes are introduced.

---

## Avoid Duplication

Information is documented in one place whenever possible, with related documents referencing each other.

---

## Focus on Maintainability

Every document is written so that future contributors can quickly understand the project without reverse-engineering the source code.

---

# 📂 Repository Structure

```text
FlowForge
│
├── docs
│
├── src
│   ├── FlowForge.API
│   ├── FlowForge.Application
│   ├── FlowForge.Domain
│   └── FlowForge.Infrastructure
│
├── frontend
│
├── tests
│
├── database
│
├── assets
│
└── README.md
```

---

# 📈 Version History

| Version | Milestone |
|----------|-----------|
| v0.1.0 | Authentication, Organizations and Projects |
| v0.2.0 | Boards |
| v0.3.0 | Columns |
| v0.4.0 | Work Items |
| v0.5.0 | Comments *(Planned)* |

---

# 📖 Recommended Reading Order

If you are new to FlowForge, the recommended reading order is:

1. Project Vision
2. Features
3. Roadmap
4. Architecture
5. Solution Structure
6. Domain Model
7. Database
8. API Design
9. CQRS
10. Vertical Slice Architecture
11. Authentication
12. Projects
13. Boards

Following this order provides a gradual understanding of the project's goals, architecture and implementation.

---

# 🤝 Contributing to Documentation

Documentation is treated as part of the product.

When introducing a new feature or architectural change:

- Update the corresponding documentation.
- Keep examples synchronized with the implementation.
- Explain architectural decisions.
- Avoid documenting obsolete behavior.
- Follow the existing writing style.

---

# 🚀 Future Documentation

As FlowForge continues to grow, additional documentation will be introduced for:

- Testing Strategy
- CI/CD Pipeline
- Deployment
- Docker
- Azure
- Performance Optimization
- Security
- Monitoring
- Logging
- Distributed Architecture
- Microservices Migration Strategy

---

<div align="center">

# 📚 FlowForge Documentation

**Enterprise Documentation for an Enterprise Project**

*"Good software is written twice—first in code, then in documentation."*

</div>