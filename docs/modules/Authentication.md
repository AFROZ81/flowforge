# 🔐 FlowForge Authentication Module

Authentication is the security gateway of the FlowForge platform.

Every request that interacts with protected business resources begins with the Authentication module. It is responsible for verifying user identity, issuing secure access tokens, and ensuring that only authorized users can access application features.

Built on **ASP.NET Core Identity** and **JWT Bearer Authentication**, this module provides a secure, scalable, and extensible authentication system that integrates seamlessly with the rest of the FlowForge architecture.

---

# 📑 Table of Contents

- Introduction
- Module Overview
- Authentication Philosophy
- Authentication Workflow
- User Registration
- User Login
- JWT Authentication
- Authorization

---

# 📖 Introduction

Security is one of the foundational pillars of every enterprise application.

Before a user can create projects, manage boards, update WorkItems, or access organizational data, the system must first establish **who the user is** and **what they are allowed to do**.

The Authentication module provides this capability.

It is responsible for:

- User registration
- User authentication
- JWT token generation
- Secure access to protected APIs
- User identity management
- Organization-aware authorization

Rather than implementing custom authentication mechanisms, FlowForge builds upon Microsoft's proven Identity framework to provide a secure and maintainable authentication solution.

---

# 🏛️ Module Overview

The Authentication module serves as the entry point into the application.

Every authenticated user passes through this module before interacting with business features such as:

- Organizations
- Projects
- Boards
- WorkItems
- Dashboard
- Future collaboration modules

Without successful authentication, these modules remain inaccessible.

---

## Responsibilities

The Authentication module is responsible for:

✔ Registering new users

✔ Authenticating existing users

✔ Generating JWT access tokens

✔ Validating user credentials

✔ Providing authenticated user information

✔ Supporting organization-aware access

These responsibilities are intentionally limited to authentication and identity management.

Business logic belongs in the corresponding feature modules.

---

# 🎯 Authentication Philosophy

FlowForge follows a simple authentication philosophy:

> **Verify identity once. Trust the verified identity throughout the request pipeline.**

Instead of repeatedly asking users for credentials, the application issues a signed JWT after successful authentication.

Every subsequent request carries this token, allowing the API to identify the caller without maintaining server-side session state.

This approach provides:

- Scalability
- Stateless communication
- Improved performance
- Better support for distributed systems
- Consistent authentication across clients

---

## Authentication vs Authorization

Although often used together, authentication and authorization solve different problems.

| Authentication | Authorization |
|---------------|---------------|
| Verifies identity | Verifies permissions |
| "Who are you?" | "What can you do?" |
| Happens first | Happens after authentication |
| Issues JWT | Evaluates access rights |

Example:

```text
User Login

↓

Identity Verified

↓

JWT Issued

↓

Protected API Request

↓

Authorization Checks

↓

Business Operation
```

Authentication identifies the user.

Authorization determines whether that user may perform the requested operation.

---

# 🔄 Authentication Workflow

Every authenticated session follows the same lifecycle.

```text
User
   │
   ▼
Login Request
   │
   ▼
Authentication API
   │
   ▼
ASP.NET Core Identity
   │
   ▼
Credentials Verified
   │
   ▼
JWT Generated
   │
   ▼
Client Stores Token
   │
   ▼
Authorized Requests
```

This workflow separates credential verification from business operations.

Once authenticated, every protected endpoint trusts the validated JWT.

---

## Request Lifecycle

Every protected request follows a consistent sequence.

```text
HTTP Request
      │
      ▼
JWT Bearer Middleware
      │
      ▼
Token Validation
      │
      ▼
Authorization
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Handler
      │
      ▼
Business Logic
```

Because authentication occurs before business logic executes, handlers can safely assume that the caller has already been identified.

---

# 👤 User Registration

Registration creates a new application user using ASP.NET Core Identity.

Rather than writing directly to the database, FlowForge delegates user creation to Identity, allowing it to handle password security, user storage, and identity management.

---

## Registration Process

A typical registration request performs the following steps.

```text
User Registration
        │
        ▼
Request Validation
        │
        ▼
Identity User Creation
        │
        ▼
Password Hashing
        │
        ▼
Database
        │
        ▼
Success Response
```

Each stage has a single responsibility.

Validation ensures the request is structurally correct before Identity processes it.

