# 🚀 FlowForge

<div align="center">

![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=for-the-badge&logo=dotnet)
![C#](https://img.shields.io/badge/C%23-12-239120?style=for-the-badge&logo=csharp)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=for-the-badge&logo=microsoftsqlserver)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-blue?style=for-the-badge)
![CQRS](https://img.shields.io/badge/Pattern-CQRS-success?style=for-the-badge)

**A modern enterprise-grade project management platform built with Clean Architecture, Vertical Slice Architecture, CQRS, MediatR and ASP.NET Core.**

---

*Inspired by Jira, Azure DevOps and Trello.*

</div>

---

# 📖 Overview

FlowForge is a modern project management platform designed using enterprise software architecture principles rather than CRUD-first development.

The goal of this project is to demonstrate how real-world SaaS applications are designed and built using scalable architecture, rich domain models, and clean separation of responsibilities.

Instead of treating the project as a tutorial application, FlowForge is developed as if it were a production-ready enterprise system.

---

# ✨ Current Features

## Authentication

- ASP.NET Identity
- JWT Authentication
- Login
- Registration
- Role-based Authorization
- Current User Service

---

## Organizations

- Multi-tenant architecture
- Organization isolation
- Organization management

---

## Projects

- Create Project
- Update Project
- Get Project
- Get All Projects
- Pagination
- Searching
- Sorting
- Archive Project
- Restore Project

---

## Boards

- Create Board
- Update Board
- Get Board
- Get Boards
- Pagination
- Searching
- Sorting
- Archive Board
- Restore Board

---

# 🏗 Architecture

FlowForge follows **Clean Architecture**.

```text
Presentation (API)

        │

Application

        │

Domain

        │

Infrastructure
```

Application logic never depends on Infrastructure.

Domain remains completely independent.

---

# 📚 Design Patterns

- Clean Architecture
- Vertical Slice Architecture
- CQRS
- MediatR
- Rich Domain Model
- Dependency Injection
- Repository-Free Architecture
- Business Rules Pattern
- Validation Pipeline
- Result Wrapper Pattern

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

## Frontend

- React
- TypeScript
- Tailwind CSS

---

# 📂 Solution Structure

```text
FlowForge

├── src
│
│   ├── FlowForge.API
│   ├── FlowForge.Application
│   ├── FlowForge.Domain
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

---

# 📖 Documentation

Complete project documentation is available inside the **docs** folder.

| Document | Description |
|----------|-------------|
| Project Vision | Goals and philosophy |
| Architecture | System architecture |
| Domain Model | Business entities |
| CQRS | Command Query Responsibility Segregation |
| Vertical Slice | Feature-based architecture |
| Database | Database design |
| API Design | REST API guidelines |
| Projects | Project Aggregate |
| Boards | Board Aggregate |

---

# 🚧 Project Status

## ✅ Completed

- Authentication
- Organizations
- Projects Module
- Boards Module

---

## 🚀 In Progress

- Columns
- Tasks
- Comments
- Attachments
- Dashboard

---

# 🗺 Roadmap

```text
v0.1.0
Authentication
Organizations
Projects
✔ Completed

↓

v0.2.0
Boards
✔ Completed

↓

v0.3.0
Columns

↓

v0.4.0
Tasks

↓

v0.5.0
Comments
Attachments

↓

v0.6.0
Dashboard

↓

v1.0.0
Production Release
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/<your-username>/FlowForge.git
```

Navigate to the solution

```bash
cd FlowForge
```

Restore packages

```bash
dotnet restore
```

Apply migrations

```bash
dotnet ef database update
```

Run the API

```bash
dotnet run --project src/FlowForge.API
```

---

# 🎯 Project Goals

- Enterprise Architecture
- Production Ready Design
- Clean Code
- SOLID Principles
- Maintainability
- Scalability
- High Performance
- Testability

---

# 📈 Development Philosophy

FlowForge is built by following a few core principles:

- Business logic belongs in the Domain.
- Application layer orchestrates use cases.
- Infrastructure implements technical details.
- Every feature follows Vertical Slice Architecture.
- CQRS separates reads from writes.
- Rich domain entities encapsulate behavior.
- Business rules are explicit and reusable.
- Simplicity is preferred over unnecessary abstractions.

---

# 🤝 Contributing

Contributions, suggestions and discussions are welcome.

Please read the documentation before contributing.

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**FlowForge**

*Building enterprise software the right way.*

</div>