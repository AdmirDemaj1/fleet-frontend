# Document Management Hooks Refactoring Guide

This guide explains how to refactor document management components to use the new reusable hooks for optimistic document updates.

## Available Hooks

### 1. `usePendingDocuments`
Manages pending documents lifecycle (loading, committing, cleanup).

### 2. `useDocumentUpload`
Handles document upload, replacement, and deletion with validation.

## Usage Pattern

### Step 1: Use `usePendingDocuments` in Container/Page Component

```typescript
import { usePendingDocuments } from '../../../shared/hooks/usePendingDocuments';

const EditEntityPage = () => {
  const { id } = useParams();
  
  // Track pending documents
  const {
    pendingDocumentIds,
    commitPendingDocuments,
    cleanupPendingDocuments,
  } = usePendingDocuments({
    entityType: 'vehicle', // or 'customer', 'contract', 'administrator'
    entityId: id,
    enabled: !!id, // Only load if editing
  });

  // On save, commit pending documents
  const handleSave = async () => {
    try {
      // Commit pending documents first
      if (pendingDocumentIds.length > 0) {
        await commitPendingDocuments();
      }
      
      // Then update entity
      await updateEntity(data);
    } catch (error) {
      // Transaction will rollback automatically
    }
  };

  // On cancel, cleanup pending documents
  const handleCancel = async () => {
    await cleanupPendingDocuments();
    navigate('/back');
  };
};
```

### Step 2: Use `useDocumentUpload` in Document Component

```typescript
import { useDocumentUpload } from '../../../shared/hooks/useDocumentUpload';
import { usePendingDocuments } from '../../../shared/hooks/usePendingDocuments';

const DocumentUploadComponent = ({ entityId, onDocumentsChange }) => {
  // Track pending document IDs
  const { addPendingDocumentId, removePendingDocumentId } = usePendingDocuments({
    entityType: 'vehicle',
    entityId,
    enabled: false, // Don't auto-load, we'll manage manually
  });

  // Use document upload hook
  const {
    uploadDocument,
    replaceDocument,
    deleteDocument,
    validateDocument,
    uploadError,
    replacingDocumentId,
    deletingDocumentId,
  } = useDocumentUpload({
    entityType: 'vehicle',
    entityId, // undefined for create mode
    onPendingDocumentIdsChange: (ids) => {
      // Update parent's pending document IDs
      ids.forEach(id => addPendingDocumentId(id));
    },
    requiredDocuments: [
      { category: 'vehicle_registration', name: 'Vehicle Registration' },
      // ... other required docs
    ],
    mapDocumentType: (category) => {
      // Map component category to API document type
      return category; // or custom mapping
    },
  });

  const handleUpload = async (file: File, category: string) => {
    const expiryDate = getExpiryDate(); // Get from form/state
    
    const newDoc = await uploadDocument(
      file,
      category,
      description,
      expiryDate,
      documents
    );
    
    if (newDoc) {
      onDocumentsChange([...documents, newDoc]);
    }
  };

  const handleReplace = async (oldDoc: DocumentFile, newFile: File) => {
    const expiryDate = getExpiryDate();
    
    const newDoc = await replaceDocument(
      oldDoc,
      newFile,
      oldDoc.category,
      description,
      expiryDate,
      documents
    );
    
    if (newDoc) {
      // Update documents: mark old as pending replacement, add new
      const updated = documents.map(doc => 
        doc.id === oldDoc.id 
          ? { ...doc, isPendingReplacement: true, pendingReplacementId: newDoc.id }
          : doc
      );
      onDocumentsChange([...updated, newDoc]);
    }
  };
};
```

## Migration Checklist

For each entity with documents:

- [ ] **Container/Page Component:**
  - [ ] Import `usePendingDocuments`
  - [ ] Track pending document IDs
  - [ ] Commit pending documents on save
  - [ ] Cleanup pending documents on cancel/unmount

- [ ] **Document Upload Component:**
  - [ ] Import `useDocumentUpload` and `usePendingDocuments`
  - [ ] Replace manual upload logic with `uploadDocument`
  - [ ] Replace manual replace logic with `replaceDocument`
  - [ ] Replace manual delete logic with `deleteDocument`
  - [ ] Use `validateDocument` for validation
  - [ ] Remove duplicate validation code
  - [ ] Remove manual pending document tracking

- [ ] **API Integration:**
  - [ ] Ensure `documentApi.uploadPendingDocument` supports entity type
  - [ ] Ensure `documentApi.getPendingDocuments` supports entity type
  - [ ] Ensure `documentApi.commitPendingDocuments` supports entity type
  - [ ] Ensure `documentApi.deletePendingDocuments` works correctly

## Benefits

1. **Code Reuse**: Same logic across all entities
2. **Consistency**: Uniform behavior everywhere
3. **Maintainability**: Fix bugs in one place
4. **Smaller Components**: Logic extracted to hooks
5. **Type Safety**: Shared interfaces and types
6. **Optimistic Updates**: Built-in support for pending documents

## Entity-Specific Notes

### Vehicles
- Already refactored (can be used as reference)
- Document types: vehicle_registration, vehicle_inspection, etc.

### Customers/Administrators
- Document types: business_administrator_id_card, business_administrator_qkb
- Uses react-hook-form (different pattern but same hooks)

### Contracts
- Document types: id_card, passport, etc.
- May have multiple entities (customer, vehicle, contract)

