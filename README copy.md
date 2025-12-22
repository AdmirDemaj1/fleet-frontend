# Dynamic Report Generation API

This document describes how to use the dynamic report generation API that allows users to select entities, choose relations, apply filters, and generate Excel reports.

## Overview

The dynamic report system enables flexible report generation where users can:
1. Select a main entity (Customer, Contract, Payment, Vehicle, or Collateral)
2. Choose one or multiple related entities to include
3. Apply filters on the main entity and/or related entities
4. Sort the results
5. Generate an Excel file with all selected data

## Base URL

```
http://localhost:3000/reports
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Available Relations for an Entity

Get all possible relations that can be selected for a given entity type.

**Endpoint:** `GET /reports/dynamic/entities/relations`

**Query Parameters:**
- `entityType` (required): One of `customer`, `contract`, `payment`, `vehicle`, `collateral`

**Response:**
```json
[
  "contracts",
  "payments",
  "vehicles",
  "collaterals",
  "logs"
]
```

**Example:**
```bash
GET /reports/dynamic/entities/relations?entityType=customer
```

### 2. Get Available Filter Fields

Get all filterable fields for the main entity and selected relations.

**Endpoint:** `GET /reports/dynamic/entities/filter-fields`

**Query Parameters:**
- `entityType` (required): One of `customer`, `contract`, `payment`, `vehicle`, `collateral`
- `relations` (optional): Comma-separated list of relations (e.g., `contracts,payments`)

**Response:**
```json
{
  "customer": [
    "id",
    "type",
    "status",
    "email",
    "phone",
    "address",
    "creditBalance",
    "createdAt",
    "updatedAt"
  ],
  "contracts": [
    "id",
    "contractNumber",
    "type",
    "status",
    "startDate",
    "endDate",
    "totalAmount",
    "remainingAmount",
    "createdAt",
    "updatedAt"
  ],
  "payments": [
    "id",
    "amount",
    "status",
    "type",
    "dueDate",
    "paymentDate",
    "paymentNumber",
    "createdAt",
    "updatedAt"
  ]
}
```

**Example:**
```bash
GET /reports/dynamic/entities/filter-fields?entityType=customer&relations=contracts,payments
```

### 3. Generate Dynamic Report

Generate an Excel report based on entity selection, relations, and filters.

**Endpoint:** `POST /reports/dynamic/generate`

**Content-Type:** `application/json`

**Accept:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Request Body:**
```typescript
{
  entityType: "customer" | "contract" | "payment" | "vehicle" | "collateral";
  relations?: string[]; // Optional: selected relations to include
  filters?: FilterCondition[]; // Optional: filter conditions
  sortBy?: string; // Optional: field to sort by (e.g., "createdAt" or "contracts.startDate")
  sortOrder?: "asc" | "desc"; // Optional: sort direction (default: "desc")
  options?: {
    includeAllFields?: boolean; // Optional: include all entity fields
    limit?: number; // Optional: limit number of records
    offset?: number; // Optional: pagination offset
  };
}
```

**FilterCondition:**
```typescript
{
  field: string; // Field name (e.g., "status", "email", "contracts.status")
  operator: "equals" | "not_equals" | "in" | "not_in" | "greater_than" | 
            "greater_than_or_equal" | "less_than" | "less_than_or_equal" | 
            "between" | "like" | "is_null" | "is_not_null";
  value?: any; // Value(s) for the filter (string, number, array, etc.)
  relation?: string; // Optional: which relation this filter applies to
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Binary Excel file (.xlsx)
- Filename in Content-Disposition header

## Entity Types and Relations

### Customer Entity
**Available Relations:**
- `contracts` - Customer's contracts
- `payments` - Customer's payments
- `vehicles` - Vehicles assigned to customer (via currentClientId)
- `collaterals` - Customer's collaterals
- `logs` - Customer activity logs

**Example Filter Fields:**
- `status` (enum: active, passive, pending, suspended, inactive, blacklisted)
- `type` (enum: individual, business)
- `email`, `phone`, `address`
- `creditBalance`
- `createdAt`, `updatedAt`

### Contract Entity
**Available Relations:**
- `customer` - Contract's customer
- `payments` - Contract's payments
- `collaterals` - Contract's collaterals
- `vehicle` - Vehicle associated with contract

**Example Filter Fields:**
- `status` (enum: draft, active, completed, cancelled, defaulted)
- `type` (enum: loan, leasing)
- `contractNumber`
- `startDate`, `endDate`
- `totalAmount`, `remainingAmount`
- `createdAt`, `updatedAt`

### Payment Entity
**Available Relations:**
- `contract` - Payment's contract
- `customer` - Payment's customer

**Example Filter Fields:**
- `status` (enum: pending, paid, late, defaulted)
- `type` (enum: scheduled, advance, extra)
- `amount`, `principalAmount`, `interestAmount`
- `dueDate`, `paymentDate`
- `paymentNumber`
- `createdAt`, `updatedAt`

### Vehicle Entity
**Available Relations:**
- `currentClient` - Current customer using the vehicle
- `contract` - Contract associated with vehicle
- `maintenanceRecords` - Vehicle maintenance records

**Example Filter Fields:**
- `status` (enum: AVAILABLE, LEASED, MAINTENANCE, SOLD, LIQUID_ASSET)
- `conditionStatus` (enum: EXCELLENT, GOOD, FAIR, POOR, NEEDS_REPAIR)
- `licensePlate`, `vin`
- `make`, `model`, `year`
- `purchaseValue`, `currentValuation`, `marketValue`
- `createdAt`, `updatedAt`

### Collateral Entity
**Available Relations:**
- `contract` - Collateral's contract
- `customer` - Collateral's customer

**Example Filter Fields:**
- `type` (enum: vehicle, property, personal_guarantee, other)
- `description`, `value`
- `active` (boolean)
- `createdAt`, `updatedAt`

## Filter Operators

### Comparison Operators

#### `equals`
Exact match:
```json
{
  "field": "status",
  "operator": "equals",
  "value": "active"
}
```

#### `not_equals`
Not equal:
```json
{
  "field": "status",
  "operator": "not_equals",
  "value": "inactive"
}
```

#### `in`
Value in array:
```json
{
  "field": "status",
  "operator": "in",
  "value": ["active", "defaulted"]
}
```

#### `not_in`
Value not in array:
```json
{
  "field": "status",
  "operator": "not_in",
  "value": ["cancelled", "completed"]
}
```

### Range Operators

#### `greater_than`
```json
{
  "field": "dueDate",
  "operator": "greater_than",
  "value": "2024-01-01"
}
```

#### `greater_than_or_equal`
```json
{
  "field": "totalAmount",
  "operator": "greater_than_or_equal",
  "value": 10000
}
```

#### `less_than`
```json
{
  "field": "endDate",
  "operator": "less_than",
  "value": "2024-12-31"
}
```

#### `less_than_or_equal`
```json
{
  "field": "remainingAmount",
  "operator": "less_than_or_equal",
  "value": 5000
}
```

#### `between`
Range between two values:
```json
{
  "field": "startDate",
  "operator": "between",
  "value": ["2024-01-01", "2024-12-31"]
}
```

### Text Operators

#### `like`
Pattern matching (case-insensitive):
```json
{
  "field": "email",
  "operator": "like",
  "value": "gmail"
}
```

### Null Operators

#### `is_null`
Check if field is null:
```json
{
  "field": "paymentDate",
  "operator": "is_null"
}
```

#### `is_not_null`
Check if field is not null:
```json
{
  "field": "paymentDate",
  "operator": "is_not_null"
}
```

## Filtering on Relations

To filter on a related entity, specify the `relation` field in the filter:

```json
{
  "field": "status",
  "operator": "in",
  "value": ["active", "defaulted"],
  "relation": "contracts"
}
```

This filters customers who have contracts with status "active" or "defaulted".

You can also use dot notation in the field name:

```json
{
  "field": "contracts.status",
  "operator": "in",
  "value": ["active", "defaulted"]
}
```

## Examples

### Example 1: Customer Report with Contracts and Payments

**Request:**
```json
{
  "entityType": "customer",
  "relations": ["contracts", "payments"],
  "filters": [
    {
      "field": "status",
      "operator": "equals",
      "value": "active"
    },
    {
      "field": "status",
      "operator": "in",
      "value": ["active", "defaulted"],
      "relation": "contracts"
    },
    {
      "field": "dueDate",
      "operator": "greater_than",
      "value": "2024-01-01",
      "relation": "payments"
    }
  ],
  "sortBy": "contracts.startDate",
  "sortOrder": "desc"
}
```

**Frontend Implementation (JavaScript/TypeScript):**
```typescript
async function generateCustomerReport() {
  const response = await fetch('http://localhost:3000/reports/dynamic/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    body: JSON.stringify({
      entityType: 'customer',
      relations: ['contracts', 'payments'],
      filters: [
        {
          field: 'status',
          operator: 'equals',
          value: 'active'
        },
        {
          field: 'status',
          operator: 'in',
          value: ['active', 'defaulted'],
          relation: 'contracts'
        },
        {
          field: 'dueDate',
          operator: 'greater_than',
          value: '2024-01-01',
          relation: 'payments'
        }
      ],
      sortBy: 'contracts.startDate',
      sortOrder: 'desc'
    })
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-report.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const error = await response.json();
    console.error('Error:', error);
  }
}
```

### Example 2: Contract Report with Customer and Payments

**Request:**
```json
{
  "entityType": "contract",
  "relations": ["customer", "payments"],
  "filters": [
    {
      "field": "type",
      "operator": "equals",
      "value": "loan"
    },
    {
      "field": "status",
      "operator": "equals",
      "value": "active"
    },
    {
      "field": "status",
      "operator": "equals",
      "value": "pending",
      "relation": "payments"
    }
  ],
  "sortBy": "startDate",
  "sortOrder": "asc"
}
```

### Example 3: Payment Report with Contract and Customer

**Request:**
```json
{
  "entityType": "payment",
  "relations": ["contract", "customer"],
  "filters": [
    {
      "field": "status",
      "operator": "in",
      "value": ["pending", "late"]
    },
    {
      "field": "dueDate",
      "operator": "between",
      "value": ["2024-01-01", "2024-12-31"]
    }
  ],
  "sortBy": "dueDate",
  "sortOrder": "asc"
}
```

### Example 4: Vehicle Report with Current Client

**Request:**
```json
{
  "entityType": "vehicle",
  "relations": ["currentClient", "contract"],
  "filters": [
    {
      "field": "status",
      "operator": "equals",
      "value": "LEASED"
    },
    {
      "field": "email",
      "operator": "like",
      "value": "gmail",
      "relation": "currentClient"
    }
  ],
  "sortBy": "year",
  "sortOrder": "desc"
}
```

## Frontend Implementation Guide

### Step 1: Build the UI

1. **Entity Selection Dropdown**
   - Options: Customer, Contract, Payment, Vehicle, Collateral
   - On selection, fetch available relations

2. **Relation Selection (Multi-select)**
   - Fetch relations when entity is selected: `GET /reports/dynamic/entities/relations?entityType={entityType}`
   - Allow multiple selections
   - On selection, fetch available filter fields

3. **Filter Builder**
   - For each filter, provide:
     - Field dropdown (populated from filter fields endpoint)
     - Operator dropdown
     - Value input (text, number, date, or multi-select for arrays)
     - Relation selector (if relations are selected)
   - Allow adding/removing multiple filters

4. **Sorting Options**
   - Sort by field dropdown
   - Sort order toggle (asc/desc)

5. **Generate Button**
   - On click, send POST request and download Excel file

### Step 2: Fetch Available Relations

```typescript
async function getAvailableRelations(entityType: string): Promise<string[]> {
  const response = await fetch(
    `http://localhost:3000/reports/dynamic/entities/relations?entityType=${entityType}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}
```

### Step 3: Fetch Available Filter Fields

```typescript
async function getAvailableFilterFields(
  entityType: string,
  relations: string[]
): Promise<Record<string, string[]>> {
  const relationsParam = relations.join(',');
  const response = await fetch(
    `http://localhost:3000/reports/dynamic/entities/filter-fields?entityType=${entityType}&relations=${relationsParam}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return await response.json();
}
```

### Step 4: Generate and Download Report

```typescript
async function generateReport(requestBody: GenerateDynamicReportDto) {
  const response = await fetch('http://localhost:3000/reports/dynamic/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate report');
  }

  // Get filename from Content-Disposition header
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    : 'report.xlsx';

  // Download file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

## Error Handling

### Common Errors

**400 Bad Request:**
- Invalid entity type
- Invalid relation for entity
- Invalid filter field
- Invalid operator
- Missing required parameters

**Response:**
```json
{
  "message": "Invalid relations for customer: invalidRelation. Valid relations: contracts, payments, vehicles, collaterals, logs",
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 Unauthorized:**
- Missing or invalid authentication token

**500 Internal Server Error:**
- Database errors
- Query execution errors

**Response:**
```json
{
  "message": "Failed to generate dynamic report",
  "error": "Error message details"
}
```

## TypeScript Interfaces

```typescript
enum ReportEntityType {
  CUSTOMER = 'customer',
  CONTRACT = 'contract',
  PAYMENT = 'payment',
  VEHICLE = 'vehicle',
  COLLATERAL = 'collateral'
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  BETWEEN = 'between',
  LIKE = 'like',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
  relation?: string;
}

interface GenerateDynamicReportDto {
  entityType: ReportEntityType;
  relations?: string[];
  filters?: FilterCondition[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  options?: {
    includeAllFields?: boolean;
    limit?: number;
    offset?: number;
  };
}
```

## Notes

1. **Enum Fields**: Fields like `status`, `type`, `conditionStatus` are automatically cast to TEXT in queries to avoid PostgreSQL enum type mismatch errors.

2. **Date Formats**: Use ISO 8601 format for dates: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`

3. **Array Values**: For `in`, `not_in`, and `between` operators, provide arrays as values.

4. **Relation Filters**: When filtering on relations, ensure the relation is included in the `relations` array.

5. **Sorting**: You can sort by main entity fields or relation fields using dot notation (e.g., `contracts.startDate`).

6. **Excel Output**: The generated Excel file includes:
   - All fields from the main entity
   - All fields from selected relations (flattened)
   - Proper formatting (dates, numbers, currencies)
   - Alternating row colors for readability
   - Headers with blue background and white text

## Testing

Use the following curl command to test:

```bash
curl -X 'POST' \
  'http://localhost:3000/reports/dynamic/generate' \
  -H 'accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "entityType": "customer",
  "relations": ["contracts", "payments"],
  "filters": [
    {
      "field": "status",
      "operator": "equals",
      "value": "active"
    },
    {
      "field": "status",
      "operator": "in",
      "value": ["active", "defaulted"],
      "relation": "contracts"
    }
  ],
  "sortBy": "contracts.startDate",
  "sortOrder": "desc"
}' \
  --output report.xlsx
```

