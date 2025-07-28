import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CustomerForm } from '../components';
import { useCreateCustomer } from '../hooks/useCreateCustomer';

const STEPS = ['Customer Type', 'Details', 'Review'];

export const CreateCustomerPage: React.FC = () => {
  const { createCustomer, loading } = useCreateCustomer();
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = async (data: any) => {
    try {
      await createCustomer(data);
      // Reset to first step after successful submission
      setActiveStep(0);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

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