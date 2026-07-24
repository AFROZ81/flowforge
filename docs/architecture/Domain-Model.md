# 🏛️ FlowForge Domain Model

The Domain Model represents the core business concepts of FlowForge.

Unlike the database model, which focuses on how information is stored, the Domain Model focuses on **how the business behaves**.

It defines the entities, relationships, responsibilities and business rules that make up the application while remaining completely independent of infrastructure, databases and frameworks.

The Domain layer is the foundation of the entire application and serves as the single source of truth for business logic.

---

# 📑 Table of Contents

- Introduction
- What is the Domain Model?
- Domain Philosophy
- Core Design Principles
- Domain Hierarchy
- Aggregate Roots
- Core Entities
- Entity Relationships

---

# 📖 Introduction

Enterprise applications become increasingly difficult to maintain when business logic is scattered across controllers, services and data access code.

FlowForge avoids this problem by placing business behavior inside a dedicated Domain layer.

This approach provides several benefits:

- Clear business boundaries
- Consistent behavior
- Better maintainability
- Improved testability
- Framework independence
- Long-term scalability

The Domain Model describes **what the business is**, not **how it is implemented**.

---

# 💡 What is the Domain Model?

The Domain Model represents the business language of FlowForge.

Examples include:

- Organization
- User
- Project
- Board
- Column
- WorkItem

These concepts are business entities—not database tables.

Every entity contains:

- State
- Identity
- Business behavior
- Lifecycle
- Validation rules

The Domain Model answers questions such as:

- What is a Project?
- Who owns a Board?
- How does a Work Item move through a workflow?
- When can something be archived?
- Which operations are allowed?

It intentionally avoids discussing persistence, APIs or infrastructure.

---

# 🎯 Domain Philosophy

FlowForge follows a business-first philosophy.

Rather than allowing external layers to manipulate entities directly, every business operation is expressed through meaningful domain behavior.

Examples include:

```csharp
project.Update(...);

project.Archive();

project.Restore();

board.Update(...);

column.Move(...);

workItem.Move(...);

workItem.Archive();
```

Consumers describe **intent**, while entities decide whether that intent is valid.

This keeps business knowledge centralized within the Domain layer.

---

# 🧱 Core Design Principles

The FlowForge Domain Model is built upon several guiding principles.

---

## Rich Domain Model

Entities own their behavior.

Instead of acting as simple data containers, entities expose business operations that protect their own consistency.

For example:

```csharp
project.Archive();

project.Restore();

board.Update();

workItem.Move();
```

This approach keeps business logic close to the data it governs.

---

## Encapsulation

Entity state should never be modified directly.

Incorrect:

```csharp
project.Name = "Website";

project.IsArchived = true;
```

Correct:

```csharp
project.Update(...);

project.Archive();
```

Encapsulation prevents invalid state transitions and ensures that every change passes through business validation.

---

## Explicit Business Rules

Complex business policies are implemented through dedicated rule classes.

Examples include:

```text
ProjectRules

BoardRules

ColumnRules

WorkItemRules
```

Separating reusable business policies from application orchestration keeps handlers focused and improves consistency across the application.

---

## Framework Independence

The Domain layer contains no references to:

- ASP.NET Core
- Entity Framework Core
- SQL Server
- MediatR
- ASP.NET Identity

Business logic should remain independent of implementation technologies.

---

# 🌐 Domain Hierarchy

The FlowForge business model follows a hierarchical structure.

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
WorkItem
```

Each level owns the level beneath it.

Ownership determines:

- Security boundaries
- Lifecycle
- Business responsibilities
- Aggregate consistency

This hierarchy mirrors how users naturally organize work inside the application.

---

# 🏛️ Aggregate Roots

FlowForge groups related entities into aggregates.

An aggregate is a consistency boundary that protects related business data.

```text
Organization
      │
      ▼
Projects
      │
      ▼
Boards
      │
      ▼
Columns
      │
      ▼
WorkItems
```

Aggregate roots control access to the entities they own.

External components should interact with the aggregate root rather than manipulating child entities directly.

Benefits include:

- Better consistency
- Simpler validation
- Predictable business behavior
- Clear ownership boundaries

---

# ❤️ Core Entities

The current implementation consists of six primary business entities.

---

## Organization

The Organization represents the highest-level business boundary.

It serves as the application's tenant and security boundary.

### Responsibilities

- Own users
- Own projects
- Isolate business data
- Define ownership boundaries
- Prevent cross-organization access

Every business object ultimately belongs to an Organization.

---

## User

A User represents an authenticated person interacting with the system.

Users perform business operations within the scope of an Organization.

Typical responsibilities include:

- Authentication
- Authorization
- Project participation
- Work management

Users never exist independently of organizational boundaries.

---

## Project

A Project represents a logical workspace.

Projects organize work into manageable business initiatives.

### Responsibilities

- Own Boards
- Maintain project information
- Coordinate project lifecycle
- Support archival and restoration

Current domain behavior includes:

```csharp
Update()

