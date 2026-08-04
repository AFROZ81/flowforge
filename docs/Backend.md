# ⚙️ Backend

## Overview

The FlowForge backend is built with **ASP.NET Core** using a feature-first approach based on **Clean Architecture**, **CQRS**, and **Vertical Slice Architecture**.

Each project has a single responsibility, making the solution modular, scalable, and easy to maintain.

---

# Solution Structure

```
backend
│
├── src
│   ├── FlowForge.API
│   ├── FlowForge.Application
│   ├── FlowForge.Domain
│   └── FlowForge.Infrastructure
│
├── tests
│
└── FlowForge.sln
```

---

# Projects

## FlowForge.API

The entry point of the application.

Responsibilities:

- HTTP API endpoints
- Authentication & Authorization
- Middleware
- Dependency Injection
- Swagger
- SignalR Hubs

The API project contains minimal business logic and acts as the communication layer between clients and the application.

---

## FlowForge.Application

The core of the application.

Responsibilities:

- Commands
- Queries
- Handlers
- Validators
- DTOs
- Business Rules
- Application Services

This project contains the application's use cases and coordinates interactions between the domain and infrastructure.

---

## FlowForge.Domain

Contains the business model.

Responsibilities:

- Entities
- Enums
- Value Objects
- Domain Constants

The Domain project is independent of all other projects and contains no infrastructure or framework-specific code.

---

## FlowForge.Infrastructure

Contains all external implementations.

Responsibilities:

- Entity Framework Core
- SQL Server
- Authentication Services
- SignalR Services
- Logging
- External Integrations

Infrastructure implements the interfaces defined in the Application layer.

---

# Feature Organization

Features are organized independently rather than by technical layers.

Example:

```
Features
│
├── Authentication
├── Organizations
├── Projects
├── Boards
├── Columns
├── WorkItems
├── Comments
└── Notifications
```

Each feature contains everything required for that feature, including commands, queries, validators, handlers, and supporting classes.

---

# Request Lifecycle

Every request follows the same flow.

```
Client

↓

API Endpoint

↓

MediatR

↓

Command / Query

↓

Handler

↓

Business Rules

↓

Database

↓

Response
```

For realtime operations, SignalR events are published after successful database updates.

---

# Dependency Injection

Application services are registered through dependency injection, allowing implementations to be replaced without changing business logic.

Examples include:

- Current User Service
- Notification Service
- Realtime Notifier
- Online User Tracker
- Board Presence Tracker

This keeps the application loosely coupled and easy to test.

---

# Validation

Request validation is handled using **FluentValidation**.

Each command or query can define its own validator, ensuring invalid requests are rejected before reaching business logic.

---

# Logging

FlowForge uses **Serilog** for structured logging.

Logging is used throughout the application for:

- Request tracking
- Authentication events
- Errors
- Realtime events
- Diagnostics

---

# Testing

The solution includes a dedicated **tests** project for automated testing.

Business logic is designed to remain independent from infrastructure, making it easier to write unit and integration tests.

---

# Summary

The backend is organized around features rather than technical layers, keeping business logic isolated from infrastructure while making the application easier to extend, maintain, and test.