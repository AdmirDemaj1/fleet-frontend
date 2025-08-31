import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../../shared/utils/env";
import { 
  VehicleDocumentType, 
  VehicleDocumentStatus, 
  VehicleDocument
} from "../types/vehicleType";

// Interface for the actual upload request (without sessionKey in body)
export interface UploadVehicleDocumentRequestData {
  type: VehicleDocumentType;
  title: string;
  description?: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export const vehicleDocumentApi = createApi({
  reducerPath: "vehicleDocumentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      // Add authorization header if needed
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      
      // Get or generate a consistent user ID
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem("userId", userId);
      }
      headers.set("x-user-id", userId);
      
      return headers;
    },
  }),
  tagTypes: ["VehicleDocument"],
  endpoints: (builder) => ({
    // Upload a vehicle document
    uploadDocument: builder.mutation<
      VehicleDocument & { sessionKey?: string },
      {
        file: File;
        data: UploadVehicleDocumentRequestData;
        sessionKey?: string; // Optional for first upload
      }
    >({
      query: ({ file, data, sessionKey }) => {
        const formData = new FormData();

        // Generate a UUID for entityId
        const entityId = crypto.randomUUID();
        

        // Add file first (required)
        formData.append("file", file);

        // Add required fields for new endpoint
        formData.append("entityType", "vehicle");
        formData.append("entityId", entityId);
        formData.append("documentType", data.type);
        formData.append("title", data.title);

        // Add session key only if provided (for subsequent uploads)
        if (sessionKey) {
          formData.append("sessionKey", sessionKey);
        }

        // Add optional fields
        if (data.description) {
          formData.append("description", data.description);
        }
        if (data.expiryDate) {
          formData.append("expiryDate", data.expiryDate);
        }
        if (data.metadata) {
          // Add metadata as individual fields
          Object.entries(data.metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(`metadata[${key}]`, String(value));
            }
          });
        }

        console.log("🔗 Vehicle Document API Request Details:");
        console.log("URL:", `/document-management/upload`);
        console.log("Method: POST");
        console.log("Session Key:", sessionKey || "Not provided (first upload)");
        console.log("Entity ID:", entityId);
        console.log("Entity Type: vehicle");
        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        return {
          url: `/document-management/upload`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["VehicleDocument"],
    }),

    // Get all documents for a vehicle
    getVehicleDocuments: builder.query<VehicleDocument[], string>({
      query: (vehicleId) => `/vehicle-documents/vehicle/${vehicleId}`,
      providesTags: ["VehicleDocument"],
    }),

    // Remove a pending document
    removePendingDocument: builder.mutation<
      { message: string },
      {
        documentId: string;
        sessionKey?: string;
      }
    >({
      query: ({ documentId, sessionKey }) => {
        console.log("Removing vehicle document:", documentId);
        console.log("Session key:", sessionKey);
        
        const url = sessionKey 
          ? `/document-management/pending/${documentId}?sessionKey=${sessionKey}`
          : `/document-management/pending/${documentId}`;
        
        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: ["VehicleDocument"],
    }),

    // Replace a pending document
    replacePendingDocument: builder.mutation<
      VehicleDocument,
      {
        documentId: string;
        sessionKey: string;
        file: File;
        metadata?: Record<string, any>;
      }
    >({
      query: ({ documentId, sessionKey, file, metadata }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (metadata) {
          formData.append("metadata", JSON.stringify(metadata));
        }

        return {
          url: `/document-management/pending/${documentId}/replace?sessionKey=${sessionKey}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["VehicleDocument"],
    }),
  }),
});

export const {
  useUploadDocumentMutation,
  useGetVehicleDocumentsQuery,
  useRemovePendingDocumentMutation,
  useReplacePendingDocumentMutation,
} = vehicleDocumentApi;