Archive()

Restore()
```

Projects cannot exist without an Organization.

---

## Board

Boards represent workflows within a Project.

They divide work into meaningful stages.

### Responsibilities

- Organize Columns
- Define workflow
- Support business processes
- Maintain board lifecycle

Typical domain behavior:

```csharp
Update()

Archive()

Restore()
```

Boards always belong to a single Project.

---

## Column

Columns represent workflow stages.

Typical examples include:

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

### Responsibilities

- Organize Work Items
- Maintain ordering
- Support drag-and-drop workflows
- Represent workflow progression

Columns belong exclusively to one Board.

---

## WorkItem

The WorkItem represents the smallest unit of work within FlowForge.

It tracks individual tasks performed by users while remaining flexible enough to support future enhancements.

### Responsibilities

- Track work
- Maintain status
- Support prioritization
- Preserve ordering
- Move between Columns
- Participate in workflow

Future enhancements may include:

- Assignments
- Due Dates
- Labels
- Comments
- Attachments
- Activity History

Work Items cannot exist outside a Column.

---

# 🔗 Entity Relationships

The relationships between entities establish clear ownership boundaries.

```text
Organization
│
├── Users
│
└── Projects
      │
      └── Boards
             │
             └── Columns
                    │
                    └── WorkItems
```

Relationship summary:

| Parent | Child |
|---------|-------|
| Organization | Projects |
| Organization | Users |
| Project | Boards |
| Board | Columns |
| Column | WorkItems |

Each relationship represents business ownership rather than simple database foreign keys.

Ownership determines lifecycle, permissions and consistency throughout the domain.

---

# 🏗️ Aggregate Responsibilities

Each aggregate in FlowForge protects its own business consistency.

An aggregate is responsible not only for storing data, but also for enforcing the rules that govern that portion of the business.

---

## Organization Aggregate

The Organization aggregate is the highest business boundary.

Responsibilities include:

- Owning Projects
- Owning Users
- Providing tenant isolation
- Enforcing organization-level security
- Preventing cross-organization access

Everything inside FlowForge ultimately belongs to an Organization.

---

## Project Aggregate

Projects organize business initiatives.

Responsibilities include:

- Maintaining project information
- Owning Boards
- Managing project lifecycle
- Preventing invalid project operations
- Coordinating board ownership

Projects act as the aggregate root for everything contained within them.

---

## Board Aggregate

Boards define project workflows.

Responsibilities include:

- Managing workflow stages
- Owning Columns
- Maintaining board ordering
- Supporting board lifecycle

A Board cannot exist independently of a Project.

---

## Column Aggregate

Columns represent workflow stages.

Responsibilities include:

- Organizing Work Items
- Maintaining display order
- Supporting drag-and-drop movement
- Preserving workflow integrity

Columns ensure Work Items remain organized throughout the workflow.

---

## WorkItem Aggregate

Work Items represent individual units of work.

Responsibilities include:

- Tracking progress
- Maintaining status
- Managing workflow movement
- Supporting archival
- Preserving ordering

Each Work Item belongs to exactly one Column at any given time.

---

# ❤️ Rich Domain Model

FlowForge follows the **Rich Domain Model** pattern.

Business entities are responsible for protecting themselves rather than exposing unrestricted mutable properties.

Instead of allowing external code to manipulate internal state directly, entities expose meaningful business operations.

Example:

```csharp
project.Update(...);

project.Archive();

project.Restore();

board.Update(...);

column.Move(...);

workItem.Move(...);

workItem.Archive();
```

This ensures that every state transition passes through business validation.

The Domain remains the authoritative source of business behavior.

---

# ⚙️ Business Behavior

Business behavior describes what an entity is capable of doing.

Examples include:

## Project

```text
Update()

Archive()

Restore()
```

---

## Board

```text
Update()

Archive()

Restore()
```

---

## Column

```text
Rename()

Move()

Archive()

Restore()
```

---

## WorkItem

```text
Update()

Move()

Archive()

