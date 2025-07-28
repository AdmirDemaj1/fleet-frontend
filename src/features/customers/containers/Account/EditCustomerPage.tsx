import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { CustomerAccountEdit } from '../../components';

export const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleEditComplete = () => {
    // Navigate back to customer details or wherever appropriate
    navigate(`/customers/${id}`);
  };

  const handleCancel = () => {
    // Navigate back without saving
    navigate(`/customers/${id}`);
  };

  if (!id) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Customer ID is required
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Edit Customer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Update customer information
          </Typography>
        </Box>
        
        <CustomerAccountEdit
          customerId={id}
          variant="card"
          showHeader={false}
          onEditComplete={handleEditComplete}
          onCancel={handleCancel}
        />
      </Box>
    </Box>
  );
};