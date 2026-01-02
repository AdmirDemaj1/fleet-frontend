// Document category enum - matches backend document types
export enum DocumentCategory {
  ID_CARD = "id_card",
  INSURANCE = "insurance",
  TPL = "tpl", // Third Party Liability
  CASCO = "casco",
  DRIVING_PERMIT = "driving_permit", // Leje qarkullimi
  CUSTOMER_REGISTRATION = "customer_registration",
  ENDORSER_ID = "endorser_id",
  CONTRACT_AGREEMENT = "contract_agreement",
  BUSINESS_REGISTRATION = "business_registration",
  TAX_CERTIFICATE = "tax_certificate",
}

// Contract document interface for local document management
export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File; // Optional for existing documents
  documentId?: string; // ID of existing document from API
  fileName?: string; // Name of existing document file
  category: DocumentCategory;
  description?: string;
  expiryDate?: string; // YYYY-MM-DD format
  isRequired: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  // Versioning fields for optimistic updates
  parentDocumentId?: string; // ID of document being replaced
  version?: number; // Document version number
  isCurrent?: boolean; // Whether this is the current active version
  isPendingReplacement?: boolean; // Whether this document has a pending replacement
  pendingReplacementId?: string; // ID of the pending replacement document
}

