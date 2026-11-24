# Realtime

## Overview

FlowForge uses one SignalR hub, `/hubs/notifications`, for notifications, presence, board events, role changes, and typing events. The hub requires a JWT supplied either as a bearer header or as an `access_token` query parameter.

## Connection groups

| Group | Purpose |
| --- | --- |
| `user:{userId}` | Personal notifications and role changes. |
| `organization:{organizationId}` | Organization-wide events when used. |
| `board:{boardId}` | Board work-item/comment events, typing, and board presence. |

On connect, a user joins their user and organization groups. `JoinBoard` and `LeaveBoard` manage board membership and republish the roster.

## Events

| Event | Audience | Current use |
| --- | --- | --- |
| `NotificationReceived` | User | Notification inbox and unread updates. |
| `UserOnline` / `UserOffline` | All clients | Online presence. |
| `BoardPresenceChanged` | Board | Board viewer roster. |
| `WorkItemCreated` | Board | Received by the client and re-dispatched as a DOM event. |
| `WorkItemUpdated` | Board | Received by the client and re-dispatched as a DOM event. |
| `WorkItemMoved` | Board | Received by the client and re-dispatched as a DOM event. |
| `WorkItemDeleted` | Board | Received by the client and re-dispatched as a DOM event. |
| `CommentAdded` / `Updated` / `Deleted` | Board | Received by the client and re-dispatched as DOM events. |
| `RoleChanged` | User | Client refreshes its token when its own role changes. |
| `TypingStarted` / `TypingStopped` | Board except sender | Subscribed by the client; no UI currently invokes the hub methods. |

`NotifyOrganizationAsync` exists but has no current caller. `RealtimeEvents.BoardUpdated` is defined but not broadcast.

## Client architecture

`PresenceProvider` owns the shared connection and exposes:

- online users
- board viewers
- board connection state
- typing users
- idle/away state
- notification refresh helpers

The connection uses automatic reconnect and this transport order:

1. WebSockets
2. Server-Sent Events
3. Long Polling

Work-item and comment events are converted to window custom events such as `flowforge:work-item-moved`. `BoardRealtimeListener` contains query-invalidation logic for those events, but it is not currently mounted, so live board refetch from those broadcasts is not yet wired end to end.

## Presence

Online presence is tracked per user. Board presence is tracked per connection, so multiple tabs do not incorrectly share board membership and closing one tab does not mark the user offline while another remains connected.

Presence trackers are in memory. An app-pool recycle clears them and drops hub connections; clients reconnect automatically.

## Notifications

The client maintains a notification inbox with unread counts, read/unread actions, mark-all-read, refresh, and delete. SignalR `NotificationReceived` events trigger inbox refreshes.

## Current gaps

- Typing events are subscribed but no client component sends `StartTyping` or `StopTyping`.
- The board realtime invalidation listener is not mounted.
- Organization-wide broadcast has no current publisher.
- There is no durable pub/sub backplane; the current design assumes one application process.
- Local development CORS allows ports 5173, 5174, and 5175; production remains same-origin.
