# 🗄️ FlowForge Database Design

The database is responsible for persisting the business model defined by the Domain layer while maintaining data integrity, performance and scalability.

Although the Domain Model describes how the business behaves, the database defines how that business information is stored and related.

FlowForge uses **Microsoft SQL Server** together with **Entity Framework Core** to provide a reliable, maintainable and enterprise-ready persistence layer.

---

# 📑 Table of Contents

- Introduction
- Database Philosophy
- Persistence Architecture
- SQL Server Overview
- Multi-Tenancy
- Database Hierarchy
- Entity Relationships
- Database Tables

---

# 📖 Introduction

A well-designed database does more than store information.

It must also:

- Preserve business relationships
- Protect data integrity
- Support application performance
- Enable future expansion
- Remain easy to evolve through version-controlled migrations

FlowForge's database has been designed alongside the Domain Model to ensure that business concepts are persisted without leaking persistence concerns into the Domain layer.

Business behavior belongs in the Domain.

Persistence belongs in the Infrastructure layer.

---

# 🎯 Database Philosophy

The FlowForge database follows several guiding principles.

---

## Persistence, Not Business Logic

The database stores business data but does not define business behavior.

Business rules remain inside:

- Domain Entities
- Business Rule Classes
- Application Workflows

The database focuses on:

- Relationships
- Constraints
- Consistency
- Performance
- Persistence

---

## Normalized Design

The schema is normalized to reduce redundancy while remaining practical for application development.

Benefits include:

- Reduced duplication
- Easier maintenance
- Improved consistency
- Better storage efficiency

---

## Evolvable Schema

The schema is expected to evolve as new business capabilities are introduced.

Rather than manually modifying production databases, all structural changes are introduced through Entity Framework Core migrations.

---

## Framework Separation

Persistence concerns remain isolated from business logic.

```text
Domain
      │
      ▼
Application
      │
      ▼
Infrastructure
      │
      ▼
SQL Server
```

The Domain layer remains completely unaware of how its entities are stored.

---

# 🏗️ Persistence Architecture

FlowForge follows a layered persistence model.

```text
Domain Entity
        │
        ▼
Entity Framework Core
        │
        ▼
Entity Configuration
        │
        ▼
Migration
        │
        ▼
SQL Server Table
```

Each layer has a distinct responsibility.

---

## Domain Entity

Represents business concepts.

Example:

- Organization
- Project
- Board
- Column
- WorkItem

---

## Entity Framework Core

Responsible for:

- Change Tracking
- Relationship Management
- Query Translation
- Persistence
- Migrations

---

## Entity Configuration

Configuration classes define how domain entities map to database tables.

Examples include:

```text
OrganizationConfiguration

ProjectConfiguration

BoardConfiguration

ColumnConfiguration

WorkItemConfiguration
```

This keeps persistence concerns outside the Domain layer.

---

## SQL Server

SQL Server stores the final persisted data while enforcing relational integrity through keys and constraints.

---

# 💾 SQL Server Overview

FlowForge currently uses:

```text
Database Engine

Microsoft SQL Server
```

Object Relational Mapper:

```text
Entity Framework Core
```

Migration Strategy:

```text
Code First
```

Reasons for choosing SQL Server include:

- Mature relational database
- Excellent tooling
- Strong transactional support
- Reliable indexing
- Enterprise scalability
- Native EF Core integration

This combination provides a robust persistence platform suitable for long-term growth.

---

# 🏢 Multi-Tenancy

FlowForge is a multi-tenant application.

Each Organization owns its own business data.

```text
Organization
│
├── Users
├── Projects
├── Boards
├── Columns
└── WorkItems
```

Organization boundaries define:

- Ownership
- Permissions
- Security
- Data isolation

Every business query is scoped to the active Organization.

This ensures users cannot access information belonging to another tenant.

Multi-tenancy is enforced through both application logic and database relationships.

---

# 🌐 Database Hierarchy

The database hierarchy mirrors the Domain Model.

