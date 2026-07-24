# 🗄️ Entity Framework Core Migrations

Entity Framework Core Migrations provide the mechanism for evolving the FlowForge database schema in a controlled, repeatable, and versioned manner.

Rather than manually creating or modifying database tables, FlowForge uses **Entity Framework Core Code First Migrations** to keep the application's domain model and SQL Server database synchronized throughout the software lifecycle.

Built upon **Entity Framework Core**, **SQL Server**, and **Clean Architecture**, migrations enable teams to safely evolve the database while preserving data integrity and ensuring consistent environments across development, testing, and production.

---

# 📑 Table of Contents

- Introduction
- Migration Philosophy
- Why Migrations?
- Code First Architecture
- Current Database Provider
- DbContext
- Migration Lifecycle
- Creating Migrations
- Applying Migrations
- Updating Existing Models
- Reviewing Generated Migrations

---

# 📖 Introduction

Modern applications continuously evolve.

New features introduce new entities.

Existing business requirements require additional columns.

Relationships change over time.

Indexes are optimized.

Constraints are added.

Without a structured migration system, keeping every developer's database synchronized quickly becomes impossible.

Entity Framework Core solves this challenge through **Migrations**.

Each migration represents a version-controlled snapshot of the database schema.

Instead of manually writing SQL scripts for every change, developers describe changes through C# entities and configurations, while EF Core generates the required database operations.

---

# 🎯 Migration Philosophy

FlowForge follows the **Code First** approach.

The application's domain model is considered the single source of truth.

```text
Domain Model
      │
      ▼
Entity Configurations
      │
      ▼
ApplicationDbContext
      │
      ▼
EF Core Migration
      │
      ▼
SQL Server Database
```

The database is therefore an implementation of the domain model rather than an independently managed artifact.

This philosophy ensures that business requirements drive the database structure, not the other way around.

---

# ❓ Why Migrations?

Database schemas are never static.

As FlowForge grows, entities evolve.

Examples include:

- New modules
- Additional properties
- Relationship changes
- Performance optimizations
- New indexes
- Constraints
- Business rule enforcement

Migrations provide a safe mechanism for applying these changes.

---

## Benefits

Using migrations provides several advantages.

✔ Version-controlled database evolution

✔ Repeatable deployments

✔ Consistent development environments

✔ Automatic schema generation

✔ Safe incremental updates

✔ Team collaboration

✔ Source control integration

✔ Reliable production deployments

---

# 🏗️ Code First Architecture

FlowForge uses **Entity Framework Core Code First**.

Rather than designing the database first, developers design domain entities.

Example flow:

```text
Create Entity
      │
      ▼
Configure Entity
      │
      ▼
Create Migration
      │
      ▼
Apply Migration
      │
      ▼
Database Updated
```

This approach keeps the domain model at the center of the application architecture.

---

# 🗄️ Current Database Provider

FlowForge currently uses:

```text
SQL Server
```

SQL Server provides:

- ACID transactions
- Referential integrity
- Indexing
- Stored procedures (if required)
- High performance
- Enterprise scalability

Entity Framework Core translates domain changes into SQL Server-specific schema operations.

---

# 🧩 ApplicationDbContext

The central component responsible for database access is:

```text
ApplicationDbContext
```

Responsibilities include:

- Entity registration
- Relationship mapping
- Configuration loading
- Change tracking
- Transaction management
- Migration generation

The DbContext acts as the bridge between the domain model and the relational database.

---

# 🔄 Migration Lifecycle

Every migration follows a predictable lifecycle.

```text
Modify Entity
      │
      ▼
Update Configuration
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
Database Updated
```

Each stage ensures that database evolution remains controlled and predictable.

---

# ➕ Creating a Migration

Whenever entities or configurations change, a new migration should be created.

Example:

```bash
dotnet ef migrations add InitialCreate
```

Feature-specific examples:

