import { documentApi } from "../../../shared/api/documentApi";

interface UpdateAdministratorOptions {
  administratorId: string;
  data: any;
  pendingDocumentIds: string[];
  setPendingDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
  updateAdministrator: (id: string, data: any) => Promise<any>;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/**
 * Handles administrator update logic including document commits
 */
export const handleAdministratorUpdate = async ({
  administratorId,
  data,
  pendingDocumentIds,
  setPendingDocumentIds,
  updateAdministrator,
  onSuccess,
  onError,
}: UpdateAdministratorOptions): Promise<void> => {
  // Commit pending documents first (if any)
  // Get all pending document IDs from the form data
  const formPendingIds: string[] = [];
  (data.administratorDocuments || []).forEach((doc: any) => {
    // Collect pending replacement IDs
    if (doc.pendingReplacementId) {
      formPendingIds.push(doc.pendingReplacementId);
    }
    // Collect pending document IDs (documents with status pending and parentDocumentId)
    if (doc.status === "pending" && doc.parentDocumentId && doc.documentId) {
      formPendingIds.push(doc.documentId);
    }
  });

  const allPendingIds = [...new Set([...pendingDocumentIds, ...formPendingIds])];

  // Commit pending documents first (if any)
  // Only commit if we have actual pending document IDs (not empty array)
  const hasPendingDocuments = Array.isArray(allPendingIds) && allPendingIds.length > 0;
  if (hasPendingDocuments) {
    console.log("📋 Committing pending administrator documents:", allPendingIds);
    try {
      // Commit pending documents
      await documentApi.commitPendingDocuments(
        allPendingIds,
        "administrator",
        administratorId
      );
      console.log("✅ Pending documents committed successfully");

      // Clear pending document IDs after successful commit
      setPendingDocumentIds([]);
    } catch (error) {
      console.error("Failed to commit pending documents:", error);
      throw error;
    }
  } else {
    console.log("ℹ️ No pending documents to commit, skipping commit API call");
  }

  await updateAdministrator(administratorId, data);
  onSuccess();
};

