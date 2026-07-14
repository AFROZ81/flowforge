# 🏗️ FlowForge - System Architecture

> **Version:** 1.0.0  
> **Document Type:** Software Architecture Document (SAD)  
> **Last Updated:** 14 July 2026

---

# 📖 Overview

FlowForge is a **modern multi-tenant SaaS Project Management Platform** built using **ASP.NET Core (.NET 10)** and **React 19**.

The purpose of this document is to explain the overall architecture of the application, the major business entities, and how different parts of the system communicate with each other.

This document serves as the foundation for all future development.

---

# 🎯 Objectives

The architecture is designed with the following goals:

- Build a scalable SaaS application
- Follow modern software engineering principles
- Keep backend and frontend completely independent
- Support future microservice migration
- Maintain clean and understandable code
- Ensure long-term maintainability
- Provide a professional learning experience

---

# 🌍 What is FlowForge?

FlowForge is an online platform that enables organizations to manage projects, collaborate with team members, assign tasks, and track project progress.

It is inspired by products such as:

- Jira
- ClickUp
- Trello
- Linear

However, FlowForge is **not a clone**.

The goal is to understand how such systems are designed while implementing them using modern technologies.

---

# 🏢 Multi-Tenant Architecture

FlowForge follows a **Multi-Tenant Architecture**.

## What does Multi-Tenant mean?

Multiple organizations use the same application while their data remains completely isolated.

Example:

```text
FlowForge
│
├── Organization A
│      ├── Users
│      ├── Projects
│      └── Tasks
│
├── Organization B
│      ├── Users
│      ├── Projects
│      └── Tasks
│
└── Organization C
       ├── Users
       ├── Projects
       └── Tasks
```

An organization can never access another organization's data.

This is the same concept used by:

- GitHub
- Slack
- Notion
- Jira
- ClickUp

---

# 🏛 High Level Architecture

```text
                    React 19
                 (Frontend UI)
                        │
                        │ HTTP / HTTPS
                        ▼
      ASP.NET Core (.NET 10) Web API
                        │
                        ▼
              Business Logic Layer
                        │
                        ▼
          Entity Framework Core (EF Core)
                        │
                        ▼
                  SQL Server Database
```

---

# 🔄 Request Flow

Every request inside FlowForge follows the same path.

```text
User

↓

React UI

↓

HTTP API Request

↓

ASP.NET Core Controller

↓

Service Layer

↓

Entity Framework Core

↓

SQL Server

↓

Response

↓

React UI
```

Understanding this flow is one of the most important concepts in modern web development.

---

# 🧩 Core Business Entities

Version 1 of FlowForge will consist of the following entities.

| Entity | Purpose |
|---------|---------|
| User | Represents an individual user |
| Organization | Represents a company or workspace |
| OrganizationMember | Connects users with organizations |
| Project | Represents a project inside an organization |
| ProjectMember | Connects users with projects |
| Board | Represents a Kanban board |
| TaskStatus | Stores available task statuses |
| Task | Represents an individual work item |
| Comment | Discussion on tasks |

---

# 🔗 Entity Relationship Overview

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Organization   ProjectMember
 │
 ▼
Project
 │
 ▼
Board
 │
 ▼
Task
 │
 ▼
Comment
```

This model is intentionally kept simple for Version 1.

More entities will be introduced in later releases.

---

# 🚀 Version 1 Scope

The following modules are included in Version 1.

## Authentication

- Register
- Login
- JWT Authentication

---

## Organization

- Create Organization
- Edit Organization
- Invite Members

---

## Projects

- Create Project
- Update Project
- Archive Project

---

## Boards

- Kanban Board
- Task Columns

---

## Tasks

- Create Task
- Assign Task
- Priority
- Due Date
- Status

---

## Dashboard

- Project Summary
- Recent Activity
- Task Statistics

---

# 📌 Future Modules

The following features are intentionally postponed.

- AI Assistant
- Docker Deployment
- Azure Hosting
- SignalR
- Notifications
- File Attachments
- Calendar
- Time Tracking
- Activity Logs
- Team Chat

This allows us to focus on building a strong foundation first.

---

# 🎯 Design Principles

FlowForge follows these engineering principles.

### ✅ Separation of Concerns

Frontend, Backend, and Database remain independent.

---

### ✅ Scalability

The architecture should support thousands of users without major redesign.

---

### ✅ Maintainability

Code should be easy to understand, modify, and extend.

---

### ✅ Reusability

Components should be reusable wherever possible.

---

### ✅ Security First

Authentication and authorization will be built into the system from the beginning.

---

# 🧠 Why We Are Building This Way

Many tutorials start by creating database tables and writing CRUD APIs immediately.

Professional software teams do not.

They first understand:

- Business requirements
- Users
- Relationships
- System boundaries
- Future scalability

Only then do they begin implementation.

This project follows the same professional approach.

---

# 📚 Key Learning Outcomes

By understanding this architecture, you will learn:

- SaaS Architecture
- Multi-Tenant Design
- Client-Server Architecture
- Layered Architecture
- Request Lifecycle
- Business Domain Modeling
- Modern Project Planning

---

# 💼 Interview Notes

### Q1. What is a Multi-Tenant Application?

A software application where multiple organizations share the same application while keeping their data completely isolated.

---

### Q2. Why separate Frontend and Backend?

To allow independent development, deployment, scalability, and technology flexibility.

---

### Q3. Why use a Web API instead of Razor Pages?

Because modern applications often have multiple clients (Web, Mobile, Desktop) that consume the same backend APIs.

---

# 🚫 Common Mistakes

❌ Mixing business logic inside controllers

❌ Designing database tables before understanding the business

❌ Building every feature before defining Version 1 scope

❌ Tight coupling between frontend and backend

---

# 📖 Summary

FlowForge is being built as a **production-grade SaaS application** using modern engineering principles.

The architecture focuses on simplicity, scalability, maintainability, and real-world software development practices.

This document serves as the architectural blueprint for all future development.

---

> **Next Document → `05-Database.md`**