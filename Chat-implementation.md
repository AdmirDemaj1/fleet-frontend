# AI Chat Integration — Fleet Credit System

## Overview

An AI-powered chat assistant has been added to the backend. Accountants and administrators can ask natural-language questions and receive answers backed by live data from the system — contracts, payments, customers, vehicles, EURIBOR rates, and reports.

The assistant is powered by **Claude (Anthropic)** and uses tool-calling to query the real database through the existing services. It is read-only by design.

---

## What Was Implemented (Backend)

### New module: `src/domains/chat/`

| File | Purpose |
|---|---|
| `chat.module.ts` | NestJS module — wires all dependencies |
| `chat.controller.ts` | Exposes `POST /chat` HTTP endpoint |
| `chat.service.ts` | Manages Claude API calls, agentic loop, and session history |
| `dto/chat.dto.ts` | Request/response DTOs |
| `tools/tool-definitions.ts` | 14 read-only tools exposed to Claude (JSON Schema) |
| `tools/tool-executor.ts` | Maps Claude tool calls to real service methods |

### Endpoint

```
POST /chat
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request body:**
```json
{
  "message": "Show me all overdue payments",
  "sessionId": "optional-uuid-to-continue-a-conversation"
}
```

**Response:**
```json
{
  "response": "There are currently 8 overdue payments totalling €24,300...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

- `sessionId` is auto-generated on the first message. Pass it back in subsequent requests to maintain conversation context.
- Sessions expire after **1 hour of inactivity** and are held in memory (reset on server restart).

### Tools available to the AI

The assistant can call the following tools autonomously based on the user's question:

| Tool | What it does |
|---|---|
| `list_contracts` | List/search contracts by type, status, or keyword |
| `get_contract` | Full contract details including vehicles, collaterals, and financial analysis |
| `get_customer_contracts` | All contracts for a specific customer |
| `list_customers` | List/search customers by name, fiscal code, email, or status |
| `get_customer` | Detailed customer profile including contracts and collateral |
| `list_payments` | List payments across all contracts, filterable by status or type |
| `get_payment` | Single payment with audit history |
| `get_customer_payments` | All payments for a specific customer |
| `get_amortization_schedule` | Full installment schedule for a contract |
| `list_vehicles` | Fleet vehicles, filterable by status or customer |
| `get_vehicle_statistics` | Aggregate fleet stats (totals, valuations) |
| `get_vehicles_expiring_insurance` | Vehicles with insurance expiring within N days |
| `get_euribor_rates` | Current EURIBOR rates for all tenors (3M, 6M, 12M) |
| `get_euribor_history` | Historical EURIBOR rates for a given tenor and period |
| `generate_report` | Dynamic report on any entity type with custom filters |

### Authentication

The endpoint is protected by the existing global JWT guard. The frontend must send a valid Bearer token — no additional auth setup is required.

### Environment variable required

Add the following to your `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get the API key from [console.anthropic.com](https://console.anthropic.com).

---

## What Needs to Be Implemented (Frontend)

### 1. Chat UI component

A chat panel or page where users can type messages and read responses. Suggested approach:

- A sidebar or drawer that can be toggled from anywhere in the app
- A scrollable message list (user messages on the right, assistant on the left)
- A text input with a send button at the bottom
- Loading/typing indicator while waiting for the response

### 2. Session management

- On the **first message**, the backend returns a `sessionId`. Store it in component state (not localStorage — sessions expire on server restart anyway).
- On **every subsequent message** in the same conversation, include the `sessionId` in the request body.
- When the user starts a **new conversation** (e.g. clicks "New chat"), discard the `sessionId` so the next message starts a fresh session.

### 3. API call

```ts
// POST /chat
const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: userInput,
    sessionId: currentSessionId ?? undefined,
  }),
});

const data = await response.json();
// data.response  → assistant message to display
// data.sessionId → store this for the next request
```

### 4. Error handling

| HTTP status | Meaning | Suggested UI behaviour |
|---|---|---|
| `401` | Missing or expired JWT | Redirect to login |
| `400` | Empty message sent | Show inline validation |
| `500` | Server error or Claude API failure | Show a "Something went wrong, try again" message |

### 5. UX recommendations

- **Markdown rendering**: The assistant often returns text with bullet points, bold text, and tables. Render the response as Markdown (e.g. using `react-markdown`) rather than plain text.
- **Timestamps**: Show a timestamp on each message.
- **Copy to clipboard**: Add a copy button on assistant messages — useful for sharing figures with colleagues.
- **Suggested prompts**: On first open, show 3–4 example questions to help users get started, e.g.:
  - "How many active contracts do we have?"
  - "Show me all overdue payments"
  - "What are the current EURIBOR rates?"
  - "List customers with contracts expiring this month"
- **Disable input while loading**: Prevent sending a second message before the first response arrives.

---

## Example conversation flow

```
User:    "Show me contracts expiring this month"
Claude:  [calls list_contracts with status=ACTIVE]
Claude:  "There are 4 active contracts expiring in June 2026: ..."

User:    "Which of those have overdue payments?"
Claude:  [calls get_customer_payments for each contract's customer]
Claude:  "Contracts #C-2024-011 and #C-2024-019 have overdue installments..."

User:    "Generate a report for all of them"
Claude:  [calls generate_report with filters]
Claude:  "Here is the full report: ..."
```

The backend handles the full multi-turn conversation — the frontend only needs to pass the `sessionId` to maintain context.
