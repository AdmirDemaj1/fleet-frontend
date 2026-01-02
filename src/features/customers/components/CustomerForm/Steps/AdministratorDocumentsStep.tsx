import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  IconButton,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  Visibility,
  Download,
  SwapHoriz,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { documentApi } from '../../../../../shared/api/documentApi';

export enum AdministratorDocumentType {
  ID_CARD = 'business_administrator_id_card',
  QKB = 'business_administrator_qkb',
}

interface AdministratorDocument {
  id: string; // Unique ID for the document
  type: AdministratorDocumentType;
  file?: File; // Optional for existing documents
  expiryDate: string;
  title: string;
  documentId?: string; // ID of existing document from API
  fileName?: string; // Name of existing document file
  size?: number; // File size in bytes
  uploadedAt?: Date; // Upload date
  status?: "pending" | "uploaded" | "verified" | "rejected"; // Document status
  // Versioning fields for optimistic updates
  isPendingReplacement?: boolean; // Whether this document has a pending replacement
  pendingReplacementId?: string; // ID of the pending replacement document
  pendingReplacement?: AdministratorDocument; // The pending replacement document
  parentDocumentId?: string; // ID of document being replaced (for pending replacements)
}

const DOCUMENT_LABELS: Record<AdministratorDocumentType, string> = {
  [AdministratorDocumentType.ID_CARD]: 'ID Card',
  [AdministratorDocumentType.QKB]: 'QKB',
};

const REQUIRED_DOCUMENTS = [AdministratorDocumentType.ID_CARD];
const OPTIONAL_DOCUMENTS = [AdministratorDocumentType.QKB];

interface AdministratorDocumentsStepProps {
  administratorId?: string;
  onPendingDocumentIdsChange?: (ids: string[]) => void; // Callback to track pending document IDs
}

