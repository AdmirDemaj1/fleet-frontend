import { useState } from "react";
import { customerApi } from "../api/customerApi";
import { documentApi } from "../../../shared/api/documentApi";
import { Customer } from "../types/customer.types";
import { useNotification } from "../../../shared/hooks/useNotification";
import { AdministratorDocumentType } from "../components/CustomerForm/Steps/AdministratorDocumentsStep";

interface AdministratorDocument {
  type: AdministratorDocumentType;
  file?: File; // Optional for existing documents
  expiryDate: string;
  title: string;
  documentId?: string; // ID of existing document if updating
}

export const useUpdateAdministrator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const updateAdministrator = async (
    id: string,
    data: any & { administratorDocuments?: AdministratorDocument[] }
  ): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Updating administrator with data:", data);
      
      // Extract documents if present
      const documents = data.administratorDocuments || [];
      const administratorData = { ...data };
      delete (administratorData as any).administratorDocuments;

      // Update administrator details
      const customer = await customerApi.updateAdministrator(id, administratorData);
      console.log("Administrator updated:", customer);
      console.log("Administrator ID:", customer?.id);

      // Handle document updates/upload
      if (documents.length > 0 && customer?.id) {
        console.log(`📄 Processing ${documents.length} document(s) for administrator:`, customer.id);
        let uploadedCount = 0;
        let updatedCount = 0;
        let failedCount = 0;

        for (const doc of documents) {
          try {
            // If document has a file, it's a new upload or replacement
            if (doc.file) {
              console.log(`📄 Uploading document: ${doc.type} (${doc.file.name})`);
              await customerApi.uploadAdministratorDocument(
                customer.id,
                doc.file,
                doc.type,
                doc.expiryDate,
                doc.title
              );
              uploadedCount++;
              console.log(`✅ Document ${doc.type} uploaded successfully`);
            } else if (doc.documentId) {
              // Document exists but no new file - might need to update metadata
              // For now, we'll just count it as processed
              updatedCount++;
              console.log(`ℹ️ Document ${doc.type} already exists, skipping upload`);
            }
          } catch (uploadError: any) {
            console.error(`❌ Failed to process document ${doc.type}:`, uploadError);
            console.error(`❌ Error details:`, uploadError.response?.data || uploadError.message);
            failedCount++;
          }
        }

        if (failedCount > 0) {
          showError(`Administrator updated but ${failedCount} document(s) failed to process.`);
        } else if (uploadedCount > 0 || updatedCount > 0) {
          showSuccess(`Administrator updated successfully${uploadedCount > 0 ? ` with ${uploadedCount} new document(s)` : ''}!`);
        }
      } else {
        showSuccess("Administrator updated successfully");
      }

      return customer;
    } catch (err) {
      console.error("Error updating administrator:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update administrator";
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAdministrator,
    loading,
    error,
  };
};

