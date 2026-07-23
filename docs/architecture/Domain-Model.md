# Domain Model

The Domain Model represents the core business concepts of FlowForge.

Unlike the database model, which focuses on data storage, the domain model focuses on business behavior, relationships, and rules.

The Domain layer is the heart of the application and is intentionally independent of frameworks, databases, and infrastructure concerns.

---

# Table of Contents

- What is the Domain Model?
- Design Principles
- Aggregate Overview
- Entity Relationships
- Aggregate Responsibilities
- Entity Lifecycle
- Business Rules
- Future Expansion
- Summary

---

# What is the Domain Model?

The domain model describes the business objects that exist within FlowForge and the rules that govern them.

Examples include:

- Organization
- Project
- Board
- Column
- Task

These entities represent business concepts rather than database tables.

Every entity encapsulates both state and behavior.

---

# Design Principles

The FlowForge domain model follows several principles.

## Rich Domain Model

Entities are responsible for protecting their own state.

Instead of exposing mutable properties, they expose meaningful business operations.

Example:

```csharp
project.Update(...);

project.Archive();

project.Restore();
```

---

## Encapsulation

Business behavior belongs inside the entity.

Consumers should not directly manipulate entity state.

Incorrect:

```csharp
project.Name = "New Name";
project.IsArchived = true;
```

Correct:

```csharp
project.Update(...);

project.Archive();
```

---

## Explicit Business Rules

Complex business policies are implemented through dedicated rule classes.

Examples:

- ProjectRules
- BoardRules

This keeps handlers small while ensuring business constraints remain reusable and consistent.

---

# Aggregate Overview

The FlowForge domain is organized around several aggregates.

```text
Organization
│
├── Projects
│      │
│      ├── Boards
│      │      │
│      │      ├── Columns
│      │      │      │
│      │      │      └── Tasks
│      │      │
│      │      └── Members
│      │
│      └── Activity
│
└── Users
```

Each aggregate represents a business boundary.

Changes should remain within a single aggregate whenever possible.

---

# Entity Relationships

## Organization

Represents a tenant within FlowForge.

Responsibilities:

- Own users
- Own projects
- Isolate data
- Define security boundary

Relationship:

```text
Organization

↓

Projects

↓

Boards

↓

Columns

↓

Tasks
```

---

## Project

Represents a logical workspace.

Responsibilities:

- Organize work
- Contain boards
- Maintain lifecycle

Current behavior:

- Update()
- Archive()
- Restore()

---

## Board

Represents a workflow inside a project.

Responsibilities:

- Organize columns
- Maintain workflow
- Contain work stages

Current behavior:

- Update()
- Archive()
- Restore()

---

## Column

*(Planned)*

Represents a workflow stage.

Examples:

```text
Backlog

↓

To Do

↓

In Progress

↓

Review

↓

Done
```

Responsibilities:

- Organize tasks
- Preserve ordering
- Support workflow progression

---

## Task

*(Planned)*

Represents an individual unit of work.

Responsibilities:

- Assignment
- Priority
- Due dates
- Status
- Comments
- Attachments

---

# Aggregate Responsibilities

Each aggregate protects its own consistency.

Example:

Project Aggregate

Responsible for:

- Project information
- Board ownership
- Lifecycle

Board Aggregate

Responsible for:

- Board information
- Columns
- Workflow

Column Aggregate

Responsible for:

- Ordering
- Task placement

Task Aggregate

Responsible for:

- Work tracking
- Completion state
- Collaboration

---

# Entity Lifecycle

## Project Lifecycle

```text
Create

↓

Active

↓

Archive

↓

Restore
```

Archived projects remain available for historical purposes but cannot be modified.

---

## Board Lifecycle

```text
Create

↓

Active

↓

Archive

↓

Restore
```

A board cannot exist without a project.

---

## Future Task Lifecycle

```text
Create

↓

To Do

↓

In Progress

↓

Review

↓

Done

↓

Archived
```

---

# Business Rules

Business rules protect the integrity of the domain.

Examples currently implemented:

## Projects

- Project names must be unique within an organization.
- Archived projects cannot be updated.
- Archived projects cannot receive new boards.
- Organizations cannot access each other's projects.

---

## Boards

- Board names must be unique within a project.
- Archived boards cannot be updated.
- Boards cannot belong to archived projects.
- Organizations cannot access another organization's boards.

---

## Planned Rules

Columns

- Column positions must remain unique.
- Default columns cannot be removed.
- Archived columns cannot accept new tasks.

Tasks

- Completed tasks cannot be modified without reopening.
- Archived tasks become read-only.
- Due dates cannot be before creation dates.

---

# Domain Services vs Entities

FlowForge prefers placing behavior inside entities whenever possible.

If behavior:

- depends only on one entity → entity method
- spans multiple entities → business rule/service

Example:

Inside Project

```csharp
Archive();

Restore();

Update();
```

Inside ProjectRules

```text
EnsureUniqueName()

EnsureNotArchived()

GetByIdAsync()
```

This keeps responsibilities well separated.

---

# Future Expansion

The domain model is designed to evolve without major restructuring.

Planned additions include:

- Labels
- Milestones
- Sprints
- Notifications
- Activity Timeline
- Time Tracking
- Attachments
- Comments

Each new concept will become its own aggregate or entity when appropriate.

---

# Domain Integrity

The domain layer must never depend on:

- ASP.NET Core
- Entity Framework Core
- SQL Server
- Identity
- MediatR
- Controllers

The domain should remain pure and framework-independent.

---

# Summary

The FlowForge domain model represents the business rather than the database.

Entities encapsulate behavior, business rules enforce consistency, and aggregates define clear ownership boundaries.

This approach keeps business logic centralized, expressive, and resilient as the application grows.