import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  Skeleton
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { Customer, CustomerType } from '../../types/customer.types';

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onDelete
}) => {
  const navigate = useNavigate();

  const getCustomerName = (customer: Customer) => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      return `${(customer as any).firstName} ${(customer as any).lastName}`;
    }
    return (customer as any).legalName;
  };

  const getCustomerIdentifier = (customer: Customer) => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      return (customer as any).idNumber;
    }
    return (customer as any).nuisNipt;
  };

  if (loading && customers.length === 0) {
    return (
      <Card>
        <Box sx={{ p: 2 }}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} height={60} sx={{ my: 1 }} />
          ))}
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>ID/NUIS</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {getCustomerName(customer)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={customer.type === CustomerType.INDIVIDUAL ? 'Individual' : 'Business'}
                    size="small"
                    color={customer.type === CustomerType.INDIVIDUAL ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>{getCustomerIdentifier(customer)}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(customer.id!)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Card>
  );
};