```bash
dotnet ef migrations add AddProjects

dotnet ef migrations add AddBoards

dotnet ef migrations add AddColumns

dotnet ef migrations add AddWorkItems

dotnet ef migrations add UpdateProjectConfiguration
```

Migration names should clearly describe the purpose of the schema change.

---

## Naming Guidelines

Good migration names include:

```text
AddProjects

AddBoards

AddColumns

AddWorkItems

AddPriorityField

AddLabels

UpdateBoardConfiguration

RenameWorkItemStatus
```

Avoid generic names such as:

```text
Migration1

Update

Changes

Test

NewMigration
```

Descriptive names make migration history easier to understand.

---

# ⬆️ Applying Migrations

After creating a migration, it must be applied to the database.

```bash
dotnet ef database update
```

EF Core determines which migrations have not yet been applied and executes them in sequence.

```text
Migration History

↓

Pending Migration

↓

SQL Generated

↓

Database Updated
```

This ensures every environment progresses through the same schema history.

---

# ✏️ Updating Existing Models

Schema evolution usually begins with changes to the domain model.

Typical workflow:

```text
Modify Entity

↓

Update Entity Configuration

↓

Create Migration

↓

Review Migration

↓

Apply Migration

↓

Verify Database
```

Reviewing generated migrations before applying them helps identify unintended schema changes such as dropped columns or renamed relationships.

---

# ❌ Removing a Migration

During development, it is common to create migrations that are no longer required.

If a migration has **not yet been applied to the database**, Entity Framework Core allows it to be safely removed.

```bash
dotnet ef migrations remove
```

Removing a migration deletes the most recently generated migration files while leaving the database unchanged.

This command should only be used before the migration has been applied.

If the migration has already been executed against a shared database, a new migration should be created to reverse the changes rather than deleting migration history.

---

## When Should a Migration Be Removed?

Typical scenarios include:

- Incorrect migration name
- Accidental migration generation
- Model changes immediately after creating a migration
- Development experimentation

Example workflow:

```text
Create Migration
      │
      ▼
Review Migration
      │
      ▼
Found Problem
      │
      ▼
Remove Migration
      │
      ▼
Fix Model
      │
      ▼
Create New Migration
```

This keeps migration history clean and meaningful.

---

# 📂 Migration Files

Each migration consists of automatically generated C# files.

A typical migration includes:

```text
MigrationName.cs

MigrationName.Designer.cs

ApplicationDbContextModelSnapshot.cs
```

---

## Migration Class

The primary migration class contains two methods.

```csharp
Up()

Down()
```

### Up()

The `Up()` method describes the operations required to move the database schema forward.

Typical operations include:

- Create tables
- Add columns
- Rename columns
- Create indexes
- Add foreign keys
- Create constraints

---

### Down()

The `Down()` method defines how to reverse the migration.

Typical operations include:

- Drop tables
- Remove columns
- Drop indexes
- Remove foreign keys
- Restore previous schema

Having both methods enables controlled schema evolution and rollback during development.

---

# 🔄 Database Synchronization

One of the primary purposes of migrations is keeping every development environment synchronized.

A new developer joining the project should not manually create database tables.

Instead, the project itself defines the required schema.

Typical setup:

```bash
git pull

dotnet restore

dotnet ef database update
```

EF Core automatically applies every pending migration.

This guarantees that all developers work against the same database structure.

---

## Synchronization Workflow

```text
Pull Latest Code
        │
        ▼
Migration Files
        │
        ▼
EF Core
        │
        ▼
Database Updated
```

This process eliminates inconsistencies caused by manually maintained databases.

---

# 🚀 Deployment Considerations

Database schema changes are part of every application deployment.

A typical deployment workflow is:

```text
Build Application
        │
        ▼
Deploy Application
        │
        ▼
Apply Pending Migrations
        │
        ▼
Application Ready
```

For production environments, migrations should be reviewed and tested before execution.

