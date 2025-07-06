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
import { CollateralSummary } from '../../types/customer.types';
import { customerApi } from '../../api/customerApi';

interface CustomerCollateralProps {
  customerId: string;
  collateral: CollateralSummary[];
}

export const CustomerCollateral: React.FC<CustomerCollateralProps> = ({ 
  customerId, 
  collateral: initialCollateral 
}) => {
  const navigate = useNavigate();
  const [collateral, setCollateral] = useState<CollateralSummary[]>(initialCollateral);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCollateral();
  }, [customerId]);

  const fetchCollateral = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getCollateral(customerId);
      setCollateral(data);
    } catch (error) {
      console.error('Failed to fetch collateral:', error);
    } finally {
      setLoading(false);
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
        <Typography variant="h6">Collateral</Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={() => navigate(`/collateral/new?customerId=${customerId}`)}
        >
          Add Collateral
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collateral.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">${item.value.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={item.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={item.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/collateral/${item.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {collateral.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No collateral found
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