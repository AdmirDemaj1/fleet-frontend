import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ContractForm } from '../components';
import { useCreateContractWithDependenciesMutation } from '../api/contractApi';
import { CreateContractDto } from '../types/contract.types';

export const CreateContractPage: React.FC = () => {
  const [createContract, { isLoading }] = useCreateContractWithDependenciesMutation();

  const handleSubmit = async (data: CreateContractDto) => {
    try {
      await createContract(data).unwrap();
      // Navigate to contracts list or show success message
      console.log('Contract created successfully');
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Contract
        </Typography>
        <ContractForm 
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </Box>
    </Container>
  );
};
