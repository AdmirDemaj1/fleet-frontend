import { AdministratorDocumentType } from "../components/CustomerForm/Steps/AdministratorDocumentsStep";

/**
 * Maps API document type to AdministratorDocumentType enum
 */
export const mapApiTypeToAdministratorDocumentType = (
  docType: string
): AdministratorDocumentType | null => {
  if (docType === "business_administrator_id_card") {
    return AdministratorDocumentType.ID_CARD;
  } else if (docType === "business_administrator_qkb") {
    return AdministratorDocumentType.QKB;
  }
  return null;
};

/**
 * Transforms a single API document to administrator document format
 */
export const transformAdministratorDocument = (
  doc: any,
  pendingReplacement?: any
): any | null => {
  const docType = mapApiTypeToAdministratorDocumentType(doc.type);
  if (!docType) {
    return null;
  }

  const documentObj: any = {
    id: doc.id,
    type: docType,
    documentId: doc.id,
    fileName: doc.fileName || doc.title,
    title: doc.title || doc.fileName,
    expiryDate:
      doc.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    size: 0, // Size not available from API
    status: "uploaded",
    uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    // Mark as pending replacement if there's a pending document replacing it
    isPendingReplacement: !!pendingReplacement,
    pendingReplacementId: pendingReplacement?.id,
  };

  // Add pending replacement object if it exists
  if (pendingReplacement) {
    const pendingDocType = mapApiTypeToAdministratorDocumentType(pendingReplacement.type);
    if (!pendingDocType) {
      return documentObj; // Return without pending replacement if type is unknown
    }

    documentObj.pendingReplacement = {
      id: pendingReplacement.id,
      type: pendingDocType,
      documentId: pendingReplacement.id,
      fileName: pendingReplacement.fileName || pendingReplacement.title,
      title: pendingReplacement.title || pendingReplacement.fileName,
      expiryDate:
        pendingReplacement.expiryDate ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      size: 0,
      status: "pending",
      uploadedAt: pendingReplacement.createdAt
        ? new Date(pendingReplacement.createdAt)
        : undefined,
      parentDocumentId:
        pendingReplacement.replacesDocumentId ||
        pendingReplacement.parentDocumentId,
    };
  }

  return documentObj;
};

/**
 * Transforms API documents to administrator form format
 */
export const transformAdministratorDocuments = (
  documents: any[],
  pendingDocuments: any[] = []
): any[] => {
  if (!documents || documents.length === 0) {
    return [];
  }

  return documents
    .map((doc) => {
      // Check if this document has a pending replacement
      const pendingReplacement = pendingDocuments.find(
        (pending) =>
          pending.replacesDocumentId === doc.id ||
          pending.parentDocumentId === doc.id
      );

      return transformAdministratorDocument(doc, pendingReplacement);
    })
    .filter((doc): doc is any => doc !== null);
};

