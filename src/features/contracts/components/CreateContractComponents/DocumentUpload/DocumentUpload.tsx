import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
  CheckCircle,
  Error,
  Upload,
  Download,
  Visibility,
  SwapHoriz,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useNotification } from "../../../../../shared/hooks/useNotification";
import { VehicleSummary, CustomerSummary } from "../../../types/contract.types";
import { getApiUrl } from "../../../../../shared/utils/env";
import { DocumentCategory, ContractDocument } from "./documentUpload.types";
import { documentApi } from "../../../../../shared/api/documentApi";

// Re-export types for consumers
export { DocumentCategory } from "./documentUpload.types";
export type { ContractDocument } from "./documentUpload.types";

interface DocumentUploadProps {
  documents: ContractDocument[];
  onDocumentsChange: (documents: ContractDocument[]) => void;
  error?: string;
  customerId?: string;
  customerData?: CustomerSummary; // Full customer data including documents
  endorserId?: string;
  vehicleIds: string[];
  vehicleData?: VehicleSummary[]; // Full vehicle data including documents
  contractId?: string; // For edit mode - if provided, documents are uploaded immediately with PENDING status
  onPendingDocumentIdsChange?: (ids: string[]) => void; // Callback to track pending document IDs
}

const REQUIRED_DOCUMENTS = [
  {
    category: DocumentCategory.ID_CARD,
    name: "ID Card",
    description: "Valid government-issued photo identification",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  // Vehicle-related documents (INSURANCE, TPL, CASCO) removed - now provided by vehicle picker
  {
    category: DocumentCategory.DRIVING_PERMIT,
    name: "Driving Permit",
    description: "Valid driving license (Leje qarkullimi)",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true, // ✅ Requires expiry date
  },
  {
    category: DocumentCategory.CUSTOMER_REGISTRATION,
    name: "Customer Registration",
    description: "Customer registration documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  {
    category: DocumentCategory.CONTRACT_AGREEMENT,
    name: "Contract Agreement",
    description: "Contract agreement documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  {
    category: DocumentCategory.BUSINESS_REGISTRATION,
    name: "Business Registration",
    description: "Business Registration documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  {
    category: DocumentCategory.TAX_CERTIFICATE,
    name: "Tax Certificate",
    description: "Tax Certificate Documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
];

// Optional documents that can be uploaded manually if needed
const OPTIONAL_DOCUMENTS = [
  {
    category: DocumentCategory.ENDORSER_ID,
    name: "Endorser ID",
    description: "Endorser identification documents (optional)",
    isRequired: false,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  {
    category: DocumentCategory.TPL,
    name: "Third Party Liability (TPL)",
    description:
      "Third party liability insurance certificate (provided by selected vehicle)",
    isRequired: false, // No longer required for manual upload
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: DocumentCategory.CASCO,
    name: "CASCO Insurance",
    description:
      "Comprehensive vehicle insurance certificate (provided by selected vehicle)",
    isRequired: false, // No longer required for manual upload
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
];

// Combined array for dropdown selection (required + optional documents)
const ALL_DOCUMENTS = [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS];

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  error,
  customerId,
  customerData,
  endorserId,
  vehicleIds,
  vehicleData = [],
  contractId,
  onPendingDocumentIdsChange,
}) => {
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DocumentCategory.ID_CARD
  );
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentExpiryDate, setDocumentExpiryDate] = useState<string>("");
  const [uploadError, setUploadError] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<ContractDocument | null>(null);
  const [previewDocument, setPreviewDocument] = useState<any | null>(null); // For vehicle document preview
  const [replacingDocumentId, setReplacingDocumentId] = useState<string | null>(
    null
  );
  const [pendingDocumentIds, setPendingDocumentIds] = useState<string[]>([]);

  // Notification system
  const { showSuccess, showError } = useNotification();

  // Initialize pending document IDs from existing documents (for edit mode)
  // Use a ref to track if we've already initialized to prevent loops
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (contractId && documents.length > 0 && !hasInitializedRef.current) {
      const existingPendingIds = documents
        .filter((doc) => doc.status === "pending" && doc.documentId)
        .map((doc) => doc.documentId!)
        .filter(Boolean);

      if (existingPendingIds.length > 0) {
        setPendingDocumentIds(existingPendingIds);
        onPendingDocumentIdsChange?.(existingPendingIds);
        hasInitializedRef.current = true;
      }
    }
    // Reset initialization flag if contractId changes
    if (!contractId) {
      hasInitializedRef.current = false;
    }
  }, [contractId]); // Only depend on contractId to avoid loops

  // Effect to set expiry date when dialog opens - required for ALL documents
  useEffect(() => {
    if (isTypeDialogOpen && selectedCategory && !documentExpiryDate) {
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
      const formattedDate = defaultExpiryDate.toISOString().split("T")[0];
      setDocumentExpiryDate(formattedDate);
      console.log(
        "🗓️ Auto-set expiry date when dialog opened:",
        formattedDate,
        "for category:",
        selectedCategory
      );
    }
  }, [isTypeDialogOpen, selectedCategory, documentExpiryDate]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check if customer is selected before allowing uploads (optional but recommended for organization)
      if (!customerId) {
        setUploadError(
          "Please select a customer before uploading documents for better organization."
        );
        // Don't return - allow uploads to proceed
      }

      // For now, only handle one file at a time for better UX
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPendingFile(file);

        // Find the next required document type to upload
        const uploadedCategories = documents.map((doc) => doc.category);
        const nextRequiredDoc = REQUIRED_DOCUMENTS.find(
          (doc) => !uploadedCategories.includes(doc.category)
        );
        const defaultCategory =
          nextRequiredDoc?.category || DocumentCategory.ID_CARD;

        setSelectedCategory(defaultCategory);
        setDocumentDescription("");

        // Auto-set expiry date to 1 year from now for ALL documents
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
        const formattedDate = defaultExpiryDate.toISOString().split("T")[0];
        setDocumentExpiryDate(formattedDate);
        console.log(
          "🗓️ Auto-set expiry date on drop:",
          formattedDate,
          "for category:",
          defaultCategory
        );

        setUploadError(""); // Clear any previous errors
        setIsTypeDialogOpen(true);
      }
    },
    [customerId, documents]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 25 * 1024 * 1024, // 25MB max
    multiple: false, // Changed to false since we handle one file at a time
  });

  const handleDeleteDocument = async (documentId: string) => {
    try {
      console.log("Removing document:", documentId);
      setDeletingDocumentId(documentId);

      const documentToRemove = documents.find((doc) => doc.id === documentId);

      // If it's a pending document in edit mode, delete it from API
      if (
        contractId &&
        documentToRemove?.documentId &&
        documentToRemove.status === "pending"
      ) {
        try {
          await documentApi.deletePendingDocuments([
            documentToRemove.documentId,
          ]);
          console.log("✅ Deleted pending document from API");

          // Remove from pending document IDs
          const updatedPendingIds = pendingDocumentIds.filter(
            (id) => id !== documentToRemove.documentId
          );
          setPendingDocumentIds(updatedPendingIds);
          onPendingDocumentIdsChange?.(updatedPendingIds);
        } catch (error) {
          console.error("Failed to delete pending document from API:", error);
          // Continue with local removal even if API call fails
        }
      }

      // Remove from local state
      const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
      onDocumentsChange(updatedDocuments);

      showSuccess("Document removed");

      // Clear any previous errors
      setUploadError("");
    } catch (error) {
      console.error("Failed to delete document:", error);
      // Show error to user
      const errorMessage = "Failed to delete document. Please try again.";
      setUploadError(errorMessage);
      showError(errorMessage);
    } finally {
      setDeletingDocumentId(null);
      setDocumentToDelete(null); // Close confirmation dialog
    }
  };
  console.log("documentToDelete", documentToDelete);
  const handleDeleteClick = (document: ContractDocument) => {
    console.log("document", document);
    setDocumentToDelete(document);
  };

  const handleCancelDelete = () => {
    setDocumentToDelete(null);
  };

  const handleConfirmDocumentUpload = async () => {
    if (!pendingFile) return;

    // Check for duplicates by name
    const existingNames = documents.map((doc) => doc.name);
    if (existingNames.includes(pendingFile.name)) {
      // Show error and don't proceed
      setUploadError(
        `Document "${pendingFile.name}" has already been uploaded. Please use a different file or remove the existing one first.`
      );
      return;
    }

    // Check for duplicates by file content (using size and type as a basic check)
    const existingFile = documents.find(
      (doc) =>
        doc.size === pendingFile.size &&
        doc.type === pendingFile.type &&
        doc.name !== pendingFile.name
    );

    if (existingFile) {
      setUploadError(
        `A file with the same size and type has already been uploaded. Please ensure you're not uploading duplicate content.`
      );
      return;
    }

    // Check if this document category already has a document uploaded
    const existingCategoryDoc = documents.find(
      (doc) => doc.category === selectedCategory
    );

    if (existingCategoryDoc) {
      setUploadError(
        `A document of type "${
          ALL_DOCUMENTS.find((d) => d.category === selectedCategory)?.name
        }" has already been uploaded. Please remove the existing one first or choose a different category.`
      );
      return;
    }

    // Expiry date is required for ALL documents
    if (!documentExpiryDate) {
      setUploadError("Expiry date is required. Please select an expiry date.");
      return;
    }

    // Check if expiry date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (documentExpiryDate < today) {
      setUploadError(
        "Expiry date cannot be in the past. Please select a valid date."
      );
      return;
    }

    // Clear any previous errors
    setUploadError("");

    // For edit mode (contractId exists), upload immediately with PENDING status
    if (contractId) {
      try {
        // Map category to document type
        const documentType = selectedCategory; // Category already matches document type

        // Upload document immediately with PENDING status
        const uploadedDoc = await documentApi.uploadPendingDocument(
          pendingFile,
          {
            type: documentType,
            title: pendingFile.name,
            description: documentDescription,
            contractId: contractId,
            expiryDate: documentExpiryDate,
          }
        );

        console.log("✅ Uploaded pending document:", uploadedDoc);

        // Create document object from uploaded document
        const newDocument: ContractDocument = {
          id: uploadedDoc.id,
          name: pendingFile.name,
          type: pendingFile.type,
          size: pendingFile.size,
          file: pendingFile,
          documentId: uploadedDoc.id,
          fileName: uploadedDoc.fileName || uploadedDoc.title,
          category: selectedCategory,
          description: documentDescription,
          expiryDate: documentExpiryDate,
          isRequired: REQUIRED_DOCUMENTS.some(
            (doc) => doc.category === selectedCategory
          ),
          status: "pending", // PENDING until contract update is confirmed
          uploadedAt: new Date(uploadedDoc.createdAt),
          version: (uploadedDoc as any).version || 1,
          isCurrent: (uploadedDoc as any).isCurrent || false,
        };

        const updatedDocuments = [...documents, newDocument];
        onDocumentsChange(updatedDocuments);

        // Update pending document IDs
        const newPendingIds = [...pendingDocumentIds, uploadedDoc.id];
        setPendingDocumentIds(newPendingIds);
        onPendingDocumentIdsChange?.(newPendingIds);

        showSuccess(
          `Document "${pendingFile.name}" uploaded. Click Save to confirm changes.`
        );
      } catch (error) {
        console.error("Failed to upload document:", error);
        setUploadError("Failed to upload document. Please try again.");
        return;
      }
    } else {
      // For create mode (no contractId), store document locally
      const newDocument: ContractDocument = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: pendingFile.name,
        type: pendingFile.type,
        size: pendingFile.size,
        file: pendingFile,
        category: selectedCategory,
        description: documentDescription,
        expiryDate: documentExpiryDate,
        isRequired: REQUIRED_DOCUMENTS.some(
          (doc) => doc.category === selectedCategory
        ),
        status: "pending", // Will be uploaded with contract creation
        uploadedAt: new Date(),
      };

      console.log(
        "📄 Document added locally (will be uploaded with contract):"
      );
      console.log("  📁 File:", pendingFile.name);
      console.log("  📂 Category:", selectedCategory);
      console.log("  📅 Expiry Date:", documentExpiryDate);

      const updatedDocuments = [...documents, newDocument];
      onDocumentsChange(updatedDocuments);

      showSuccess(`Document "${pendingFile.name}" added successfully`);
    }

    // Reset and close dialog
    setPendingFile(null);
    setSelectedCategory(DocumentCategory.ID_CARD);
    setDocumentDescription("");
    setDocumentExpiryDate("");
    setIsTypeDialogOpen(false);
  };

  const handleCancelDocumentUpload = () => {
    setPendingFile(null);
    setSelectedCategory(DocumentCategory.ID_CARD);
    setDocumentDescription("");
    setDocumentExpiryDate("");
    setUploadError("");
    setIsTypeDialogOpen(false);
  };

  // Replace document - supports both create mode (local) and edit mode (optimistic update)
  const handleReplaceDocument = async (
    document: ContractDocument,
    newFile: File
  ) => {
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
    const formattedDate = defaultExpiryDate.toISOString().split("T")[0];

    // For edit mode (contractId exists), upload immediately with PENDING status
    if (contractId && document.documentId) {
      try {
        setReplacingDocumentId(document.id);

        // Upload document immediately with PENDING status as replacement
        const uploadedDoc = await documentApi.uploadPendingDocument(newFile, {
          type: document.category,
          title: newFile.name,
          description: document.description || "",
          contractId: contractId,
          replacesDocumentId: document.documentId,
          expiryDate: formattedDate,
        });

        console.log("✅ Uploaded pending replacement document:", uploadedDoc);

        // Create pending replacement document
        const pendingReplacement: ContractDocument = {
          id: uploadedDoc.id,
          name: newFile.name,
          type: newFile.type,
          size: newFile.size,
          file: newFile,
          documentId: uploadedDoc.id,
          fileName: uploadedDoc.fileName || uploadedDoc.title,
          category: document.category,
          description: document.description,
          expiryDate: formattedDate,
          isRequired: document.isRequired,
          status: "pending",
          uploadedAt: new Date(uploadedDoc.createdAt),
          parentDocumentId: document.documentId,
        };

        // Mark old document as having a pending replacement
        const updatedDocuments = documents.map((doc) => {
          if (doc.id === document.id) {
            return {
              ...doc,
              isPendingReplacement: true,
              pendingReplacementId: uploadedDoc.id,
            };
          }
          return doc;
        });

        // Add pending replacement to documents list
        updatedDocuments.push(pendingReplacement);
        onDocumentsChange(updatedDocuments);

        // Update pending document IDs
        const newPendingIds = [...pendingDocumentIds, uploadedDoc.id];
        setPendingDocumentIds(newPendingIds);
        onPendingDocumentIdsChange?.(newPendingIds);

        showSuccess("Document replacement uploaded. Click Save to confirm.");
      } catch (error) {
        console.error("Failed to upload replacement document:", error);
        showError("Failed to upload replacement document. Please try again.");
      } finally {
        setReplacingDocumentId(null);
      }
    } else {
      // For create mode (no contractId), just replace locally
      const updatedDocuments = documents.map((doc) => {
        if (doc.id === document.id) {
          return {
            ...doc,
            name: newFile.name,
            file: newFile,
            size: newFile.size,
            type: newFile.type,
          };
        }
        return doc;
      });

      onDocumentsChange(updatedDocuments);
      showSuccess("Document replaced successfully");
    }
  };

  const handleReplaceClick = (document: ContractDocument) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleReplaceDocument(document, file);
      }
    };
    input.click();
  };

  const handleCancelReplacement = async (document: ContractDocument) => {
    if (!document.pendingReplacementId) return;

    // Delete pending document if it was uploaded
    if (contractId && document.pendingReplacementId) {
      try {
        await documentApi.deletePendingDocuments([
          document.pendingReplacementId,
        ]);
      } catch (error) {
        console.error("Failed to delete pending document:", error);
      }
    }

    // Remove pending replacement from documents
    const updatedDocuments = documents
      .filter((d) => d.id !== document.pendingReplacementId)
      .map((d) => {
        if (d.id === document.id) {
          return {
            ...d,
            isPendingReplacement: false,
            pendingReplacementId: undefined,
          };
        }
        return d;
      });

    onDocumentsChange(updatedDocuments);

    // Update pending document IDs
    const newPendingIds = pendingDocumentIds.filter(
      (id) => id !== document.pendingReplacementId
    );
    setPendingDocumentIds(newPendingIds);
    onPendingDocumentIdsChange?.(newPendingIds);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <PictureAsPdf />;
    if (fileType.includes("image")) return <Image />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <Description />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "uploaded":
        return "info";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle fontSize="small" />;
      case "uploaded":
        return <Upload fontSize="small" />;
      case "rejected":
        return <Error fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const requiredDocuments = REQUIRED_DOCUMENTS.filter(
    (doc) =>
      !documents.some((uploadedDoc) => uploadedDoc.category === doc.category)
  );

  const missingRequired = requiredDocuments.filter((doc) => doc.isRequired);

  // Helper function to properly join URLs
  const buildFullUrl = useCallback((relativePath: string) => {
    const baseUrl = getApiUrl().replace(/\/$/, ""); // Remove trailing slash
    const path = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;
    return `${baseUrl}${path}`;
  }, []);

  // Handle vehicle document preview
  const handlePreviewVehicleDocument = useCallback(
    (document: any) => {
      console.log("🔍 Opening vehicle document preview:", document);
      console.log("  📄 Preview URL:", document.previewUrl);
      console.log("  📥 Download URL:", document.downloadUrl);
      console.log(
        "  🌐 Full Preview URL:",
        buildFullUrl(document.previewUrl || document.downloadUrl)
      );
      setPreviewDocument(document);
    },
    [buildFullUrl]
  );

  const openDocumentViewInNewTab = useCallback(
    async (documentId?: string) => {
      if (!documentId) {
        showError("Document ID is missing.");
        return;
      }

      try {
        // Match the customer documents preview behavior:
        // fetch as Blob via authenticated client, then open in a new tab WITHOUT forcing download.
        const blob = await documentApi.downloadDocument(documentId);
        const blobUrl = URL.createObjectURL(blob);

        const link = window.document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        // Best-effort cleanup (can't guarantee new tab finished reading)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (e: any) {
        console.error("Failed to open document:", e);
        showError(
          e?.response?.data?.message || e?.message || "Failed to open document"
        );
      }
    },
    [showError]
  );

  // Handle customer document preview
  const handlePreviewCustomerDocument = useCallback(
    (document: any) => {
      console.log("🔍 Opening customer document preview:", document);
      openDocumentViewInNewTab(document?.id);
    },
    [openDocumentViewInNewTab]
  );

  console.log("documents", documents);

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Description />
        Required Documents
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload all required documents to complete your contract application.
        After uploading each file, you'll be prompted to select the appropriate
        document category. Documents will be reviewed and verified by our team.
      </Typography>

      {/* Information about optional documents */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          📋 Document Requirements Updated
        </Typography>
        <Typography variant="body2">
          • Customer documents (ID Card, Registration) are automatically
          provided from the selected customer.
          <br />
          • Vehicle-related documents (Insurance, TPL, CASCO) are automatically
          provided from the selected vehicle.
          <br />• Endorser documents are optional and not required for contract
          creation.
        </Typography>
      </Alert>

      {/* Customer Documents Section */}
      {customerData &&
        customerData.documents &&
        customerData.documents.filter((doc) => doc.type !== "contract_agreement").length > 0 && (
          <Card
            sx={{
              mb: 3,
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "primary.50",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <CheckCircle />
                Customer Documents (Already Available)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The following documents are already associated with the selected
                customer:
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  👤 {customerData.name} ({customerData.type})
                </Typography>
                <Grid container spacing={1}>
                  {customerData.documents
                    .filter((doc) => doc.type !== "contract_agreement")
                    .map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1,
                          border: "1px solid",
                          borderColor: "primary.main",
                          bgcolor: "primary.50",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircle color="primary" fontSize="small" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              display: "block",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {doc.type.replace(/_/g, " ").toUpperCase()}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {doc.title}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePreviewCustomerDocument(doc)}
                          sx={{ ml: "auto" }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}

      {/* Vehicle Documents Section */}
      {vehicleData &&
        vehicleData.length > 0 &&
        vehicleData.some((v) => v.documents && v.documents.length > 0) && (
          <Card
            sx={{
              mb: 3,
              border: "2px solid",
              borderColor: "success.main",
              bgcolor: "success.50",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "success.main",
                }}
              >
                <CheckCircle />
                Vehicle Documents (Already Available)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The following documents are already associated with the selected
                vehicle(s):
              </Typography>

              {vehicleData.map(
                (vehicle) =>
                  vehicle.documents &&
                  vehicle.documents.length > 0 && (
                    <Box key={vehicle.id} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        📋 {vehicle.year} {vehicle.make} {vehicle.model} -{" "}
                        {vehicle.licensePlate}
                      </Typography>
                      <Grid container spacing={1}>
                        {vehicle.documents.map((doc) => (
                          <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                p: 1,
                                border: "1px solid",
                                borderColor: "success.main",
                                bgcolor: "success.50",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CheckCircle color="success" fontSize="small" />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    display: "block",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {doc.type}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {doc.title}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handlePreviewVehicleDocument(doc)
                                }
                                sx={{ ml: "auto" }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )
              )}
            </CardContent>
          </Card>
        )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!customerId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Customer selection is recommended for better document organization,
          but not required for upload.
        </Alert>
      )}

      {customerId && vehicleIds.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No vehicles selected. You can still upload documents, but vehicle
          information will not be associated.
        </Alert>
      )}

      {/* Missing Required Documents Alert */}
      {missingRequired.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Missing Required Documents ({missingRequired.length}):
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            {missingRequired.map((doc, index) => (
              <li key={index}>
                <strong>{doc.name}</strong> - {doc.description}
                {doc.requiresExpiryDate && (
                  <Typography
                    component="span"
                    color="warning.main"
                    sx={{ ml: 1, fontWeight: 500 }}
                  >
                    (Expiry date required)
                  </Typography>
                )}
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {/* Document Upload Area */}
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          border: `2px dashed ${isDragActive ? "primary.main" : "divider"}`,
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          cursor: customerId ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          bgcolor: isDragActive
            ? "primary.50"
            : customerId
            ? "background.paper"
            : "grey.100",
          opacity: customerId ? 1 : 0.6,
          "&:hover": {
            borderColor: customerId ? "primary.main" : "divider",
            bgcolor: customerId ? "primary.50" : "grey.100",
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? "Drop file here" : "Drag & drop a file here"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported formats: PDF, JPG, PNG, DOC, DOCX (Max: 25MB per file)
        </Typography>
        <Typography
          variant="caption"
          color="primary.main"
          sx={{ display: "block", mt: 1, fontWeight: 500 }}
        >
          You'll be prompted to select the document type after upload
        </Typography>
        {customerId && (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ display: "block", mt: 1, fontWeight: 500 }}
          >
            ✓ Customer: {customerId.slice(0, 8)}... | Vehicles:{" "}
            {vehicleIds.length} | Endorser:{" "}
            {endorserId ? endorserId.slice(0, 8) + "..." : "None"}
          </Typography>
        )}
        {!customerId && (
          <Typography
            variant="caption"
            color="info.main"
            sx={{ display: "block", mt: 1, fontWeight: 500 }}
          >
            ℹ️ No customer selected - documents will be uploaded with session
            key only
          </Typography>
        )}
      </Paper>

      {/* Required Documents Checklist */}
      {REQUIRED_DOCUMENTS.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Required Documents Checklist
          </Typography>
          <Grid container spacing={2}>
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploadedDoc = documents.find(
                (d) => d.category === doc.category
              );
              const isCompleted = !!uploadedDoc;

              return (
                <Grid item xs={12} sm={6} md={4} key={doc.category}>
                  <Card
                    elevation={0}
                    sx={{
                      border: `1px solid ${
                        isCompleted ? "success.main" : "divider"
                      }`,
                      bgcolor: isCompleted ? "success.50" : "background.paper",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Description color="action" fontSize="small" />
                        )}
                        <Typography variant="body2" fontWeight={600}>
                          {doc.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description}
                      </Typography>
                      {doc.requiresExpiryDate && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ display: "block", mt: 0.5, fontWeight: 500 }}
                        >
                          ⚠️ Expiry date required
                        </Typography>
                      )}
                      {uploadedDoc && (
                        <Chip
                          label={uploadedDoc.status}
                          size="small"
                          color={getStatusColor(uploadedDoc.status)}
                          icon={getStatusIcon(uploadedDoc.status)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Uploaded Documents ({documents.length})
          </Typography>

          <List>
            {documents.map((document) => {
              // Skip pending replacements in main list - they're shown with their parent
              if (document.parentDocumentId && document.status === "pending") {
                return null;
              }

              const pendingReplacement = document.pendingReplacementId
                ? documents.find((d) => d.id === document.pendingReplacementId)
                : null;

              return (
                <React.Fragment key={document.id}>
                  <ListItem
                    sx={{
                      border: "1px solid",
                      borderColor: document.isPendingReplacement
                        ? "warning.main"
                        : "divider",
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: document.isPendingReplacement
                        ? "warning.50"
                        : "background.paper",
                      opacity: document.isPendingReplacement ? 0.7 : 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                      {getFileIcon(document.type)}
                    </Box>

                    <ListItemText
                      primary={
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {document.name}
                            </Typography>
                            {document.isPendingReplacement && (
                              <Chip
                                label="Will be replaced"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(document.size)} •{" "}
                            {document.category} •{" "}
                            {document.uploadedAt?.toLocaleDateString() ||
                              "Existing"}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={document.status}
                            size="small"
                            color={getStatusColor(document.status)}
                            icon={getStatusIcon(document.status)}
                            sx={{ mr: 1 }}
                          />
                          {document.isRequired && (
                            <Chip
                              label="Required"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {document.file ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const url = URL.createObjectURL(document.file!);
                                window.open(url, "_blank");
                              }}
                              title="Preview document"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const url = URL.createObjectURL(document.file!);
                                const a = window.document.createElement("a");
                                a.href = url;
                                a.download = document.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              title="Download document"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </>
                        ) : document.documentId ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                try {
                                  const blob =
                                    await documentApi.downloadDocument(
                                      document.documentId!
                                    );
                                  const blobUrl =
                                    window.URL.createObjectURL(blob);
                                  window.open(blobUrl, "_blank");
                                  setTimeout(
                                    () => window.URL.revokeObjectURL(blobUrl),
                                    100
                                  );
                                } catch (error) {
                                  showError("Failed to preview document");
                                }
                              }}
                              title="Preview document"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                try {
                                  const blob =
                                    await documentApi.downloadDocument(
                                      document.documentId!
                                    );
                                  const url = window.URL.createObjectURL(blob);
                                  const a = window.document.createElement("a");
                                  a.href = url;
                                  a.download = document.name;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  showError("Failed to download document");
                                }
                              }}
                              title="Download document"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReplaceClick(document)}
                              color="primary"
                              title="Replace document"
                              disabled={
                                replacingDocumentId === document.id ||
                                document.isPendingReplacement
                              }
                            >
                              {replacingDocumentId === document.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <SwapHoriz fontSize="small" />
                              )}
                            </IconButton>
                          </>
                        ) : null}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(document)}
                          color="error"
                          title="Delete document"
                          disabled={
                            deletingDocumentId === document.id ||
                            document.isPendingReplacement
                          }
                        >
                          {deletingDocumentId === document.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {/* Show pending replacement document below the original */}
                  {pendingReplacement && (
                    <ListItem
                      sx={{
                        border: "1px solid",
                        borderColor: "success.main",
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: "success.50",
                        ml: 4,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: 2 }}
                      >
                        {getFileIcon(pendingReplacement.type)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight={500}>
                                {pendingReplacement.name} (New)
                              </Typography>
                              <Chip
                                label="Pending Replacement"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatFileSize(pendingReplacement.size)} •{" "}
                              {pendingReplacement.category}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label="Pending"
                              size="small"
                              color="warning"
                              sx={{ mr: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Will replace "{document.name}" when contract is
                              saved
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleCancelReplacement(document)}
                          color="error"
                          title="Cancel replacement"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Box>
      )}

      {/* Document Status Summary */}
      {documents.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Document Status Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary.main">
                      {documents.length}
                    </Typography>
                    <Typography variant="caption">Total Uploaded</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="success.main">
                      {documents.filter((d) => d.status === "verified").length}
                    </Typography>
                    <Typography variant="caption">Verified</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="info.main">
                      {documents.filter((d) => d.status === "uploaded").length}
                    </Typography>
                    <Typography variant="caption">Pending Review</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="error.main">
                      {documents.filter((d) => d.status === "rejected").length}
                    </Typography>
                    <Typography variant="caption">Rejected</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Document Type Selection Dialog */}
      <Dialog
        open={isTypeDialogOpen}
        onClose={handleCancelDocumentUpload}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Select Document Type
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose the appropriate category for: {pendingFile?.name}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Document Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value as DocumentCategory;
                  setSelectedCategory(newCategory);

                  // Auto-set expiry date for ALL documents (required for all)
                  const defaultExpiryDate = new Date();
                  defaultExpiryDate.setFullYear(
                    defaultExpiryDate.getFullYear() + 1
                  );
                  const formattedDate = defaultExpiryDate
                    .toISOString()
                    .split("T")[0];
                  setDocumentExpiryDate(formattedDate);
                  console.log(
                    "🗓️ Auto-set expiry date:",
                    formattedDate,
                    "for category:",
                    newCategory
                  );
                }}
                label="Document Category"
              >
                {ALL_DOCUMENTS.map((doc) => (
                  <MenuItem key={doc.category} value={doc.category}>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {doc.name}
                        {doc.isRequired ? (
                          <Chip
                            label="Required"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Optional"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description}
                      </Typography>
                      {doc.requiresExpiryDate && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ display: "block", mt: 0.5, fontWeight: 500 }}
                        >
                          ⚠️ Expiry date required
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="Add any additional notes about this document..."
              multiline
              rows={2}
            />

            {/* Expiry Date Field - Required for ALL documents */}
            <TextField
              fullWidth
              label="Expiry Date (Required)"
              type="date"
              value={documentExpiryDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date().toISOString().split("T")[0];
                // Only allow dates that are today or in the future
                if (selectedDate >= today) {
                  setDocumentExpiryDate(selectedDate);
                  setUploadError("");
                } else {
                  setUploadError("Expiry date cannot be in the past");
                }
              }}
              required
              error={
                documentExpiryDate !== "" &&
                documentExpiryDate < new Date().toISOString().split("T")[0]
              }
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split("T")[0], // Today as minimum - browser validation
              }}
              sx={{ mt: 2 }}
              helperText={
                documentExpiryDate !== "" &&
                documentExpiryDate < new Date().toISOString().split("T")[0]
                  ? "Expiry date cannot be in the past"
                  : "Please select the expiry date for this document (must be today or in the future)"
              }
            />

            {/* Error Display */}
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}

            {pendingFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>File Details:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Name: {pendingFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {formatFileSize(pendingFile.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {pendingFile.type || "Unknown"}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancelDocumentUpload} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDocumentUpload}
            variant="contained"
            disabled={
              !pendingFile ||
              !!uploadError ||
              !documentExpiryDate || // Expiry date is required for ALL documents
              documentExpiryDate < new Date().toISOString().split("T")[0] // Cannot be in the past
            }
          >
            Add Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {documentToDelete && (
        <Dialog
          open={!!documentToDelete}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete "{documentToDelete.name}"? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteDocument(documentToDelete.id)}
              color="error"
              variant="contained"
              disabled={deletingDocumentId === documentToDelete.id}
            >
              {deletingDocumentId === documentToDelete.id ? (
                <CircularProgress size={20} />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Vehicle Document Preview Dialog */}
      {previewDocument && (
        <Dialog
          open={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility />
            Vehicle Document Preview
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewDocument.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {previewDocument.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created:{" "}
                {new Date(previewDocument.createdAt).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Preview action buttons */}
            {(previewDocument.previewUrl || previewDocument.downloadUrl) && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 2,
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Document preview options:
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {previewDocument.previewUrl && (
                    <Button
                      variant="contained"
                      startIcon={<Visibility />}
                      onClick={() => {
                        openDocumentViewInNewTab(previewDocument?.id);
                      }}
                    >
                      Open Preview
                    </Button>
                  )}

                  {previewDocument.downloadUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => {
                        // Keep download behavior explicit
                        window.open(
                          buildFullUrl(previewDocument.downloadUrl),
                          "_blank"
                        );
                      }}
                    >
                      Download
                    </Button>
                  )}
                </Box>

                <Alert severity="info" sx={{ mt: 1 }}>
                  Due to browser security restrictions, the document will open
                  in a new tab for preview.
                </Alert>
              </Box>
            )}

            {/* Show message if no preview available */}
            {!previewDocument.previewUrl && !previewDocument.downloadUrl && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Preview not available for this document.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPreviewDocument(null)}
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
