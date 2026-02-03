import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { Warning, DirectionsCar, Upload, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { VehicleSummary } from '../../../types/contract.types';
import { BrandLogo } from '../../../../../shared/components';

// Required document types for a vehicle to be used in a contract
export const REQUIRED_VEHICLE_DOCUMENT_TYPES = [
  'vehicle_registration',
  'tpl',
//   'vehicle_inspection',
  'casco',
//   'purchase_invoice',
];

export interface VehicleDocumentUpload {
  type: string;
  file: File;
  title: string;
  expiryDate: string; // Required - YYYY-MM-DD format
}

interface VehicleCompletionModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: VehicleSummary | null;
  onComplete: (data: {
    licensePlate?: string;
    documents?: VehicleDocumentUpload[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const VehicleCompletionModal: React.FC<VehicleCompletionModalProps> = ({
  open,
  onClose,
  vehicle,
  onComplete,
  isLoading = false,
}) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [documents, setDocuments] = useState<VehicleDocumentUpload[]>([]);
  const [documentExpiryDates, setDocumentExpiryDates] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Check what's missing
  const isMissingLicensePlate = !vehicle?.licensePlate;
  const existingDocumentTypes = vehicle?.documents?.map(d => d.type) || [];
  const missingDocumentTypes = REQUIRED_VEHICLE_DOCUMENT_TYPES.filter(
    type => !existingDocumentTypes.includes(type)
  );
  const isMissingDocuments = missingDocumentTypes.length > 0;

  // Check if all required items are provided
  const isLicensePlateProvided = !isMissingLicensePlate || (licensePlate.trim().length >= 3);
  const allDocumentsProvided = missingDocumentTypes.every(
    type => documents.some(d => d.type === type)
  );
  // All uploaded documents must have expiry dates
  const uploadedDocsHaveExpiry = documents.every(
    d => documentExpiryDates[d.type] && documentExpiryDates[d.type].trim() !== ''
  );
  const canSubmit = isLicensePlateProvided && allDocumentsProvided && uploadedDocsHaveExpiry;

  const handleFileUpload = useCallback((acceptedFiles: File[], docType: string) => {
    const file = acceptedFiles[0];
    if (file) {
      // Set default expiry date to 1 year from now if not already set
      if (!documentExpiryDates[docType]) {
        const defaultExpiry = new Date();
        defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
        setDocumentExpiryDates(prev => ({
          ...prev,
          [docType]: defaultExpiry.toISOString().split('T')[0]
        }));
      }
      
      setDocuments(prev => {
        // Remove existing document of same type if any
        const filtered = prev.filter(d => d.type !== docType);
        return [...filtered, {
          type: docType,
          file,
          title: getDocumentLabel(docType),
          expiryDate: documentExpiryDates[docType] || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }];
      });
    }
  }, [documentExpiryDates]);

  const handleExpiryDateChange = useCallback((docType: string, date: string) => {
    setDocumentExpiryDates(prev => ({
      ...prev,
      [docType]: date
    }));
    
    // Update the document's expiry date if it exists
    setDocuments(prev => prev.map(doc => 
      doc.type === docType 
        ? { ...doc, expiryDate: date }
        : doc
    ));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    try {
      const submitData = {
        licensePlate: isMissingLicensePlate ? licensePlate.trim().toUpperCase() : undefined,
        documents: documents.length > 0 ? documents : undefined,
      };
      console.log('📤 VehicleCompletionModal submitting:', submitData);
      console.log('🏷️ License plate to submit:', submitData.licensePlate);
      await onComplete(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
    }
  };

  const handleClose = () => {
    setLicensePlate('');
    setDocuments([]);
    setDocumentExpiryDates({});
    setError(null);
    onClose();
  };

  const getDocumentLabel = (type: string): string => {
    switch (type) {
      case 'vehicle_registration':
        return 'Vehicle Registration';
      case 'insurance':
        return 'Insurance Certificate';
      case 'tpl':
        return 'Third Party Liability (TPL)';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Warning color="warning" />
          <Typography variant="h6" component="span">
            Complete Vehicle Information
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Vehicle Info */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'grey.50',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <BrandLogo brandName={vehicle.make} size={80} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Typography>
            {vehicle.licensePlate ? (
              <Typography variant="body2" color="text.secondary">
                🏷️ {vehicle.licensePlate}
              </Typography>
            ) : (
              <Chip 
                label="No License Plate" 
                size="small" 
                color="warning" 
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )}
            <Typography variant="body2" color="text.secondary">
              🔢 VIN: {vehicle.vinNumber}
            </Typography>
          </Box>
        </Paper>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            To use this vehicle in a contract, the following information is required:
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* License Plate Section */}
        {isMissingLicensePlate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar fontSize="small" />
              License Plate *
            </Typography>
            <TextField
              fullWidth
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Enter license plate number"
              inputProps={{
                maxLength: 15,
                style: { textTransform: 'uppercase' }
              }}
              error={licensePlate.length > 0 && licensePlate.length < 3}
              helperText={
                licensePlate.length > 0 && licensePlate.length < 3
                  ? 'License plate must be at least 3 characters'
                  : 'Enter the vehicle\'s license plate number'
              }
            />
          </Box>
        )}

        {/* Documents Section */}
        {isMissingDocuments && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Upload fontSize="small" />
              Missing Documents
            </Typography>

            {missingDocumentTypes.map((docType) => {
              const uploadedDoc = documents.find(d => d.type === docType);
              
              return (
                <DocumentDropzone
                  key={docType}
                  label={getDocumentLabel(docType)}
                  uploadedFile={uploadedDoc?.file}
                  expiryDate={documentExpiryDates[docType] || ''}
                  onDrop={(files) => handleFileUpload(files, docType)}
                  onExpiryDateChange={(date) => handleExpiryDateChange(docType, date)}
                />
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {isLoading ? 'Updating...' : 'Complete & Select'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Dropzone component for individual document types
interface DocumentDropzoneProps {
  label: string;
  uploadedFile?: File;
  expiryDate: string;
  onDrop: (files: File[]) => void;
  onExpiryDateChange: (date: string) => void;
}

const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  label,
  uploadedFile,
  expiryDate,
  onDrop,
  onExpiryDateChange,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: uploadedFile && expiryDate
          ? 'success.main' 
          : 'grey.300',
        borderRadius: 2,
        bgcolor: uploadedFile && expiryDate
          ? 'success.50' 
          : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {/* File Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          p: 1.5,
          border: '2px dashed',
          borderColor: uploadedFile 
            ? 'success.main' 
            : isDragActive 
              ? 'primary.main' 
              : 'grey.300',
          borderRadius: 1,
          bgcolor: isDragActive ? 'primary.50' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          }
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {uploadedFile ? (
              <CheckCircle color="success" />
            ) : (
              <Upload color="action" />
            )}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {label} *
              </Typography>
              {uploadedFile ? (
                <Typography variant="caption" color="success.main">
                  ✓ {uploadedFile.name}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Drop file or click to upload (PDF, JPG, PNG)
                </Typography>
              )}
            </Box>
          </Box>
          {uploadedFile && (
            <Chip 
              label="Uploaded" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Expiry Date Field - Always visible once file is uploaded */}
      {uploadedFile && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Expiry Date *"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            size="small"
            error={!expiryDate}
            helperText={!expiryDate ? 'Expiry date is required' : 'When does this document expire?'}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default VehicleCompletionModal;