```text
Organizations
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

Each child table references its parent through a foreign key.

This hierarchy preserves ownership while maintaining referential integrity.

---

# 🔗 Entity Relationships

Every major business entity participates in a well-defined relationship hierarchy.

```text
Organizations
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
| Organizations | Users |
| Organizations | Projects |
| Projects | Boards |
| Boards | Columns |
| Columns | WorkItems |

Each relationship represents business ownership rather than merely connecting tables.

---

# 📋 Database Tables

The current implementation consists of several core business tables.

---

## Organizations

Represents tenant boundaries.

Responsibilities:

- Own Projects
- Own Users
- Provide data isolation
- Define security boundaries

---

## Users

Stores authenticated users managed through ASP.NET Identity.

Responsibilities include:

- Authentication
- Authorization
- Organization membership
- User profile information

---

## Projects

Represents logical business workspaces.

Typical information includes:

- Name
- Description
- Organization
- Audit fields
- Archive status

Projects own multiple Boards.

---

## Boards

Represents project workflows.

Typical information includes:

- Name
- Description
- Project reference
- Display order
- Archive status

Boards own multiple Columns.

---

## Columns

Represents workflow stages.

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

Stored information includes:

- Board reference
- DisplayOrder
- Archive status

Columns organize WorkItems within a workflow.

---

## WorkItems

Represents individual units of work.

Typical stored information includes:

- Title
- Description
- Column reference
- DisplayOrder
- Priority
- Status
- Archive status

Future versions may include:

- Due dates
- Labels
- Assignments
- Attachments
- Comments
- Activity history

WorkItems represent the smallest persistent business object within the current domain model.

---

# 🔑 Primary & Foreign Keys

FlowForge uses explicit primary and foreign keys to establish clear ownership and maintain referential integrity across the database.

Relationships are intentionally designed to mirror the Domain Model rather than simply connecting tables.

---

## Primary Keys

Every business entity uses a GUID as its primary key.

```sql
Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
```

Reasons for using GUIDs include:

- Globally unique identifiers
- Safe identifier generation outside the database
- Reduced collision risk
- Better support for distributed systems
- Easier synchronization across environments
- Consistent API identifiers

Although GUIDs consume more storage than integer keys, they provide flexibility that aligns with FlowForge's long-term architecture.

---

## Foreign Keys

Ownership relationships are represented using explicit foreign keys.

Examples include:

```text
OrganizationId

ProjectId

BoardId

ColumnId
```

Every foreign key reflects a business ownership relationship.

For example:

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

These relationships ensure that orphaned business records cannot exist.

---

# 📝 Audit Fields

Every business entity includes audit information.

Typical fields include:

```text
CreatedAt

CreatedBy

UpdatedAt

UpdatedBy
```

These fields support:

- Auditing
- Troubleshooting
- Reporting
- Operational history

Future versions may also introduce:

```text
ArchivedAt

ArchivedBy
```

to provide richer historical tracking.

---

# 📦 Archiving Strategy

FlowForge uses **archiving** instead of physical deletion for business entities.

Each archivable entity contains:

```text
IsArchived
```

Archived records:

- Remain in the database
- Preserve historical information
- Are excluded from active workflows
- Can be restored when required

This approach minimizes accidental data loss while supporting reporting and historical analysis.

---

## Why Not Delete?

Deleting business data can result in:

- Broken relationships
- Lost history
- Incomplete reports
- Difficult auditing

Archiving preserves both integrity and traceability.

---

# ↕️ Ordering Strategy (DisplayOrder)

Workflow-based modules require predictable ordering.

FlowForge uses a dedicated field:

```text
DisplayOrder
```

instead of relying on creation time.

Examples include:

- Boards
- Columns
- WorkItems

This enables:

- Drag-and-drop interfaces
- Manual reordering
- Stable presentation
- Flexible workflow management

Each parent maintains its own independent ordering.

Example:

```text
Board
│
├── Column A (100)
├── Column B (200)
└── Column C (300)
```

Sparse ordering reduces the number of updates required during reordering operations.

Instead of renumbering every record, intermediate values can be assigned efficiently.

---

# ⚙️ Entity Framework Core Mapping

Entity Framework Core maps Domain entities to SQL Server tables.

