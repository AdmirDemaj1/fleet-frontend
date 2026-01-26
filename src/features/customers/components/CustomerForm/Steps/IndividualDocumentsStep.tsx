import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  Visibility,
  Download,
  SwapHoriz,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { documentApi } from "../../../../../shared/api/documentApi";
import type { Document } from "../../../../../shared/types/document.types";

export enum IndividualDocumentType {
  ID_CARD = "customer_id_card",
}

interface IndividualDocument {
  id: string;
  type: IndividualDocumentType;
  file?: File;
  expiryDate: string;
  title: string;
  documentId?: string;
  fileName?: string;
  size?: number;
  uploadedAt?: Date;
  status?: "pending" | "uploaded" | "verified" | "rejected";
  isPendingReplacement?: boolean;
  pendingReplacementId?: string;
}

const DOCUMENT_LABELS: Record<IndividualDocumentType, string> = {
  [IndividualDocumentType.ID_CARD]: "ID Card",
};

const REQUIRED_DOCUMENTS = [IndividualDocumentType.ID_CARD] as const;

interface IndividualDocumentsStepProps {
  customerId?: string; // if present, we are in edit mode
  onPendingDocumentIdsChange?: (ids: string[]) => void;
}

export const IndividualDocumentsStep: React.FC<
  IndividualDocumentsStepProps
