import React from 'react';
import { Box } from '@mui/material';
import { useParams, Outlet } from 'react-router-dom';

export const VehicleAccountPage: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <Box>Error: Vehicle ID is required.</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ flexGrow: 1, pt: 3, pb: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default VehicleAccountPage;
