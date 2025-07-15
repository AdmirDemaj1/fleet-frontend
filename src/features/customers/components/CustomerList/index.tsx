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
  Checkbox,
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
  Visibility, 
  MoreVert, 
  Email as EmailIcon,
  Phone as PhoneIcon,
  BusinessCenter,
  Person,
  FileDownload,
  ContentCopy
} from '@mui/icons-material';
import { Customer, CustomerType, IndividualCustomer, BusinessCustomer } from '../../types/customer.types';

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
type OrderBy = 'name' | 'type' | 'identifier' | 'email' | 'phone';

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
  
  // Add selection state
  const [selected, setSelected] = useState<string[]>([]);
  
  // Add sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('name');
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = customers.map(n => n.id!);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const getCustomerName = (customer: Customer): string => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      const individualCustomer = customer as IndividualCustomer;
      return `${individualCustomer.firstName} ${individualCustomer.lastName}`;
    }
    const businessCustomer = customer as BusinessCustomer;
    return businessCustomer.legalName;
  };

  const getCustomerIdentifier = (customer: Customer): string => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      return (customer as IndividualCustomer).idNumber;
    }
    return (customer as BusinessCustomer).nuisNipt;
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
            {['18%', '12%', '15%', '20%', '15%', '15%'].map((width, i) => (
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
              {['18%', '12%', '15%', '20%', '15%', '15%'].map((width, i) => (
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
      {selected.length > 0 && (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="subtitle1" color="primary">
            {selected.length} customer{selected.length > 1 ? 's' : ''} selected
          </Typography>
          <Box>
            <Button 
              size="small" 
              startIcon={<EmailIcon />}
              sx={{ mr: 1 }}
            >
              Email
            </Button>
            <Button 
              size="small" 
              startIcon={<FileDownload />}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button 
              size="small"
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </Box>
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < customers.length}
                  checked={customers.length > 0 && selected.length === customers.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all customers' }}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'identifier'}
                  direction={orderBy === 'identifier' ? order : 'asc'}
                  onClick={() => handleRequestSort('identifier')}
                >
                  ID/NUIS
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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const isItemSelected = isSelected(customer.id!);
              return (
                <TableRow 
                  key={customer.id} 
                  hover
                  onClick={() => handleClick(customer.id!)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      }
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': `customer-${customer.id}` }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(
                            customer.type === CustomerType.INDIVIDUAL 
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
                        {customer.type === CustomerType.INDIVIDUAL ? (
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
                        >
                          {getCustomerName(customer)}
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
                      label={customer.type === CustomerType.INDIVIDUAL ? 'Individual' : 'Business'}
                      size="small"
                      color={customer.type === CustomerType.INDIVIDUAL ? 'primary' : 'secondary'}
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
                      <Typography variant="body2">{getCustomerIdentifier(customer)}</Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton 
                          size="small" 
                          sx={{ ml: 0.5, opacity: 0.5, '&:hover': { opacity: 1 } }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(getCustomerIdentifier(customer));
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon 
                        fontSize="small" 
                        sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} 
                      />
                      <Typography variant="body2">{customer.email}</Typography>
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
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          sx={{ 
                            color: theme.palette.info.main,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
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
                    <Button variant="contained" color="primary">
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
            minWidth: 180,
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/contracts`);
            handleMenuClose();
          }}
          dense
        >
          View Contracts
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) navigate(`/customers/${activeCustomerId}/invoices`);
            handleMenuClose();
          }}
          dense
        >
          View Invoices
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            if (activeCustomerId) onDelete(activeCustomerId);
            handleMenuClose();
          }}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Customer
        </MenuItem>
      </Menu>
    </Paper>
  );
};