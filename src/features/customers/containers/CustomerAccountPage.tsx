import React from 'react';
import { Box } from '@mui/material';
import { useParams, Outlet } from 'react-router-dom';
import CustomerAccountMenu from '../components/CustomerAccount/CustomerAccountMenu';



const CustomerAccountPage: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <Box>Error: Customer ID is required.</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CustomerAccountMenu customerId={id} />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CustomerAccountPage;