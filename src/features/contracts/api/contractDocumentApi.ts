import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../../shared/utils/env";

// Add these enums to match your backend
export enum ContractDocumentType {
  ID_CARD = "id_card",
  INSURANCE = "insurance",
  TPL = "tpl",
  CASCO = "casco",
  DRIVING_PERMIT = "driving_permit",
  CUSTOMER_REGISTRATION = "customer_registration",
  ENDORSER_ID = "endorser_id",
  CONTRACT_AGREEMENT = "contract_agreement",
  BUSINESS_REGISTRATION = "business_registration",
  TAX_CERTIFICATE = "tax_certificate",
  OTHER = "other",
}

export enum ContractDocumentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

// Types for the API - Updated to match your backend DTO
export interface UploadContractDocumentDto {
  type: ContractDocumentType; // Use the enum for type safety
  title: string;
  description?: string;
  customerId: string;
  endorserId?: string;
  metadata?: Record<string, any>;
  expiryDate?: string;
  sessionKey: string;
}

// Interface for the actual upload request (without sessionKey in body)
export interface UploadRequestData {
  type: ContractDocumentType;
  title: string;
  description?: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}
// Updated interfaces to match backend DTOs

// Then update your interfaces to use these enums
export interface ContractDocumentResponseDto {
  id: string;
  type: ContractDocumentType; // ✅ More type-safe
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  status: ContractDocumentStatus; // ✅ More type-safe
  contractId: string;
  customerId?: string;
  endorserId?: string;
  metadata?: Record<string, any>;
  expiryDate?: string;
  isRequired: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequirementsDto {
  requiredDocuments: ContractDocumentType[]; // ✅ More type-safe
  optionalDocuments: ContractDocumentType[]; // ✅ More type-safe
  documentStatus: Record<ContractDocumentType, ContractDocumentStatus>; // ✅ More type-safe
  isComplete: boolean;
  missingDocuments: ContractDocumentType[]; // ✅ More type-safe
}

export const contractDocumentApi = createApi({
  reducerPath: "contractDocumentApi",
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
  tagTypes: ["ContractDocument"],
  endpoints: (builder) => ({
    // Test endpoint to verify backend connection - using a simple GET to test connectivity
    testConnection: builder.query<any, void>({
      query: () => "/", // Root endpoint to test basic connectivity
    }),

    // Upload a contract document
    uploadDocument: builder.mutation<
      ContractDocumentResponseDto & { sessionKey?: string },
      {
        file: File;
        data: UploadRequestData;
        sessionKey?: string;
      }
    >({
      query: ({ file, data, sessionKey }) => {
        const formData = new FormData();

        // Generate a UUID for entityId
        const entityId = crypto.randomUUID();

        // Add file first (required)
        formData.append("file", file);

        // Add required fields for new endpoint
        formData.append("entityType", "contract");
        formData.append("entityId", entityId); // Use generated UUID
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

        console.log("🔗 Contract Document API Request Details:");
        console.log("URL:", `/document-management/upload`);
        console.log("Method: POST");
        console.log(
          "Session Key:",
          sessionKey || "Not provided (first upload)"
        );
        console.log("Entity ID:", entityId);
        console.log("Entity Type: contract");
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
      invalidatesTags: ["ContractDocument"],
    }),

    // Get all documents for a contract
    getContractDocuments: builder.query<ContractDocumentResponseDto[], string>({
      query: (contractId) => `/contract-documents/contract/${contractId}`,
      providesTags: ["ContractDocument"],
    }),

    // Get document requirements for a contract
    getDocumentRequirements: builder.query<DocumentRequirementsDto, string>({
      query: (contractId) =>
        `/contract-documents/contract/${contractId}/requirements`,
      providesTags: ["ContractDocument"],
    }),

    // Update document status
    updateDocumentStatus: builder.mutation<
      ContractDocumentResponseDto,
      {
        documentId: string;
        status: string;
      }
    >({
      query: ({ documentId, status }) => ({
        url: `/contract-documents/${documentId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ContractDocument"],
    }),

    // Delete a document
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (documentId) => ({
        url: `/document-management/pending/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContractDocument"],
    }),

    // Generate contract agreement
    generateContractAgreement: builder.mutation<
      ContractDocumentResponseDto,
      string
    >({
      query: (contractId) => ({
        url: `/contract-documents/contract/${contractId}/generate-agreement`,
        method: "POST",
      }),
      invalidatesTags: ["ContractDocument"],
    }),

    // Remove a pending document
    removePendingDocument: builder.mutation<
      { message: string },
      {
        documentId: string;
        sessionKey: string;
      }
    >({
      query: ({ documentId, sessionKey }) => {
        console.log("documentId", documentId);
        console.log("sessionKey", sessionKey);
        return {
          url: `/document-management/pending/${documentId}?sessionKey=${sessionKey}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["ContractDocument"],
    }),

    // Replace a pending document
    replacePendingDocument: builder.mutation<
      ContractDocumentResponseDto,
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
          url: `/contract-documents/pending/${documentId}/replace?sessionKey=${sessionKey}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["ContractDocument"],
    }),
  }),
});

export const {
  useTestConnectionQuery,
  useUploadDocumentMutation,
  useGetContractDocumentsQuery,
  useGetDocumentRequirementsQuery,
  useUpdateDocumentStatusMutation,
  useDeleteDocumentMutation,
  useGenerateContractAgreementMutation,
  useRemovePendingDocumentMutation,
  useReplacePendingDocumentMutation,
} = contractDocumentApi;
