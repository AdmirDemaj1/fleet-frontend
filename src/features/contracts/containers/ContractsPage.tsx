import React from 'react';
import {
  Box,
  Typography,
  Button
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
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Contracts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateContract}
        >
          Create Contract
        </Button>
      </Box>

      <ContractListFilters
        search={search}
        type={type}
        status={status}
        onSearchChange={handleSearchChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onReset={resetFilters}
      />

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
    </Box>
  );
};
