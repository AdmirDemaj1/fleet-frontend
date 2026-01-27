import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/utils/rtkBaseQuery";

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

// Interface for the actual upload request (standalone document upload)
export interface UploadRequestData {
  type: ContractDocumentType;
  title: string;
  description?: string;
  expiryDate: string; // Required for all documents
  customerId?: string;
  contractId?: string;
  vehicleId?: string;
  metadata?: Record<string, any>;
}

// Response DTO
export interface ContractDocumentResponseDto {
  id: string;
  type: ContractDocumentType;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  status: ContractDocumentStatus;
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
  requiredDocuments: ContractDocumentType[];
  optionalDocuments: ContractDocumentType[];
  documentStatus: Record<ContractDocumentType, ContractDocumentStatus>;
  isComplete: boolean;
  missingDocuments: ContractDocumentType[];
}

export const contractDocumentApi = createApi({
  reducerPath: "contractDocumentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ContractDocument"],
  endpoints: (builder) => ({
    // Test endpoint to verify backend connection
    testConnection: builder.query<any, void>({
      query: () => "/",
    }),

    // Upload a standalone contract document using /documents/upload endpoint
    // Note: For new contracts, documents should be uploaded with the contract creation request
    uploadDocument: builder.mutation<
      ContractDocumentResponseDto,
      {
        file: File;
        data: UploadRequestData;
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

        console.log("🔗 Contract Document API Request Details:");
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
      invalidatesTags: ["ContractDocument"],
    }),

    // Get all documents for a contract
    getContractDocuments: builder.query<ContractDocumentResponseDto[], string>({
      query: (contractId) => `/documents/contract/${contractId}`,
      providesTags: ["ContractDocument"],
    }),

    // Get document requirements for a contract
    getDocumentRequirements: builder.query<DocumentRequirementsDto, string>({
      query: (contractId) =>
        `/documents/contract/${contractId}/requirements`,
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
        url: `/documents/${documentId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ContractDocument"],
    }),

    // Delete a document
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
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
        url: `/documents/contract/${contractId}/generate-agreement`,
        method: "POST",
      }),
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
} = contractDocumentApi;
