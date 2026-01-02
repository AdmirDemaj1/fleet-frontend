# Frontend Document Optimistic Update Flow Guide

This guide explains how the frontend should implement the optimistic document update system with versioning.

## Overview

The system uses **optimistic updates** where documents are uploaded with `PENDING` status and only activated when the entity update is committed. This prevents data loss and orphaned documents.

## Document Lifecycle Statuses

- **PENDING**: Document uploaded but not yet confirmed (awaiting entity update)
- **ACTIVE**: Document is confirmed and part of an entity (visible to users)
- **SUPERSEDED**: Document was replaced by a newer version (kept for history)
- **DELETED**: Document was explicitly deleted by user

## Flow Diagrams

### Scenario 1: Replacing a Document During Entity Update

```
User Action Flow:
1. User opens entity edit form (e.g., Vehicle edit)
2. User clicks "Replace Document" for an existing document
3. User selects new file
4. Frontend uploads document with PENDING status
5. User continues editing other fields
6. User clicks "Save" to commit all changes
7. Frontend commits pending documents atomically with entity update
8. Success: New document is ACTIVE, old document is SUPERSEDED
```

### Scenario 2: User Cancels Update

```
User Action Flow:
1. User uploads pending document(s)
2. User clicks "Cancel" or navigates away
3. Frontend calls cleanup endpoint to delete pending documents
4. Pending documents marked as DELETED
```

## API Endpoints

### 1. Upload Pending Document

**Endpoint:** `POST /documents/upload/pending`

**When to use:** When user uploads/replaces a document during entity editing (before saving)

**Request:**
```typescript
// FormData
{
  file: File,
  type: DocumentType, // e.g., 'vehicle_registration'
  title: string,
  description?: string,
  vehicleId?: string, // or customerId, contractId, administratorId
  replacesDocumentId?: string, // ID of document being replaced
  expiryDate?: string,
  metadata?: object
}
```

**Response:**
```typescript
{
  id: string,
  version: number,
  lifecycleStatus: 'PENDING',
  parentDocumentId?: string, // If replacing
  isCurrent: false,
  // ... other document fields
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'vehicle_registration');
formData.append('title', 'Vehicle Registration Certificate');
formData.append('vehicleId', vehicleId);
formData.append('replacesDocumentId', oldDocumentId); // If replacing

const response = await api.post('/documents/upload/pending', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Store pending document ID for later commit
pendingDocumentIds.push(response.data.id);
```

---

### 2. Get Pending Documents

**Endpoint:** `GET /documents/pending/:entityType/:entityId`

**When to use:** 
- On page load to show pending documents
- After upload to refresh the list
- Before committing to verify pending documents

**Request:**
```typescript
// URL parameters
entityType: 'customer' | 'vehicle' | 'contract' | 'administrator'
entityId: string (UUID)
```

**Response:**
```typescript
[
  {
    id: string,
    version: number,
    lifecycleStatus: 'PENDING',
    parentDocumentId?: string,
    isCurrent: false,
    // ... other document fields
  }
]
```

**Example:**
```typescript
// Get all pending documents for a vehicle
const pendingDocs = await api.get(
  `/documents/pending/vehicle/${vehicleId}`
);

// Display in UI with "Pending" badge
pendingDocs.forEach(doc => {
  console.log(`Pending: ${doc.title} (v${doc.version})`);
});
```

---

### 3. Commit Pending Documents (During Entity Update)

**Endpoint:** `POST /documents/commit-pending`

**When to use:** When user clicks "Save" on entity edit form - call this **within the entity update transaction**

**Request:**
```typescript
{
  pendingDocumentIds: string[], // Array of pending document IDs to activate
  entityType: 'customer' | 'vehicle' | 'contract' | 'administrator',
  entityId: string
}
```

**Response:**
```typescript
{
  message: string,
  committedCount: number
}
```

**Example:**
```typescript
// During vehicle update
async function updateVehicle(vehicleId: string, vehicleData: any, pendingDocIds: string[]) {
  // Option A: Commit documents first, then update entity
  if (pendingDocIds.length > 0) {
    await api.post('/documents/commit-pending', {
      pendingDocumentIds: pendingDocIds,
      entityType: 'vehicle',
      entityId: vehicleId
    });
  }
  
  // Then update the vehicle
  await api.patch(`/vehicles/${vehicleId}`, vehicleData);
  
  // Option B: Backend handles both in transaction (recommended)
  // See "Recommended Backend Integration" section below
}
```

---

### 4. Delete Pending Documents (Cleanup)

**Endpoint:** `DELETE /documents/pending`

**When to use:** 
- User clicks "Cancel" on edit form
- User navigates away from edit page
- Component unmounts with pending documents

**Request:**
```typescript
{
  pendingDocumentIds: string[]
}
```

**Response:**
```typescript
{
  message: string,
  deletedCount: number
}
```

