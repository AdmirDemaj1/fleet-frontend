// src/pages/CreateContractPage.tsx

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { ContractForm } from '../components/ContractForm';

const CreateContractPage = () => {
 

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Create New Contract
      </Typography>

      <Paper sx={{ p: 3 }}>
        <ContractForm
          onSubmit={(data) =>console.log(data)}
          loading={false}
        />
      </Paper>
    </Box>
  );
};

export default CreateContractPage;

