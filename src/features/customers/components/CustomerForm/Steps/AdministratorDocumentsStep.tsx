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
  TextField,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';

export enum AdministratorDocumentType {
  ID_CARD = 'business_administrator_id_card',
  QKB = 'business_administrator_qkb',
}

interface AdministratorDocument {
  type: AdministratorDocumentType;
  file: File;
  expiryDate: string;
  title: string;
}

const DOCUMENT_LABELS: Record<AdministratorDocumentType, string> = {
  [AdministratorDocumentType.ID_CARD]: 'ID Card',
  [AdministratorDocumentType.QKB]: 'QKB',
};

const REQUIRED_DOCUMENTS = [AdministratorDocumentType.ID_CARD];
const OPTIONAL_DOCUMENTS = [AdministratorDocumentType.QKB];

export const AdministratorDocumentsStep: React.FC = () => {
  const theme = useTheme();
  const { control, watch, setValue } = useFormContext();
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const documents = watch('administratorDocuments') || [];

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
        type,
        file,
        expiryDate: formattedDate,
        title: file.name,
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

      {/* Required Documents */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Required Documents
        </Typography>
        {REQUIRED_DOCUMENTS.map((docType) => {
          const document = documents.find(
            (doc: AdministratorDocument) => doc.type === docType
          );
          const isUploaded = !!document;

          return (
            <Paper
              key={docType}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: isUploaded
                  ? alpha(theme.palette.success.main, 0.05)
                  : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {DOCUMENT_LABELS[docType]}
                  </Typography>
                  <Chip
                    label="Required"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                  {isUploaded && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Uploaded"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
                {isUploaded && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveDocument(docType)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {isUploaded ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {document.file.name} ({formatFileSize(document.file.size)})
                  </Typography>
                  <TextField
                    type="date"
                    label="Expiry Date"
                    value={document.expiryDate}
                    onChange={(e) => handleExpiryDateChange(docType, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => {
                    const input = document.createElement('input');
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
                  sx={{ mt: 1 }}
                >
                  Upload {DOCUMENT_LABELS[docType]}
                </Button>
              )}

              {uploadErrors[docType] && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadErrors[docType]}
                </Alert>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Optional Documents */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Optional Documents
        </Typography>
        {OPTIONAL_DOCUMENTS.map((docType) => {
          const document = documents.find(
            (doc: AdministratorDocument) => doc.type === docType
          );
          const isUploaded = !!document;

          return (
            <Paper
              key={docType}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: isUploaded
                  ? alpha(theme.palette.info.main, 0.05)
                  : 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {DOCUMENT_LABELS[docType]}
                  </Typography>
                  <Chip
                    label="Optional"
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                  {isUploaded && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Uploaded"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
                {isUploaded && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveDocument(docType)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {isUploaded ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {document.file.name} ({formatFileSize(document.file.size)})
                  </Typography>
                  <TextField
                    type="date"
                    label="Expiry Date"
                    value={document.expiryDate}
                    onChange={(e) => handleExpiryDateChange(docType, e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => {
                    const input = document.createElement('input');
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
                  sx={{ mt: 1 }}
                >
                  Upload {DOCUMENT_LABELS[docType]}
                </Button>
              )}

              {uploadErrors[docType] && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadErrors[docType]}
                </Alert>
              )}
            </Paper>
          );
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

