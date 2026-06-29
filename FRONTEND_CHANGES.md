# Backend Changes — Frontend Integration Guide

This document covers all breaking changes and new endpoints introduced by the multi-tenant company system. Read this before updating any frontend auth or user-related code.

---

## Summary of What Changed

| Area | Change |
|---|---|
| Auth response shape | `role` field removed, replaced by `companyId`, `isAdministrator`, `roleId` |
| JWT payload | New fields: `companyId`, `isAdministrator`, `permissions[]`, `planTier` |
| Registration flow | New public endpoint replaces direct signup for end users |
| User invitation | New email-based invite flow |
| Company management | Entire new set of endpoints for administrators |
| User profile response | `role` removed, new fields added |

---

## Breaking Changes

### 1. Auth Response Shape — CHANGED

All endpoints that return a user object (`POST /auth/signin`, `POST /auth/register`, `POST /auth/accept-invite`) now return this shape:

**Before:**
```json
{
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "role": "admin"
  },
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 60
}
```

**After:**
```json
{
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "companyId": "uuid",
    "isAdministrator": false,
    "roleId": "uuid"
  },
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 60
}
```

**What to update:** Any place in the frontend that reads `user.role` to determine what the user can see or do. Replace with:
- `user.isAdministrator` — for administrator-only UI sections (user management, company settings)
- `user.roleId` — to display the user's assigned role name (fetch role details from `GET /companies/roles`)

---

### 2. JWT Payload — CHANGED

If the frontend decodes the JWT to read user info, the payload shape changed.

**Before:**
```json
{
  "sub": "uuid",
  "username": "john",
  "email": "john@example.com",
  "role": "admin",
  "type": "access"
}
```

**After:**
```json
{
  "sub": "uuid",
  "username": "john",
  "email": "john@example.com",
  "companyId": "uuid",
  "isAdministrator": false,
  "permissions": ["create_contract", "view_contract", "..."],
  "planTier": "standard",
  "type": "access"
}
```

**New fields available from the token:**
- `companyId` — the company this user belongs to
- `isAdministrator` — whether this user is the company administrator
- `permissions` — array of permission strings the user has
- `planTier` — `"basic"` | `"standard"` | `"premium"` — use this to show/hide features

---

### 3. GET /auth/profile — CHANGED

**Before:**
```json
{
  "id": "uuid",
  "username": "john",
  "role": "admin",
  "phone": "...",
  "department": "...",
  "lastLoginAt": "...",
  "createdAt": "..."
}
```

**After:**
```json
{
  "id": "uuid",
  "username": "john",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "active",
  "companyId": "uuid",
  "isAdministrator": false,
  "roleId": "uuid",
  "phone": "...",
  "department": "...",
  "lastLoginAt": "...",
  "createdAt": "..."
}
```

---

### 4. GET /auth/validate — CHANGED

**Before:**
```json
{
  "valid": true,
  "user": { "id": "...", "username": "...", "email": "...", "role": "admin" },
  "message": "Token is valid"
}
```

**After:**
```json
{
  "valid": true,
  "user": { "id": "...", "username": "...", "email": "...", "isAdministrator": false },
  "message": "Token is valid"
}
```

---

### 5. POST /auth/signup — CHANGED REQUEST BODY

The old `role` field is removed. This endpoint still works for internal/test use (requires secret key) but no longer accepts a role assignment.

**Removed field:** `role` (was `"admin"` | `"low_tier"`)

---

## New Endpoints

### Company Self-Registration

**POST /auth/register** — Public, no auth required

Creates a new company and the administrator account in one request. This is the main sign-up flow for new customers.

**Request:**
```json
{
  "companyName": "Acme Leasing",
  "administratorEmail": "admin@acme.com",
  "administratorPassword": "SecurePass123!",
  "administratorFirstName": "John",
  "administratorLastName": "Doe"
}
```

**Response:** Same auth response shape as signin (user + accessToken + refreshToken + expiresIn), plus:
```json
{
  "company": {
    "id": "uuid",
    "name": "Acme Leasing",
    "slug": "acme-leasing",
    "subscriptionPlan": "basic",
    "status": "trial",
    "trialEndsAt": "2026-07-12T..."
  },
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 60
}
```

---

### Accept Invite

**POST /auth/accept-invite** — Public, no auth required

Called when a user clicks the invite link in their email.

**Request:**
```json
{
  "token": "raw-token-from-email-link",
  "email": "invited@example.com",
  "password": "SecurePass123!",
  "username": "invited_user"
}
```

**Response:** Same auth response shape as signin (user + tokens).

**How to implement the invite flow:**
1. User receives email with a link like: `https://yourapp.com/accept-invite?token=xxx&email=user@example.com`
2. Frontend shows a "Set your password" form pre-filled with the email
3. On submit, call `POST /auth/accept-invite` with the token, email, chosen password, and chosen username
4. On success, redirect to dashboard (user is immediately logged in)

---

### Company Info

**GET /companies/me** — Requires auth (any user)

```json
{
  "id": "uuid",
  "name": "Acme Leasing",
  "slug": "acme-leasing",
  "subscriptionPlan": "standard",
  "status": "active",
  "trialEndsAt": null,
  "isActive": true,
  "maxUsers": 20,
  "currentUsers": 7
}
```

Use `planTier` from the JWT or `subscriptionPlan` from this endpoint to conditionally show/hide features:

| Feature | Basic | Standard | Premium |
|---|---|---|---|
| Approval workflows | No | Yes | Yes |
| Excel export | No | Yes | Yes |
| EURIBOR rate | No | Yes | Yes |
| AI Assistant | No | No | Yes |
| Custom roles | No | No | Yes |

