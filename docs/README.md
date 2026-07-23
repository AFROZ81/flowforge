# 📚 FlowForge Documentation

Welcome to the official documentation for **FlowForge**.

This documentation explains the architecture, design decisions, development standards, and implemented modules of the project.

Unlike tutorial-style notes, these documents describe the actual implementation of FlowForge and the reasoning behind the chosen architecture.

---

# Documentation Structure

The documentation is divided into four major sections:

- Project Foundation
- Architecture & Design
- Engineering Standards
- Feature Documentation

---

# 1. Project Foundation

| Document | Description |
|----------|-------------|
| [Project-Vision.md](Project-Vision.md) | Vision, objectives and philosophy of FlowForge |
| [Features.md](Features.md) | Functional and planned features |
| [Roadmap.md](Roadmap.md) | Development roadmap and milestones |

---

# 2. Architecture & Design

| Document | Description |
|----------|-------------|
| [Architecture.md](Architecture.md) | Overall software architecture |
| [Solution-Structure.md](Solution-Structure.md) | Solution organization and project responsibilities |
| [Domain-Model.md](Domain-Model.md) | Domain entities and relationships |
| [Database.md](Database.md) | Database design and conventions |
| [Api-Design.md](Api-Design.md) | REST API standards and endpoint design |

---

# 3. Engineering Standards

| Document | Description |
|----------|-------------|
| [CQRS.md](CQRS.md) | CQRS implementation |
| [Vertical-Slice-Architecture.md](Vertical-Slice-Architecture.md) | Vertical Slice Architecture |
| [Dependency-Injection.md](Dependency-Injection.md) | Dependency Injection strategy |
| [Coding-Standards.md](Coding-Standards.md) | Coding conventions |
| [DTOs.md](DTOs.md) | DTO design guidelines |
| [EF-Core-Migrations.md](EF-Core-Migrations.md) | Migration workflow |
| [15-Project-Dependencies.md](15-Project-Dependencies.md) | NuGet packages and dependencies |

---

# 4. Feature Documentation

| Document | Description |
|----------|-------------|
| [Authentication.md](Authentication.md) | Authentication and Authorization |
| [Projects.md](Projects.md) | Project Aggregate |
| [Boards.md](Boards.md) | Board Aggregate |

---

# Architecture Overview

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

---

# Development Workflow

Every new feature follows the same workflow.

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

Testing

        │

        ▼

Documentation

        │

        ▼

Git Commit
```

---

# Documentation Principles

FlowForge documentation follows these principles:

- Document decisions instead of theory.
- Explain why an architecture was chosen.
- Keep implementation and documentation synchronized.
- Every completed module receives its own documentation.
- Documentation evolves with the codebase.

---

# Current Project Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Complete |
| Organizations | ✅ Complete |
| Projects | ✅ Complete |
| Boards | ✅ Complete |
| Columns | 🚧 In Progress |
| Tasks | ⏳ Planned |
| Comments | ⏳ Planned |
| Attachments | ⏳ Planned |
| Dashboard | ⏳ Planned |

---

# Version History

| Version | Description |
|----------|-------------|
| v0.1.0 | Authentication, Organizations, Projects |
| v0.2.0 | Boards |
| v0.3.0 | Columns *(Current Development)* |

---

# Repository

The repository root contains:

```text
FlowForge

├── docs
├── src
├── frontend
├── tests
├── database
├── assets
├── README.md
```

---

# Next Reading Order

If you're reading the documentation for the first time, follow this order:

1. Project Vision
2. Features
3. Roadmap
4. Architecture
5. Solution Structure
6. Domain Model
7. CQRS
8. Vertical Slice Architecture
9. Authentication
10. Projects
11. Boards

---

**Happy Coding! 🚀**