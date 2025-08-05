import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ContractList } from '../components/ContractList';
import { ContractListFilters } from '../components/ContractList/ContractListFilters';
import { useContracts } from '../hooks/useContracts';

export const ContractsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    contracts,
    isLoading,
    page,
    rowsPerPage,
    totalCount,
    type,
    status,
    search,
    handlePageChange,
    handleRowsPerPageChange,
    handleTypeChange,
    handleStatusChange,
    handleSearchChange,
    handleDeleteContract,
    resetFilters
  } = useContracts();

  const handleCreateContract = () => {
    navigate('/contracts/create');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
              }}
            >
              <Typography variant="h4" component="h1">
                Contracts
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateContract}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Create Contract
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <ContractListFilters
              search={search}
              type={type}
              status={status}
              onSearchChange={handleSearchChange}
              onTypeChange={handleTypeChange}
              onStatusChange={handleStatusChange}
              onReset={resetFilters}
            />
          </Grid>

          <Grid item xs={12}>
            <ContractList
              contracts={contracts}
              loading={isLoading}
              totalCount={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onDelete={handleDeleteContract}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
