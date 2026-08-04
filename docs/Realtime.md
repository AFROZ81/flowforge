# ⚡ Realtime

## Overview

FlowForge uses **SignalR** to provide realtime collaboration across connected clients.

Instead of requiring users to manually refresh the application, changes are broadcast instantly whenever important events occur, keeping all clients synchronized in real time.

---

# SignalR Hub

The application exposes a central **NotificationHub** responsible for realtime communication.

The hub manages client connections, group membership, presence tracking, typing indicators, and event broadcasting.

---

# Connection Groups

Connected clients are organized into SignalR groups to ensure events are delivered only to relevant users.

### User Group

```
user:{userId}
```

Used for personal events such as notifications.

---

### Organization Group

```
organization:{organizationId}
```

Used for organization-wide events.

---

### Board Group

```
board:{boardId}
```

Used for board-specific collaboration, including work items, comments, typing indicators, and board presence.

---

# Realtime Events

The application publishes realtime events after successful business operations.

## Work Items

- WorkItemCreated
- WorkItemUpdated
- WorkItemMoved
- WorkItemDeleted

---

## Comments

- CommentAdded
- CommentUpdated
- CommentDeleted

---

## Notifications

- NotificationReceived

---

## Presence

- UserOnline
- UserOffline
- BoardPresenceChanged

---

## Typing

- TypingStarted
- TypingStopped

---

# Presence

FlowForge tracks two different types of presence.

### Online Presence

Indicates whether a user is currently connected to the application.

### Board Presence

Tracks which users are actively viewing a specific board.

This allows clients to display live board viewers and collaboration indicators.

---

# Typing Indicators

Typing indicators provide temporary realtime feedback while users interact with comments or other collaborative features.

Unlike comments or work items, typing events are not stored in the database and exist only while users are actively typing.

---

# Realtime Flow

Most collaborative actions follow the same workflow.

```
Client Action
      │
      ▼
HTTP Request
      │
      ▼
Command Handler
      │
      ▼
Business Rules
      │
      ▼
Database
      │
      ▼
RealtimeNotifier
      │
      ▼
SignalR Hub
      │
      ▼
Connected Clients
```

This ensures all connected users receive updates immediately after successful database operations.

---

# Realtime Notifier

The `IRealtimeNotifier` abstraction separates business logic from SignalR.

Application handlers publish events through this interface without depending directly on SignalR, keeping the Application layer independent of infrastructure concerns.

---

# Summary

Realtime collaboration is a core part of FlowForge. By combining SignalR, presence tracking, notifications, and event broadcasting, the platform keeps connected users synchronized while maintaining a clean separation between business logic and realtime infrastructure.