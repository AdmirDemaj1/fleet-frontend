import { createApi } from "@reduxjs/toolkit/query/react";
import { 
  VehicleDocumentType, 
  VehicleDocument
} from "../types/vehicleType";
import { baseQueryWithReauth } from "../../../shared/utils/rtkBaseQuery";

// Interface for the actual upload request (standalone document upload)
export interface UploadVehicleDocumentRequestData {
  type: VehicleDocumentType;
  title: string;
  description?: string;
  expiryDate: string; // Required for all documents
  customerId?: string;
  contractId?: string;
  vehicleId?: string;
  metadata?: Record<string, any>;
}

// Custom base query for document uploads that adds user-id header
const documentBaseQuery = async (args: any, api: any, extraOptions: any) => {
  // Use the base query with reauth
  const result = await baseQueryWithReauth(args, api, extraOptions);
  return result;
};

export const vehicleDocumentApi = createApi({
  reducerPath: "vehicleDocumentApi",
  baseQuery: documentBaseQuery,
  tagTypes: ["VehicleDocument"],
  endpoints: (builder) => ({
    // Upload a standalone vehicle document using /documents/upload endpoint
    // Note: For new vehicles, documents should be uploaded with the vehicle creation request
    uploadDocument: builder.mutation<
      VehicleDocument & { 
        requiresApproval?: boolean;
        approvalRequestId?: string;
        message?: string;
      },
      {
        file: File;
        data: UploadVehicleDocumentRequestData;
      }
    >({
      query: ({ file, data }) => {
        const formData = new FormData();

        // Add file (required)
        formData.append("file", file);

        // Add required fields matching the endpoint format
        formData.append("type", data.type);
        formData.append("title", data.title);
        formData.append("expiryDate", data.expiryDate); // Required for all documents

        // Add optional fields
        if (data.customerId) {
          formData.append("customerId", data.customerId);
        }
        if (data.contractId) {
          formData.append("contractId", data.contractId);
        }
        if (data.vehicleId) {
          formData.append("vehicleId", data.vehicleId);
        }
        if (data.description) {
          formData.append("description", data.description);
        }

        // Add metadata as JSON string
        if (data.metadata) {
          formData.append("metadata", JSON.stringify(data.metadata));
        }

        console.log("🔗 Vehicle Document API Request Details:");
        console.log("URL:", `/documents/upload`);
        console.log("Method: POST");
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        return {
          url: `/documents/upload`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["VehicleDocument"],
    }),

    // Get all documents for a vehicle
    getVehicleDocuments: builder.query<VehicleDocument[], string>({
      query: (vehicleId) => `/documents/vehicle/${vehicleId}`,
      providesTags: ["VehicleDocument"],
    }),

    // Delete a document
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VehicleDocument"],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useGetVehicleDocumentsQuery,
  useDeleteDocumentMutation,
} = vehicleDocumentApi;
