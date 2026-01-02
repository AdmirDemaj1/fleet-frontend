import { Vehicle } from "../types/vehicleType";
import { vehicleApi } from "../api/vehicleApi";
import { documentApi } from "../../../shared/api/documentApi";

interface UpdateVehicleOptions {
  vehicleId: string;
  updatedVehicleData:
    | Partial<Vehicle>
    | {
        vehicleData: Partial<Vehicle>;
        files?: File[];
        documents?: any[];
        documentReplacements?: any[];
        pendingDocumentIds?: string[];
      };
  pendingDocumentIds: string[];
  setPendingDocumentIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onNavigate: (path: string) => void;
}

/**
 * Handles vehicle update logic including document commits and atomic updates
 */
export const handleVehicleUpdate = async ({
  vehicleId,
  updatedVehicleData,
  pendingDocumentIds,
  setPendingDocumentIds,
  onSuccess,
  onError,
  onNavigate,
}: UpdateVehicleOptions): Promise<void> => {
  // Extract vehicle data from the submission (handle both old and new format)
  let vehicleDataToUpdate =
    "vehicleData" in updatedVehicleData
      ? updatedVehicleData.vehicleData
      : updatedVehicleData;

  // Remove read-only fields that should not be sent in update request
  const {
    id: _id,
    vin: _vin,
    contractId: _contractId,
    lastValuationDate: _lastValuationDate,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    createdBy: _createdBy,
    updatedBy: _updatedBy,
    ...cleanedVehicleData
  } = vehicleDataToUpdate as any;

  // Get pending document IDs from submission or state
  const pendingIds =
    "pendingDocumentIds" in updatedVehicleData && updatedVehicleData.pendingDocumentIds
      ? updatedVehicleData.pendingDocumentIds
      : pendingDocumentIds;

  // Commit pending documents first (if any)
  // Only commit if we have actual pending document IDs (not empty array)
  const hasPendingDocuments = Array.isArray(pendingIds) && pendingIds.length > 0;
  if (hasPendingDocuments) {
    console.log("📋 Committing pending documents:", pendingIds);
    try {
      await documentApi.commitPendingDocuments(pendingIds, "vehicle", vehicleId);
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

  // Handle atomic document updates if documents are being replaced or new documents are being uploaded
  if (
    "vehicleData" in updatedVehicleData &&
    (updatedVehicleData.documentReplacements?.length ||
      (updatedVehicleData.files?.length && updatedVehicleData.documents?.length))
  ) {
    console.log("🔄 Processing vehicle update with documents atomically");
    console.log("📁 Files:", updatedVehicleData.files?.length || 0);
    console.log("📋 Documents:", updatedVehicleData.documents?.length || 0);
    console.log("🔄 Replacements:", updatedVehicleData.documentReplacements?.length || 0);

    // Use updateVehicleWithDocuments for atomic updates
    const response = await vehicleApi.updateVehicleWithDocuments({
      vehicleId,
      vehicleData: cleanedVehicleData,
      files: updatedVehicleData.files,
      documents: updatedVehicleData.documents,
      documentReplacements: updatedVehicleData.documentReplacements,
    });

    console.log("Update response:", response);

    // Check if response indicates approval is required
    if (response.requiresApproval) {
      onSuccess("Action requires approval. Request has been submitted.");
      setTimeout(() => {
        onNavigate(`/vehicles/${vehicleId}`);
      }, 1500);
    } else {
      onSuccess("Vehicle updated successfully");
      setTimeout(() => {
        onNavigate(`/vehicles/${vehicleId}`);
      }, 1500);
    }
    return;
  }

  // Regular update without document replacements
  const response = await vehicleApi.updateVehicle(vehicleId, cleanedVehicleData);

  console.log("Update response:", response);

  // Check if response indicates approval is required
  if (response.requiresApproval) {
    onSuccess("Action requires approval. Request has been submitted.");
    setTimeout(() => {
      onNavigate(`/vehicles/${vehicleId}`);
    }, 1500);
  } else {
    onSuccess("Vehicle updated successfully");
    setTimeout(() => {
      onNavigate(`/vehicles/${vehicleId}`);
    }, 1500);
  }
};

