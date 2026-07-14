# 🗺️ FlowForge Entity Relationship Diagram (ERD)

> **Version:** 1.0.0
> **Document Type:** Entity Relationship Diagram
> **Last Updated:** 14 July 2026

---

# 📖 Overview

This document defines the complete Entity Relationship Diagram (ERD) for FlowForge Version 1.

It acts as the single source of truth for database relationships throughout the project.

Every API, Entity Framework model, and migration will follow this design.

---

# 🎯 Objectives

- Define all business entities.
- Define relationships.
- Minimize redundancy.
- Ensure scalability.
- Maintain referential integrity.

---

# 🏛 Domain Overview

```text
ApplicationUser
        │
        │
        ▼
OrganizationMember
        ▲
        │
Organization
        │
        ▼
Project
        │
        ▼
Board
        │
        ▼
TaskStatus
        │
        ▼
TaskItem
        │
        ▼
Comment
```

---

# 🔗 Relationships

## ApplicationUser ↔ Organization

Many-to-Many

Implemented using:

OrganizationMember

---

## Organization → Project

One-to-Many

One organization can have many projects.

Each project belongs to exactly one organization.

---

## ApplicationUser ↔ Project

Many-to-Many

Implemented using:

ProjectMember

---

## Project → Board

One-to-One (Version 1)

Each project owns one Kanban board.

Future versions may support multiple boards.

---

## Board → TaskStatus

One-to-Many

Each board contains multiple workflow columns.

Example

To Do

↓

In Progress

↓

Review

↓

Done

---

## TaskStatus → TaskItem

One-to-Many

Each status contains multiple tasks.

---

## TaskItem → Comment

One-to-Many

Every task can have multiple comments.

---

# 📊 Cardinality Summary

| Parent | Child | Relationship |
|---------|--------|-------------|
| Organization | Projects | 1:N |
| Project | Board | 1:1 |
| Board | TaskStatus | 1:N |
| TaskStatus | TaskItem | 1:N |
| TaskItem | Comment | 1:N |
| User | Organization | N:N |
| User | Project | N:N |

---

# 📌 Notes

Version 1 intentionally keeps the domain model small.

Future versions will introduce:

- Attachments
- Activity Logs
- Notifications
- Time Tracking
- Calendar
- AI Assistant
- Team Chat

---

# 📖 Summary

The ER Diagram represents the complete business domain for FlowForge Version 1.

Every future database table, API endpoint, and Entity Framework entity will be based on this design.

---

➡️ Next Document

Domain-Model.md