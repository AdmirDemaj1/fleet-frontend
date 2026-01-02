import { useState, useCallback } from "react";
import { documentApi } from "../../../shared/api/documentApi";
import { ContractFormData } from "../types/contract.types";
import { transformDocumentsToContractFormat } from "../utils/contractDocumentTransformers";
import { mergeActiveAndPendingDocuments } from "../utils/contractDocumentMerger";
import { buildContractFormData } from "../utils/contractDataTransformers";

interface UseContractDataLoaderOptions {
  contractId: string | undefined;
  contract: any;
  customerData: any;
  isLoadingCustomer: boolean;
  setPendingDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseContractDataLoaderReturn {
  initialData: Partial<ContractFormData> | null;
  loadingData: boolean;
  error: string | null;
  loadContractData: () => Promise<void>;
}

/**
 * Hook for loading and transforming contract data for editing
 */
export const useContractDataLoader = ({
  contractId,
  contract,
  customerData,
  isLoadingCustomer,
  setPendingDocumentIds,
}: UseContractDataLoaderOptions): UseContractDataLoaderReturn => {
  const [initialData, setInitialData] = useState<Partial<ContractFormData> | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContractData = useCallback(async () => {
    if (!contractId) {
      setError("Contract ID is required");
      setLoadingData(false);
      return;
    }

    if (!contract) {
      // Contract might still be loading, don't set error yet
      // The component will handle showing error if contract is not found after loading completes
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setError(null);

      // Step 1: Fetch documents (active + pending) in parallel
      const [activeDocs, pendingDocs] = await Promise.allSettled([
        documentApi.getContractDocuments(contractId),
        documentApi.getPendingDocuments("contract", contractId).catch(() => []),
      ]);

      const activeDocuments =
        activeDocs.status === "fulfilled" ? activeDocs.value : [];
      const pendingDocuments =
        pendingDocs.status === "fulfilled" ? pendingDocs.value : [];

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

      // Step 2: Merge active and pending documents
      const { mergedDocuments } = mergeActiveAndPendingDocuments(
        activeDocuments,
        pendingDocuments
      );

      // Step 3: Wait for customer data if needed
      if (contract.customerId && !customerData && isLoadingCustomer) {
        // Customer data is loading, will retry when it's ready
        setLoadingData(false);
        return;
      }

      // Step 4: Transform all data
      const transformedDocuments = transformDocumentsToContractFormat(mergedDocuments);
      const transformedData = buildContractFormData(
        contract,
        customerData,
        transformedDocuments
      );

      console.log("✅ Contract data loaded and transformed:", {
        documents: transformedDocuments.length,
        vehicles: transformedData.selectedVehicleData?.length || 0,
        endorsers: transformedData.selectedEndorsers?.length || 0,
        collaterals: transformedData.collaterals?.length || 0,
      });

      setInitialData(transformedData);
      setLoadingData(false);
    } catch (err: any) {
      console.error("Error loading contract data:", err);
      setError(err?.message || "Failed to load contract data for editing");
      setLoadingData(false);
    }
  }, [
    contractId,
    contract,
    customerData,
    isLoadingCustomer,
    setPendingDocumentIds,
  ]);

  return {
    initialData,
    loadingData,
    error,
    loadContractData,
  };
};

