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
  customerId: string;
  endorserId?: string;
  metadata?: Record<string, any>;
  expiryDate?: string;
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
  expiryDate?: Date;
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
      ContractDocumentResponseDto,
      {
        file: File;
        data: UploadRequestData;
        sessionKey: string;
      }
    >({
      query: ({ file, data, sessionKey }) => {
        const formData = new FormData();
        
        // Add file first (required)
        formData.append("file", file);
        
        // Add required fields
        formData.append("type", data.type);
        formData.append("title", data.title);
        formData.append("customerId", data.customerId);
        
        // Add sessionKey to the form data body
        formData.append("sessionKey", sessionKey);
        
        // Add optional fields
        if (data.description) {
          formData.append("description", data.description);
        }
        if (data.endorserId) {
          formData.append("endorserId", data.endorserId);
        }
        if (data.metadata) {
          // Don't stringify metadata - send it as individual fields
          Object.entries(data.metadata).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(`metadata[${key}]`, String(value));
            }
          });
        }
        if (data.expiryDate) {
          formData.append("expiryDate", data.expiryDate);
        }

        console.log("🔗 API Request Details:");
        console.log("URL:", `/contract-documents/upload?sessionKey=${sessionKey}`);
        console.log("Method: POST");
        console.log("Session Key:", sessionKey);
        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        return {
          url: `/contract-documents/upload?sessionKey=${sessionKey}`,
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
        url: `/contract-documents/${documentId}`,
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
      query: ({ documentId, sessionKey }) => ({
        url: `/contract-documents/pending/${documentId}?sessionKey=${sessionKey}`,
        method: "DELETE",
      }),
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
