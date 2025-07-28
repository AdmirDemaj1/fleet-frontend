import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { Edit, Close, Check } from '@mui/icons-material';
import { CustomerForm } from '../CustomerForm';
import { customerApi } from '../../api/customerApi';
import { useUpdateCustomer } from '../../hooks/useUpdateCustomer';
import { CreateCustomerDto, CustomerType, Customer, CustomerDetailed } from '../../types/customer.types';

interface CustomerAccountEditProps {
  customerId: string;
  onEditComplete?: (customer: Customer) => void;
  onCancel?: () => void;
  variant?: 'modal' | 'inline' | 'card';
  showHeader?: boolean;
}

const STEPS = ['Customer Type', 'Details', 'Review'];

export const CustomerAccountEdit: React.FC<CustomerAccountEditProps> = ({
  customerId,
  onEditComplete,
  onCancel,
  variant = 'card',
  showHeader = true
}) => {
  const { updateCustomer, loading: updateLoading } = useUpdateCustomer();
  
  const [customer, setCustomer] = useState<CustomerDetailed | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch customer data
  const fetchCustomer = async () => {
    try {
      setCustomerLoading(true);
      setError(null);
      console.log('Fetching customer with ID:', customerId);
      const customerData = await customerApi.getById(customerId);
      console.log('Received customer data:', customerData);
      console.log('Customer.customer:', customerData?.customer);
      setCustomer(customerData);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
    } finally {
      setCustomerLoading(false);
    }
  };

  // Fetch customer on mount and when customerId changes
  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  // Reset step when customer changes
  useEffect(() => {
    setActiveStep(0);
  }, [customerId]);

  const handleSubmit = async (data: CreateCustomerDto) => {
    try {
      const updatedCustomer = await updateCustomer(customerId, {
        id: customerId,
        individualDetails: data.individualDetails,
        businessDetails: data.businessDetails
      });

      setShowSuccessMessage(true);
      setIsEditing(false);
      setActiveStep(0);
      
      // Refetch customer data to get the latest information
      await fetchCustomer();
      
      if (onEditComplete && updatedCustomer) {
        onEditComplete(updatedCustomer);
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveStep(0);
    if (onCancel) {
      onCancel();
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Loading state
  if (customerLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: variant === 'modal' ? 200 : 300,
        p: 3
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchCustomer}>
          Retry
        </Button>
      </Box>
    );
  }

  // No customer found
  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Customer not found
        </Alert>
      </Box>
    );
  }

  // Prepare initial data - handle both direct customer and nested structure
  let customerData = customer.customer || customer;
  
  // Additional check for data validity
  if (!customerData || typeof customerData !== 'object') {
    console.log('Invalid customer data structure:', customer);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Customer data is invalid. Expected customer object but received: {typeof customer}
        </Alert>
      </Box>
    );
  }

  // Check if customer has required type field
  if (!customerData.type) {
    console.log('Customer missing type field:', customerData);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Customer type is missing from the data
        </Alert>
      </Box>
    );
  }

  const initialData: Partial<CreateCustomerDto> = {};
  
  if (customerData.type === CustomerType.INDIVIDUAL) {
    initialData.individualDetails = {
      type: CustomerType.INDIVIDUAL,
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      idNumber: customerData.idNumber || '',
      dateOfBirth: customerData.dateOfBirth || '',
      address: customerData.address || '',
      phone: customerData.phone || '',
      email: customerData.email || '',
      secondaryPhone: customerData.secondaryPhone || '',
      secondaryEmail: customerData.secondaryEmail || '',
      additionalNotes: customerData.additionalNotes || ''
    };
  } else if (customerData.type === CustomerType.BUSINESS) {
    initialData.businessDetails = {
      type: CustomerType.BUSINESS,
      legalName: customerData.legalName || '',
      nuisNipt: customerData.nuisNipt || '',
      administratorName: customerData.administratorName || '',
      administratorId: customerData.administratorId || '',
      administratorPosition: customerData.administratorPosition || '',
      mainShareholders: customerData.mainShareholders || '',
      address: customerData.address || '',
      phone: customerData.phone || '',
      email: customerData.email || '',
      secondaryPhone: customerData.secondaryPhone || '',
      secondaryEmail: customerData.secondaryEmail || '',
      additionalNotes: customerData.additionalNotes || ''
    };
  }

  // Get container styles based on variant
  const getContainerProps = () => {
    const baseProps = {
      sx: {} as any
    };

    switch (variant) {
      case 'modal':
        baseProps.sx = {
          maxWidth: 800,
          mx: 'auto',
          p: 0
        };
        break;
      case 'inline':
        baseProps.sx = {
          width: '100%'
        };
        break;
      case 'card':
      default:
        return {
          component: Paper,
          elevation: 2,
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        };
    }

    return baseProps;
  };

  const containerProps = getContainerProps();

  // Read-only view when not editing
  if (!isEditing) {
    return (
      <Box {...containerProps}>
        {showHeader && (
          <Box sx={{ 
            p: 3, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Customer Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customerData.type === CustomerType.INDIVIDUAL 
                  ? `${customerData.firstName} ${customerData.lastName}`
                  : customerData.legalName
                }
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleStartEdit}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Edit Customer
            </Button>
          </Box>
        )}

        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3 
          }}>
            {/* Customer Type */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Customer Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customerData.type === CustomerType.INDIVIDUAL ? 'Individual' : 'Business'}
              </Typography>
            </Box>

            {/* Name/Business Name */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {customerData.type === CustomerType.INDIVIDUAL ? 'Full Name' : 'Business Name'}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customerData.type === CustomerType.INDIVIDUAL 
                  ? `${customerData.firstName} ${customerData.lastName}`
                  : customerData.legalName
                }
              </Typography>
            </Box>

            {/* Email */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customerData.email}
              </Typography>
            </Box>

            {/* Phone */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Phone
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customerData.phone}
              </Typography>
            </Box>

            {/* Address */}
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Address
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customerData.address}
              </Typography>
            </Box>

            {/* Business-specific fields */}
            {customerData.type === CustomerType.BUSINESS && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    NUIS/NIPT
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {customerData.nuisNipt}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Administrator
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {customerData.administratorName}
                  </Typography>
                </Box>
              </>
            )}

            {/* Individual-specific fields */}
            {customerData.type === CustomerType.INDIVIDUAL && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {customerData.idNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {customerData.dateOfBirth}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {!showHeader && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleStartEdit}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Edit Customer Information
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Edit mode
  return (
    <>
      <Box {...containerProps}>
        {showHeader && (
          <Box sx={{ 
            p: 3, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Edit Customer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update customer information
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={handleCancel}
              disabled={updateLoading}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Cancel
            </Button>
          </Box>
        )}

        <Box sx={{ p: variant === 'modal' ? 3 : 0 }}>
          <CustomerForm
            onSubmit={handleSubmit}
            initialData={initialData}
            loading={updateLoading}
            activeStep={activeStep}
            onStepChange={setActiveStep}
            steps={STEPS}
            isEdit={true}
          />
        </Box>
      </Box>

      {/* Success notification */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          iconMapping={{
            success: <Check fontSize="inherit" />
          }}
        >
          Customer updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
};
