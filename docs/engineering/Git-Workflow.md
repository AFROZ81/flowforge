# 🌿 FlowForge Git Workflow

This document defines the Git workflow used throughout the FlowForge project.

A consistent Git workflow enables developers to collaborate efficiently, maintain a clean commit history, and reduce integration issues as the project grows.

Whether working individually or as part of a larger engineering team, every contributor should follow these guidelines.

---

# 📑 Table of Contents

- Introduction
- Workflow Philosophy
- Branching Strategy
- Repository Structure
- Main Branches
- Feature Branch Workflow
- Branch Naming Conventions
- Commit Message Standards
- Pull Request Guidelines

---

# 📖 Introduction

Git is more than a version control system—it is the foundation of collaboration.

A well-defined workflow helps developers:

- Work independently
- Integrate changes safely
- Review code efficiently
- Maintain project history
- Recover from mistakes
- Deliver reliable releases

FlowForge follows a lightweight workflow inspired by GitHub Flow with conventions adapted for enterprise development.

---

# 🎯 Workflow Philosophy

The Git workflow is built around several guiding principles.

---

## Keep Changes Small

Small changes are easier to:

- Review
- Test
- Merge
- Revert

Avoid combining unrelated work into a single branch or Pull Request.

---

## Protect the Main Branch

The `main` branch should always represent a stable and deployable state.

Developers should never commit directly to `main`.

All changes should pass through:

- Feature Branch
- Pull Request
- Code Review
- Merge

---

## Frequent Integration

Feature branches should be merged regularly.

Long-lived branches increase:

- Merge conflicts
- Outdated code
- Review complexity

---

## Traceability

Every commit should clearly explain:

- What changed
- Why it changed

The Git history should tell the story of the project.

---

# 🌳 Branching Strategy

FlowForge follows a simple branching strategy.

```text
                    main
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
feature/create   feature/auth   feature/workitems
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
              Pull Request
                     │
                     ▼
               Code Review
                     │
                     ▼
                Squash Merge
                     │
                     ▼
                    main
```

Every feature begins from the latest `main` branch.

---

# 📁 Repository Structure

Typical branch hierarchy:

```text
main

feature/*

bugfix/*

hotfix/*

release/*
```

Each branch serves a single purpose.

---

# 🌟 Main Branch

The `main` branch is the source of truth.

Characteristics:

- Always stable
- Always deployable
- Protected from direct pushes
- Updated only through Pull Requests

Only reviewed and approved changes should reach `main`.

---

# 🚀 Feature Branch Workflow

Every new feature begins with a dedicated branch.

Example:

```bash
git checkout main

git pull origin main

git checkout -b feature/create-project
```

Development occurs exclusively on the feature branch.

Once complete:

```bash
git push origin feature/create-project
```

Open a Pull Request for review.

---

# 🏷️ Branch Naming Conventions

Branch names should be short, descriptive, and lowercase.

## Features

```text
feature/create-project

feature/archive-workitem

feature/jwt-authentication

feature/board-reordering
```

---

## Bug Fixes

```text
bugfix/project-validation

bugfix/display-order

bugfix/login-error
```

---

## Hotfixes

```text
hotfix/token-expiry

hotfix/login-timeout

hotfix/security-patch
```

---

## Releases

```text
release/v1.0

release/v1.1

release/v2.0
```

Use hyphens instead of spaces.

Avoid generic names like:

```text
feature/test

feature/update

feature/new

mybranch
```

---

# ✍️ Commit Message Standards

Commits should describe one logical change.

Preferred format:

```text
<type>: <description>
```

Examples:

```text
feat: add project creation endpoint

feat: implement board archive workflow

fix: resolve workitem ordering bug

fix: prevent duplicate project names

refactor: simplify CreateProjectHandler

docs: update architecture guide

test: add project handler tests

chore: upgrade EF Core packages
```

---

## Commit Types

| Type | Purpose |
|-------|----------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| refactor | Code improvement without behavior change |
| test | Testing |
| chore | Maintenance |
| style | Formatting only |

---

## Good Commit Messages

✔

```text
feat: add board archive endpoint
```

✔

```text
fix: prevent duplicate organization names
```

✔

```text
docs: update API documentation
```

---

## Poor Commit Messages

❌

```text
Update
```

❌

```text
Fix
```

❌

```text
Changes
```

Commit messages should remain meaningful even months later.

---

# 🔀 Pull Request Guidelines

Every Pull Request should represent one logical change.

A Pull Request should include:

- Purpose of the change
- Summary of implementation
- Related issue (if applicable)
- Screenshots (for UI changes)
- Testing notes

Example checklist:

```text
☑ Builds successfully

☑ Tests pass

☑ Documentation updated

☑ Coding Standards followed

☑ No secrets committed

☑ Ready for review
```

Small Pull Requests are preferred over large ones.

They are:

- Easier to review
- Easier to test
- Easier to merge

---

# 👨‍💻 Code Review Process

Every Pull Request should be reviewed before it is merged into the `main` branch.

The purpose of code reviews is not only to find bugs, but also to:

- Improve code quality
- Share knowledge
- Maintain consistency
- Enforce architectural standards
- Reduce technical debt

Code reviews should be constructive, respectful, and focused on improving the software rather than criticizing the developer.

---

## Review Checklist

Every reviewer should verify the following:

### Architecture

