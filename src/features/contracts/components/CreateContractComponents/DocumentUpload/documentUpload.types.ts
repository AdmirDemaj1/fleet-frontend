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
  file: File;
  category: DocumentCategory;
  description?: string;
  expiryDate?: string; // YYYY-MM-DD format
  isRequired: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

