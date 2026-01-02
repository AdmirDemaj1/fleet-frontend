import { VehicleDocumentFile } from "../components/VehicleDocumentUpload/VehicleDocumentUpload";
import { VehicleDocumentType } from "../types/vehicleType";

/**
 * Merges active documents with pending documents, handling pending replacements
 * Returns both the current documents (with replacement flags) and pending replacement documents
 */
export const mergeActiveAndPendingDocuments = (
  activeDocuments: VehicleDocumentFile[],
  pendingDocuments: any[]
): VehicleDocumentFile[] => {
  const documentsWithPendingReplacements: VehicleDocumentFile[] = [];
  const pendingReplacementIds = new Set<string>();

  // Process active documents and find their pending replacements
  const mergedDocs = activeDocuments.map((doc) => {
    // Check if this document has a pending replacement
    let pendingReplacement: any = null;

    if (doc.isPendingReplacement && doc.pendingReplacementId) {
      // Document already marked as having pending replacement - find the pending replacement document
      pendingReplacement = pendingDocuments.find(
        (pending: any) => pending.id === doc.pendingReplacementId
      );
    } else {
      // Check if any pending document replaces this one (by checking replacesDocumentId or parentDocumentId)
      pendingReplacement = pendingDocuments.find(
        (pending: any) =>
          pending.replacesDocumentId === doc.documentId ||
          pending.replacesDocumentId === doc.id ||
          pending.parentDocumentId === doc.documentId ||
          pending.parentDocumentId === doc.id
      );
    }

    // If we found a pending replacement, add it to the list so both are displayed
    if (pendingReplacement) {
      pendingReplacementIds.add(pendingReplacement.id);

      // Transform the pending replacement document to VehicleDocumentFile format
      const pendingReplacementDoc = transformPendingReplacementToVehicleFormat(
        pendingReplacement,
        doc.documentId || doc.id
      );

      documentsWithPendingReplacements.push(pendingReplacementDoc);
    }

    // Mark the current document as having a pending replacement
    return {
      ...doc,
      isPendingReplacement: !!pendingReplacement,
      pendingReplacementId: pendingReplacement ? pendingReplacement.id : undefined,
    };
  });

  // Add new pending documents (not replacements - these are brand new documents)
  const newPendingDocs = pendingDocuments
    .filter(
      (pending: any) =>
        !pending.replacesDocumentId &&
        !pending.parentDocumentId &&
        !pendingReplacementIds.has(pending.id) // Don't include if already added as replacement
    )
    .map((doc: any) => transformNewPendingDocumentToVehicleFormat(doc));

  // Combine: current docs (with replacement flags) + pending replacements + new pending docs
  // This ensures both the current document and its pending replacement are in the array
  const allDocuments = [...mergedDocs, ...documentsWithPendingReplacements, ...newPendingDocs];

  console.log("📄 Merged vehicle documents:", {
    active: mergedDocs.length,
    pendingReplacements: documentsWithPendingReplacements.length,
    newPending: newPendingDocs.length,
    total: allDocuments.length,
  });

  return allDocuments;
};

/**
 * Transforms a pending replacement document to VehicleDocumentFile format
 */
const transformPendingReplacementToVehicleFormat = (
  pendingDoc: any,
  parentDocId: string
): VehicleDocumentFile => {
  let category: VehicleDocumentType;
  const docType = pendingDoc.type?.toLowerCase();

  if (docType === "vehicle_registration") {
    category = VehicleDocumentType.VEHICLE_REGISTRATION;
  } else if (docType === "vehicle_inspection") {
    category = VehicleDocumentType.VEHICLE_INSPECTION;
  } else if (docType === "insurance") {
    category = VehicleDocumentType.INSURANCE;
  } else if (docType === "tpl") {
    category = VehicleDocumentType.TPL;
  } else if (docType === "casco") {
    category = VehicleDocumentType.CASCO;
  } else if (docType === "purchase_invoice") {
    category = VehicleDocumentType.PURCHASE_INVOICE;
  } else if (docType === "technical_passport") {
    category = VehicleDocumentType.TECHNICAL_PASSPORT;
  } else {
    category = VehicleDocumentType.OTHER;
  }

  return {
    id: pendingDoc.id,
    name: pendingDoc.fileName || pendingDoc.title,
    type: pendingDoc.type || "application/pdf",
    size: 0,
    documentId: pendingDoc.id,
    category: category,
    description: pendingDoc.title,
    expiryDate: "", // Would need to be fetched separately if available
    isRequired: [
      VehicleDocumentType.VEHICLE_REGISTRATION,
      VehicleDocumentType.VEHICLE_INSPECTION,
      VehicleDocumentType.INSURANCE,
      VehicleDocumentType.TPL,
      VehicleDocumentType.CASCO,
    ].includes(category),
    status: "pending" as const,
    uploadedAt: pendingDoc.createdAt ? new Date(pendingDoc.createdAt) : new Date(),
    parentDocumentId: parentDocId,
    version: pendingDoc.version,
    isCurrent: false,
    isPendingReplacement: false,
    pendingReplacementId: undefined,
  };
};

/**
 * Transforms a new pending document (not a replacement) to VehicleDocumentFile format
 */
const transformNewPendingDocumentToVehicleFormat = (doc: any): VehicleDocumentFile => {
  let category: VehicleDocumentType;
  const docType = doc.type?.toLowerCase();

  if (docType === "vehicle_registration") {
    category = VehicleDocumentType.VEHICLE_REGISTRATION;
  } else if (docType === "vehicle_inspection") {
    category = VehicleDocumentType.VEHICLE_INSPECTION;
  } else if (docType === "insurance") {
    category = VehicleDocumentType.INSURANCE;
  } else if (docType === "tpl") {
    category = VehicleDocumentType.TPL;
  } else if (docType === "casco") {
    category = VehicleDocumentType.CASCO;
  } else if (docType === "purchase_invoice") {
    category = VehicleDocumentType.PURCHASE_INVOICE;
  } else if (docType === "technical_passport") {
    category = VehicleDocumentType.TECHNICAL_PASSPORT;
  } else {
    category = VehicleDocumentType.OTHER;
  }

  return {
    id: doc.id,
    name: doc.fileName || doc.title,
    type: doc.type || "application/pdf",
    size: 0,
    documentId: doc.id,
    category: category,
    description: doc.title,
    expiryDate: "", // Would need to be fetched separately if available
    isRequired: [
      VehicleDocumentType.VEHICLE_REGISTRATION,
      VehicleDocumentType.VEHICLE_INSPECTION,
      VehicleDocumentType.INSURANCE,
      VehicleDocumentType.TPL,
      VehicleDocumentType.CASCO,
    ].includes(category),
    status: "pending" as const,
    uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    parentDocumentId: doc.parentDocumentId,
    version: doc.version,
    isCurrent: doc.isCurrent || false,
  };
};

