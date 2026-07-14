# 🗄️ FlowForge - Database Design

> **Version:** 1.0.0  
> **Document Type:** Database Design Document (DDD)  
> **Last Updated:** 14 July 2026

---

# 📖 Overview

The database is the heart of every software application.

A well-designed database makes an application scalable, maintainable, secure, and easy to extend.

A poorly designed database creates technical debt that becomes harder to fix as the application grows.

This document defines the database design principles, naming conventions, relationships, and standards that will be followed throughout the FlowForge project.

---

# 🎯 Objectives

Our database should:

- Be easy to understand
- Be normalized
- Be scalable
- Support future features
- Follow industry standards
- Work seamlessly with Entity Framework Core
- Avoid unnecessary complexity

---

# 🏗 Database Technology

| Property | Value |
|----------|--------|
| Database | SQL Server 2022 |
| ORM | Entity Framework Core 10 |
| Primary Key | GUID |
| Migrations | EF Core Migrations |
| Time Zone | UTC |
| Delete Strategy | Soft Delete |
| Architecture | Code First |

---

# ❓ Why SQL Server?

FlowForge uses SQL Server because:

- Excellent integration with .NET
- Enterprise-grade reliability
- Powerful query optimizer
- Rich tooling (SSMS)
- Widely used in enterprise applications
- Excellent Entity Framework Core support

Although PostgreSQL is also excellent, SQL Server aligns better with our learning goals as a .NET developer.

---

# ❓ Why Code First?

There are three approaches:

- Database First
- Model First
- Code First

We will use **Code First**.

Why?

Because modern ASP.NET Core development commonly uses Entity Framework Core Code First.

Benefits:

- Database evolves with the application.
- Version controlled migrations.
- Easy collaboration.
- Better CI/CD integration.

---

# 🔑 Primary Key Strategy

FlowForge will use **GUID (Globally Unique Identifier)** as the primary key for every major entity.

Example:

```text
3F2504E0-4F89-41D3-9A0C-0305E82C3301
```

---

## Why not Integer IDs?

Integers are:

✅ Smaller

✅ Faster

But:

❌ Predictable

```
/users/5
/users/6
/users/7
```

This can expose data unintentionally if authorization is implemented incorrectly.

---

## Why GUID?

Advantages:

- Globally unique
- Difficult to guess
- Better for distributed systems
- Easy database merging
- Industry standard for many enterprise .NET systems

---

# 📌 Naming Conventions

Consistency is critical.

## Tables

Use plural nouns.

Examples:

```
Users
Organizations
Projects
Boards
Tasks
Comments
```

---

## Primary Keys

Always use:

```
Id
```

Not:

```
UserId
ProjectId
TaskId
```

Example:

```csharp
public Guid Id { get; set; }
```

---

## Foreign Keys

Use:

```
OrganizationId
ProjectId
BoardId
TaskId
AssignedToUserId
CreatedByUserId
```

---

## Date Columns

Use:

```
CreatedAt
UpdatedAt
DeletedAt
```

Never:

```
Created_Date
CreateDate
createdDate
```

---

## Boolean Columns

Use:

```
IsDeleted
IsActive
IsArchived
```

---

# 🕒 UTC Date Strategy

All timestamps in FlowForge will be stored in **UTC (Coordinated Universal Time)**.

Why?

Imagine users from:

- India
- Germany
- USA
- Japan

If every server stores local time, reports become inconsistent.

Instead:

```
Database
↓

UTC

↓

Frontend converts to local timezone.
```

This is how modern cloud applications work.

---

# 🗑 Soft Delete Strategy

FlowForge will never permanently delete business data.

Instead of:

```sql
DELETE FROM Projects
```

We will mark:

```
IsDeleted = true
DeletedAt = UTC Date
```

Benefits:

- Restore deleted records
- Audit history
- Prevent accidental data loss

---

# 📝 Audit Fields

Every major entity will include the following fields:

| Column | Purpose |
|---------|----------|
| CreatedAt | Record creation timestamp |
| UpdatedAt | Last modification timestamp |
| CreatedBy | User who created the record |
| UpdatedBy | User who modified the record |
| IsDeleted | Soft delete flag |
| DeletedAt | Deletion timestamp |

This provides complete traceability.

---

# 🧩 Core Business Entities

Version 1 contains the following entities.

| Entity | Description |
|----------|-------------|
| ApplicationUser | System user (Identity) |
| Organization | Company / Workspace |
| OrganizationMember | User membership inside organizations |
| Project | Project inside an organization |
| ProjectMember | User membership inside projects |
| Board | Kanban board |
| TaskStatus | Status column |
| Task | Work item |
| Comment | Discussion on tasks |

---

# 🔗 Entity Relationships

```
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
Task
        │
        ▼
Comment
```

---

# 📌 Relationship Types

| Relationship | Type |
|--------------|------|
| Organization → Projects | One-to-Many |
| Project → Board | One-to-One (Version 1) |
| Board → TaskStatus | One-to-Many |
| TaskStatus → Tasks | One-to-Many |
| Task → Comments | One-to-Many |
| Users ↔ Organizations | Many-to-Many |
| Users ↔ Projects | Many-to-Many |

---

# 🏛 Database Design Principles

FlowForge follows these principles.

## Separation of Concerns

Business logic never belongs in SQL.

---

## Normalization

Avoid duplicate information.

---

## Referential Integrity

Foreign keys protect relationships.

---

## Consistency

Follow naming conventions everywhere.

---

## Scalability

Design today for tomorrow's features.

---

# 🚫 Common Mistakes

❌ Using inconsistent table names

❌ Storing passwords manually

❌ Hard deleting business records

❌ Using local server time

❌ Mixing business logic inside SQL

❌ Creating duplicate user information

---

# 💼 Interview Notes

### Why GUID instead of INT?

Because GUIDs are globally unique and more suitable for distributed systems and SaaS applications.

---

### Why Soft Delete?

To preserve historical data and allow record recovery.

---

### Why UTC?

To maintain consistent timestamps across multiple time zones.

---

### Why Code First?

It keeps database schema synchronized with source code through migrations.

---

# 📚 Best Practices

✅ Keep entity names singular in C# and plural in database tables.

✅ Use navigation properties wisely.

✅ Never expose database entities directly through APIs.

✅ Always validate data before saving.

✅ Keep migrations small and meaningful.

---

# 📖 Summary

The FlowForge database is designed using modern software engineering principles.

It emphasizes:

- Scalability
- Maintainability
- Security
- Consistency
- Professional development practices

This document serves as the foundation for every entity, migration, and database-related decision in the project.

---

# ➡️ Next Document

**06-API-Design.md**