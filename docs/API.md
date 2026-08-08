# Task Management API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require the header:

```
Authorization: Bearer <token>
```

## Response Format

**Success:**

```json
{
  "success": true,
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Health

### GET /api/health

Check server health.

**Authentication:** Not required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Server is healthy"
}
```

---

## Authentication

### POST /api/auth/register

Register a new user.

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password1"
}
```

**Validation:**
- Name: required, min 2 characters
- Email: valid email format
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

**Error Responses:**
- `400` — Validation error
- `409` — Email already registered

---

### POST /api/auth/login

Authenticate a user.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Password1"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwt_token"
  }
}
```

**Error Responses:**
- `400` — Validation error
- `401` — Invalid email or password

---

### GET /api/auth/me

Get the current authenticated user.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `401` — Not authenticated or invalid token

---

### POST /api/auth/logout

Logout the current user (client-side token removal).

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Tasks

### POST /api/tasks

Create a new task. Owner is automatically set to the authenticated user.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Complete React project",
  "description": "Build the task management application",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-08-20"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Complete React project",
    "description": "Build the task management application",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "owner": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `400` — Validation error
- `401` — Not authenticated

---

### GET /api/tasks

Get paginated tasks for the authenticated user.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| status | string | Filter by status: TODO, IN_PROGRESS, COMPLETED |
| priority | string | Filter by priority: LOW, MEDIUM, HIGH |
| search | string | Search in title and description |
| sortBy | string | createdAt, updatedAt, dueDate, priority, title |
| sortOrder | string | asc or desc (default: desc) |
| dueDateFilter | string | today, upcoming, overdue |

**Example:** `/api/tasks?status=TODO&priority=HIGH&search=react&page=1&limit=10`

**Success Response (200):**

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### GET /api/tasks/:id

Get a single task by ID.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "...",
    "owner": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "completedAt": null
  }
}
```

**Error Responses:**
- `404` — Task not found (includes tasks owned by other users)

---

### PATCH /api/tasks/:id

Update a task. Only the owner or admin can update.

**Authentication:** Required

**Request Body (all fields optional):**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "dueDate": "2026-08-25"
}
```

**Notes:**
- Setting status to `COMPLETED` automatically sets `completedAt`
- Changing status away from `COMPLETED` clears `completedAt`

**Success Response (200):**

```json
{
  "success": true,
  "data": { }
}
```

**Error Responses:**
- `400` — Validation error
- `404` — Task not found

---

### DELETE /api/tasks/:id

Delete a task. Only the owner or admin can delete.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Error Responses:**
- `404` — Task not found

---

## Comments

### POST /api/tasks/:taskId/comments

Add a comment to a task.

**Authentication:** Required

**Request Body:**

```json
{
  "content": "This is a comment"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "task": "...",
    "user": { "_id": "...", "name": "...", "email": "..." },
    "content": "This is a comment",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `400` — Empty or invalid comment
- `404` — Task not found

---

### GET /api/tasks/:taskId/comments

Get all comments for a task.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": []
}
```

---

### DELETE /api/tasks/:taskId/comments/:commentId

Delete a comment. Users can delete their own comments; admins can delete any comment.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Comment deleted successfully"
  }
}
```

**Error Responses:**
- `403` — Not authorized to delete
- `404` — Task or comment not found

---

## Dashboard

### GET /api/dashboard/stats

Get task statistics for the authenticated user.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 24,
    "todo": 8,
    "inProgress": 6,
    "completed": 10,
    "overdue": 3,
    "highPriority": 5
  }
}
```

---

### GET /api/dashboard

Get full dashboard data including stats, recent tasks, upcoming tasks, overdue tasks, and status distribution.

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "stats": { },
    "recentTasks": [],
    "upcomingTasks": [],
    "overdueTasks": [],
    "statusDistribution": {
      "TODO": 8,
      "IN_PROGRESS": 6,
      "COMPLETED": 10
    }
  }
}
```
