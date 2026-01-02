import { useState, useCallback } from "react";
import { documentApi } from "../../../shared/api/documentApi";
import { vehicleApi } from "../api/vehicleApi";
import { Vehicle } from "../types/vehicleType";
import { VehicleDocumentFile } from "../components/VehicleDocumentUpload/VehicleDocumentUpload";
import { transformDocumentsToVehicleFormat } from "../utils/vehicleDocumentTransformers";
import { mergeActiveAndPendingDocuments } from "../utils/vehicleDocumentMerger";

interface UseVehicleDataLoaderOptions {
  vehicleId: string | undefined;
  setPendingDocumentIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

interface UseVehicleDataLoaderReturn {
  vehicleData: Vehicle | null;
  vehicleDocuments: VehicleDocumentFile[];
  loading: boolean;
  error: string | null;
  loadVehicleData: () => Promise<void>;
}

/**
 * Hook for loading and transforming vehicle data for editing
 */
export const useVehicleDataLoader = ({
  vehicleId,
  setPendingDocumentIds,
}: UseVehicleDataLoaderOptions): UseVehicleDataLoaderReturn => {
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [vehicleDocuments, setVehicleDocuments] = useState<VehicleDocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicleData = useCallback(async () => {
    if (!vehicleId) {
      setError("Vehicle ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch vehicle data
      const vehicle = await vehicleApi.getVehicleById(vehicleId);
      setVehicleData(vehicle);

      // Fetch vehicle documents
      let documents: any[] = [];
      try {
        documents = await documentApi.getVehicleDocuments(vehicleId);
        console.log("Fetched vehicle documents:", documents);
      } catch (docError) {
        console.warn("Failed to fetch documents:", docError);
        // Continue without documents if fetch fails
      }

      // Fetch pending documents
      let pendingDocuments: any[] = [];
      try {
        pendingDocuments = await documentApi.getPendingDocuments(
          "vehicle",
          vehicleId
        );
        console.log("Fetched pending vehicle documents:", pendingDocuments);

        // Update pending document IDs
        const pendingIds = pendingDocuments.map((doc) => doc.id).filter(Boolean);
        if (pendingIds.length > 0 && setPendingDocumentIds) {
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

      // Transform active documents to VehicleDocumentFile format
      const transformedDocuments = transformDocumentsToVehicleFormat(documents);
      
      // Merge active and pending documents (handles pending replacements)
      const mergedDocuments = mergeActiveAndPendingDocuments(
        transformedDocuments,
        pendingDocuments
      );
      
      setVehicleDocuments(mergedDocuments);
    } catch (err: any) {
      console.error("Error fetching vehicle:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load vehicle data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [vehicleId, setPendingDocumentIds]);

  return {
    vehicleData,
    vehicleDocuments,
    loading,
    error,
    loadVehicleData,
  };
};