- Clean Architecture boundaries are respected.
- Dependencies flow in the correct direction.
- No Infrastructure code leaks into the Domain layer.
- CQRS conventions are followed.

---

### Code Quality

- Naming conventions are followed.
- Methods are concise and focused.
- Classes have a single responsibility.
- No duplicated logic.
- Readability is prioritized over clever implementations.

---

### Validation

- Input validation is implemented using FluentValidation.
- Business rules are enforced in the Domain layer.
- Edge cases are considered.

---

### Security

- Authorization checks are present where required.
- Sensitive information is not exposed.
- No secrets or credentials are committed.
- Input is properly validated.

---

### Performance

- Database queries are efficient.
- Pagination is implemented for collection endpoints.
- Asynchronous APIs are used appropriately.
- Unnecessary allocations are avoided.

---

### Documentation

Ensure that:

- Public APIs remain documented.
- Architecture documentation is updated if needed.
- README changes accompany significant features.

---

# 🔀 Merge Strategy

FlowForge uses **Squash Merge** as the preferred merge strategy.

```text
Feature Branch

Commit A

Commit B

Commit C

        │
        ▼

Single Squash Commit

        │
        ▼

main
```

Benefits include:

- Cleaner Git history
- Easier rollback
- One logical commit per feature
- Reduced noise from intermediate commits

---

## When to Merge

Merge only when:

- Code review is approved.
- CI pipeline succeeds.
- No merge conflicts remain.
- Documentation is updated if required.
- The feature has been tested.

---

## Protected Branches

The `main` branch should be protected.

Restrictions should include:

- No direct pushes
- Required Pull Requests
- Required code review approvals
- Successful CI before merge

This ensures the main branch always remains stable.

---

# 🚀 Release Workflow

When preparing a release, create a dedicated release branch.

Example:

```bash
git checkout main

git pull origin main

git checkout -b release/v1.0
```

Only release-related work should occur on this branch.

Typical activities include:

- Final testing
- Documentation updates
- Version number changes
- Release notes
- Minor bug fixes

After validation:

```text
release/v1.0

        │

        ▼

Production

        │

        ▼

Merge back into main
```

This workflow isolates release preparation from ongoing feature development.

---

# 🚑 Hotfix Workflow

Critical production issues should be addressed using a dedicated hotfix branch.

Example:

```bash
git checkout main

git pull origin main

git checkout -b hotfix/login-timeout
```

Hotfix branches should contain only the changes required to resolve the issue.

After testing:

```text
main
 │
 ▼
hotfix/login-timeout
 │
 ▼
Pull Request
 │
 ▼
main
```

If a release branch exists, the hotfix should also be merged into that branch.

---

# ⚔️ Conflict Resolution

Merge conflicts are inevitable in collaborative development.

To minimize conflicts:

- Pull changes from `main` regularly.
- Keep feature branches short-lived.
- Avoid modifying unrelated files.
- Break large features into smaller Pull Requests.

When conflicts occur:

1. Pull the latest changes.
2. Resolve conflicts manually.
3. Build the solution.
4. Run tests.
5. Commit the resolved changes.
6. Push the updated branch.

Never resolve conflicts without verifying that the application still builds and behaves correctly.

---

# ✅ Best Practices

Follow these practices to maintain a healthy repository.

✔ Create one branch per feature.

✔ Keep branches focused on a single objective.

✔ Commit frequently with meaningful messages.

✔ Rebase or merge `main` regularly.

✔ Open Pull Requests early for feedback.

✔ Delete merged feature branches.

✔ Keep documentation synchronized with implementation.

✔ Review code respectfully and constructively.

✔ Test before opening a Pull Request.

✔ Ensure the solution builds successfully before pushing changes.

---

# ❌ Common Mistakes

Avoid the following practices.

---

## Direct Commits to `main`

Never bypass the Pull Request process.

---

## Large Pull Requests

Large Pull Requests are difficult to review and often introduce more defects.

Prefer smaller, focused changes.

---

## Generic Commit Messages

Avoid:

```text
Update

Fix

Changes

Test
```

Instead, describe the actual change.

---

## Mixing Unrelated Work

A single Pull Request should address one feature or bug.

Do not combine:

- Feature development
- Refactoring
- Documentation
- Dependency upgrades

into a single branch unless they are directly related.

---

## Long-Lived Branches

Feature branches should be merged as soon as practical.

Long-lived branches increase:

- Merge conflicts
- Outdated code
- Review complexity

---

## Force Pushing Shared Branches

Avoid force pushing branches that other developers may be using.

Force pushes should only be used when absolutely necessary and with team agreement.

---

# 📖 Summary

A disciplined Git workflow is essential for maintaining a reliable and collaborative development process.

By following these standards, contributors ensure that every change is:

- Easy to understand
- Properly reviewed
- Safely integrated
- Fully traceable
- Consistent with the project's engineering practices

The FlowForge Git Workflow complements the Coding Standards by defining not only **how code should be written**, but also **how it should be managed, reviewed, and integrated** throughout the software development lifecycle.

Following these guidelines helps keep the repository organized, maintainable, and ready to scale as the project and team continue to grow.

---

<div align="center">

# 🌿 FlowForge Git Workflow

### Collaborate Efficiently. Review Carefully. Merge Confidently.

*"Great teams don't just write great code—they build great workflows that make quality the default."*

</div>