import { api } from "../utils/api";
import { Document, DocumentPreviewResponse } from "../types/document.types";

export const documentApi = {
  // Get documents by customer ID
  getCustomerDocuments: async (customerId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer documents:", error);
      throw error;
    }
  },

  // Get documents by contract ID
  getContractDocuments: async (contractId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/contract/${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching contract documents:", error);
      throw error;
    }
  },

  // Get documents by vehicle ID
  getVehicleDocuments: async (vehicleId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/vehicle/${vehicleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching vehicle documents:", error);
      throw error;
    }
  },

  // Get document preview
  getDocumentPreview: async (
    documentId: string
  ): Promise<DocumentPreviewResponse> => {
    try {
      const response = await api.get<DocumentPreviewResponse>(
        `/documents/${documentId}/preview`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching document preview:", error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: "blob",
      });
      return response.data as Blob;
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  },

  // Get documents by administrator ID
  getAdministratorDocuments: async (
    administratorId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/administrator/${administratorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching administrator documents:", error);
      throw error;
    }
  },

  // Get non-active documents by customer ID
  getNonActiveCustomerDocuments: async (
    customerId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/non-active/customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching non-active customer documents:", error);
      throw error;
    }
  },

  // Get non-active documents by vehicle ID
  getNonActiveVehicleDocuments: async (
    vehicleId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/non-active/vehicle/${vehicleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching non-active vehicle documents:", error);
      throw error;
    }
  },

  // Get non-active documents by contract ID
  getNonActiveContractDocuments: async (
    contractId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/non-active/contract/${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching non-active contract documents:", error);
      throw error;
    }
  },

  // Get non-active documents by administrator ID
  getNonActiveAdministratorDocuments: async (
    administratorId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/non-active/administrator/${administratorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching non-active administrator documents:", error);
      throw error;
    }
  },

  // Delete administrator document
  deleteAdministratorDocument: async (
    administratorId: string,
    documentId: string
  ): Promise<void> => {
    try {
      await api.delete(
        `/documents/administrator/${administratorId}/documents/${documentId}`
      );
    } catch (error) {
      console.error("Error deleting administrator document:", error);
      throw error;
    }
  },

  // Delete vehicle document
  deleteVehicleDocument: async (
    vehicleId: string,
    documentId: string
  ): Promise<void> => {
    try {
      await api.delete(
        `/documents/vehicle/${vehicleId}/documents/${documentId}`
      );
    } catch (error) {
      console.error("Error deleting vehicle document:", error);
      throw error;
    }
  },

  // Upload pending document (for optimistic updates)
  uploadPendingDocument: async (
    file: File,
    data: {
      type: string;
      title: string;
      description?: string;
      vehicleId?: string;
      customerId?: string;
      contractId?: string;
      administratorId?: string;
      replacesDocumentId?: string;
      expiryDate?: string;
      metadata?: object;
    }
  ): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", data.type);
      formData.append("title", data.title);

      if (data.description) formData.append("description", data.description);
      if (data.vehicleId) formData.append("vehicleId", data.vehicleId);
      if (data.customerId) formData.append("customerId", data.customerId);
      if (data.contractId) formData.append("contractId", data.contractId);
      if (data.administratorId)
        formData.append("administratorId", data.administratorId);
      if (data.replacesDocumentId)
        formData.append("replacesDocumentId", data.replacesDocumentId);
      if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
      if (data.metadata)
        formData.append("metadata", JSON.stringify(data.metadata));

      const response = await api.post<Document>(
        "/documents/upload/pending",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading pending document:", error);
      throw error;
    }
  },

  // Get pending documents for an entity
  getPendingDocuments: async (
    entityType: "customer" | "vehicle" | "contract" | "administrator",
    entityId: string
  ): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(
        `/documents/pending/${entityType}/${entityId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      throw error;
    }
  },

  // Commit pending documents (activate them)
  commitPendingDocuments: async (
    pendingDocumentIds: string[],
    entityType: "customer" | "vehicle" | "contract" | "administrator",
    entityId: string
  ): Promise<{ message: string; committedCount: number }> => {
    try {
      const response = await api.post<{
        message: string;
        committedCount: number;
      }>("/documents/commit-pending", {
        pendingDocumentIds,
        entityType,
        entityId,
      });
      return response.data;
    } catch (error) {
      console.error("Error committing pending documents:", error);
      throw error;
    }
  },

  // Delete pending documents (cleanup)
  deletePendingDocuments: async (
    pendingDocumentIds: string[]
  ): Promise<{ message: string; deletedCount: number }> => {
    console.log("🔍 Deleting pending documents:", pendingDocumentIds);

    // Validate that we have at least one ID
    if (!pendingDocumentIds || pendingDocumentIds.length === 0) {
      throw new Error("At least one pending document ID is required");
    }

    // Validate that all IDs are valid UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidIds = pendingDocumentIds.filter((id) => !uuidRegex.test(id));
    if (invalidIds.length > 0) {
      console.error("❌ Invalid UUIDs found:", invalidIds);
      throw new Error(`Invalid UUID format: ${invalidIds.join(", ")}`);
    }

    try {
      // Send DELETE request with body
      // Note: Some servers don't parse DELETE request bodies correctly
      // NestJS requires @Body() decorator and proper body parser configuration
      const requestBody = { pendingDocumentIds };
      console.log("📤 Sending DELETE request to /documents/pending");
      console.log("📦 Request body:", JSON.stringify(requestBody, null, 2));
      console.log("📦 Pending document IDs:", pendingDocumentIds);

      // Ensure the request is sent with proper headers and data
      const response = await api.post<{
        message: string;
        deletedCount: number;
      }>(
        "/documents/pending/delete",

        {
          pendingDocumentIds,
        }
      );

      console.log("✅ Successfully deleted pending documents:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error deleting pending documents:", error);
      // Log the full error for debugging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2)
        );
        console.error("Request URL:", error.config?.url);
        console.error("Request method:", error.config?.method);
        console.error("Request data:", error.config?.data);
        console.error("Request headers:", error.config?.headers);
      } else if (error.request) {
        console.error(
          "Request was made but no response received:",
          error.request
        );
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
};