Large schema changes should be planned carefully to minimize downtime and reduce deployment risk.

---

# 👥 Team Development Workflow

In collaborative environments, multiple developers may create migrations simultaneously.

A recommended workflow is:

```text
Pull Latest Changes
        │
        ▼
Update Local Database
        │
        ▼
Implement Feature
        │
        ▼
Modify Domain Model
        │
        ▼
Create Migration
        │
        ▼
Review Generated Code
        │
        ▼
Commit Migration
        │
        ▼
Push Changes
```

Following this workflow helps avoid migration conflicts and keeps schema history consistent across the team.

---

# ⚠️ Common Migration Pitfalls

Although EF Core automates database evolution, developers should review every generated migration before applying it.

Common issues include:

### Renamed Properties

Renaming an entity property may generate:

```text
Drop Column

Create New Column
```

instead of a column rename.

This can result in unintended data loss.

---

### Accidental Table Recreation

Large model changes may cause EF Core to recreate tables instead of modifying them incrementally.

Always inspect generated migrations before execution.

---

### Missing Entity Configuration

If an entity configuration is accidentally removed, EF Core may attempt to delete related tables.

Reviewing migration code prevents unexpected schema changes.

---

### Multiple Developers

Two developers creating migrations independently can produce conflicting migration histories.

Always:

- Pull latest changes
- Update the local database
- Resolve conflicts
- Generate migrations from the latest schema

---

# ⭐ Best Practices

Follow these recommendations when working with EF Core Migrations.

✔ Create a migration for every schema change.

✔ Keep migrations small and focused.

✔ Use descriptive migration names.

✔ Review generated migration code before execution.

✔ Commit migration files to source control.

✔ Never edit applied migration history.

✔ Test migrations on a development database before production.

✔ Keep every environment synchronized using migrations.

✔ Avoid manually modifying production schema outside the migration system.

✔ Treat migration history as part of the application's source code.

Following these practices ensures reliable database evolution throughout the project's lifecycle.

---

# 📚 Common EF Core Commands

The following commands are used frequently during development.

---

## Create Migration

```bash
dotnet ef migrations add MigrationName
```

Creates a new migration based on model changes.

---

## Apply Migrations

```bash
dotnet ef database update
```

Updates the database to the latest migration.

---

## Remove Last Migration

```bash
dotnet ef migrations remove
```

Removes the most recent migration if it has not been applied.

---

## List All Migrations

```bash
dotnet ef migrations list
```

Displays every migration in chronological order.

---

## Generate SQL Script

```bash
dotnet ef migrations script
```

Generates a SQL script representing migration operations.

This is especially useful for deployment reviews and production environments where database changes must be inspected before execution.

---

## Drop Database (Development Only)

```bash
dotnet ef database drop
```

Removes the current database.

This command should only be used in development or testing environments.

---

# 📖 Summary

Entity Framework Core Migrations provide the foundation for controlled and repeatable database evolution within FlowForge.

By treating the domain model as the source of truth and using Code First Migrations to generate SQL Server schema changes, the application maintains consistency across development, testing, and production environments.

The migration system enables developers to:

- Track schema history
- Synchronize databases
- Deploy changes safely
- Collaborate effectively
- Preserve data integrity
- Support long-term application growth

Working alongside **Entity Framework Core**, **ApplicationDbContext**, and **SQL Server**, migrations ensure that database evolution remains predictable, maintainable, and fully integrated into FlowForge's Clean Architecture.

---

<div align="center">

# 🗄️ Entity Framework Core Migrations

### Managing Database Evolution Through Version-Controlled, Repeatable, and Reliable Schema Changes

*"A database is not a static artifact—it evolves alongside the domain. Entity Framework Core Migrations transform changes in the application's business model into safe, traceable, and repeatable database updates, enabling FlowForge to grow with confidence while preserving consistency across every environment."*

</div>