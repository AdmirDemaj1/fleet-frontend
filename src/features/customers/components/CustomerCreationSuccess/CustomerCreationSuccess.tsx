import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Download,
  Person,
  Business,
  Security,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Customer } from '../../types/customer.types';

interface CustomerCreationSuccessProps {
  customer: Customer;
  onDownloadDocument: () => void;
  isDownloading: boolean;
  onReset?: () => void;
}

export const CustomerCreationSuccess: React.FC<CustomerCreationSuccessProps> = ({
  customer,
  onDownloadDocument,
  isDownloading,
  onReset
}) => {
  const navigate = useNavigate();

  const handleGoToCustomer = () => {
    const basePath = customer.type === 'endorser' ? 'endorsers' : 'customers';
    navigate(`/${basePath}/${customer.id}`);
  };

  const handleCreateAnother = () => {
    if (onReset) {
      onReset();
    }
  };

  const customerName = customer.type === 'individual' 
    ? `${(customer as any).firstName} ${(customer as any).lastName}`.trim()
    : customer.type === 'business'
    ? (customer as any).legalName || (customer as any).administratorName
    : customer.type === 'endorser'
    ? `${(customer as any).firstName} ${(customer as any).lastName}`.trim()
    : 'Unknown Customer';

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Card 
        elevation={0}
        sx={{ 
          border: '2px solid',
          borderColor: 'success.main',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <CheckCircle 
              sx={{ 
                fontSize: 64, 
                color: 'success.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
              Customer Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The customer has been added to your fleet management system
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer Info */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              {customer.type === 'individual' ? (
                <Person sx={{ color: 'primary.main' }} />
              ) : customer.type === 'endorser' ? (
                <Security sx={{ color: 'info.main' }} />
              ) : (
                <Business sx={{ color: 'secondary.main' }} />
              )}
              <Typography variant="h6" fontWeight="600">
                {customerName}
              </Typography>
              <Chip
                label={customer.type}
                size="small"
                color={customer.type === 'individual' ? 'primary' : customer.type === 'endorser' ? 'info' : 'secondary'}
                variant="outlined"
              />
            </Box>
            
            {customer.email && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Email: {customer.email}
              </Typography>
            )}
            {customer.phone && (
              <Typography variant="body2" color="text.secondary">
                Phone: {customer.phone}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 3 }}>
            What would you like to do next?
          </Typography>

          <Stack spacing={2}>
            {/* Download Registration Document */}
            <Button
              variant="contained"
              size="large"
              startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
              onClick={onDownloadDocument}
              disabled={isDownloading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {isDownloading ? 'Generating Document...' : 'Download Registration Document'}
            </Button>

            {/* Go to Customer Page */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<Person />}
              endIcon={<ArrowForward />}
              onClick={handleGoToCustomer}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Go to Customer Page
            </Button>

            {/* Create Another Customer */}
            <Button
              variant="text"
              size="medium"
              onClick={handleCreateAnother}
              sx={{
                mt: 2,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Create Another Customer
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