**PATCH /companies/me** — Requires administrator

```json
{ "name": "New Company Name" }
```

---

### User Management (Administrator only)

All endpoints below require `isAdministrator: true`. Show them only in the admin panel.

---

**POST /companies/users/invite** — Invite a new user

```json
{
  "email": "newuser@acme.com",
  "roleId": "uuid-of-role",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

Response: `{ "message": "Invitation sent successfully" }`

---

**GET /companies/users** — List all users in company

```json
[
  {
    "id": "uuid",
    "username": "jane",
    "email": "jane@acme.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "status": "active",
    "isAdministrator": false,
    "roleId": "uuid",
    "createdAt": "..."
  }
]
```

---

**GET /companies/users/invites** — List pending invitations

```json
[
  {
    "id": "uuid",
    "email": "pending@acme.com",
    "firstName": "Pending",
    "lastName": "User",
    "roleId": "uuid",
    "expiresAt": "...",
    "createdAt": "..."
  }
]
```

---

**PATCH /companies/users/:id/role** — Change a user's role

```json
{ "roleId": "uuid-of-new-role" }
```

---

**PATCH /companies/users/:id/status** — Activate or suspend a user

```json
{ "status": "active" }
```

Values: `"active"` | `"inactive"` | `"suspended"`

---

**DELETE /companies/users/:id** — Remove user from company

Sets user status to inactive. Returns: `{ "message": "User removed from company" }`

---

**DELETE /companies/users/invites/:id** — Cancel a pending invitation

Returns: `{ "message": "Invitation cancelled" }`

---

### Role Management

**GET /companies/roles** — List all roles available to this company (any authenticated user)

Returns system roles + custom roles (for Premium companies):

```json
[
  {
    "id": "uuid",
    "name": "admin",
    "description": "Full operational access",
    "isSystemRole": true,
    "permissions": ["create_contract", "view_contract", "..."],
    "companyId": null
  },
  {
    "id": "uuid",
    "name": "My Custom Role",
    "description": "...",
    "isSystemRole": false,
    "permissions": ["view_contract", "view_customer"],
    "companyId": "uuid"
  }
]
```

**System role names:** `administrator`, `admin`, `manager`, `accountant`, `collections_officer`, `basic_user`

---

**POST /companies/roles** — Create custom role (Premium plan only)

```json
{
  "name": "Senior Analyst",
  "description": "Can view and approve contracts",
  "permissions": ["view_contract", "approve_contract", "view_customer", "view_payment"]
}
```

---

**PATCH /companies/roles/:id** — Update custom role (Premium plan only)

```json
{
  "name": "Updated Name",
  "permissions": ["view_contract", "view_customer"]
}
```

---

**DELETE /companies/roles/:id** — Delete custom role (Premium plan only)

Only works if no users are currently assigned to this role.

---

## Full Permissions List

Use these values when building the custom role form for Premium companies:

| Permission | What it allows |
|---|---|
| `create_user` | Invite / create users |
| `update_user` | Edit user details |
| `delete_user` | Remove users |
| `view_user` | See user list |
| `create_customer` | Add new customers |
| `update_customer` | Edit customers |
| `delete_customer` | Delete customers |
| `view_customer` | View customers |
| `create_contract` | Create contracts |
| `update_contract` | Edit contracts |
| `delete_contract` | Delete contracts |
| `view_contract` | View contracts |
| `approve_contract` | Approve contracts |
| `create_vehicle` | Add vehicles |
| `update_vehicle` | Edit vehicles |
| `delete_vehicle` | Delete vehicles |
| `view_vehicle` | View vehicles |
| `create_payment` | Record payments |
| `update_payment` | Edit payments |
| `delete_payment` | Delete payments |
| `view_payment` | View payments |
| `approve_payment` | Approve payments |
| `create_document` | Upload documents |
| `update_document` | Edit documents |
| `delete_document` | Delete documents |
| `view_document` | View documents |
| `approve_actions` | Approve pending requests from other users |
| `view_pending_approvals` | See the approvals queue |
| `view_audit_logs` | Access audit trail |
| `manage_system` | System-level settings |

---

## Recommended UI Changes

### Login / Registration Flow
- Replace any "Sign Up" form that asks for username/email/password/secret-key with the new **company registration form** (`POST /auth/register`)
- Add an **Accept Invite** page at the route the invite email links to (e.g. `/accept-invite`) that reads `token` and `email` from query params

### After Login — Store These
From the JWT or auth response, store and use:
- `companyId` — send with any requests that need it (most don't, the backend reads it from the token)
- `isAdministrator` — controls visibility of the admin panel
- `permissions[]` — use this array to show/hide specific buttons and pages without extra API calls
- `planTier` — use this to gate premium features in the UI

### Admin Panel (new section needed)
Show only when `isAdministrator === true`:
- **Users tab** — list users, change roles, suspend/remove, see pending invites, cancel invites
- **Invite User button** — opens form with email + role selector (fetched from `GET /companies/roles`)
- **Roles tab** (Premium only, check `planTier === "premium"`) — create/edit/delete custom roles with permission checkboxes
- **Company Settings** — edit company name

### Feature Gating by Plan
Use `planTier` from the JWT to conditionally render:
```js
// Example
if (planTier === 'basic') {
  // hide: approval workflows, EURIBOR, Excel export, AI assistant
}
if (planTier !== 'premium') {
  // hide: AI assistant, custom role management, API access section
}
```
