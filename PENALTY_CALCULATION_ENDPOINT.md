# Late Payment Penalty Calculation Endpoint

## Overview

A new endpoint has been added to calculate late payment penalties for preview purposes. This allows users to see what penalties would be applied to a late payment over a specified period, regardless of whether `applyPenalties` is currently enabled on the payment.

## Endpoint

```
POST /api/payments/:id/calculate-penalties
```

**Permission Required:** `VIEW_PAYMENT`

## Use Cases

1. **Preview Penalties**: Show customers what they would owe if payment is delayed by X days
2. **What-If Scenarios**: Calculate penalties for different time periods without actually applying them
3. **Decision Support**: Help users decide whether to enable automatic penalty accrual
4. **Customer Communication**: Provide accurate penalty estimates to customers

## Request

### Path Parameters

- `id` (string, required): Payment ID (UUID)

### Body (optional)

```typescript
{
  daysLate?: number;        // Calculate for specific number of days late
  customEndDate?: string;   // Calculate up to a specific date (YYYY-MM-DD)
}
```

**Note:** If no body is provided, calculates from due date to today.

## Examples

### Example 1: Calculate to Today

```bash
POST /api/payments/123e4567-e89b-12d3-a456-426614174000/calculate-penalties
Content-Type: application/json

{}
```

### Example 2: Calculate for 14 Days Late

```bash
POST /api/payments/123e4567-e89b-12d3-a456-426614174000/calculate-penalties
Content-Type: application/json

{
  "daysLate": 14
}
```

### Example 3: Calculate to Specific Date

```bash
POST /api/payments/123e4567-e89b-12d3-a456-426614174000/calculate-penalties
Content-Type: application/json

{
  "customEndDate": "2026-02-15"
}
```

## Response

```typescript
{
  paymentId: string;              // Payment ID
  originalAmount: number;         // Original payment amount
  paidAmount: number;             // Amount already paid
  remainingDue: number;           // Remaining amount due
  dueDate: string;                // Payment due date (YYYY-MM-DD)
  calculationEndDate: string;     // Date penalties calculated up to
  daysLate: number;               // Number of days late
  dailyPenaltyRate: number;       // Daily penalty rate (e.g., 0.001 = 0.1%)
  totalPenalty: number;           // Total penalty amount
  totalAmountDue: number;         // Total amount due including penalties
  dailyBreakdown: Array<{         // Day-by-day breakdown
    day: number;                  // Day number (1, 2, 3...)
    date: string;                 // Date (YYYY-MM-DD)
    baseAmount: number;           // Base amount used for calculation
    penaltyAmount: number;        // Penalty for this day
    cumulativePenalty: number;    // Total penalty up to this day
  }>;
  penaltiesEnabled: boolean;      // Whether penalties are enabled
  note: string;                   // Information about penalty status
}
```

### Example Response

```json
{
  "paymentId": "123e4567-e89b-12d3-a456-426614174000",
  "originalAmount": 1250.50,
  "paidAmount": 500.00,
  "remainingDue": 750.50,
  "dueDate": "2026-01-15",
  "calculationEndDate": "2026-01-29",
  "daysLate": 14,
  "dailyPenaltyRate": 0.001,
  "totalPenalty": 10.51,
  "totalAmountDue": 761.01,
  "dailyBreakdown": [
    {
      "day": 1,
      "date": "2026-01-16",
      "baseAmount": 750.50,
      "penaltyAmount": 0.75,
      "cumulativePenalty": 0.75
    },
    {
      "day": 2,
      "date": "2026-01-17",
      "baseAmount": 750.50,
      "penaltyAmount": 0.75,
      "cumulativePenalty": 1.50
    },
    // ... continues for all 14 days
  ],
  "penaltiesEnabled": false,
  "note": "Penalties are currently disabled for this payment. This is a preview calculation only."
}
```

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Payment with ID \"xxx\" not found",
  "error": "Not Found"
}
```

### 400 Bad Request - Payment Fully Paid
```json
{
  "statusCode": 400,
  "message": "Payment is fully paid. No penalties to calculate.",
  "error": "Bad Request"
}
```

### 400 Bad Request - No Penalty Rate
```json
{
  "statusCode": 400,
  "message": "Payment has no penalty rate configured (latePenaltyRatePerDay is 0 or not set).",
  "error": "Bad Request"
}
```

### 400 Bad Request - Not Yet Late
```json
{
  "statusCode": 400,
  "message": "Payment is not yet late. Penalties only apply after the due date.",
  "error": "Bad Request"
}
```

### 400 Bad Request - Invalid End Date
```json
{
  "statusCode": 400,
  "message": "customEndDate must be after the payment due date",
  "error": "Bad Request"
}
```

## How Penalties Are Calculated

1. **Base Amount**: Uses the remaining due amount (original amount - paid amount)
2. **Start Date**: Penalties start accruing the day **after** the due date
3. **Daily Calculation**: `penaltyAmount = remainingDue × dailyPenaltyRate`
4. **Cumulative**: Penalties accumulate daily over the specified period
5. **Rounding**: All amounts are rounded to 2 decimal places

### Formula

```
For each day after due date:
  dailyPenalty = remainingDue × latePenaltyRatePerDay
  totalPenalty = sum of all dailyPenalties
  totalAmountDue = remainingDue + totalPenalty
```

## Important Notes

1. **Preview Only**: This endpoint does NOT apply penalties to the payment. It only calculates what they would be.

2. **Works Regardless of `applyPenalties` Flag**: You can calculate penalties even if `applyPenalties` is set to `false` on the payment.

3. **Actual Accrual**: If `applyPenalties` is `true`, penalties are automatically accrued daily by the `PaymentPenaltySchedulerService` cron job.

4. **Partial Payments**: The calculation uses the remaining due amount (original - paid), so it works correctly for partially paid payments.

5. **No Modification**: This endpoint is read-only and does not modify any payment data.

## Related Endpoints

- `PATCH /api/payments/:id/penalties` - Enable/disable penalties or update penalty rate
- `GET /api/payments/:id` - Get payment details including current penalty status

## Frontend Integration Example

```typescript
// Calculate penalties for 30 days
const response = await fetch(`/api/payments/${paymentId}/calculate-penalties`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    daysLate: 30
  })
});

const result = await response.json();

// Show customer the breakdown
console.log(`If you pay in 30 days, you'll owe:`);
console.log(`Original: $${result.remainingDue}`);
console.log(`Penalties: $${result.totalPenalty}`);
console.log(`Total: $${result.totalAmountDue}`);
```

## Files Modified

- `src/domains/payments/dtos/calculate-penalty.dto.ts` - New DTOs
- `src/domains/payments/services/payments.service.ts` - Added `calculatePenalties()` method
- `src/domains/payments/controllers/payments.controller.ts` - Added endpoint
- `src/domains/payments/index.ts` - Export new DTOs
