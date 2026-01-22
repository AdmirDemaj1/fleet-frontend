import { useState, useCallback } from "react";
import { customerApi } from "../api/customerApi";
import { documentApi } from "../../../shared/api/documentApi";
import { transformAdministratorDocuments } from "../utils/administratorDocumentTransformers";
import { transformAdministratorData } from "../utils/administratorDataTransformers";
import { mergeActiveAndPendingAdministratorDocuments } from "../utils/administratorDocumentMerger";

interface UseAdministratorDataLoaderOptions {
  administratorId: string | undefined;
  setPendingDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseAdministratorDataLoaderReturn {
  initialData: any | null;
  loading: boolean;
  error: string | null;
  loadAdministratorData: () => Promise<void>;
}

/**
 * Hook for loading and transforming administrator data for editing
 */
export const useAdministratorDataLoader = ({
  administratorId,
  setPendingDocumentIds,
}: UseAdministratorDataLoaderOptions): UseAdministratorDataLoaderReturn => {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdministratorData = useCallback(async () => {
    if (!administratorId) {
      setError("Administrator ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Administrators are customers now; use customer endpoint
      const administrator = await customerApi.getById(administratorId);
      console.log("Fetched administrator:", administrator);

      // Fetch active documents
      let documents: any[] = [];
      try {
        documents = await documentApi.getAdministratorDocuments(administratorId);
        console.log("Fetched administrator documents:", documents);
      } catch (docError) {
        console.warn("Failed to fetch documents:", docError);
        // Continue without documents if fetch fails
      }

      // Fetch pending documents
      let pendingDocuments: any[] = [];
      try {
        pendingDocuments = await documentApi.getPendingDocuments(
          "administrator",
          administratorId
        );
        console.log("Fetched pending administrator documents:", pendingDocuments);

        // Update pending document IDs
        const pendingIds = pendingDocuments.map((doc) => doc.id).filter(Boolean);
        if (pendingIds.length > 0) {
          setPendingDocumentIds((prev) => {
            const prevSet = new Set(prev);
            const newSet = new Set(pendingIds);
            if (
              prevSet.size !== newSet.size ||
              !Array.from(prevSet).every((id) => newSet.has(id))
            ) {
              return pendingIds;
            }
            return prev;
          });
        }
      } catch (pendingError) {
        console.warn("Failed to fetch pending documents:", pendingError);
        // Continue without pending documents if fetch fails
      }

      // Transform administrator data to form format
      const administratorData = transformAdministratorData(administrator);

      // Transform active documents to form format
      const transformedActiveDocuments = transformAdministratorDocuments(
        documents,
        [] // Don't pass pending documents here, we'll merge them separately
      );

      // Merge active and pending documents (handles pending replacements)
      const mergedDocuments = mergeActiveAndPendingAdministratorDocuments(
        transformedActiveDocuments,
        pendingDocuments
      );

      // Set initial data
      setInitialData({
        ...administratorData,
        administratorDocuments: mergedDocuments,
      });
    } catch (err: any) {
      console.error("Error fetching administrator data:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load administrator data"
      );
    } finally {
      setLoading(false);
    }
  }, [administratorId, setPendingDocumentIds]);

  return {
    initialData,
    loading,
    error,
    loadAdministratorData,
  };
};

