import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ContractForm } from '../components';
import { useCreateContractWithDependenciesMutation } from '../api/contractApi';
import { CreateContractDto } from '../types/contract.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const CreateContractPage: React.FC = () => {
  const [createContract, { isLoading }] = useCreateContractWithDependenciesMutation();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (data: CreateContractDto) => {
    try {
      console.log('Creating contract with data:', data);
      const response = await createContract(data).unwrap();
      console.log('Contract creation response:', response);

      // Check if response indicates approval is required
      if (response.requiresApproval) {
        showSuccess("Action requires approval. Request has been submitted.");
      } else {
        showSuccess("Contract created successfully!");
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
      showError("Failed to create contract. Please try again.");
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
