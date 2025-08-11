import React, { useState, useCallback } from "react";
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
import { useDropzone } from "react-dropzone";

export interface ContractDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  category: DocumentCategory;
  description?: string;
  isRequired: boolean;
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export enum DocumentCategory {
  ID_CARD = "id_card",
  INSURANCE = "insurance",
  TPL = "tpl", // Third Party Liability
  CASCO = "casco",
  DRIVING_PERMIT = "driving_permit", // Leje qarkullimi
  CUSTOMER_REGISTRATION = "customer_registration",
  ENDORSER_ID = "endorser_id",
  CONTRACT_AGREEMENT = "contract_agreement",
}

interface DocumentUploadProps {
  documents: ContractDocument[];
  onDocumentsChange: (documents: ContractDocument[]) => void;
  error?: string;
}

const REQUIRED_DOCUMENTS = [
  {
    category: DocumentCategory.ID_CARD,
    name: "ID Card",
    description: "Valid government-issued photo identification",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.INSURANCE,
    name: "Insurance Certificate",
    description: "Current vehicle insurance policy",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.TPL,
    name: "Third Party Liability (TPL)",
    description: "Third party liability insurance certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.CASCO,
    name: "CASCO Insurance",
    description: "Comprehensive vehicle insurance certificate",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.DRIVING_PERMIT,
    name: "Driving Permit",
    description: "Valid driving license (Leje qarkullimi)",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.CUSTOMER_REGISTRATION,
    name: "Customer Registration",
    description: "Customer registration documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.ENDORSER_ID,
    name: "Endorser ID",
    description: "Endorser identification documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    category: DocumentCategory.CONTRACT_AGREEMENT,
    name: "Contract Agreement",
    description: "Contract agreement documents",
    isRequired: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
];



export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  error,
}) => {
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(DocumentCategory.ID_CARD);
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadError, setUploadError] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // For now, only handle one file at a time for better UX
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPendingFile(file);
        setSelectedCategory(DocumentCategory.ID_CARD); // Default category
        setDocumentDescription("");
        setUploadError(""); // Clear any previous errors
        setIsTypeDialogOpen(true);
      }
    },
    []
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

  const determineDocumentCategory = (fileName: string): DocumentCategory => {
    const lowerFileName = fileName.toLowerCase();

    if (
      lowerFileName.includes("id") ||
      lowerFileName.includes("passport") ||
      lowerFileName.includes("card")    
    ) {
      return DocumentCategory.ID_CARD;
    }
    if (
      lowerFileName.includes("insurance") ||
      lowerFileName.includes("policy")
    ) {
      return DocumentCategory.INSURANCE;
    }
    if (
      lowerFileName.includes("tpl") ||
      lowerFileName.includes("third") ||
      lowerFileName.includes("liability")
    ) {
      return DocumentCategory.TPL;
    }
    if (
      lowerFileName.includes("casco") ||
      lowerFileName.includes("comprehensive")
    ) {
      return DocumentCategory.CASCO;
    }
    if (
      lowerFileName.includes("driving") ||
      lowerFileName.includes("permit") ||
      lowerFileName.includes("license") ||
      lowerFileName.includes("leje")
    ) {
      return DocumentCategory.DRIVING_PERMIT;
    }
    if (
      lowerFileName.includes("customer") ||
      lowerFileName.includes("registration")
    ) {
      return DocumentCategory.CUSTOMER_REGISTRATION;
    }
    if (
      lowerFileName.includes("endorser") ||
      lowerFileName.includes("guarantor")
    ) {
      return DocumentCategory.ENDORSER_ID;
    }
    if (
      lowerFileName.includes("contract") ||
      lowerFileName.includes("agreement")
    ) {
      return DocumentCategory.CONTRACT_AGREEMENT;
    }

    // Default to ID_CARD if no specific category is determined
    return DocumentCategory.ID_CARD;
  };

  const handleDeleteDocument = (documentId: string) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== documentId);
    onDocumentsChange(updatedDocuments);
  };

  const handleConfirmDocumentUpload = () => {
    if (!pendingFile) return;

    // Check for duplicates by name
    const existingNames = documents.map((doc) => doc.name);
    if (existingNames.includes(pendingFile.name)) {
      // Show error and don't proceed
      setUploadError(`Document "${pendingFile.name}" has already been uploaded. Please use a different file or remove the existing one first.`);
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
      setUploadError(`A file with the same size and type has already been uploaded. Please ensure you're not uploading duplicate content.`);
      return;
    }

    // Check if this document category already has a document uploaded
    const existingCategoryDoc = documents.find(
      (doc) => doc.category === selectedCategory
    );
    
    if (existingCategoryDoc) {
      setUploadError(`A document of type "${REQUIRED_DOCUMENTS.find(d => d.category === selectedCategory)?.name}" has already been uploaded. Please remove the existing one first or choose a different category.`);
      return;
    }

    // Clear any previous errors
    setUploadError("");

    const isRequired = REQUIRED_DOCUMENTS.some(
      (doc) => doc.category === selectedCategory
    );

    const newDocument: ContractDocument = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: pendingFile.name,
      type: pendingFile.type,
      size: pendingFile.size,
      file: pendingFile,
      category: selectedCategory,
      description: documentDescription,
      isRequired,
      status: "pending" as const,
      uploadedAt: new Date(),
    };

    const updatedDocuments = [...documents, newDocument];
    onDocumentsChange(updatedDocuments);

    // Reset and close dialog
    setPendingFile(null);
    setSelectedCategory(DocumentCategory.ID_CARD);
    setDocumentDescription("");
    setIsTypeDialogOpen(false);
  };

  const handleCancelDocumentUpload = () => {
    setPendingFile(null);
    setSelectedCategory(DocumentCategory.ID_CARD);
    setDocumentDescription("");
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

  const requiredDocuments = REQUIRED_DOCUMENTS.filter(
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
        Required Documents
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload all required documents to complete your contract application.
        After uploading each file, you'll be prompted to select the appropriate document category.
        Documents will be reviewed and verified by our team.
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
        <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
          You'll be prompted to select the document type after upload
        </Typography>
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
                      onClick={() => handleDeleteDocument(document.id)}
                      color="error"
                      title="Delete document"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
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
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                label="Document Category"
              >
                {REQUIRED_DOCUMENTS.map((doc) => (
                  <MenuItem key={doc.category} value={doc.category}>
                    <Box>
                      <Typography variant="body1">{doc.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description}
                      </Typography>
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

            {/* Error Display */}
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}

            {pendingFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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
                  Type: {pendingFile.type || 'Unknown'}
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
            disabled={!pendingFile}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
