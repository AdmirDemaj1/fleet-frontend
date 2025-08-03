import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CustomerForm, CustomerCreationSuccess } from '../components';
import { useCreateCustomerWithDocument } from '../hooks/useCreateCustomerWithDocument';

const STEPS = ['Customer Type', 'Details', 'Review'];

export const CreateCustomerPage: React.FC = () => {
  const { 
    createCustomer, 
    downloadRegistrationDocument,
    loading, 
    customer,
    isDownloading,
    reset
  } = useCreateCustomerWithDocument();
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = async (data: any) => {
    try {
      await createCustomer(data);
      // Don't reset step, let success component handle navigation
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleDownloadDocument = () => {
    if (customer?.id) {
      downloadRegistrationDocument(customer.id);
    }
  };

  const handleReset = () => {
    reset();
    setActiveStep(0);
  };

  // Show success component after customer creation
  if (customer) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <CustomerCreationSuccess
            customer={customer}
            onDownloadDocument={handleDownloadDocument}
            isDownloading={isDownloading}
            onReset={handleReset}
          />
        </Box>
      </Box>
    );
  }

  // Show form for customer creation
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Create New Customer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add a new customer to your fleet management system
          </Typography>
        </Box>
        
        <CustomerForm
          onSubmit={handleSubmit}
          loading={loading}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          steps={STEPS}
        />
      </Box>
    </Box>
  );
};