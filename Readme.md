# 🚀 FlowForge

<div align="center">

![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-12-239120?style=for-the-badge&logo=csharp)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=for-the-badge&logo=microsoftsqlserver)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue?style=for-the-badge)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

# FlowForge

### Enterprise Project Management Platform built with Clean Architecture & Vertical Slice Architecture

*A modern SaaS-ready project management platform inspired by Jira, Azure DevOps and Trello.*

</div>

---

# 📖 Overview

FlowForge is an enterprise-grade project management platform built to demonstrate how modern business applications should be architected.

Instead of focusing on simple CRUD operations, the project emphasizes clean software architecture, domain-driven design principles, explicit business rules, CQRS, Vertical Slice Architecture, and production-ready development practices.

Every feature is designed to be scalable, maintainable, and extensible, making FlowForge a reference implementation for enterprise ASP.NET Core applications.

---

# ✨ Key Highlights

- 🏢 Multi-Tenant Architecture
- 🔐 JWT Authentication
- 👤 ASP.NET Identity
- 🧱 Clean Architecture
- 📦 Vertical Slice Architecture
- ⚡ CQRS with MediatR
- ✅ FluentValidation
- 🗂 Rich Domain Model
- 📋 Kanban Boards
- 📑 Ordered Columns
- ✅ Work Item Management
- 🔄 Archive / Restore
- 🎯 Business Rule Driven Design
- 📈 Production-Oriented Structure

---

# ✨ Implemented Modules

## 🔐 Authentication

FlowForge uses ASP.NET Identity with JWT authentication to provide a secure authentication and authorization system.

### Features

- User Registration
- User Login
- JWT Authentication
- Role-based Authorization
- Current User Service
- Identity Integration
- Secure Password Hashing
- Claims-based Authorization

---

## 🏢 Organizations

Organizations provide complete tenant isolation across the system.

### Features

- Create Organization
- Update Organization
- Multi-tenancy
- Organization Isolation
- Ownership Management

---

## 📁 Projects

Projects act as the primary workspace for planning and organizing work.

### Features

- Create Project
- Update Project
- Archive Project
- Restore Project
- Get Project
- Get Projects
- Search
- Pagination
- Sorting
- Validation
- Business Rules

---

## 📋 Boards

Boards represent Kanban boards inside projects.

### Features

- Create Board
- Update Board
- Archive Board
- Restore Board
- Search
- Pagination
- Sorting
- Validation
- Business Rules

---

## 📑 Columns

Columns organize work items within a board.

### Features

- Create Column
- Rename Column
- Update Column
- Move Column
- Archive Column
- Restore Column
- Ordered Columns
- Display Order
- Validation
- Business Rules

---

## ✅ Work Items

Work Items represent individual tasks within a board.

### Commands

- Create Work Item
- Rename Work Item
- Update Work Item
- Move Work Item
- Activate Work Item
- Complete Work Item
- Block Work Item
- Archive Work Item
- Restore Work Item

### Queries

- Get Work Item
- Get Work Items by Column
- Search Work Items

### Features

- Sparse Ordering
- Drag & Drop Ready
- Status Management
- Archive / Restore
- Domain Methods
- CQRS
- FluentValidation
- Business Rules

---

# 🏗 Architecture

FlowForge follows **Clean Architecture** to maintain a clear separation of responsibilities.

```text
Presentation (API)

        │

Application

        │

Domain

        │

Infrastructure
```

## Layer Responsibilities

### Presentation

- REST API
- Authentication
- Authorization
- HTTP Pipeline
- Dependency Injection

---

### Application

- CQRS
- Commands
- Queries
- Handlers
- Validators
- DTOs

---

### Domain

- Entities
- Aggregates
- Business Rules
- Domain Logic
- Domain Exceptions

---

### Infrastructure

- Entity Framework Core
- SQL Server
- ASP.NET Identity
- Persistence
- External Services

---

# 📚 Design Patterns

FlowForge implements several enterprise software design patterns.

- Clean Architecture
- Vertical Slice Architecture
- CQRS
- MediatR
- Rich Domain Model
- Dependency Injection
- FluentValidation Pipeline
- Repository-Free Architecture
- Business Rules Pattern
- Result Wrapper Pattern
- Sparse Ordering Strategy

