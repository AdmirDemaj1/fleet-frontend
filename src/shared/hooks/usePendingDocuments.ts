import { useState, useEffect, useRef } from "react";
import { documentApi } from "../api/documentApi";

export type EntityType = "customer" | "vehicle" | "contract" | "administrator";

interface UsePendingDocumentsOptions {
  entityType: EntityType;
  entityId?: string;
  enabled?: boolean; // Whether to load pending documents on mount
  cleanupOnUnmount?: boolean; // Whether to automatically cleanup on unmount (default: false)
  cleanupOnCancel?: boolean; // Whether to cleanup when explicitly canceling (default: true)
}

interface UsePendingDocumentsReturn {
  pendingDocumentIds: string[];
  setPendingDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
  loadPendingDocuments: () => Promise<void>;
  commitPendingDocuments: () => Promise<void>;
  cleanupPendingDocuments: () => Promise<void>;
  addPendingDocumentId: (id: string) => void;
  removePendingDocumentId: (id: string) => void;
  cleanupOnCancel: boolean; // Whether cleanup should happen on cancel
}

/**
 * Hook for managing pending documents with optimistic updates
 * Handles loading, committing, and cleaning up pending documents
 */
export const usePendingDocuments = (
  options: UsePendingDocumentsOptions
): UsePendingDocumentsReturn => {
  const { entityType, entityId, enabled = true, cleanupOnUnmount = false, cleanupOnCancel = false } = options;
  const [pendingDocumentIds, setPendingDocumentIds] = useState<string[]>([]);
  const pendingDocumentIdsRef = useRef<string[]>([]);

  // Update ref when pendingDocumentIds changes
  useEffect(() => {
    pendingDocumentIdsRef.current = pendingDocumentIds;
  }, [pendingDocumentIds]);

  // Load pending documents on mount if enabled and entityId is provided
  useEffect(() => {
    if (enabled && entityId) {
      loadPendingDocuments();
    }
  }, [entityId, enabled]);

  // Cleanup pending documents on unmount (only if cleanupOnUnmount is true)
  useEffect(() => {
    if (!cleanupOnUnmount) return;
    
    return () => {
      // Cleanup pending documents if component unmounts with pending documents
      if (pendingDocumentIdsRef.current.length > 0) {
        documentApi
          .deletePendingDocuments(pendingDocumentIdsRef.current)
          .catch((error) => {
            console.error(
              "Failed to cleanup pending documents on unmount:",
              error
            );
            // Silently fail - user may have navigated away
          });
      }
    };
  }, [cleanupOnUnmount]);

  const loadPendingDocuments = async () => {
    if (!entityId) return;

    try {
      const pendingDocs = await documentApi.getPendingDocuments(
        entityType,
        entityId
      );
      console.log(`📋 Loaded pending documents for ${entityType}:`, pendingDocs);

      const ids = pendingDocs.map((doc) => doc.id).filter(Boolean) as string[];
      setPendingDocumentIds(ids);
    } catch (error) {
      console.warn("Failed to load pending documents:", error);
      // Continue without pending documents if fetch fails
    }
  };

  const commitPendingDocuments = async () => {
    if (!entityId || pendingDocumentIds.length === 0) return;

    try {
      console.log(
        `📋 Committing ${pendingDocumentIds.length} pending documents for ${entityType}:`,
        pendingDocumentIds
      );
      await documentApi.commitPendingDocuments(
        pendingDocumentIds,
        entityType,
        entityId
      );
      console.log("✅ Pending documents committed successfully");
      // Clear pending document IDs after successful commit
      setPendingDocumentIds([]);
      pendingDocumentIdsRef.current = [];
    } catch (error) {
      console.error("Failed to commit pending documents:", error);
      throw error;
    }
  };

  const cleanupPendingDocuments = async () => {
    if (pendingDocumentIds.length === 0) return;

    try {
      console.log(
        `🧹 Cleaning up ${pendingDocumentIds.length} pending documents`
      );
      // Always cleanup when called explicitly (cleanupOnCancel check happens in component)
      await documentApi.deletePendingDocuments(pendingDocumentIds);
      setPendingDocumentIds([]);
      pendingDocumentIdsRef.current = [];
    } catch (error) {
      console.error("Failed to cleanup pending documents:", error);
      throw error;
    }
  };

  const addPendingDocumentId = (id: string) => {
    setPendingDocumentIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removePendingDocumentId = (id: string) => {
    setPendingDocumentIds((prev) => prev.filter((docId) => docId !== id));
  };

  return {
    pendingDocumentIds,
    setPendingDocumentIds,
    loadPendingDocuments,
    commitPendingDocuments,
    cleanupPendingDocuments,
    addPendingDocumentId,
    removePendingDocumentId,
    cleanupOnCancel,
  };
};