Restore()
```

These methods express business intent rather than low-level data manipulation.

---

# 🛡️ Domain Invariants

A **Domain Invariant** is a rule that must always remain true.

If an invariant is violated, the Domain enters an invalid state.

Examples include:

- A Project must belong to an Organization.
- A Board must belong to a Project.
- A Column must belong to a Board.
- A Work Item must belong to a Column.
- Archived entities cannot be modified.
- Cross-organization access is prohibited.
- Display order must remain consistent within a workflow.

These invariants are enforced regardless of how requests enter the application.

Whether a request originates from the API, automated tests or future integrations, the Domain remains responsible for protecting its own consistency.

---

# 📏 Business Rules

Business rules define policies that govern entity behavior.

Unlike simple validation rules, business rules often depend on existing business state.

FlowForge encapsulates these policies in dedicated rule classes.

---

## Project Rules

Examples include:

- Project names must be unique within an Organization.
- Archived Projects cannot be updated.
- Archived Projects cannot receive new Boards.
- Users cannot access Projects owned by another Organization.

---

## Board Rules

Examples include:

- Board names must be unique within a Project.
- Boards cannot belong to archived Projects.
- Archived Boards cannot be modified.
- Users cannot access Boards from another Organization.

---

## Column Rules

Examples include:

- Display order must remain unique.
- Columns cannot exist without a Board.
- Archived Columns cannot receive new Work Items.
- Default workflow stages may have additional restrictions.

---

## WorkItem Rules

Examples include:

- Work Items must belong to a Column.
- Archived Work Items become read-only.
- Movement must preserve workflow ordering.
- Future due dates must remain valid.
- Business ownership boundaries must always be respected.

Rule classes centralize business policies so they can be reused consistently across multiple application workflows.

---

# 🔄 Entity Lifecycle

Every entity follows a predictable lifecycle.

---

## Project Lifecycle

```text
Create
   │
   ▼
Active
   │
   ▼
Archived
   │
   ▼
Restored
```

Archived Projects remain available for reporting and historical reference but cannot participate in active workflows.

---

## Board Lifecycle

```text
Create
   │
   ▼
Active
   │
   ▼
Archived
   │
   ▼
Restored
```

Boards inherit ownership from their parent Project.

---

## Column Lifecycle

```text
Create
   │
   ▼
Active
   │
   ▼
Archived
   │
   ▼
Restored
```

Columns continue preserving workflow history even after archival.

---

## WorkItem Lifecycle

```text
Create
   │
   ▼
Backlog
   │
   ▼
To Do
   │
   ▼
In Progress
   │
   ▼
Review
   │
   ▼
Done
   │
   ▼
Archived
```

As the application evolves, additional workflow stages can be introduced without changing the overall Domain structure.

---

# ⚖️ Domain Services vs Entities

FlowForge keeps business behavior inside entities whenever possible.

General guideline:

- Behavior affecting a single entity belongs inside that entity.
- Behavior involving multiple entities belongs in dedicated rule classes or domain services.

Example:

Inside **Project**:

```csharp
Update();

Archive();

Restore();
```

Inside **ProjectRules**:

```text
EnsureUniqueName()

EnsureOrganizationOwnership()

EnsureNotArchived()
```

This separation keeps entities focused on their own behavior while allowing reusable business policies to remain centralized.

---

# 🚀 Future Domain Evolution

The current Domain Model is intentionally designed for long-term growth.

Future concepts may include:

- Labels
- Comments
- Attachments
- Notifications
- Activity Timeline
- Milestones
- Sprint Planning
- Time Tracking
- Recurring Work Items
- Automation Rules

Each new concept will be introduced as an independent entity or aggregate while preserving existing ownership boundaries.

Because the Domain remains framework-independent, these enhancements can be added without redesigning the application's architecture.

---

# 📖 Summary

The FlowForge Domain Model represents the business rather than the database.

By combining **Rich Domain Models**, **Aggregate Roots** and **Business Rules**, FlowForge ensures that business behavior remains centralized, consistent and protected from infrastructure concerns.

The Domain layer:

- Defines business concepts.
- Encapsulates behavior.
- Protects invariants.
- Enforces business rules.
- Establishes ownership boundaries.
- Supports long-term evolution.

As FlowForge grows, the Domain Model will remain the foundation upon which every new feature is built, ensuring that the application continues to evolve without compromising business consistency.

---

<div align="center">

# 🏛️ FlowForge Domain Model

### Modeling Business Behavior, Not Database Tables

*"A strong domain model reflects how the business thinks, speaks and behaves—not how data happens to be stored."*

</div>