---

# 🛠 Technology Stack

## Backend

- ASP.NET Core (.NET 10)
- C#
- Entity Framework Core
- SQL Server
- ASP.NET Identity
- JWT Authentication
- MediatR
- FluentValidation

---

## Frontend

- React
- TypeScript
- Tailwind CSS

---

## Database

- SQL Server
- Entity Framework Core
- Code First Migrations

---

## Development Tools

- Visual Studio
- Git
- GitHub
- Swagger / OpenAPI

---

# 📂 Solution Structure

```text
FlowForge

├── src
│
│   ├── FlowForge.API
│   │
│   ├── FlowForge.Application
│   │
│   ├── FlowForge.Domain
│   │
│   └── FlowForge.Infrastructure
│
├── frontend
│
├── tests
│
├── docs
│
└── database
```

## Project Responsibilities

### FlowForge.API

- REST Endpoints
- Authentication
- Authorization
- Swagger
- Dependency Injection

### FlowForge.Application

- Commands
- Queries
- Validators
- DTOs
- Business Use Cases

### FlowForge.Domain

- Aggregates
- Entities
- Domain Rules
- Domain Exceptions

### FlowForge.Infrastructure

- Persistence
- Identity
- EF Core
- SQL Server
- External Integrations

---

# 📖 Documentation

Complete documentation is available inside the **docs** folder.

## Foundation

- Project Vision
- Features
- Roadmap

## Architecture

- Architecture
- Solution Structure
- Domain Model
- Database Design
- API Design

## Engineering

- CQRS
- Vertical Slice Architecture
- Coding Standards
- Dependency Injection
- DTO Guidelines
- EF Core Migrations

## Modules

- Authentication
- Projects
- Boards
- Columns
- Work Items

---

# 🚧 Project Status

## ✅ Completed

- Authentication
- Organizations
- Projects
- Boards
- Columns
- Work Items

## 🚧 Currently Building

- Comments
- Attachments
- Labels

## 📅 Planned

- Dashboard
- Activity Timeline
- Notifications
- Reports
- File Storage
- Search Improvements

---

# 🗺 Development Roadmap

```text
v0.1.0
──────────────
Authentication
Organizations
Projects
✔ Completed

↓

v0.2.0
──────────────
Boards
✔ Completed

↓

v0.3.0
──────────────
Columns
✔ Completed

↓

v0.4.0
──────────────
Work Items
✔ Completed

↓

v0.5.0
──────────────
Comments
Attachments
Labels

↓

v0.6.0
──────────────
Dashboard
Notifications
Reports

↓

v0.7.0
──────────────
Activity Timeline
Labels
Advanced Search
Audit Logs

↓

v1.0.0
──────────────
Production Release
Enterprise Ready
```

---

# 🚀 Getting Started

## Prerequisites

Before running FlowForge, ensure the following tools are installed:

- .NET 10 SDK
- SQL Server 2022 or later
- Visual Studio 2022 / Visual Studio Code
- Node.js (Latest LTS)
- Git

---

## Clone the Repository

```bash
git clone https://github.com/<your-username>/FlowForge.git
```

Navigate to the solution directory.

```bash
cd FlowForge
```

---

## Restore NuGet Packages

```bash
dotnet restore
```

---

## Configure Database

Update your connection string inside:

```text
src/FlowForge.API/appsettings.json
```

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=FlowForge;Trusted_Connection=True;TrustServerCertificate=True"
}
```

---

## Apply Migrations

```bash
dotnet ef database update
```

---

## Run the API

```bash
dotnet run --project src/FlowForge.API
```

Swagger will be available at:

```text
https://localhost:5001/swagger
```

---

## Run the Frontend

Navigate to the frontend project.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

---

# 📦 Current Module Hierarchy

```text
Organization
      │
      ▼
Project
      │
      ▼
Board
      │
      ▼
Column
      │
      ▼
Work Item
```

Upcoming modules will extend this hierarchy:

```text
Work Item
      │
      ├── Comments
      ├── Attachments
      ├── Labels
      ├── Activity History
      └── Notifications
