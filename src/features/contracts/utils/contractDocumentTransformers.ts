import dayjs from "dayjs";

/**
 * Type mapping for contract document types to categories
 */
const CONTRACT_TYPE_TO_CATEGORY: Record<string, string> = {
  id_card: "id_card",
  insurance: "insurance",
  tpl: "tpl",
  casco: "casco",
  driving_permit: "driving_permit",
  customer_registration: "customer_registration",
  endorser_id: "endorser_id",
  contract_agreement: "contract_agreement",
  business_registration: "business_registration",
  tax_certificate: "tax_certificate",
};

/**
 * Determines document status from API response
 */
const determineDocumentStatus = (doc: any): "pending" | "uploaded" | "verified" | "rejected" => {
  if (doc.lifecycleStatus === "PENDING" || doc.status === "pending") {
    return "pending";
  }
  if (doc.status === "completed" || doc.lifecycleStatus === "ACTIVE") {
    return "uploaded";
  }
  if (doc.status === "verified") {
    return "verified";
  }
  if (doc.status === "rejected") {
    return "rejected";
  }
  return "uploaded";
};

/**
 * Transforms API documents to contract form format
 */
export const transformDocumentsToContractFormat = (apiDocuments: any[]): any[] => {
  if (!apiDocuments || apiDocuments.length === 0) {
    return [];
  }

  return apiDocuments.map((doc) => {
    const documentStatus = determineDocumentStatus(doc);

    return {
      id: doc.id,
      name: doc.title || doc.fileName || "",
      type: doc.type || "",
      size: doc.metadata?.size || doc.size || 0,
      fileName: doc.fileName,
      documentId: doc.id,
      category: CONTRACT_TYPE_TO_CATEGORY[doc.type] || doc.type,
      description: doc.description || "",
      expiryDate: doc.expiryDate
        ? dayjs(doc.expiryDate).format("YYYY-MM-DD")
        : undefined,
      isRequired: false,
      status: documentStatus,
      uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
      version: doc.version,
      isCurrent: doc.isCurrent,
      // Preserve pending replacement info from API
      isPendingReplacement: doc.isPendingReplacement || false,
      pendingReplacementId: doc.pendingReplacementId,
      parentDocumentId: doc.parentDocumentId || (doc as any).replacesDocumentId,
    };
  });
};

/**
 * Transforms a pending replacement document to contract format
 */
export const transformPendingReplacementToContractFormat = (pendingDoc: any, parentDocId: string): any => {
  return {
    id: pendingDoc.id,
    name: pendingDoc.title || pendingDoc.fileName || "",
    type: pendingDoc.type || "",
    size: pendingDoc.metadata?.size || pendingDoc.size || 0,
    fileName: pendingDoc.fileName,
    documentId: pendingDoc.id,
    category: CONTRACT_TYPE_TO_CATEGORY[pendingDoc.type] || pendingDoc.type,
    description: pendingDoc.description || "",
    expiryDate: pendingDoc.expiryDate
      ? dayjs(pendingDoc.expiryDate).format("YYYY-MM-DD")
      : undefined,
    isRequired: false,
    status: "pending" as const,
    uploadedAt: pendingDoc.createdAt ? new Date(pendingDoc.createdAt) : new Date(),
    version: pendingDoc.version,
    isCurrent: false,
    parentDocumentId: parentDocId,
    isPendingReplacement: false,
    pendingReplacementId: undefined,
  };
};

