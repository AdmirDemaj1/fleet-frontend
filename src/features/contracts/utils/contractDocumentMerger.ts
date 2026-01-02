import { transformPendingReplacementToContractFormat } from "./contractDocumentTransformers";

/**
 * Merges active documents with pending documents, handling pending replacements
 * Returns both the current documents (with replacement flags) and pending replacement documents
 */
export const mergeActiveAndPendingDocuments = (
  activeDocuments: any[],
  pendingDocuments: any[]
): {
  mergedDocuments: any[];
  pendingReplacementIds: Set<string>;
} => {
  const documentsWithPendingReplacements: any[] = [];
  const pendingReplacementIds = new Set<string>();

  // Process active documents and find their pending replacements
  const mergedDocs = activeDocuments.map((doc: any) => {
    // Check if this document has a pending replacement
    let pendingReplacement: any = null;

    if (doc.isPendingReplacement && doc.pendingReplacementId) {
      // Document already marked as having pending replacement - find the pending replacement document
      pendingReplacement = pendingDocuments.find(
        (pending: any) => (pending as any).id === doc.pendingReplacementId
      );
    } else {
      // Check if any pending document replaces this one (by checking replacesDocumentId or parentDocumentId)
      pendingReplacement = pendingDocuments.find(
        (pending: any) =>
          (pending as any).replacesDocumentId === doc.id ||
          (pending as any).parentDocumentId === doc.id
      );
    }

    // If we found a pending replacement, add it to the list so both are displayed
    if (pendingReplacement) {
      pendingReplacementIds.add((pendingReplacement as any).id);

      // Transform the pending replacement document to ContractDocument format
      const pendingReplacementDoc = transformPendingReplacementToContractFormat(
        pendingReplacement,
        doc.id
      );

      documentsWithPendingReplacements.push(pendingReplacementDoc);
    }

    // Mark the current document as having a pending replacement
    return {
      ...doc,
      isPendingReplacement: !!pendingReplacement,
      pendingReplacementId: pendingReplacement ? (pendingReplacement as any).id : undefined,
    };
  });

  // Add new pending documents (not replacements - these are brand new documents)
  const newPendingDocs = pendingDocuments.filter(
    (pending: any) =>
      !(pending as any).replacesDocumentId &&
      !(pending as any).parentDocumentId &&
      !pendingReplacementIds.has((pending as any).id) // Don't include if already added as replacement
  );

  // Combine: current docs (with replacement flags) + pending replacements + new pending docs
  // This ensures both the current document and its pending replacement are in the array
  const allDocuments = [...mergedDocs, ...documentsWithPendingReplacements, ...newPendingDocs];

  console.log("📄 Merged documents:", {
    active: mergedDocs.length,
    pendingReplacements: documentsWithPendingReplacements.length,
    newPending: newPendingDocs.length,
    total: allDocuments.length,
  });

  return {
    mergedDocuments: allDocuments,
    pendingReplacementIds,
  };
};