---

## Registration Responsibilities

During registration, the module:

- Validates request data
- Creates a new Identity user
- Hashes the password
- Stores user information
- Associates the user with an organization (where applicable)
- Returns a success response

At no point is the user's password stored in plain text.

---

# 🔑 User Login

Login verifies the credentials supplied by an existing user.

If authentication succeeds, FlowForge issues a signed JWT access token.

This token becomes the user's identity for subsequent requests.

---

## Login Workflow

```text
Login Request
      │
      ▼
Identity Validation
      │
      ▼
Password Verification
      │
      ▼
JWT Creation
      │
      ▼
Login Response
```

Invalid credentials immediately terminate the workflow without exposing unnecessary information.

---

## Successful Login

A successful login typically results in:

- Identity verification
- JWT creation
- User information retrieval
- Token returned to client

The client is then responsible for storing the token securely and including it in future requests.

---

# 🎫 JWT Authentication

FlowForge uses **JSON Web Tokens (JWT)** for stateless authentication.

Instead of maintaining server-side sessions, authenticated users receive a signed token containing identity information.

Subsequent requests include this token within the Authorization header.

Example:

```http
Authorization: Bearer <access_token>
```

The API validates the token before executing any protected operation.

---

## Why JWT?

JWT authentication provides several advantages.

- Stateless architecture
- High scalability
- Excellent support for REST APIs
- Easy integration with web and mobile applications
- Reduced server memory usage

Because the server does not maintain user sessions, authentication remains lightweight and scalable.

---

## Token Lifecycle

The lifecycle of an access token can be summarized as:

```text
User Login
      │
      ▼
JWT Generated
      │
      ▼
Client Stores Token
      │
      ▼
Protected API Requests
      │
      ▼
Token Validation
      │
      ▼
Authorized Response
```

Every protected request depends on successful token validation.

---

# 🛡️ Authorization

Authentication confirms a user's identity.

Authorization determines whether that authenticated user is permitted to perform a requested action.

FlowForge performs authorization before executing business operations.

Current authorization includes:

- Authenticated user verification
- Protected endpoint access
- Organization-aware resource access

Future versions may introduce role-based and permission-based authorization to provide finer-grained access control.

---

# 👤 Current User Service

After a user has been authenticated, many business operations require information about the currently logged-in user.

Instead of allowing handlers to access the HTTP context directly, FlowForge provides a dedicated **Current User Service**.

This abstraction keeps the Application layer independent of ASP.NET Core while providing a simple way to retrieve authenticated user information.

---

## Responsibilities

The Current User Service provides commonly required information such as:

- User Identifier
- Organization Identifier
- User Name
- Email Address
- User Roles
- Authentication Status

Business features consume this service through Dependency Injection rather than interacting directly with framework-specific APIs.

---

## Why Use a Current User Service?

Using an abstraction provides several advantages:

- Keeps handlers framework-independent
- Simplifies unit testing
- Reduces coupling
- Centralizes identity access
- Improves maintainability

Rather than retrieving claims from the HTTP context throughout the application, a single service becomes the trusted source of authenticated user information.

---

# 🔌 API Endpoints

The Authentication module currently exposes two primary endpoints.

---

## Register

```http
POST /api/auth/register
```

### Purpose

Creates a new user account.

### Typical Workflow

```text
Client
    │
    ▼
Registration Request
    │
    ▼
Validation
    │
    ▼
Identity User Creation
    │
    ▼
Success Response
```

A successful registration stores the new user securely using ASP.NET Core Identity.

---

## Login

```http
POST /api/auth/login
```

### Purpose

Authenticates an existing user and returns a JWT access token.

### Typical Workflow

```text
Client
    │
    ▼
Login Request
    │
    ▼
Identity Verification
    │
    ▼
JWT Generation
    │
    ▼
Access Token Returned
```

The client includes this token in subsequent requests to protected endpoints.

---

# 🔄 Complete Request Flow

Every authenticated request follows the same processing pipeline.

```text
Client Request
      │
      ▼
JWT Bearer Authentication
      │
      ▼
Authentication Middleware
      │
      ▼
Authorization
      │
      ▼
Controller
      │
      ▼
MediatR
      │
      ▼
Handler
      │
      ▼
Business Logic
      │
      ▼
Database
      │
      ▼
API Response
```