export const AdministratorDocumentsStep: React.FC<AdministratorDocumentsStepProps> = ({
  administratorId,
  onPendingDocumentIdsChange,
}) => {
  const theme = useTheme();
  const { watch, setValue } = useFormContext();
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const documents = watch('administratorDocuments') || [];

  // Initialize pending document IDs from existing documents (for edit mode)
  // Use a ref to track if we've already initialized to prevent loops
  const hasInitializedRef = React.useRef(false);
  const prevDocumentsLengthRef = React.useRef(0);
  
  React.useEffect(() => {
    // Only initialize when documents are first loaded (length changes from 0 to >0)
    const documentsJustLoaded = documents.length > 0 && prevDocumentsLengthRef.current === 0;
    
    if (administratorId && documentsJustLoaded && !hasInitializedRef.current) {
      const existingPendingIds = documents
        .filter((doc: AdministratorDocument) => 
          doc.status === 'pending' && (doc.documentId || doc.id)
        )
        .map((doc: AdministratorDocument) => doc.documentId || doc.id)
        .filter(Boolean) as string[];
      
      // Also include pending replacement IDs
      const pendingReplacementIds = documents
        .filter((doc: AdministratorDocument) => doc.pendingReplacementId)
        .map((doc: AdministratorDocument) => doc.pendingReplacementId)
        .filter(Boolean) as string[];
      
      const allPendingIds = [...new Set([...existingPendingIds, ...pendingReplacementIds])];
      
      if (allPendingIds.length > 0) {
        console.log("📋 Initializing pending document IDs from existing administrator documents:", allPendingIds);
        onPendingDocumentIdsChange?.(allPendingIds);
        hasInitializedRef.current = true;
      } else {
        // Even if no pending IDs found, mark as initialized to prevent re-checking
        hasInitializedRef.current = true;
      }
    }
    
    // Update ref to track documents length
    prevDocumentsLengthRef.current = documents.length;
    
    // Reset initialization flag if administratorId changes
    if (!administratorId) {
      hasInitializedRef.current = false;
      prevDocumentsLengthRef.current = 0;
    }
  }, [administratorId, documents.length, onPendingDocumentIdsChange]); // Only depend on length to avoid loops

  const handleAddDocument = useCallback(
    (file: File, type: AdministratorDocumentType) => {
      const existingDocs = documents || [];
      
      // Check if document type already exists
      if (existingDocs.some((doc: AdministratorDocument) => doc.type === type)) {
        setUploadErrors((prev) => ({
          ...prev,
          [type]: `A ${DOCUMENT_LABELS[type]} document has already been uploaded`,
        }));
        return;
      }

      // Set default expiry date to 1 year from now
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
      const formattedDate = defaultExpiryDate.toISOString().split('T')[0];

      const newDocument: AdministratorDocument = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        file,
        expiryDate: formattedDate,
        title: file.name,
        size: file.size,
        status: 'pending',
        uploadedAt: new Date(),
      };

      setValue('administratorDocuments', [...existingDocs, newDocument]);
      setUploadErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });
    },
    [documents, setValue]
  );

  const handleRemoveDocument = useCallback(
    (type: AdministratorDocumentType) => {
      const existingDocs = documents || [];
      setValue(
        'administratorDocuments',
        existingDocs.filter((doc: AdministratorDocument) => doc.type !== type)
      );
      setUploadErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      });
    },
    [documents, setValue]
  );

  const handleExpiryDateChange = useCallback(
    (type: AdministratorDocumentType, expiryDate: string) => {
      const existingDocs = documents || [];
      setValue(
        'administratorDocuments',
        existingDocs.map((doc: AdministratorDocument) =>
          doc.type === type ? { ...doc, expiryDate } : doc
        )
      );
    },
    [documents, setValue]
  );

  const handleReplaceDocument = useCallback(
    async (docType: AdministratorDocumentType, file: File) => {
      const existingDocs = documents || [];
      const existingDoc = existingDocs.find(
        (doc: AdministratorDocument) => doc.type === docType
      );

      if (!existingDoc) return;

      // Set default expiry date to 1 year from now
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
      const formattedDate = defaultExpiryDate.toISOString().split('T')[0];

      // For edit mode (administratorId exists), upload immediately with PENDING status
      if (existingDoc.documentId && administratorId) {
        try {
          setDeletingDocumentId(existingDoc.documentId);
          
          // Upload document immediately with PENDING status as replacement
          const uploadedDoc = await documentApi.uploadPendingDocument(file, {
            type: docType,
            title: file.name,
            description: '',
            administratorId: administratorId,
            replacesDocumentId: existingDoc.documentId,
            expiryDate: formattedDate,
          });

          console.log('✅ Uploaded pending replacement document:', uploadedDoc);

          // Create pending replacement document
          const pendingReplacement: AdministratorDocument = {
            id: uploadedDoc.id,
            type: docType,
            file: file,
            expiryDate: formattedDate,
            title: file.name,
            documentId: uploadedDoc.id,
            fileName: uploadedDoc.fileName || uploadedDoc.title,
            size: file.size,
            status: 'pending',
            uploadedAt: new Date(uploadedDoc.createdAt),
            parentDocumentId: existingDoc.documentId || existingDoc.id,
          };

          // Mark old document as having a pending replacement and add pending replacement to list
          const updatedDocs = existingDocs.map((doc: AdministratorDocument) =>
            doc.type === docType
              ? {
                  ...doc,
                  isPendingReplacement: true,
                  pendingReplacementId: uploadedDoc.id,
                  pendingReplacement: pendingReplacement,
                }
              : doc
          );
          
          // Add pending replacement to the documents list
          updatedDocs.push(pendingReplacement);
          
          setValue('administratorDocuments', updatedDocs);

          // Notify parent about pending document ID
          const currentPendingIds = updatedDocs
            .filter((d: AdministratorDocument) => d.pendingReplacementId || (d.status === 'pending' && d.parentDocumentId))
            .map((d: AdministratorDocument) => d.pendingReplacementId || d.documentId)
            .filter(Boolean) as string[];
          onPendingDocumentIdsChange?.(currentPendingIds);

          setUploadErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[docType];
            return newErrors;
          });
        } catch (error) {
          console.error('Failed to upload replacement document:', error);
          setUploadErrors((prev) => ({
            ...prev,
            [docType]: 'Failed to upload replacement document. Please try again.',
          }));
        } finally {
          setDeletingDocumentId(null);
        }
      } else {
        // For create mode (no administratorId), just replace locally
        setValue(
          'administratorDocuments',
          existingDocs.map((doc: AdministratorDocument) =>
            doc.type === docType
              ? { ...doc, file, title: file.name, documentId: undefined }
              : doc
          )
        );
        setUploadErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[docType];
          return newErrors;
        });
      }
    },
    [documents, setValue, administratorId]
  );

  const handleCancelReplacement = useCallback(
    (docType: AdministratorDocumentType) => {
      const existingDocs = documents || [];
      const existingDoc = existingDocs.find(
        (doc: AdministratorDocument) => doc.type === docType
      );

      if (!existingDoc?.pendingReplacementId) return;

      // Delete pending document if it was uploaded
      if (existingDoc.pendingReplacementId && administratorId) {
        documentApi.deletePendingDocuments([existingDoc.pendingReplacementId])
          .catch(console.error);
      }

      // Remove pending replacement
      setValue(
        'administratorDocuments',
        existingDocs.map((doc: AdministratorDocument) =>
          doc.type === docType
            ? {
                ...doc,
                isPendingReplacement: false,
                pendingReplacementId: undefined,
                pendingReplacement: undefined,
              }
            : doc
        )
      );
    },
    [documents, setValue, administratorId]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Find which document type to upload
        const uploadedTypes = documents.map((doc: AdministratorDocument) => doc.type);
        const missingRequired = REQUIRED_DOCUMENTS.find(
          (type) => !uploadedTypes.includes(type)
        );
        
        if (missingRequired) {
          handleAddDocument(file, missingRequired);
        } else {
          // If all required are uploaded, check optional
          const missingOptional = OPTIONAL_DOCUMENTS.find(
            (type) => !uploadedTypes.includes(type)
          );
          if (missingOptional) {
            handleAddDocument(file, missingOptional);
          }
        }
      }
    },
    [documents, handleAddDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
  });

  const uploadedTypes = documents.map((doc: AdministratorDocument) => doc.type);
  const hasRequiredDocuments = REQUIRED_DOCUMENTS.every((type) =>
    uploadedTypes.includes(type)
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileType?: string, fileName?: string) => {
    const type = fileType?.toLowerCase() || fileName?.toLowerCase() || '';
    if (type.includes('pdf')) return <PictureAsPdf />;
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) return <Image />;
    return <InsertDriveFile />;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'uploaded':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckIcon fontSize="small" />;
      case 'uploaded':
        return <UploadIcon fontSize="small" />;
      case 'rejected':
        return <DeleteIcon fontSize="small" />;
      default:
        return <DocumentIcon fontSize="small" />;
    }
  };

  const handleReplaceClick = (document: AdministratorDocument) => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleReplaceDocument(document.type, file);
      }
    };
    input.click();
  };

  const handleDeleteClick = (document: AdministratorDocument) => {
    handleRemoveDocument(document.type);
  };

  const handlePreview = async (document: AdministratorDocument) => {
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      window.open(url, '_blank');
    } else if (document.documentId) {
      try {
        const blob = await documentApi.downloadDocument(document.documentId);
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      } catch (error) {
        console.error('Failed to preview document:', error);
      }
    }
  };

  const handleDownload = async (document: AdministratorDocument) => {
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      a.click();
      URL.revokeObjectURL(url);
    } else if (document.documentId) {
      try {
        const blob = await documentApi.downloadDocument(document.documentId);
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.fileName || document.title;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download document:', error);
      }
    }
  };

  // Transform documents to unified format for display
  const allDocuments = documents.map((doc: AdministratorDocument) => ({
    ...doc,
    id: doc.id || doc.documentId || `doc-${doc.type}`,
    name: doc.fileName || doc.title,
    category: DOCUMENT_LABELS[doc.type],
    isRequired: REQUIRED_DOCUMENTS.includes(doc.type),
    size: doc.size || doc.file?.size || 0,
  }));

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: theme.palette.primary.main,
        mb: 3
      }}>
        <DocumentIcon />
        Administrator Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload required documents for the administrator. ID Card is required, QKB is optional.
      </Typography>

      {/* Uploaded Documents List */}
      {allDocuments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Uploaded Documents ({allDocuments.length})
          </Typography>

          <List>
            {allDocuments.map((document: AdministratorDocument & { id: string; name: string; category: string; isRequired: boolean }) => {
              // Skip pending replacements in main list - they're shown with their parent
              if (document.parentDocumentId && document.status === 'pending') {
                return null;
              }

              const pendingReplacement = document.pendingReplacementId
                ? allDocuments.find((d: AdministratorDocument & { id: string; name: string; category: string; isRequired: boolean }) => d.id === document.pendingReplacementId)
                : null;

              return (
                <React.Fragment key={document.id}>
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: document.isPendingReplacement
                        ? 'warning.main'
                        : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: document.isPendingReplacement
                        ? 'warning.50'
                        : 'background.paper',
                      opacity: document.isPendingReplacement ? 0.7 : 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {getFileIcon(undefined, document.fileName || document.title)}
                    </Box>

                    <ListItemText
                      primary={
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
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
                            {formatFileSize(document.size || 0)} • {document.category} •{' '}
                            {document.uploadedAt?.toLocaleDateString() || 'Existing'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={document.status || 'uploaded'}
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {document.file ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(document)}
                              title="Preview document"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(document)}
                              title="Download document"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </>
                        ) : document.documentId ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(document)}
                              title="Preview document"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(document)}
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
                                deletingDocumentId === document.documentId ||
                                document.isPendingReplacement
                              }
                            >
                              {deletingDocumentId === document.documentId ? (
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
                            deletingDocumentId === document.documentId ||
                            document.isPendingReplacement
                          }
                        >
                          {deletingDocumentId === document.documentId ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {/* Show pending replacement document below the original */}
                  {pendingReplacement && (
                    <ListItem
                      sx={{
                        border: '1px solid',
                        borderColor: 'success.main',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'success.50',
                        ml: 4,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mr: 2 }}
                      >
                        {getFileIcon(undefined, pendingReplacement.fileName || pendingReplacement.title)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
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
                              {formatFileSize(pendingReplacement.size)} •{' '}
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
                              Will replace "{document.name}" when administrator is
                              saved
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleCancelReplacement(document.type)}
                          color="error"
                          title="Cancel replacement"
                        >
                          <DeleteIcon fontSize="small" />
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

      {/* Upload buttons for missing documents */}
      <Box sx={{ mt: 3 }}>
        {[...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS].map((docType) => {
          const document = documents.find(
            (doc: AdministratorDocument) => doc.type === docType
          );
          const isUploaded = !!document;
          const isRequired = REQUIRED_DOCUMENTS.includes(docType);

          if (!isUploaded) {
            return (
              <Button
                key={docType}
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => {
                  const input = window.document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/pdf,image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddDocument(file, docType);
                    }
                  };
                  input.click();
                }}
                sx={{ mt: 1, mr: 1 }}
              >
                Upload {DOCUMENT_LABELS[docType]} {isRequired && '(Required)'}
              </Button>
            );
          }
          return null;
        })}
      </Box>

      {/* Drag and Drop Zone */}
      {!hasRequiredDocuments && (
        <Paper
          {...getRootProps()}
          elevation={0}
          sx={{
            p: 4,
            border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive
              ? alpha(theme.palette.primary.main, 0.05)
              : 'background.default',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon
            sx={{
              fontSize: 48,
              color: isDragActive ? 'primary.main' : 'text.secondary',
              mb: 2,
            }}
          />
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop a document here, or click to select'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accepted formats: PDF, JPG, PNG (Max 25MB)
          </Typography>
        </Paper>
      )}

      {/* Validation Alert */}
      {!hasRequiredDocuments && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please upload all required documents before proceeding.
        </Alert>
      )}
    </Box>
  );
};

