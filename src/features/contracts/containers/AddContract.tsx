// src/pages/AddContractPage.tsx

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ContractForm } from "../components/ContractForm";

const AddContractPage = () => {
  const handleCreateContract = (data: any) => {
    console.log("Contract created:", data);
    
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add New Contract
      </Typography>

      <Paper sx={{ p: 3 }}>
        <ContractForm
          onSubmit={handleCreateContract}
          loading={false}
        />
        
      </Paper>
    </Box>
  );
};

export default AddContractPage;
