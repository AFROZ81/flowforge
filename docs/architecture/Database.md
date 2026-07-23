# Database Design

This document describes the database architecture of FlowForge, the conventions used throughout the schema, and the design decisions that support scalability, maintainability, and multi-tenant operation.

The goal of the database is not simply to store data, but to provide a consistent, performant, and extensible foundation for the application.

---

# Table of Contents

- Overview
- Design Goals
- Database Engine
- Multi-Tenancy
- Entity Relationships
- Schema Conventions
- Primary Keys
- Foreign Keys
- Audit Fields
- Archiving Strategy
- Indexing Strategy
- Migrations
- Future Scalability
- Summary

---

# Overview

FlowForge uses **Microsoft SQL Server** as its primary relational database.

Entity Framework Core is responsible for mapping domain entities to the database schema and managing database migrations.

The schema is intentionally normalized to reduce redundancy while remaining practical for application development.

---

# Design Goals

The database is designed with the following goals:

- Data integrity
- Predictable performance
- Multi-tenant isolation
- Easy evolution through migrations
- Clear naming conventions
- Minimal redundancy
- Scalability

---

# Database Engine

Current database:

- Microsoft SQL Server

ORM:

- Entity Framework Core

Migration strategy:

- Code First

---

# Multi-Tenancy

FlowForge is a **multi-tenant** application.

Each organization owns its own business data.

```text
Organization
│
├── Users
├── Projects
├── Boards
├── Columns
└── Tasks
```

Every query is scoped to the current organization.

This prevents users from accessing data belonging to other organizations.

Organization isolation is enforced both in the application layer and at the database query level.

---

# Entity Relationships

Current hierarchy:

```text
Organization
│
└── Project
      │
      └── Board
            │
            └── Column
                  │
                  └── Task
```

Each child entity references its parent using a foreign key.

This creates a clear ownership hierarchy.

---

# Schema Conventions

## Table Names

Tables use the plural form.

Examples:

```text
Organizations

Projects

Boards

Columns

Tasks
```

---

## Primary Keys

Every table uses:

```text
Id UNIQUEIDENTIFIER
```

Example:

```sql
Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY
```

GUIDs are used to support:

- Distributed systems
- API-generated identifiers
- Future synchronization scenarios
- Reduced key collision risk

---

## Foreign Keys

Relationships are represented using explicit foreign keys.

Examples:

```text
OrganizationId

ProjectId

BoardId

ColumnId
```

Foreign keys are required unless the relationship is optional by design.

---

# Audit Fields

Every business entity should contain standard audit information.

Example:

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
- Activity history

Future versions may also include:

```text
DeletedAt

DeletedBy
```

if hard deletion policies evolve.

---

# Archiving Strategy

FlowForge currently uses **archiving** instead of soft deletion.

Each archivable entity contains:

```text
IsArchived
```

Archived records:

- Remain in the database
- Preserve historical data
- Cannot be modified through normal workflows
- May be restored

This approach avoids accidental data loss while keeping historical information available.

---

# Cascade Behavior

Cascade delete is avoided for business entities.

Example:

Deleting a project should not automatically delete all boards and tasks.

Instead:

- Projects are archived.
- Boards are archived.
- Tasks remain historically available.

This protects business data from accidental loss.

---

# Indexing Strategy

Indexes are created for:

- Primary Keys
- Foreign Keys
- Frequently searched columns

Examples include:

- OrganizationId
- ProjectId
- BoardId
- Email
- NormalizedUserName

Additional indexes may be introduced based on query performance and production usage.

---

# Constraints

The database uses constraints to maintain data integrity.

Examples:

- Required foreign keys
- Unique project names within an organization
- Unique board names within a project

Where appropriate, these constraints are reinforced by business rules in the application layer.

---

# Naming Conventions

The database follows consistent naming conventions.

## Tables

Plural nouns.

Example:

```text
Projects

Boards

Tasks
```

---

## Columns

PascalCase.

Example:

```text
ProjectId

CreatedAt

UpdatedBy

IsArchived
```

---

## Foreign Keys

Named after the referenced entity.

Example:

```text
ProjectId

BoardId

OrganizationId
```

---

## Constraints

Use descriptive names where explicitly configured.

Examples:

```text
FK_Boards_Projects

FK_Projects_Organizations

IX_Projects_OrganizationId

PK_Projects
```

---

# Entity Framework Configuration

Entity Framework Core is responsible for:

- Table mapping
- Relationships
- Keys
- Constraints
- Indexes

Entity configuration is kept separate from domain entities using `IEntityTypeConfiguration<T>`.

Example:

```text
ProjectConfiguration

BoardConfiguration

OrganizationConfiguration
```

This keeps persistence concerns out of the domain layer.

---

# Database Migrations

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
```

All schema changes should be version-controlled and applied through migrations.

Manual database changes should be avoided except for emergency maintenance.

---

# Future Scalability

As FlowForge evolves, the database may expand with additional entities such as:

- Labels
- Comments
- Attachments
- Notifications
- Activity Logs
- Time Entries
- Sprints

The existing hierarchy is designed to accommodate these additions without requiring major schema redesign.

---

# Backup and Recovery

Although not currently implemented, production deployments should include:

- Automated backups
- Point-in-time recovery
- Disaster recovery procedures
- Migration rollback strategy

These considerations are essential for production environments.

---

# Summary

The FlowForge database is designed to prioritize consistency, scalability, and maintainability.

By following clear naming conventions, enforcing relationships, supporting multi-tenancy, and using Entity Framework Core migrations, the database provides a reliable foundation for the application while remaining flexible enough to evolve as new business capabilities are introduced.