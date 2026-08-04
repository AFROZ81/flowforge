# 🛠 Development

## Overview

This document provides the basic information required to set up and contribute to the FlowForge project.

---

# Prerequisites

Before running the project, ensure the following tools are installed:

- .NET SDK
- SQL Server
- Visual Studio 2022 (or later)
- Git
- Node.js *(required for the frontend)*

---

# Repository Structure

```
FlowForge
│
├── backend
│   ├── src
│   ├── tests
│   └── FlowForge.sln
│
├── frontend
│
└── docs
```

---

# Backend Setup

1. Clone the repository.
2. Open `FlowForge.sln`.
3. Configure the SQL Server connection string.
4. Apply the latest database migrations.
5. Run the API project.

Swagger will be available after the application starts.

---

# Frontend Setup

The frontend is built with React and is maintained as a separate application.

After installation:

1. Install dependencies.
2. Configure the API base URL.
3. Start the development server.

---

# Database

Database schema changes are managed using Entity Framework Core migrations.

When modifying entities:

1. Update the domain model.
2. Create a new migration.
3. Apply the migration.
4. Verify the database schema.

---

# Coding Guidelines

To keep the project consistent:

- Follow Clean Architecture principles.
- Organize code by feature.
- Keep controllers lightweight.
- Place business logic inside handlers.
- Validate requests using FluentValidation.
- Use dependency injection for services.
- Keep domain models independent of infrastructure.

---

# Branching

When working on new features:

- Create a feature branch.
- Commit changes with meaningful messages.
- Open a pull request after testing.

Keep commits focused and avoid mixing unrelated changes.

---

# Testing

Before submitting changes:

- Ensure the solution builds successfully.
- Run available tests.
- Verify database migrations.
- Test affected API endpoints.
- Verify realtime features when applicable.

---

# Documentation

Whenever a significant architectural or functional change is introduced, update the relevant documentation inside the `docs` directory.

Keeping the documentation current helps future contributors understand the project more easily.

---

# Summary

FlowForge is designed to be modular and easy to contribute to. Following the project's architectural patterns and development workflow helps maintain a consistent and scalable codebase.