```

---

# 🎯 Project Goals

FlowForge is built with long-term maintainability and scalability in mind.

The primary objectives are:

- Build enterprise-grade software architecture
- Follow Clean Architecture principles
- Demonstrate Vertical Slice Architecture
- Keep the Domain independent
- Encapsulate business logic inside aggregates
- Produce maintainable and testable code
- Minimize technical debt
- Keep features independently deployable
- Encourage explicit business rules
- Provide a reference implementation for modern ASP.NET Core applications

---

# 💡 Why FlowForge?

Most tutorial projects stop after implementing CRUD operations.

FlowForge goes several steps further by focusing on how real enterprise systems are designed.

The project emphasizes:

- Rich Domain Models
- Explicit Business Rules
- Vertical Slice Architecture
- CQRS with MediatR
- FluentValidation
- Multi-Tenant Design
- Ordered Kanban Boards
- Aggregate Boundaries
- Production-Oriented Folder Structure
- Scalable API Design

Rather than simply making features work, FlowForge aims to demonstrate **why** architectural decisions matter and how they improve long-term maintainability.

---

# 📈 Development Philosophy

FlowForge follows a few core engineering principles.

## Business Logic Belongs in the Domain

Business rules should never be scattered across controllers or infrastructure services.

---

## CQRS Separates Responsibilities

Commands modify state.

Queries retrieve data.

Keeping these concerns separate improves maintainability and scalability.

---

## Vertical Slice Architecture

Each feature owns everything it needs.

Commands, queries, validators and handlers are organized together rather than by technical layer.

---

## Explicit Business Rules

Rules are implemented intentionally and are easy to locate, understand and modify.

---

## Simplicity Over Cleverness

Readable code is preferred over unnecessary abstraction.

Every abstraction should have a clear purpose.

---

## Documentation Evolves with the Code

Documentation is treated as part of the product and should always reflect the current implementation.

---

# 📊 Current Progress

| Module | Status |
|---------|--------|
| Authentication | ✅ Complete |
| Organizations | ✅ Complete |
| Projects | ✅ Complete |
| Boards | ✅ Complete |
| Columns | ✅ Complete |
| Work Items | ✅ Complete |
| Comments | 🚧 Planned |
| Attachments | 🚧 Planned |
| Labels | 🚧 Planned |
| Dashboard | 🚧 Planned |
| Notifications | 🚧 Planned |

---

# 🧭 Current Milestone

The foundational Kanban system has been completed.

Implemented hierarchy:

```text
Organization
      │
Project
      │
Board
      │
Column
      │
Work Item
```

Current capabilities include:

- Authentication & Authorization
- Multi-Tenant Organizations
- Project Management
- Board Management
- Ordered Columns
- Sparse Ordering
- Drag & Drop Ready Work Items
- Status Management
- Archive / Restore
- FluentValidation
- CQRS
- MediatR
- Rich Domain Model

The next milestone focuses on collaboration features including Comments, Attachments and Labels.

---

# 📚 Documentation

Detailed documentation is available in the `/docs` directory.

Topics include:

- Project Vision
- Architecture
- Solution Structure
- Domain Model
- Database Design
- API Design
- CQRS
- Vertical Slice Architecture
- Authentication
- Projects
- Boards
- Columns
- Work Items

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve FlowForge:

1. Fork the repository.
2. Create a feature branch.
3. Follow the existing coding standards.
4. Update documentation where applicable.
5. Submit a pull request.

Please ensure that all changes align with the architectural principles used throughout the project.

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify and distribute this project in accordance with the terms of the license.

---

# 🙏 Acknowledgements

FlowForge draws inspiration from several modern project management platforms and software architecture practices, including:

- Jira
- Azure DevOps
- Trello
- Clean Architecture
- Domain-Driven Design (DDD)
- Vertical Slice Architecture
- CQRS
- ASP.NET Core

---

<div align="center">

# 🚀 FlowForge

### Building Enterprise Software the Right Way

**Current Version:** `v0.4.0`

**Current Milestone:** Core Kanban Foundation Complete

```
Organization
      │
Project
      │
Board
      │
Column
      │
Work Item
```

**Next Milestone**

```
Comments
Attachments
Labels
```

Built with ❤️ using ASP.NET Core, Clean Architecture, Vertical Slice Architecture, CQRS, MediatR and Entity Framework Core.

</div>