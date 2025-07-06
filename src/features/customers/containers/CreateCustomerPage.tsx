import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CustomerForm } from '../components/CustomerForm';
import { useCreateCustomer } from '../hooks/useCreateCustomer';

export const CreateCustomerPage: React.FC = () => {
  const { createCustomer, loading } = useCreateCustomer();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Create New Customer
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <CustomerForm
          onSubmit={(data) => createCustomer(data).then(() => {})}
          loading={loading}
        />
      </Paper>
    </Box>
  );
};