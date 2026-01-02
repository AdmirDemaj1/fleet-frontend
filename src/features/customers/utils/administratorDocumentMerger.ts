import { AdministratorDocumentType } from "../components/CustomerForm/Steps/AdministratorDocumentsStep";
import { mapApiTypeToAdministratorDocumentType } from "./administratorDocumentTransformers";

/**
 * Merges active documents with pending documents, handling pending replacements
 * Returns both the current documents (with replacement flags) and pending replacement documents
 */
export const mergeActiveAndPendingAdministratorDocuments = (
  activeDocuments: any[],
  pendingDocuments: any[]
): any[] => {
  const documentsWithPendingReplacements: any[] = [];
  const pendingReplacementIds = new Set<string>();

  // Process active documents and find their pending replacements
  const mergedDocs = activeDocuments
    .map((doc) => {
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
            pending.replacesDocumentId === doc.id ||
            pending.replacesDocumentId === doc.documentId ||
            pending.parentDocumentId === doc.id ||
            pending.parentDocumentId === doc.documentId
        );
      }

      // If we found a pending replacement, add it to the list so both are displayed
      if (pendingReplacement) {
        pendingReplacementIds.add(pendingReplacement.id);

        // Transform the pending replacement document
        const pendingReplacementDoc = transformPendingReplacementToAdministratorFormat(
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
        pendingReplacement: undefined, // Remove nested pending replacement, it's now a separate document
      };
    })
    .filter((doc): doc is any => doc !== null);

  // Add new pending documents (not replacements - these are brand new documents)
  const newPendingDocs = pendingDocuments
    .filter(
      (pending: any) =>
        !pending.replacesDocumentId &&
        !pending.parentDocumentId &&
        !pendingReplacementIds.has(pending.id) // Don't include if already added as replacement
    )
    .map((doc: any) => transformNewPendingDocumentToAdministratorFormat(doc))
    .filter((doc): doc is any => doc !== null);

  // Combine: current docs (with replacement flags) + pending replacements + new pending docs
  // This ensures both the current document and its pending replacement are in the array
  const allDocuments = [...mergedDocs, ...documentsWithPendingReplacements, ...newPendingDocs];

  console.log("📄 Merged administrator documents:", {
    active: mergedDocs.length,
    pendingReplacements: documentsWithPendingReplacements.length,
    newPending: newPendingDocs.length,
    total: allDocuments.length,
  });

  return allDocuments;
};

/**
 * Transforms a pending replacement document to administrator format
 */
const transformPendingReplacementToAdministratorFormat = (
  pendingDoc: any,
  parentDocId: string
): any => {
  const docType = mapApiTypeToAdministratorDocumentType(pendingDoc.type);
  if (!docType) {
    return null;
  }

  return {
    id: pendingDoc.id,
    type: docType,
    documentId: pendingDoc.id,
    fileName: pendingDoc.fileName || pendingDoc.title,
    title: pendingDoc.title || pendingDoc.fileName,
    expiryDate:
      pendingDoc.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    size: 0,
    status: "pending" as const,
    uploadedAt: pendingDoc.createdAt ? new Date(pendingDoc.createdAt) : new Date(),
    parentDocumentId: parentDocId,
    isPendingReplacement: false,
    pendingReplacementId: undefined,
    pendingReplacement: undefined,
  };
};

/**
 * Transforms a new pending document (not a replacement) to administrator format
 */
const transformNewPendingDocumentToAdministratorFormat = (doc: any): any => {
  const docType = mapApiTypeToAdministratorDocumentType(doc.type);
  if (!docType) {
    return null;
  }

  return {
    id: doc.id,
    type: docType,
    documentId: doc.id,
    fileName: doc.fileName || doc.title,
    title: doc.title || doc.fileName,
    expiryDate:
      doc.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    size: 0,
    status: "pending" as const,
    uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    parentDocumentId: doc.parentDocumentId,
    isPendingReplacement: false,
    pendingReplacementId: undefined,
    pendingReplacement: undefined,
  };
};

