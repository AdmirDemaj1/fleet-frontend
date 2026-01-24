import { useMemo, useState } from "react";
import { customerApi } from "../api/customerApi";
import { documentApi, downloadFile } from "../api/documentApi";
import { CreateCustomerDto, Customer } from "../types/customer.types";
import { useNotification } from "../../../shared/hooks/useNotification";

type UploadEntityType = "administrator" | "customer";

type UploadItem = {
  type: string;
  file: File;
  expiryDate: string;
  title: string;
};

type UploadFailure = {
  key: string;
  type: string;
  title: string;
  fileName: string;
  message: string;
};

export type DocumentUploadState = {
  status: "none" | "success" | "partial" | "failed";
  entityType: UploadEntityType | null;
  total: number;
  uploaded: number;
  failed: number;
  failures: UploadFailure[];
};

interface CreateCustomerResult {
  customer: Customer | null;
  isDownloading: boolean;
  uploadState: DocumentUploadState;
  lastUploadItems: UploadItem[];
  lastUploadEntityType: UploadEntityType | null;
  isUploadingDocuments: boolean;
  isRollingBack: boolean;
}

export const useCreateCustomerWithDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateCustomerResult>({
    customer: null,
    isDownloading: false,
    uploadState: {
      status: "none",
      entityType: null,
      total: 0,
      uploaded: 0,
      failed: 0,
      failures: [],
    },
    lastUploadItems: [],
    lastUploadEntityType: null,
    isUploadingDocuments: false,
    isRollingBack: false,
  });
  const { showSuccess, showError } = useNotification();

  const uploadKey = useMemo(() => {
    return (doc: UploadItem) =>
      `${doc.type}:${doc.title || doc.file.name}:${doc.file.name}`;
  }, []);

  const uploadDocuments = async (
    customerId: string,
    entityType: UploadEntityType,
    items: UploadItem[],
    onlyKeys?: Set<string>
  ): Promise<DocumentUploadState> => {
    if (!customerId || items.length === 0) {
      return {
        status: "none",
        entityType,
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      };
    }

    let uploaded = 0;
    let failed = 0;
    const failures: UploadFailure[] = [];

    for (const doc of items) {
      const key = uploadKey(doc);
      if (onlyKeys && !onlyKeys.has(key)) continue;
      if (!doc?.file) continue;

      try {
        // if (entityType === "administrator") {
        //   await customerApi.uploadAdministratorDocument(
        //     customerId,
        //     doc.file,
        //     doc.type,
        //     doc.expiryDate,
        //     doc.title
        //   );
        // } else {
          await customerApi.uploadCustomerDocument(
            customerId,
            doc.file,
            doc.type,
            doc.expiryDate,
            doc.title
          );
        // }
        uploaded++;
      } catch (uploadError: any) {
        failed++;
        failures.push({
          key,
          type: doc.type,
          title: doc.title,
          fileName: doc.file?.name || "unknown",
          message:
            uploadError?.response?.data?.message ||
            uploadError?.message ||
            "Upload failed",
        });
      }
    }

    const total = onlyKeys ? uploaded + failed : items.length;
    const status: DocumentUploadState["status"] =
      total === 0
        ? "none"
        : failed === 0
          ? "success"
          : uploaded === 0
            ? "failed"
            : "partial";

    return { status, entityType, total, uploaded, failed, failures };
  };

  const createCustomer = async (
    data: CreateCustomerDto & {
      administratorDocuments?: Array<{
        type: string;
        file: File;
        expiryDate: string;
        title: string;
      }>;
      individualDocuments?: Array<{
        type: string;
        file: File;
        expiryDate: string;
        title: string;
      }>;
    }
  ): Promise<Customer> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Creating customer with data:", data);
      // Extract documents if present
      const documents: UploadItem[] = ((data as any).administratorDocuments || []).filter(
        (d: any) => !!d?.file
      );
      const individualDocuments: UploadItem[] = (
        (data as any).individualDocuments || []
      ).filter((d: any) => !!d?.file);
      const customerData = { ...data };
      delete (customerData as any).administratorDocuments;
      delete (customerData as any).individualDocuments;

      // customerApi.create already extracts the customer from the wrapped response
      const customer = await customerApi.create(customerData);
      console.log("Customer created:", customer);
      console.log("Customer ID:", customer?.id);

      let uploadState: DocumentUploadState = {
        status: "none",
        entityType: null,
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      };

      if (customer?.id) {
        if (documents.length > 0) {
          uploadState = await uploadDocuments(
            customer.id,
            "administrator",
            documents
          );
        } else if (individualDocuments.length > 0) {
          uploadState = await uploadDocuments(
            customer.id,
            "customer",
            individualDocuments
          );
        }
      }

      if (uploadState.status === "partial" || uploadState.status === "failed") {
        const entityLabel =
          uploadState.entityType === "administrator" ? "Administrator" : "Customer";
        showError(
          `${entityLabel} created, but ${uploadState.failed} document(s) failed to upload. You can retry uploads or rollback.`
        );
      } else if (uploadState.status === "success") {
        const entityLabel =
          uploadState.entityType === "administrator" ? "Administrator" : "Customer";
        showSuccess(
          `${entityLabel} created successfully with ${uploadState.uploaded} document(s)!`
        );
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

      setResult({
        customer,
        isDownloading: false,
        uploadState,
        lastUploadItems:
          uploadState.entityType === "administrator"
            ? documents
            : uploadState.entityType === "customer"
              ? individualDocuments
              : [],
        lastUploadEntityType: uploadState.entityType,
        isUploadingDocuments: false,
        isRollingBack: false,
      });
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

  const retryFailedUploads = async (): Promise<void> => {
    const customerId = result.customer?.id;
    const entityType = result.lastUploadEntityType;
    const items = result.lastUploadItems;

    if (!customerId || !entityType || items.length === 0) {
      showError("Nothing to retry: missing customer or documents.");
      return;
    }

    const failedKeys = new Set(result.uploadState.failures.map((f) => f.key));
    if (failedKeys.size === 0) {
      showSuccess("All documents are already uploaded.");
      return;
    }

    setResult((prev) => ({ ...prev, isUploadingDocuments: true }));
    try {
      const retryState = await uploadDocuments(
        customerId,
        entityType,
        items,
        failedKeys
      );

      // Merge: remove retried keys that succeeded, keep those that still fail.
      const stillFailing = new Map<string, UploadFailure>();
      for (const f of retryState.failures) stillFailing.set(f.key, f);

      const remainingFailures = result.uploadState.failures
        .filter((f) => failedKeys.has(f.key))
        .map((f) => stillFailing.get(f.key) || null)
        .filter(Boolean) as UploadFailure[];

      const uploadedDelta = retryState.uploaded;
      const failedNow = remainingFailures.length;
      const total = result.uploadState.total;
      const uploaded = Math.min(total, result.uploadState.uploaded + uploadedDelta);
      const failed = Math.max(0, total - uploaded);

      const status: DocumentUploadState["status"] =
        total === 0
          ? "none"
          : failedNow === 0 && failed === 0
            ? "success"
            : uploaded === 0
              ? "failed"
              : "partial";

      const nextUploadState: DocumentUploadState = {
        ...result.uploadState,
        status,
        uploaded,
        failed,
        failures: remainingFailures,
      };

      setResult((prev) => ({ ...prev, uploadState: nextUploadState }));

      if (nextUploadState.status === "success") {
        showSuccess("All documents uploaded successfully.");
      } else {
        showError(
          `${nextUploadState.failed} document(s) are still failing. You can retry again or upload later from the customer page.`
        );
      }
    } finally {
      setResult((prev) => ({ ...prev, isUploadingDocuments: false }));
    }
  };

  const rollbackCustomer = async (): Promise<void> => {
    const customerId = result.customer?.id;
    if (!customerId) {
      showError("No customer to rollback.");
      return;
    }

    setResult((prev) => ({ ...prev, isRollingBack: true }));
    try {
      const res = await customerApi.delete(customerId);
      if ((res as any)?.requiresApproval) {
        showError(
          res.message ||
            "Rollback requested, but deletion requires approval. Check approvals."
        );
        return;
      }

      showSuccess(res.message || "Customer rolled back (deleted) successfully.");
      // Fully reset local state only if we actually deleted immediately.
      setResult({
        customer: null,
        isDownloading: false,
        uploadState: {
          status: "none",
          entityType: null,
          total: 0,
          uploaded: 0,
          failed: 0,
          failures: [],
        },
        lastUploadItems: [],
        lastUploadEntityType: null,
        isUploadingDocuments: false,
        isRollingBack: false,
      });
      setError(null);
    } catch (e: any) {
      showError(e?.message || "Failed to rollback customer.");
    } finally {
      setResult((prev) => ({ ...prev, isRollingBack: false }));
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
    setResult({
      customer: null,
      isDownloading: false,
      uploadState: {
        status: "none",
        entityType: null,
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      },
      lastUploadItems: [],
      lastUploadEntityType: null,
      isUploadingDocuments: false,
      isRollingBack: false,
    });
    setError(null);
  };

  return {
    createCustomer,
    downloadRegistrationDocument,
    retryFailedUploads,
    rollbackCustomer,
    loading,
    error,
    customer: result.customer,
    isDownloading: result.isDownloading,
    uploadState: result.uploadState,
    isUploadingDocuments: result.isUploadingDocuments,
    isRollingBack: result.isRollingBack,
    reset,
  };
};