> = ({ customerId, onPendingDocumentIdsChange }) => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext();
  const [uploadError, setUploadError] = useState<string>("");
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingIdCard, setExistingIdCard] = useState<Document | null>(null);
  const [pendingReplacementId, setPendingReplacementId] = useState<
    string | null
  >(null);

  const documents: IndividualDocument[] = watch("individualDocuments") || [];

  // Load existing customer documents in edit mode
  useEffect(() => {
    const load = async () => {
      if (!customerId) return;
      try {
        setLoadingExisting(true);
        const docs = await documentApi.getCustomerDocuments(customerId);
        const idCard =
          docs.find((d) => d.type === IndividualDocumentType.ID_CARD) ||
          docs.find((d) => d.title?.toLowerCase().includes("id card")) ||
          docs.find((d) => d.title?.toLowerCase().includes("id"));
        setExistingIdCard(idCard || null);

        // Ensure step validation passes if an ID card exists already
        if (idCard) {
          const defaultExpiryDate = new Date();
          defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
          const formattedDate = defaultExpiryDate.toISOString().split("T")[0];
          setValue(
            "individualDocuments",
            [
              {
                id: `existing-${idCard.id}`,
                type: IndividualDocumentType.ID_CARD,
                title: idCard.title || "ID Card",
                expiryDate: formattedDate,
                documentId: idCard.id,
                fileName: idCard.fileName,
                status: idCard.status as any,
                uploadedAt: new Date(idCard.createdAt),
              },
            ],
            { shouldValidate: true }
          );
        }
      } catch (e) {
        // Don't block the form if we fail to load docs
        console.warn("Failed to load customer documents:", e);
      } finally {
        setLoadingExisting(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleAddOrReplace = useCallback(
    async (file: File) => {
      // Default expiry date to 1 year from now (backend expects expiryDate in many flows)
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
      const formattedDate = defaultExpiryDate.toISOString().split("T")[0];

      // Edit mode: upload immediately as pending replacement if we have an existing doc
      if (customerId && existingIdCard?.id) {
        try {
          setUploadError("");
          const uploaded = await documentApi.uploadPendingDocument(file, {
            type: IndividualDocumentType.ID_CARD,
            title: `ID Card - ${file.name}`,
            description: "",
            customerId,
            replacesDocumentId: existingIdCard.id,
            expiryDate: formattedDate,
          });
          setPendingReplacementId(uploaded.id);
          onPendingDocumentIdsChange?.([uploaded.id]);

          // Update form state (for validation + UI)
          const next: IndividualDocument[] = [
            {
              id: `existing-${existingIdCard.id}`,
              type: IndividualDocumentType.ID_CARD,
              title: existingIdCard.title || "ID Card",
              expiryDate: formattedDate,
              documentId: existingIdCard.id,
              fileName: existingIdCard.fileName,
              uploadedAt: new Date(existingIdCard.createdAt),
              status: existingIdCard.status as any,
              isPendingReplacement: true,
              pendingReplacementId: uploaded.id,
            },
            {
              id: uploaded.id,
              type: IndividualDocumentType.ID_CARD,
              file,
              title: `ID Card - ${file.name}`,
              expiryDate: formattedDate,
              documentId: uploaded.id,
              fileName: uploaded.fileName || uploaded.title,
              uploadedAt: new Date(uploaded.createdAt),
              status: "pending",
              size: file.size,
            },
          ];
          setValue("individualDocuments", next, { shouldValidate: true });
        } catch (e) {
          console.error("Failed to upload replacement ID card:", e);
          setUploadError(
            "Failed to upload replacement ID card. Please try again."
          );
        }
        return;
      }

      // Create mode: store locally
      const newDoc: IndividualDocument = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: IndividualDocumentType.ID_CARD,
        file,
        expiryDate: formattedDate,
        // Make it easy to identify in CustomerAccount documents list
        title: `ID Card - ${file.name}`,
        size: file.size,
        uploadedAt: new Date(),
        status: "pending",
      };

      const next = [
        ...documents.filter((d) => d.type !== IndividualDocumentType.ID_CARD),
        newDoc,
      ];
      setValue("individualDocuments", next, { shouldValidate: true });
      setUploadError("");
    },
    [
      customerId,
      documents,
      existingIdCard,
      onPendingDocumentIdsChange,
      setValue,
    ]
  );

  const handleRemove = useCallback(() => {
    setValue(
      "individualDocuments",
      documents.filter((d) => d.type !== IndividualDocumentType.ID_CARD),
      { shouldValidate: true }
    );
  }, [documents, setValue]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      handleAddOrReplace(file);
    },
    [handleAddOrReplace]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
  });

  const hasRequired = useMemo(() => {
    const uploadedTypes = documents.map((d) => d.type);
    return REQUIRED_DOCUMENTS.every((t) => uploadedTypes.includes(t));
  }, [documents]);

  const getFileIcon = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return <PictureAsPdf />;
    if (name.match(/\.(png|jpe?g)$/)) return <Image />;
    return <InsertDriveFile />;
  };

  const previewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography
        variant="h6"
        component="h3"
        gutterBottom
        fontWeight={600}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3,
        }}
      >
        <DocumentIcon />
        Customer Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload the customer&apos;s ID card. This is required for individual
        customers.
      </Typography>

      {/* Existing document loading (edit mode) */}
      {customerId && loadingExisting && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading existing documents…
          </Typography>
        </Box>
      )}

      {/* Uploaded Document */}
      {documents.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Uploaded Documents
          </Typography>
          <List>
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                  {doc.file ? getFileIcon(doc.file) : <InsertDriveFile />}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {doc.title}
                      </Typography>
                      <Chip
                        label={DOCUMENT_LABELS[doc.type]}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Required"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {doc.isPendingReplacement && (
                        <Chip
                          label="Will be replaced"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {doc.uploadedAt?.toLocaleDateString() || ""} •{" "}
                      {Math.round((doc.size || 0) / 1024)} KB
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  {doc.file ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => previewFile(doc.file!)}
                        title="Preview"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => downloadFile(doc.file!)}
                        title="Download"
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </>
                  ) : doc.documentId ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          const blob = await documentApi.downloadDocument(
                            doc.documentId!
                          );
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, "_blank", "noopener,noreferrer");
                          setTimeout(
                            () => window.URL.revokeObjectURL(url),
                            1000
                          );
                        }}
                        title="Preview"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          const blob = await documentApi.downloadDocument(
                            doc.documentId!
                          );
                          const url = window.URL.createObjectURL(blob);
                          const a = window.document.createElement("a");
                          a.href = url;
                          a.download = doc.fileName || doc.title;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                        title="Download"
                      >
                        <Download fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          const input = window.document.createElement("input");
                          input.type = "file";
                          input.accept = "application/pdf,image/*";
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) await handleAddOrReplace(file);
                          };
                          input.click();
                        }}
                        title="Replace"
                        disabled={!!pendingReplacementId}
                      >
                        <SwapHoriz fontSize="small" />
                      </IconButton>
                    </>
                  ) : null}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      // If user uploaded a pending replacement and removes, clean it up
                      if (pendingReplacementId) {
                        await documentApi.deletePendingDocuments([
                          pendingReplacementId,
                        ]);
                        setPendingReplacementId(null);
                        onPendingDocumentIdsChange?.([]);
                      }
                      handleRemove();
                    }}
                    title="Remove"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Drag & drop */}
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          p: 4,
          border: `2px dashed ${
            isDragActive ? theme.palette.primary.main : theme.palette.divider
          }`,
          borderRadius: 2,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: isDragActive
            ? alpha(theme.palette.primary.main, 0.05)
            : "background.default",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon
          sx={{
            fontSize: 48,
            color: isDragActive ? "primary.main" : "text.secondary",
            mb: 2,
          }}
        />
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
          {isDragActive
            ? "Drop the file here"
            : "Drag & drop an ID card here, or click to select"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Accepted formats: PDF, JPG, PNG (Max 25MB)
        </Typography>
      </Paper>

      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => {
            const input = window.document.createElement("input");
            input.type = "file";
            input.accept = "application/pdf,image/*";
            input.onchange = (e: any) => {
              const file = e.target.files?.[0];
              if (file) handleAddOrReplace(file);
            };
            input.click();
          }}
          sx={{ textTransform: "none" }}
        >
          Upload / Replace ID Card
        </Button>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}

      {!hasRequired && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please upload the required ID card before proceeding.
        </Alert>
      )}
    </Box>
  );
};
