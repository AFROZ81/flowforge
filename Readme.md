# 🚀 FlowForge

<p align="center">

**A modern real-time project management platform built with ASP.NET Core, Clean Architecture, CQRS, SignalR and React.**

Designed for scalable teams, live collaboration and enterprise-grade architecture.

</p>

---

## ✨ About

FlowForge is a full-stack Kanban-style project management platform inspired by modern collaboration tools such as Jira, Trello and Azure DevOps.

The project is being built to demonstrate how enterprise applications can be designed using Clean Architecture, Domain-Driven Design principles, CQRS, real-time communication and modern frontend technologies.

Rather than focusing only on CRUD operations, FlowForge emphasizes maintainability, scalability and developer experience.

---

## 🎯 Goals

- Build an enterprise-grade backend
- Implement real-time collaboration
- Follow modern architectural practices
- Keep the codebase modular and maintainable
- Create a production-ready portfolio project

---

## ✨ Features

### Authentication

- JWT Authentication
- Role Based Authorization
- Multi-Organization Support

### Project Management

- Projects
- Boards
- Columns
- Work Items

### Collaboration

- Live Notifications
- Live Comments
- Typing Indicators
- Online Presence
- Board Presence
- SignalR Synchronization

### Infrastructure

- Clean Architecture
- CQRS + MediatR
- EF Core
- FluentValidation
- Serilog
- Swagger
- SQL Server

---

## 🏗 Architecture

```text
                Client

                   │

              ASP.NET API

                   │

      Application (CQRS)

         ▲           ▲

     Domain      Infrastructure

                   │

             SQL Server
```

---

## ⚡ Real-Time Features

FlowForge uses **SignalR** to synchronize application state across all connected users.

Supported real-time events include:

- Work Item Updates
- Comments
- Notifications
- User Presence
- Board Presence
- Typing Indicators

---

## 🛠 Technology Stack

### Backend

| Technology | Purpose |
|------------|----------|
| ASP.NET Core | REST API |
| Entity Framework Core | ORM |
| SQL Server | Database |
| SignalR | Real-time Communication |
| MediatR | CQRS |
| FluentValidation | Validation |
| Serilog | Logging |
| JWT | Authentication |

### Frontend *(Upcoming)*

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query

---

## 📁 Project Structure

```text
FlowForge

├── backend
│   ├── src
│   ├── tests
│   └── FlowForge.sln
│
├── frontend
│
├── docs
│
└── README.md
```

---

## 📚 Documentation

The `docs` directory contains concise documentation covering:

- Architecture
- Backend
- Database
- API
- Realtime
- Development
- Roadmap

---

## 🚧 Current Status

| Module | Status |
|--------|:------:|
| Backend | ✅ Complete |
| Frontend | 🚧 In Progress |
| Documentation | 🚧 In Progress |

---

## 📌 Current Version

| Version | Status |
|----------|--------|
| **v0.7.0** | ✅ Backend Complete |
| **v0.8.x** | 🚧 React Frontend |
| **v1.0.0** | 🎯 First Stable Release |

For a detailed history of project changes, see the **[Changelog](docs/Changelog.md)**.

---

## 🗺 Roadmap

### ✅ Completed

- Authentication
- Projects
- Boards
- Columns
- Work Items
- Comments
- Notifications
- SignalR
- Realtime Collaboration

### 🚧 In Progress

- React Frontend

### 🔮 Planned

- Attachments
- Dashboard Analytics
- Calendar View
- Docker
- CI/CD
- Email Notifications

---

## 🤝 Contributing

Contributions, suggestions and feedback are always welcome.

Please read the documentation before making significant architectural changes.

---

## 📄 License

This project is licensed under the **MIT License**.