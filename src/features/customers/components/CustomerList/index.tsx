import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
  Skeleton,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  TableSortLabel,
  alpha,
  useTheme,
  Divider,
  Paper
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  MoreVert, 
  Email as EmailIcon,
  Phone as PhoneIcon,
  BusinessCenter,
  Person,
  FileDownload,
  Receipt,
  DirectionsCar,
  History,
  AccountBox,
  Dashboard
} from '@mui/icons-material';
import { Customer } from '../../types/customer.types';
import dayjs from 'dayjs';

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

type Order = 'asc' | 'desc';
type OrderBy = 'email' | 'type' | 'phone' | 'createdAt';

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
  const theme = useTheme();
  
  // Add sorting state
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('createdAt');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setActiveCustomerId(id);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveCustomerId(null);
  };

  // Format the email for display as a name
  const getDisplayName = (customer: Customer): string => {
    if (customer.email) {
      // Use the part before @ in the email as name
      const emailName = customer.email.split('@')[0];
      // Format it by replacing dots and hyphens with spaces and capitalizing
      return emailName
        .split(/[.-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    // Fallback to ID if no email
    return `Customer ${customer.id?.substring(0, 8)}`;
  };

  // Format date for display
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  // Create loading skeletons
  if (loading && customers.length === 0) {
    return (
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', mb: 1.5 }}>
            {['25%', '15%', '25%', '20%', '15%'].map((width, i) => (
              <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
            ))}
          </Box>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ 
              py: 2, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none'
            }}>
              {['25%', '15%', '25%', '20%', '15%'].map((width, i) => (
                <Skeleton key={i} variant="text" width={width} height={24} sx={{ mr: 2 }} />
              ))}
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Skeleton variant="rectangular" width={300} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Name
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type' as OrderBy)}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'phone'}
                  direction={orderBy === 'phone' ? order : 'asc'}
                  onClick={() => handleRequestSort('phone')}
                >
                  Phone
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const isIndividual = customer.type === 'individual';
              
              return (
                <TableRow 
                  key={customer.id} 
                  hover
                  sx={{ 
                    transition: 'all 0.2s',
                  }}
                >
                  <TableCell sx={{ py: 1.5 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(
                            isIndividual 
                              ? theme.palette.primary.main 
                              : theme.palette.secondary.main,
                            0.1
                          ),
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5
                        }}
                      >
                        {isIndividual ? (
                          <Person 
                            fontSize="small"
                            sx={{ color: theme.palette.primary.main }} 
                          />
                        ) : (
                          <BusinessCenter 
                            fontSize="small"
                            sx={{ color: theme.palette.secondary.main }} 
                          />
                        )}
                      </Box>
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight={500}
                          id={`customer-${customer.id}`}
                          sx={{ 
                            transition: 'color 0.2s ease',
                            borderBottom: '1px dotted transparent',
                            '&:hover': {
                              borderBottomColor: theme.palette.primary.main,
                            }
                          }}
                        >
                          {getDisplayName(customer)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          ID: {customer.id?.slice(0, 8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isIndividual ? 'Individual' : 'Business'}
                      size="small"
                      color={isIndividual ? 'primary' : 'secondary'}
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        px: 0.5,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon 
                        fontSize="small" 
                        sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} 
                      />
                      <Tooltip title={customer.email}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ maxWidth: 150 }}
                        >
                          {customer.email}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon 
                        fontSize="small" 
                        sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} 
                      />
                      <Typography variant="body2">{customer.phone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(customer.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit customer">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/customers/${customer.id}/edit`)}
                          sx={{ 
                            color: theme.palette.warning.main,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, customer.id!)}
                          aria-haspopup="true"
                          sx={{ 
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {customers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 3
                  }}>
                    <Box 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: '50%',
                        p: 2,
                        mb: 2
                      }}
                    >
                      <Person sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.7 }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>No customers found</Typography>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                      No customers match your current filter criteria or there are no customers in the system yet.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate('/customers/new')}
                    >
                      Add New Customer
                    </Button>
                  </Box>
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
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-select': {
            pr: 1
          }
        }}
      />
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 200,
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        {/* Overview group */}
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}`);
            handleMenuClose();
          }}
          dense
        >
          <AccountBox fontSize="small" sx={{ mr: 1.5 }} />
          Customer Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/summary`);
            handleMenuClose();
          }}
          dense
        >
          <Dashboard fontSize="small" sx={{ mr: 1.5 }} />
          Dashboard
        </MenuItem>
        
        <Divider />
        
        {/* Assets & Contracts group */}
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/contracts`);
            handleMenuClose();
          }}
          dense
        >
          <BusinessCenter fontSize="small" sx={{ mr: 1.5 }} />
          Contracts
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/vehicles`);
            handleMenuClose();
          }}
          dense
        >
          <DirectionsCar fontSize="small" sx={{ mr: 1.5 }} />
          Vehicles
        </MenuItem>
        
        <Divider />
        
        {/* Finance group */}
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/invoices`);
            handleMenuClose();
          }}
          dense
        >
          <Receipt fontSize="small" sx={{ mr: 1.5 }} />
          Invoices
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/export`);
            handleMenuClose();
          }}
          dense
        >
          <FileDownload fontSize="small" sx={{ mr: 1.5 }} />
          Export Data
        </MenuItem>
        
        <Divider />
        
        {/* History group */}
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/logs`);
            handleMenuClose();
          }}
          dense
        >
          <History fontSize="small" sx={{ mr: 1.5 }} />
          Activity Logs
        </MenuItem>
        
        <Divider />
        
        {/* Danger zone */}
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) onDelete(activeCustomerId);
            handleMenuClose();
          }}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1.5 }} />
          Delete Customer
        </MenuItem>
      </Menu>
    </Paper>
  );
};