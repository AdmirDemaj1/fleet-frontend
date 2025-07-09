import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ContractSummary } from '../../types/customer.types';
import { customerApi } from '../../api/customerApi';
import dayjs from 'dayjs';

interface CustomerContractsProps {
  customerId: string;
  contracts: ContractSummary[];
}

export const CustomerContracts: React.FC<CustomerContractsProps> = ({ 
  customerId, 
  contracts: initialContracts 
}) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractSummary[]>(initialContracts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [customerId]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getContracts(customerId);
      setContracts(data);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Contracts</Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={() => navigate(`/contracts/new?customerId=${customerId}`)}
        >
          New Contract
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contract Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} hover>
                <TableCell>{contract.contractNumber}</TableCell>
                <TableCell>{contract.type}</TableCell>
                <TableCell>
                  <Chip
                    label={contract.status}
                    size="small"
                    color={getStatusColor(contract.status) as any}
                  />
                </TableCell>
                <TableCell>{dayjs(contract.startDate).format('MMM D, YYYY')}</TableCell>
                <TableCell>{dayjs(contract.endDate).format('MMM D, YYYY')}</TableCell>
                <TableCell align="right">${contract.totalAmount.toLocaleString()}</TableCell>
                <TableCell align="right">${contract.remainingAmount.toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No contracts found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};