**Example:**
```typescript
// Cleanup on cancel
async function handleCancel(pendingDocumentIds: string[]) {
  if (pendingDocumentIds.length > 0) {
    await api.delete('/documents/pending', {
      data: { pendingDocumentIds }
    });
  }
  
  // Navigate away or reset form
  router.back();
}

// Cleanup on component unmount
useEffect(() => {
  return () => {
    if (pendingDocumentIds.length > 0) {
      // Cleanup pending documents
      api.delete('/documents/pending', {
        data: { pendingDocumentIds }
      }).catch(console.error);
    }
  };
}, []);
```

---

## Complete Frontend Implementation Flow

### Step-by-Step: Vehicle Update with Document Replacement

```typescript
// 1. Component State
const [vehicle, setVehicle] = useState<Vehicle>(null);
const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
const [pendingDocumentIds, setPendingDocumentIds] = useState<string[]>([]);

// 2. Load existing documents on mount
useEffect(() => {
  loadVehicle(vehicleId);
  loadPendingDocuments(vehicleId);
}, [vehicleId]);

async function loadPendingDocuments(vehicleId: string) {
  const docs = await api.get(`/documents/pending/vehicle/${vehicleId}`);
  setPendingDocuments(docs);
  setPendingDocumentIds(docs.map(d => d.id));
}

// 3. Handle document replacement
async function handleReplaceDocument(oldDocument: Document, newFile: File) {
  const formData = new FormData();
  formData.append('file', newFile);
  formData.append('type', oldDocument.type);
  formData.append('title', oldDocument.title);
  formData.append('vehicleId', vehicleId);
  formData.append('replacesDocumentId', oldDocument.id);
  
  const newDoc = await api.post('/documents/upload/pending', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Update UI to show pending document
  setPendingDocuments([...pendingDocuments, newDoc]);
  setPendingDocumentIds([...pendingDocumentIds, newDoc.id]);
  
  // Show success message
  toast.success('Document uploaded. Click Save to confirm.');
}

// 4. Handle save (commit all changes)
async function handleSave() {
  try {
    // Commit pending documents first
    if (pendingDocumentIds.length > 0) {
      await api.post('/documents/commit-pending', {
        pendingDocumentIds: pendingDocumentIds,
        entityType: 'vehicle',
        entityId: vehicleId
      });
    }
    
    // Then update vehicle
    await api.patch(`/vehicles/${vehicleId}`, vehicleData);
    
    // Clear pending documents
    setPendingDocuments([]);
    setPendingDocumentIds([]);
    
    toast.success('Vehicle updated successfully');
    router.push(`/vehicles/${vehicleId}`);
  } catch (error) {
    toast.error('Failed to update vehicle');
    // Transaction will rollback automatically
  }
}

// 5. Handle cancel
async function handleCancel() {
  if (pendingDocumentIds.length > 0) {
    await api.delete('/documents/pending', {
      data: { pendingDocumentIds: pendingDocumentIds }
    });
  }
  router.back();
}

// 6. Cleanup on unmount
useEffect(() => {
  return () => {
    if (pendingDocumentIds.length > 0) {
      api.delete('/documents/pending', {
        data: { pendingDocumentIds: pendingDocumentIds }
      }).catch(console.error);
    }
  };
}, [pendingDocumentIds]);
```

---

## UI/UX Recommendations

### Document Display States

```typescript
// Show different badges based on status
function DocumentBadge({ document }: { document: Document }) {
  switch (document.lifecycleStatus) {
    case 'PENDING':
      return <Badge color="yellow">Pending</Badge>;
    case 'ACTIVE':
      return <Badge color="green">Active</Badge>;
    case 'SUPERSEDED':
      return <Badge color="gray">Superseded (v{document.version})</Badge>;
    case 'DELETED':
      return <Badge color="red">Deleted</Badge>;
  }
}
```

### Document List Component

```typescript
function DocumentList({ vehicleId }: { vehicleId: string }) {
  const [activeDocs, setActiveDocs] = useState<Document[]>([]);
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  
  useEffect(() => {
    // Load active documents
    api.get(`/documents/vehicle/${vehicleId}`)
      .then(setActiveDocs);
    
    // Load pending documents
    api.get(`/documents/pending/vehicle/${vehicleId}`)
      .then(setPendingDocs);
  }, [vehicleId]);
  
  return (
    <div>
      <h3>Active Documents</h3>
      {activeDocs.map(doc => (
        <DocumentCard key={doc.id} document={doc} status="active" />
      ))}
      
      {pendingDocs.length > 0 && (
        <>
          <h3>Pending Changes</h3>
          {pendingDocs.map(doc => (
            <DocumentCard key={doc.id} document={doc} status="pending" />
          ))}
          <Alert>
            You have {pendingDocs.length} pending document(s). 
            Click Save to confirm changes.
          </Alert>
        </>
      )}
    </div>
  );
}
```

---

## Recommended Backend Integration

For better atomicity, consider updating entity services to handle document commits internally:

