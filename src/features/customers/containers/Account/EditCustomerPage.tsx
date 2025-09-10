import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { CustomerSettingsPage } from '../../components/CustomerAccount/CustomerSettingsPage';

export const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're editing an endorser based on the current URL path
  const isEndorser = location.pathname.includes('/endorsers/');
  const basePath = isEndorser ? 'endorsers' : 'customers';

  const handleClose = () => {
    // Navigate back to customer details
    navigate(`/${basePath}/${id}`);
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
    <CustomerSettingsPage
      customerId={id}
      onClose={handleClose}
    />
  );
};