Responsibilities include:

- Table mapping
- Relationship configuration
- Change tracking
- Query generation
- Constraint creation
- Migration generation

The Domain layer remains unaware of these persistence concerns.

---

# 🧩 Entity Configuration Classes

Persistence configuration is isolated using `IEntityTypeConfiguration<T>`.

Example structure:

```text
Persistence
│
└── Configurations
      │
      ├── OrganizationConfiguration
      ├── ProjectConfiguration
      ├── BoardConfiguration
      ├── ColumnConfiguration
      └── WorkItemConfiguration
```

Each configuration class defines:

- Table name
- Primary key
- Foreign keys
- Required properties
- Relationships
- Indexes
- Constraints

Keeping configuration separate preserves the purity of the Domain layer.

---

# 🚀 Database Migrations

Schema changes are managed using Entity Framework Core migrations.

Typical workflow:

```text
Modify Domain Model
        │
        ▼
Update Entity Configuration
        │
        ▼
Create Migration
        │
        ▼
Review Migration
        │
        ▼
Apply Migration
        │
        ▼
Update Database
```

Benefits include:

- Version-controlled schema
- Repeatable deployments
- Consistent environments
- Reliable upgrades

Manual database modifications should be avoided except for controlled production maintenance.

---

# 📈 Indexing Strategy

Indexes improve query performance by reducing lookup costs.

FlowForge indexes:

- Primary Keys
- Foreign Keys
- Frequently filtered columns
- Frequently searched columns

Typical indexed fields include:

```text
OrganizationId

ProjectId

BoardId

ColumnId

Email

NormalizedUserName
```

Additional indexes should be introduced only after analyzing production workloads.

---

# ⚡ Performance Considerations

Several design decisions contribute to database performance.

### Normalized Schema

Reduces duplicate data while maintaining consistency.

---

### Efficient Relationships

Foreign keys support optimized joins and maintain referential integrity.

---

### Sparse Ordering

`DisplayOrder` minimizes updates during drag-and-drop operations.

---

### Targeted Indexing

Indexes are created only where they provide measurable value.

---

### Code-First Migrations

Controlled schema evolution prevents inconsistencies across environments.

---

# 🛡️ Data Integrity

Maintaining accurate and consistent data is a primary objective.

Integrity is enforced through multiple layers.

---

## Database Constraints

Examples include:

- Primary Keys
- Foreign Keys
- Required columns
- Unique indexes

---

## Application Validation

FluentValidation verifies incoming requests before persistence.

---

## Domain Rules

The Domain layer enforces business behavior such as:

- Unique project names within an Organization
- Archived entities cannot be modified
- Cross-organization access restrictions

Together, these layers provide comprehensive protection against invalid data.

---

# 🔮 Future Database Expansion

The schema has been designed for incremental growth.

Planned entities include:

- Labels
- Comments
- Attachments
- Notifications
- Activity Logs
- Time Entries
- Milestones
- Sprint Planning

Because relationships are well-defined, these additions can be introduced without restructuring existing tables.

---

# 💾 Backup & Recovery

Production deployments should include a comprehensive backup strategy.

Recommended practices include:

- Scheduled full backups
- Differential backups
- Transaction log backups
- Point-in-time recovery
- Disaster recovery procedures
- Regular restore validation

These practices help ensure business continuity and minimize data loss.

---

# 📖 Summary

The FlowForge database is designed to provide a reliable persistence layer that complements the Domain Model without embedding business behavior into the database itself.

By combining:

- SQL Server
- Entity Framework Core
- Code-First Migrations
- Explicit Relationships
- GUID Primary Keys
- Archiving
- Sparse `DisplayOrder`
- Targeted Indexing

FlowForge achieves a persistence architecture that is scalable, maintainable and ready for future expansion.

The database remains focused on storing and protecting business information, while the Domain layer continues to define how that information behaves.

---

<div align="center">

# 🗄️ FlowForge Database Design

### Building a Reliable Foundation for Enterprise Data

*"A well-designed database is not just a place to store information—it is the foundation that preserves business integrity, supports application performance and enables software to evolve with confidence."*

</div>