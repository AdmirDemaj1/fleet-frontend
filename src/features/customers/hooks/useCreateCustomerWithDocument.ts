import { useState } from "react";
import { customerApi } from "../api/customerApi";
import { documentApi, downloadFile } from "../api/documentApi";
import { CreateCustomerDto, Customer } from "../types/customer.types";
import { useNotification } from "../../../shared/hooks/useNotification";

interface CreateCustomerResult {
  customer: Customer | null;
  isDownloading: boolean;
}

export const useCreateCustomerWithDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateCustomerResult>({
    customer: null,
    isDownloading: false,
  });
  const { showSuccess, showError } = useNotification();

  const createCustomer = async (data: CreateCustomerDto & { administratorDocuments?: Array<{ type: string; file: File; expiryDate: string; title: string }> }): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Creating customer with data:", data);
      // Extract documents if present
      const documents = (data as any).administratorDocuments || [];
      const customerData = { ...data };
      delete (customerData as any).administratorDocuments;

      // customerApi.create already extracts the customer from the wrapped response
      const customer = await customerApi.create(customerData);
      console.log("Customer created:", customer);
      console.log("Customer ID:", customer?.id);

      // Upload documents if present (for administrators)
      // The form sends administratorDocuments in the data, so if they exist, upload them
      if (documents.length > 0 && customer?.id) {
        console.log(`📄 Uploading ${documents.length} document(s) for administrator:`, customer.id);
        let uploadedCount = 0;
        let failedCount = 0;

        for (const doc of documents) {
          try {
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
          } catch (uploadError: any) {
            console.error(`❌ Failed to upload document ${doc.type}:`, uploadError);
            console.error(`❌ Error details:`, uploadError.response?.data || uploadError.message);
            failedCount++;
          }
        }

        if (failedCount > 0) {
          showError(`Administrator created but ${failedCount} document(s) failed to upload.`);
        } else if (uploadedCount > 0) {
          showSuccess(`Administrator created successfully with ${uploadedCount} document(s)!`);
        } else {
          showSuccess("Administrator created successfully");
        }
      } else {
        // Determine customer type for success message
        let entityType = "Customer";
        if (data.administratorDetails || (data as any).administratorName) {
          entityType = "Administrator";
        } else if (data.businessDetails) {
          entityType = "Business Customer";
        } else if (data.individualDetails) {
          entityType = "Individual Customer";
        }

        showSuccess(`${entityType} created successfully`);
      }

      setResult({ customer, isDownloading: false });
      return customer;
    } catch (err) {
      console.error("Error creating customer:", err);
      const message =
        err instanceof Error ? err.message : "Failed to create customer";
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Detect if customer is an administrator based on data structure
  const isAdministrator = (customer: Customer | null): boolean => {
    if (!customer) return false;
    return !!(
      (customer as any).administratorName && 
      (customer as any).companyName
    );
  };

  const downloadRegistrationDocument = async (customerId: string) => {
    if (!customerId) {
      showError("Customer ID is required for document download");
      return;
    }

    setResult((prev) => ({ ...prev, isDownloading: true }));

    try {
      const isAdmin = isAdministrator(result.customer);
      const entityType = isAdmin ? "administrator" : "customer";
      
      console.log(
        `📄 Downloading registration document for ${entityType}:`,
        customerId
      );

      // Use the correct endpoint based on entity type
      const pdfBlob = isAdmin
        ? await documentApi.downloadAdministratorRegistrationPdf(customerId)
        : await documentApi.downloadCustomerRegistrationPdf(customerId);

      console.log("📄 PDF blob received:", pdfBlob.size, "bytes");

      // Generate filename with timestamp
      const fileName = `${entityType}-registration-${customerId}-${Date.now()}.pdf`;

      // Trigger download
      downloadFile(pdfBlob, fileName);

      showSuccess("Registration document downloaded successfully");
    } catch (err: any) {
      console.error("❌ Failed to download registration document:", err);

      // Try to get more detailed error message
      let message = "Failed to download registration document";
      if (err.response?.data) {
        // If the response is a blob (error response), try to read it
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const errorData = JSON.parse(text);
            message = errorData.message || message;
          } catch {
            // Ignore parsing errors
          }
        } else if (typeof err.response.data === "object") {
          message = err.response.data.message || message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      showError(message);
    } finally {
      setResult((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  const reset = () => {
    setResult({ customer: null, isDownloading: false });
    setError(null);
  };

  return {
    createCustomer,
    downloadRegistrationDocument,
    loading,
    error,
    customer: result.customer,
    isDownloading: result.isDownloading,
    reset,
  };
};
