import React, { useState, useCallback, useEffect } from "react";
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
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { VehicleDocumentType, VehicleDocument } from "../../types/vehicleType";
import {
  useUploadDocumentMutation,
  useRemovePendingDocumentMutation,
  UploadVehicleDocumentRequestData,
} from "../../api/vehicleDocumentApi";
import { useNotification } from "../../../../shared/hooks/useNotification";

export interface VehicleDocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  category: VehicleDocumentType;
  description?: string;
  isRequired: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
}

const REQUIRED_VEHICLE_DOCUMENTS = [
  {
    category: VehicleDocumentType.VEHICLE_REGISTRATION,
    name: "Vehicle Registration",
    description: "Official vehicle registration certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: VehicleDocumentType.VEHICLE_INSPECTION,
    name: "Vehicle Inspection",
    description: "Vehicle inspection certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: VehicleDocumentType.INSURANCE,
    name: "Insurance Certificate",
    description: "Vehicle insurance policy",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: VehicleDocumentType.TPL,
    name: "Third Party Liability (TPL)",
    description: "TPL insurance certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: VehicleDocumentType.CASCO,
    name: "CASCO Insurance",
    description: "Comprehensive insurance certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: true,
  },
  {
    category: VehicleDocumentType.PURCHASE_INVOICE,
    name: "Purchase Invoice",
    description: "Vehicle purchase invoice",
    isRequired: false,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
  {
    category: VehicleDocumentType.TECHNICAL_PASSPORT,
    name: "Technical Passport",
    description: "Vehicle technical passport",
    isRequired: false,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
    requiresExpiryDate: false,
  },
];

interface VehicleDocumentUploadProps {
  documents: VehicleDocumentFile[];
  onDocumentsChange: (documents: VehicleDocumentFile[]) => void;
  error?: string;
  sessionKey: string | null;
  onSessionKeyChange: (sessionKey: string) => void;
}

export const VehicleDocumentUpload: React.FC<VehicleDocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  error,
  sessionKey,
  onSessionKeyChange,
}) => {
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VehicleDocumentType>(
    VehicleDocumentType.VEHICLE_REGISTRATION
  );
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentExpiryDate, setDocumentExpiryDate] = useState<string>("");
  const [uploadError, setUploadError] = useState("");
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<VehicleDocumentFile | null>(null);

  // API mutations
  const [uploadDocument] = useUploadDocumentMutation();
  const [removePendingDocument] = useRemovePendingDocumentMutation();

  // Notification system
  const { showSuccess, showError } = useNotification();

  // Effect to set expiry date when dialog opens and category changes
  useEffect(() => {
    if (isTypeDialogOpen && selectedCategory) {
      const selectedDoc = REQUIRED_VEHICLE_DOCUMENTS.find(
        (doc) => doc.category === selectedCategory
      );
      if (selectedDoc?.requiresExpiryDate && !documentExpiryDate) {
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
    }
  }, [isTypeDialogOpen, selectedCategory, documentExpiryDate]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // For now, only handle one file at a time for better UX
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPendingFile(file);

        // Find the next required document type to upload
        const uploadedCategories = documents.map((doc) => doc.category);
        const nextRequiredDoc = REQUIRED_VEHICLE_DOCUMENTS.find(
          (doc) => !uploadedCategories.includes(doc.category)
        );
        const defaultCategory =
          nextRequiredDoc?.category || VehicleDocumentType.VEHICLE_REGISTRATION;

        setSelectedCategory(defaultCategory);
        setDocumentDescription("");

        // Auto-set expiry date to 1 year from now for documents that require it
        const requiresExpiry =
          nextRequiredDoc?.requiresExpiryDate ||
          REQUIRED_VEHICLE_DOCUMENTS.find(
            (doc) => doc.category === defaultCategory
          )?.requiresExpiryDate;

        if (requiresExpiry) {
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
        } else {
          setDocumentExpiryDate("");
          console.log(
            "📄 No expiry date needed for category:",
            defaultCategory
          );
        }

        setUploadError(""); // Clear any previous errors
        setIsTypeDialogOpen(true);
      }
    },
    [documents]
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
    multiple: false, // Handle one file at a time
  });

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDeletingDocumentId(documentId);

      // Check if this is a backend document (has UUID format)
      const isBackendDocument =
        documentId.includes("-") && !documentId.includes("temp-");

      if (isBackendDocument) {
        // This is a backend document, call the API to remove it
        await removePendingDocument({
          documentId,
          // TODO: RDouble check this
          sessionKey: sessionKey || undefined,
        }).unwrap();

        console.log("Vehicle document deleted from backend:", documentId);
        showSuccess("Document deleted successfully");
      } else {
        // This is a local/temporary document, just remove it locally
        console.log("Removing local vehicle document:", documentId);
        showSuccess("Document removed");
      }

      // Remove from local state
      const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
      onDocumentsChange(updatedDocuments);

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

  const handleDeleteClick = (document: VehicleDocumentFile) => {
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
      setUploadError(
        `Document "${pendingFile.name}" has already been uploaded. Please use a different file or remove the existing one first.`
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
          REQUIRED_VEHICLE_DOCUMENTS.find(
            (d) => d.category === selectedCategory
          )?.name
        }" has already been uploaded. Please remove the existing one first or choose a different category.`
      );
      return;
    }

    // Check if expiry date is required for this document type
    const selectedDocType = REQUIRED_VEHICLE_DOCUMENTS.find(
      (doc) => doc.category === selectedCategory
    );
    if (selectedDocType?.requiresExpiryDate && !documentExpiryDate) {
      setUploadError(
        `Expiry date is required for ${selectedDocType.name}. Please select an expiry date.`
      );
      return;
    }

    // Clear any previous errors
    setUploadError("");

    try {
      // Prepare upload data
      const uploadData: UploadVehicleDocumentRequestData = {
        type: selectedCategory,
        title: pendingFile.name,
        description: documentDescription,
        expiryDate: documentExpiryDate || undefined,
        metadata: {
          originalFileName: pendingFile.name,
          fileSize: pendingFile.size,
          fileType: pendingFile.type,
          uploadDate: new Date().toISOString(),
          documentCategory: selectedCategory,
          sessionKey: sessionKey,
        },
      };

      console.log("🚀 Attempting to upload vehicle document:");
      console.log(
        "📁 File:",
        pendingFile.name,
        "Size:",
        pendingFile.size,
        "Type:",
        pendingFile.type
      );
      console.log("📋 Upload Data:", uploadData);
      console.log("🔑 Session Key:", sessionKey);

      // Upload document to backend
      const response = await uploadDocument({
        file: pendingFile,
        data: uploadData,
        sessionKey: sessionKey || undefined,
      }).unwrap();

      // If this is the first upload and we get a session key back, store it
      if (!sessionKey && response.sessionKey) {
        console.log(
          "🔑 Received session key from backend:",
          response.sessionKey
        );
        onSessionKeyChange(response.sessionKey);
      }

      // Create local document object with backend response
      const newDocument: VehicleDocumentFile = {
        id: response.id,
        name: response.fileName || pendingFile.name,
        type: pendingFile.type,
        size: pendingFile.size,
        file: pendingFile,
        category: selectedCategory,
        description: documentDescription,
        isRequired: REQUIRED_VEHICLE_DOCUMENTS.some(
          (doc) => doc.category === selectedCategory
        ),
        status: response.status as
          | "pending"
          | "uploaded"
          | "verified"
          | "rejected",
        uploadedAt: new Date(response.createdAt),
      };

      const updatedDocuments = [...documents, newDocument];
      onDocumentsChange(updatedDocuments);

      // Show success notification
      showSuccess("Document uploaded successfully!");

      // Reset and close dialog
      setPendingFile(null);
      setSelectedCategory(VehicleDocumentType.VEHICLE_REGISTRATION);
      setDocumentDescription("");
      setDocumentExpiryDate("");
      setIsTypeDialogOpen(false);
    } catch (error) {
      console.error("Document upload failed:", error);
      const errorMessage = "Failed to upload document. Please try again.";
      setUploadError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleCancelDocumentUpload = () => {
    setPendingFile(null);
    setSelectedCategory(VehicleDocumentType.VEHICLE_REGISTRATION);
    setDocumentDescription("");
    setDocumentExpiryDate("");
    setUploadError("");
    setIsTypeDialogOpen(false);
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

  const requiredDocuments = REQUIRED_VEHICLE_DOCUMENTS.filter(
    (doc) =>
      !documents.some((uploadedDoc) => uploadedDoc.category === doc.category)
  );

  const missingRequired = requiredDocuments.filter((doc) => doc.isRequired);

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Description />
        Vehicle Documents
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload all required vehicle documents. After uploading each file, you'll
        be prompted to select the appropriate document category.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
          cursor: "pointer",
          transition: "all 0.2s ease",
          bgcolor: isDragActive ? "primary.50" : "background.paper",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.50",
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
      </Paper>

      {/* Required Documents Checklist */}
      {REQUIRED_VEHICLE_DOCUMENTS.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Required Documents Checklist
          </Typography>
          <Grid container spacing={2}>
            {REQUIRED_VEHICLE_DOCUMENTS.map((doc) => {
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
            {documents.map((document) => (
              <ListItem
                key={document.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                  {getFileIcon(document.type)}
                </Box>

                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {document.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(document.size)} • {document.category} •{" "}
                        {document.uploadedAt?.toLocaleDateString()}
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
                        />
                      )}
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const url = URL.createObjectURL(document.file);
                        window.open(url, "_blank");
                      }}
                      title="Preview document"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const url = URL.createObjectURL(document.file);
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
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(document)}
                      color="error"
                      title="Delete document"
                      disabled={deletingDocumentId === document.id}
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
            ))}
          </List>
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
                  const newCategory = e.target.value as VehicleDocumentType;
                  setSelectedCategory(newCategory);

                  // Auto-set expiry date for documents that require it
                  const selectedDoc = REQUIRED_VEHICLE_DOCUMENTS.find(
                    (doc) => doc.category === newCategory
                  );
                  if (selectedDoc?.requiresExpiryDate) {
                    // Always set default expiry date to 1 year from now when switching to a category that requires expiry
                    const defaultExpiryDate = new Date();
                    defaultExpiryDate.setFullYear(
                      defaultExpiryDate.getFullYear() + 1
                    );
                    setDocumentExpiryDate(
                      defaultExpiryDate.toISOString().split("T")[0]
                    );
                    console.log(
                      "🗓️ Auto-set expiry date:",
                      defaultExpiryDate.toISOString().split("T")[0]
                    );
                  } else {
                    // Clear expiry date if not required
                    setDocumentExpiryDate("");
                  }
                }}
                label="Document Category"
              >
                {REQUIRED_VEHICLE_DOCUMENTS.map((doc) => (
                  <MenuItem key={doc.category} value={doc.category}>
                    <Box>
                      <Typography variant="body1">{doc.name}</Typography>
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

            {/* Expiry Date Field */}
            {REQUIRED_VEHICLE_DOCUMENTS.find(
              (doc) => doc.category === selectedCategory
            )?.requiresExpiryDate && (
              <TextField
                fullWidth
                label="Expiry Date (Required)"
                type="date"
                value={documentExpiryDate}
                onChange={(e) => setDocumentExpiryDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0], // Today as minimum
                }}
                sx={{ mt: 2 }}
              />
            )}

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
              (REQUIRED_VEHICLE_DOCUMENTS.find(
                (doc) => doc.category === selectedCategory
              )?.requiresExpiryDate &&
                !documentExpiryDate)
            }
          >
            Upload Document
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
    </Box>
  );
};