Each stage performs one responsibility before passing control to the next component.

This predictable request lifecycle improves maintainability and debugging.

---

# 🔒 Password Security

Password security is handled entirely by ASP.NET Core Identity.

FlowForge never stores or compares passwords in plain text.

Instead, Identity automatically:

- Hashes passwords during registration
- Verifies hashes during login
- Uses secure password storage algorithms
- Protects against common password-related vulnerabilities

By relying on Microsoft's Identity framework, FlowForge benefits from continuously maintained security best practices.

---

## Credential Protection

The Authentication module follows several important principles:

✔ Passwords are never stored in plain text.

✔ Password verification is delegated to Identity.

✔ Sensitive authentication logic is centralized.

✔ Business modules never access user passwords.

This separation minimizes security risks while simplifying application code.

---

# ⚠️ Error Handling

Authentication failures are handled gracefully without revealing sensitive implementation details.

Common failure scenarios include:

- Invalid credentials
- Missing authentication token
- Expired JWT
- Invalid JWT signature
- Unauthorized access
- Forbidden resource access

The API returns clear and consistent error responses while avoiding unnecessary information disclosure.

---

## Why Generic Error Messages?

Authentication endpoints should avoid revealing whether:

- A username exists.
- An email address is registered.
- A password was partially correct.

Providing generic authentication failure messages reduces the risk of user enumeration and other security attacks.

---

# 🛡️ Security Best Practices

Authentication is one of the most security-sensitive areas of the application.

FlowForge follows several important security principles.

---

## Secure Password Storage

Passwords are:

- Hashed
- Never reversible
- Never returned through the API
- Never logged

---

## Stateless Authentication

JWT authentication eliminates server-side session storage.

Benefits include:

- Better scalability
- Lower memory usage
- Easier horizontal scaling
- Simpler API architecture

---

## Protected Endpoints

Business endpoints require successful authentication before executing any business logic.

This prevents anonymous users from accessing protected resources.

---

## Organization-Aware Access

FlowForge supports organization-aware authorization.

Even after authentication succeeds, business operations verify that users access only resources belonging to their organization.

This provides an additional layer of data isolation for multi-organization environments.

---

# 📋 Common Authentication Scenarios

The Authentication module supports several common workflows.

---

## New User Registration

```text
User
   │
   ▼
Register
   │
   ▼
Identity User Created
   │
   ▼
Ready to Login
```

---

## Existing User Login

```text
User
   │
   ▼
Login
   │
   ▼
Credentials Verified
   │
   ▼
JWT Issued
```

---

## Accessing a Protected API

```text
Client
   │
   ▼
JWT Included
   │
   ▼
Token Validated
   │
   ▼
Business Endpoint Executed
```

---

## Invalid Token

```text
Client
   │
   ▼
Expired Token
   │
   ▼
Authentication Failed
   │
   ▼
Unauthorized Response
```

The client must authenticate again before accessing protected resources.

---

# 🚀 Future Enhancements

The Authentication module has been designed to evolve as FlowForge grows.

Potential future enhancements include:

```text
Refresh Tokens

Email Verification

Password Reset

Two-Factor Authentication (2FA)

External Identity Providers

Role-Based Authorization

Permission-Based Authorization

Single Sign-On (SSO)

Multi-Factor Authentication

Audit Logging
```

Each enhancement can be integrated without disrupting the existing authentication architecture.

---

# 📖 Summary

The Authentication module is the foundation of FlowForge's security model.

It is responsible for:

- Registering users
- Authenticating identities
- Issuing JWT access tokens
- Protecting API endpoints
- Providing authenticated user information
- Supporting organization-aware authorization

Built on **ASP.NET Core Identity**, **JWT Bearer Authentication**, **Entity Framework Core**, **MediatR**, and **FluentValidation**, the module provides a secure and scalable authentication system that integrates seamlessly with the rest of the platform.

Every business feature within FlowForge depends on this module to establish identity before executing business operations.

---

<div align="center">

# 🔐 FlowForge Authentication Module

### Securing Every Request Through Trusted Identity and Stateless Authentication

*"Authentication establishes trust. Authorization enforces responsibility. Together they protect every interaction within FlowForge while providing a secure, scalable, and enterprise-ready foundation for future growth."*

</div>