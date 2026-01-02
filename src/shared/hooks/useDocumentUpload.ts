import { useState, useCallback } from "react";
import { documentApi } from "../api/documentApi";
import { useNotification } from "./useNotification";
import { EntityType } from "./usePendingDocuments";

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File; // Optional for existing documents
  documentId?: string; // ID of existing document from API
  category: string;
  description?: string;
  expiryDate?: string; // YYYY-MM-DD format
  isRequired: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected" | "superseded";
  uploadedAt?: Date;
  // Versioning fields for optimistic updates
  parentDocumentId?: string; // ID of document being replaced
  version?: number; // Document version number
  isCurrent?: boolean; // Whether this is the current active version
  isPendingReplacement?: boolean; // Whether this document has a pending replacement
  pendingReplacementId?: string; // ID of the pending replacement document
}

interface UseDocumentUploadOptions {
  entityType: EntityType;
  entityId?: string; // Required for edit mode
  onPendingDocumentIdsChange?: (ids: string[]) => void;
  requiredDocuments?: Array<{ category: string; name: string }>;
  mapDocumentType?: (category: string) => string; // Map category to API document type
}

interface UseDocumentUploadReturn {
  uploadingDocumentId: string | null;
  replacingDocumentId: string | null;
  deletingDocumentId: string | null;
  uploadError: string;
  setUploadError: (error: string) => void;
  uploadDocument: (
    file: File,
    category: string,
    description: string,
    expiryDate: string,
    existingDocuments: DocumentFile[]
  ) => Promise<DocumentFile | null>;
  replaceDocument: (
    oldDocument: DocumentFile,
    newFile: File,
    category: string,
    description: string,
    expiryDate: string,
    existingDocuments: DocumentFile[]
  ) => Promise<DocumentFile | null>;
  deleteDocument: (
    document: DocumentFile,
    existingDocuments: DocumentFile[]
  ) => Promise<void>;
  validateDocument: (
    file: File,
    category: string,
    expiryDate: string,
    existingDocuments: DocumentFile[]
  ) => { isValid: boolean; error?: string };
}

/**
 * Generic hook for document upload, replacement, and deletion
 * Handles both create mode (local storage) and edit mode (immediate upload with PENDING status)
 */
