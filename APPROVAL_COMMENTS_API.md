# Approval Comments API Guide

## Overview

This feature allows admins to provide feedback on approval requests through comments. Low-tier users (requestors) can view these comments, update their request data accordingly, and mark comments as resolved.

## Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPROVAL COMMENTS FLOW                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Low-tier user creates approval request                          │
│                    ↓                                                │
│  2. Admin reviews and adds comments (feedback/issues)               │
│                    ↓                                                │
│  3. Requestor sees comments on their request                        │
│                    ↓                                                │
│  4. Requestor updates request data to address feedback              │
│                    ↓                                                │
│  5. Requestor marks comments as resolved                            │
│                    ↓                                                │
│  6. Admin reviews again and approves/rejects                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Add Comment (Admin Only)

Add a comment to a pending approval request.

```
POST /api/approvals/:approvalRequestId/comments
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Please provide more details about the customer's address. The postal code seems incorrect."
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-of-comment",
  "content": "Please provide more details about the customer's address. The postal code seems incorrect.",
  "author": {
    "id": "admin-uuid",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Admin"
  },
  "isResolved": false,
  "resolvedAt": null,
  "resolvedBy": null,
  "resolutionNote": null,
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:00:00.000Z"
}
```

**Errors:**
- `400` - Can only comment on pending requests
- `403` - Only admins can add comments
- `404` - Approval request not found

---

### 2. Get Comments

Get all comments for an approval request.

```
GET /api/approvals/:approvalRequestId/comments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "comment-uuid-1",
    "content": "Please provide more details about the customer's address.",
    "author": {
      "id": "admin-uuid",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Admin"
    },
    "isResolved": true,
    "resolvedAt": "2025-12-20T11:00:00.000Z",
    "resolvedBy": {
      "id": "requestor-uuid",
      "username": "employee1",
      "email": "employee@example.com",
      "firstName": "Jane",
      "lastName": "Employee"
    },
    "resolutionNote": "Updated the address with correct postal code",
    "createdAt": "2025-12-20T10:00:00.000Z",
    "updatedAt": "2025-12-20T11:00:00.000Z"
  },
  {
    "id": "comment-uuid-2",
    "content": "Missing phone number for the customer.",
    "author": {
      "id": "admin-uuid",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Admin"
    },
    "isResolved": false,
    "resolvedAt": null,
    "resolvedBy": null,
    "resolutionNote": null,
    "createdAt": "2025-12-20T10:05:00.000Z",
    "updatedAt": "2025-12-20T10:05:00.000Z"
  }
]
```

**Who can access:**
- The requestor (owner of the approval request)
- Any admin

**Errors:**
- `403` - Insufficient permissions
- `404` - Approval request not found

---

### 3. Resolve Comment (Requestor Only)

Mark a comment as resolved after addressing the feedback.

```
PUT /api/approvals/comments/:commentId/resolve
```

**Headers:**
```
Authorization: Bearer <requestor_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolutionNote": "Updated the address with the correct postal code 12345"
}
```

> Note: `resolutionNote` is optional but recommended to explain what was changed.

**Response (200 OK):**
```json
{
  "id": "comment-uuid",
  "content": "Please provide more details about the customer's address.",
  "author": {
    "id": "admin-uuid",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Admin"
  },
  "isResolved": true,
  "resolvedAt": "2025-12-20T11:00:00.000Z",
  "resolvedBy": {
    "id": "requestor-uuid",
    "username": "employee1",
    "email": "employee@example.com",
    "firstName": "Jane",
    "lastName": "Employee"
  },
  "resolutionNote": "Updated the address with the correct postal code 12345",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T11:00:00.000Z"
}
```

**Errors:**
- `400` - Comment already resolved
- `403` - Only the requestor can resolve comments
- `404` - Comment not found

---

### 4. Update Request Data (Requestor Only)

Update the request data for a pending approval request (to address feedback).

```
PUT /api/approvals/:approvalRequestId/request-data
```

**Headers:**
```
Authorization: Bearer <requestor_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requestData": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "address": "123 Main St, City, 12345",
    "phone": "+1234567890"
  },
  "updateReason": "Added correct postal code and phone number as requested"
}
```

> Note: `updateReason` is optional but recommended. The system keeps a history of all updates in the metadata.

**Response (200 OK):**
Returns the full approval request with updated data (same structure as `GET /approvals/:id`).

**Errors:**
- `400` - Can only update pending requests
- `403` - Only the requestor can update request data
- `404` - Approval request not found

---

## Updated Approval Request Response

When fetching approval requests, they now include comments data:

```json
{
  "id": "approval-request-uuid",
  "action": "create_customer",
  "status": "pending",
  "requestData": { ... },
  "originalData": null,
  "entityId": null,
  "entityType": "customer",
  "reason": "New customer registration",
  "rejectionReason": null,
  "cannotExecuteReason": null,
  "requestor": { ... },
  "approver": null,
  "createdAt": "2025-12-20T09:00:00.000Z",
  "approvedAt": null,
  "expiresAt": "2025-12-23T09:00:00.000Z",
  "comments": [
    {
      "id": "comment-uuid",
      "content": "Please fix the address",
      "author": { ... },
      "isResolved": false,
      "resolvedAt": null,
      "resolvedBy": null,
      "resolutionNote": null,
      "createdAt": "2025-12-20T10:00:00.000Z",
      "updatedAt": "2025-12-20T10:00:00.000Z"
    }
  ],
  "unresolvedCommentsCount": 1
}
```

### New Fields:
- `comments` - Array of comment objects (may be empty)
- `unresolvedCommentsCount` - Number of comments not yet resolved

---

## Frontend UI Suggestions

### For Admin View (Approval Review)
- Show a "Add Comment" button/form on pending approval requests
- Display existing comments with resolved/unresolved status
- Show badge with unresolved count: `🔴 2 unresolved comments`

### For Requestor View (My Requests)
- Show notification badge when there are unresolved comments
- Display comments in a thread-like view
- For each unresolved comment:
  - Show the comment content
  - Show an "Edit Request" button to update request data
  - Show a "Mark as Resolved" button with optional note input
- Disabled "Mark as Resolved" for already resolved comments (show ✅)

### Example UI Flow for Requestor:
```
┌─────────────────────────────────────────────────────┐
│ My Approval Request                     🔴 2 issues │
├─────────────────────────────────────────────────────┤
│ Request: Create Customer                            │
│ Status: Pending                                     │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💬 Admin John (Dec 20, 10:00 AM)                │ │
│ │ "Please fix the postal code"                    │ │
│ │                                                 │ │
│ │ [Edit Request Data] [Mark as Resolved]          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ✅ Admin John (Dec 20, 9:30 AM)                 │ │
│ │ "Add customer phone number"                     │ │
│ │ Resolved by you: "Added phone +123456789"       │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## TypeScript Types

```typescript
interface ApprovalComment {
  id: string;
  content: string;
  author: UserInfo;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: UserInfo | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface CreateCommentDto {
  content: string;
}

interface ResolveCommentDto {
  resolutionNote?: string;
}

interface UpdateRequestDataDto {
  requestData: Record<string, any>;
  updateReason?: string;
}

// Updated ApprovalRequest now includes:
interface ApprovalRequest {
  // ... existing fields ...
  comments?: ApprovalComment[];
  unresolvedCommentsCount?: number;
}
```