```typescript
// In VehicleService.update()
async update(vehicleId: string, updateDto: UpdateVehicleDto, pendingDocumentIds?: string[]) {
  return await this.dataSource.transaction(async (manager) => {
    // 1. Update vehicle
    const vehicle = await manager.update(Vehicle, vehicleId, updateDto);
    
    // 2. Commit pending documents if provided
    if (pendingDocumentIds && pendingDocumentIds.length > 0) {
      await this.documentsService.commitPendingDocuments(
        pendingDocumentIds,
        'vehicle',
        vehicleId,
        manager // Pass transaction manager
      );
    }
    
    return vehicle;
  });
}
```

Then frontend can call:
```typescript
await api.patch(`/vehicles/${vehicleId}`, {
  ...vehicleData,
  pendingDocumentIds: pendingDocumentIds // Include in update request
});
```

---

## Error Handling

```typescript
async function handleSave() {
  try {
    // Validate pending documents exist
    const pendingDocs = await api.get(`/documents/pending/vehicle/${vehicleId}`);
    const pendingIds = pendingDocs.map(d => d.id);
    
    if (pendingIds.length !== pendingDocumentIds.length) {
      toast.warning('Some pending documents are missing. Please refresh and try again.');
      return;
    }
    
    // Commit documents
    await api.post('/documents/commit-pending', {
      pendingDocumentIds: pendingIds,
      entityType: 'vehicle',
      entityId: vehicleId
    });
    
    // Update entity
    await api.patch(`/vehicles/${vehicleId}`, vehicleData);
    
    toast.success('Saved successfully');
  } catch (error) {
    if (error.response?.status === 400) {
      toast.error(error.response.data.message || 'Invalid request');
    } else if (error.response?.status === 404) {
      toast.error('Some documents not found. Please refresh and try again.');
    } else {
      toast.error('Failed to save. Please try again.');
    }
  }
}
```

---

## Summary Checklist

### When User Uploads Document:
- [ ] Call `POST /documents/upload/pending`
- [ ] Store returned document ID in `pendingDocumentIds` array
- [ ] Update UI to show document with "Pending" badge
- [ ] Show warning that changes need to be saved

### When User Saves Entity:
- [ ] Call `POST /documents/commit-pending` with all pending document IDs
- [ ] Then call entity update endpoint (or include in same request if backend supports it)
- [ ] Clear `pendingDocumentIds` array on success
- [ ] Refresh document list to show new active documents

### When User Cancels:
- [ ] Call `DELETE /documents/pending` with all pending document IDs
- [ ] Clear `pendingDocumentIds` array
- [ ] Navigate away or reset form

### On Component Unmount:
- [ ] Check if `pendingDocumentIds` has items
- [ ] Call `DELETE /documents/pending` to cleanup
- [ ] Handle errors silently (user may have navigated away)

---

## Example: React Hook for Document Management

```typescript
function usePendingDocuments(
  entityType: 'customer' | 'vehicle' | 'contract' | 'administrator',
  entityId: string
) {
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  
  // Load pending documents
  const loadPending = async () => {
    const docs = await api.get(`/documents/pending/${entityType}/${entityId}`);
    setPendingDocs(docs);
    setPendingIds(docs.map(d => d.id));
  };
  
  // Upload pending document
  const uploadPending = async (file: File, uploadDto: UploadDocumentDto, replacesId?: string) => {
    const formData = new FormData();
    Object.entries(uploadDto).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    formData.append('file', file);
    if (replacesId) formData.append('replacesDocumentId', replacesId);
    
    const doc = await api.post('/documents/upload/pending', formData);
    setPendingDocs([...pendingDocs, doc]);
    setPendingIds([...pendingIds, doc.id]);
    return doc;
  };
  
  // Commit pending documents
  const commitPending = async () => {
    if (pendingIds.length === 0) return;
    
    await api.post('/documents/commit-pending', {
      pendingDocumentIds: pendingIds,
      entityType,
      entityId
    });
    
    setPendingDocs([]);
    setPendingIds([]);
  };
  
  // Cleanup pending documents
  const cleanupPending = async () => {
    if (pendingIds.length === 0) return;
    
    await api.delete('/documents/pending', {
      data: { pendingDocumentIds: pendingIds }
    });
    
    setPendingDocs([]);
    setPendingIds([]);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pendingIds.length > 0) {
        cleanupPending().catch(console.error);
      }
    };
  }, [pendingIds]);
  
  return {
    pendingDocs,
    pendingIds,
    loadPending,
    uploadPending,
    commitPending,
    cleanupPending
  };
}
```

---

## Key Points to Remember

1. **Always commit pending documents before or during entity update** - Don't leave them pending
2. **Cleanup on cancel/unmount** - Prevent orphaned pending documents
3. **Show pending status in UI** - Users should know changes aren't saved yet
4. **Handle errors gracefully** - Transaction rollback is automatic, but inform the user
5. **Version numbers increment automatically** - Frontend doesn't need to manage versions
6. **Old documents remain accessible** - They're marked SUPERSEDED, not deleted