export const useDocumentUpload = (
  options: UseDocumentUploadOptions
): UseDocumentUploadReturn => {
  const {
    entityType,
    entityId,
    onPendingDocumentIdsChange,
    requiredDocuments = [],
    mapDocumentType = (category) => category,
  } = options;

  const { showSuccess, showError } = useNotification();
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(
    null
  );
  const [replacingDocumentId, setReplacingDocumentId] = useState<string | null>(
    null
  );
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [uploadError, setUploadError] = useState("");

  const validateDocument = useCallback(
    (
      file: File,
      _category: string, // Reserved for future category-specific validation
      expiryDate: string,
      existingDocuments: DocumentFile[]
    ): { isValid: boolean; error?: string } => {
      // Check for duplicates by name
      const existingNames = existingDocuments.map((doc) => doc.name);
      if (existingNames.includes(file.name)) {
        return {
          isValid: false,
          error: `Document "${file.name}" has already been uploaded. Please use a different file or remove the existing one first.`,
        };
      }

      // Check if expiry date is provided (required for ALL documents)
      if (!expiryDate) {
        return {
          isValid: false,
          error:
            "Expiry date is required for all documents. Please select an expiry date.",
        };
      }

      // Check if expiry date is not in the past
      const today = new Date().toISOString().split("T")[0];
      if (expiryDate < today) {
        return {
          isValid: false,
          error:
            "Expiry date cannot be in the past. Please select a valid date.",
        };
      }

      return { isValid: true };
    },
    []
  );

  const uploadDocument = useCallback(
    async (
      file: File,
      category: string,
      description: string,
      expiryDate: string,
      existingDocuments: DocumentFile[]
    ): Promise<DocumentFile | null> => {
      try {
        setUploadError("");

        // Validate document
        const validation = validateDocument(
          file,
          category,
          expiryDate,
          existingDocuments
        );
        if (!validation.isValid) {
          setUploadError(validation.error || "Validation failed");
          return null;
        }

        // Check if this document category already has a document uploaded
        const existingCategoryDoc = existingDocuments.find(
          (doc) => doc.category === category
        );

        // For create mode (no entityId), store document locally
        if (!entityId) {
          if (existingCategoryDoc) {
            const docName =
              requiredDocuments.find((d) => d.category === category)?.name ||
              category;
            setUploadError(
              `A document of type "${docName}" has already been uploaded. Please remove the existing one first or choose a different category.`
            );
            return null;
          }

          // Store document locally for create mode
          const newDocument: DocumentFile = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            category: category,
            description: description,
            expiryDate: expiryDate,
            isRequired: requiredDocuments.some((doc) => doc.category === category),
            status: "pending", // Will be uploaded with entity creation
            uploadedAt: new Date(),
          };

          showSuccess(`Document "${file.name}" added successfully`);
          return newDocument;
        }

        // For edit mode (entityId exists), upload immediately with PENDING status
        if (existingCategoryDoc) {
          // If it's an existing document from API, upload as replacement
          if (existingCategoryDoc.documentId) {
            return await replaceDocument(
              existingCategoryDoc,
              file,
              category,
              description,
              expiryDate,
              existingDocuments
            );
          } else {
            const docName =
              requiredDocuments.find((d) => d.category === category)?.name ||
              category;
            setUploadError(
              `A document of type "${docName}" has already been uploaded. Please remove the existing one first or choose a different category.`
            );
            return null;
          }
        }

        // Upload new document immediately with PENDING status
        setUploadingDocumentId("new");
        const uploadedDoc = await documentApi.uploadPendingDocument(file, {
          type: mapDocumentType(category),
          title: file.name,
          description: description,
          [entityType === "customer" ? "customerId" : entityType === "vehicle" ? "vehicleId" : entityType === "contract" ? "contractId" : "administratorId"]: entityId,
          expiryDate: expiryDate,
        });

        console.log("✅ Uploaded pending document:", uploadedDoc);

        // Transform uploaded document to DocumentFile format
        const newDocument: DocumentFile = {
          id: uploadedDoc.id,
          name: uploadedDoc.fileName || uploadedDoc.title,
          type: uploadedDoc.type || file.type,
          size: file.size,
          documentId: uploadedDoc.id,
          category: category,
          description: description,
          expiryDate: expiryDate,
          isRequired: requiredDocuments.some((doc) => doc.category === category),
          status: "pending", // PENDING until entity update is confirmed
          uploadedAt: new Date(uploadedDoc.createdAt),
          version: (uploadedDoc as any).version || 1,
          isCurrent: (uploadedDoc as any).isCurrent || false,
        };

        // Track pending document ID (append to existing)
        // Note: The parent component should manage the full array
        onPendingDocumentIdsChange?.([uploadedDoc.id]);

        showSuccess(
          `Document "${file.name}" uploaded. Click Save to confirm changes.`
        );
        return newDocument;
      } catch (error) {
        console.error("Failed to upload document:", error);
        setUploadError("Failed to upload document. Please try again.");
        return null;
      } finally {
        setUploadingDocumentId(null);
      }
    },
    [
      entityId,
      entityType,
      mapDocumentType,
      onPendingDocumentIdsChange,
      requiredDocuments,
      showSuccess,
      showError,
      validateDocument,
    ]
  );

  const replaceDocument = useCallback(
    async (
      oldDocument: DocumentFile,
      newFile: File,
      category: string,
      description: string,
      expiryDate: string,
      existingDocuments: DocumentFile[]
    ): Promise<DocumentFile | null> => {
      if (!entityId) {
        setUploadError("Cannot replace document in create mode");
        return null;
      }

      try {
        setReplacingDocumentId(oldDocument.id);
        setUploadError("");

        // Validate document
        const validation = validateDocument(
          newFile,
          category,
          expiryDate,
          existingDocuments
        );
        if (!validation.isValid) {
          setUploadError(validation.error || "Validation failed");
          setReplacingDocumentId(null);
          return null;
        }

        // Upload document immediately with PENDING status
        const uploadedDoc = await documentApi.uploadPendingDocument(newFile, {
          type: mapDocumentType(category),
          title: newFile.name,
          description: description || oldDocument.description,
          [entityType === "customer" ? "customerId" : entityType === "vehicle" ? "vehicleId" : entityType === "contract" ? "contractId" : "administratorId"]: entityId,
          replacesDocumentId: oldDocument.documentId || oldDocument.id,
          expiryDate: expiryDate,
        });

        console.log("✅ Uploaded pending replacement document:", uploadedDoc);

        // Transform uploaded document to DocumentFile format
        const newDocument: DocumentFile = {
          id: uploadedDoc.id,
          name: uploadedDoc.fileName || uploadedDoc.title,
          type: uploadedDoc.type || newFile.type,
          size: newFile.size,
          documentId: uploadedDoc.id,
          category: category,
          description: description || oldDocument.description,
          expiryDate: expiryDate,
          isRequired: oldDocument.isRequired,
          status: "pending", // PENDING until entity update is confirmed
          uploadedAt: new Date(uploadedDoc.createdAt),
          parentDocumentId:
            (uploadedDoc as any).parentDocumentId || oldDocument.documentId,
          version:
            (uploadedDoc as any).version || ((oldDocument.version || 1) + 1),
          isCurrent: false,
        };

        // Track pending document ID (append to existing)
        // Note: The parent component should manage the full array
        onPendingDocumentIdsChange?.([uploadedDoc.id]);

        showSuccess(
          `Document "${oldDocument.name}" will be replaced with "${newFile.name}" when you save.`
        );
        return newDocument;
      } catch (error) {
        console.error("Failed to replace document:", error);
        setUploadError("Failed to upload document. Please try again.");
        return null;
      } finally {
        setReplacingDocumentId(null);
      }
    },
    [
      entityId,
      entityType,
      mapDocumentType,
      onPendingDocumentIdsChange,
      showSuccess,
      validateDocument,
    ]
  );

  const deleteDocument = useCallback(
    async (
      document: DocumentFile,
      _existingDocuments: DocumentFile[]
    ): Promise<void> => {
      try {
        setDeletingDocumentId(document.id);

        // If it's a pending document, delete it via pending documents API
        if (document.status === "pending" && document.documentId) {
          await documentApi.deletePendingDocuments([document.documentId]);
          console.log(
            `✅ Deleted pending document ${document.documentId} from API`
          );
          onPendingDocumentIdsChange?.([]);
        }
        // If it's an existing ACTIVE document with documentId, delete it from API
        else if (document.documentId && entityId) {
          // Note: This would need entity-specific delete methods
          // For now, we'll just remove from local state
          console.log(
            `⚠️ Document deletion for active documents needs entity-specific implementation`
          );
        }

        showSuccess("Document removed");
        setUploadError("");
      } catch (error) {
        console.error("Failed to delete document:", error);
        const errorMessage = "Failed to delete document. Please try again.";
        setUploadError(errorMessage);
        showError(errorMessage);
        throw error;
      } finally {
        setDeletingDocumentId(null);
      }
    },
    [entityId, onPendingDocumentIdsChange, showSuccess, showError]
  );

  return {
    uploadingDocumentId,
    replacingDocumentId,
    deletingDocumentId,
    uploadError,
    setUploadError,
    uploadDocument,
    replaceDocument,
    deleteDocument,
    validateDocument,
  };
};

