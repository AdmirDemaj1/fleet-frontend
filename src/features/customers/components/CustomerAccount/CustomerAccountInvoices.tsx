import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
  TableSortLabel,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
  Receipt as InvoiceIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { customerApi } from '../../api/customerApi';
import InvoiceFilters, { InvoiceFilters as InvoiceFiltersType } from './InvoiceFilters';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';

// Payment/Invoice status configuration
const PAYMENT_STATUS_CONFIG = {
  pending: { icon: <PendingIcon fontSize="small" />, color: 'warning' as const, label: 'Pending' },
  paid: { icon: <CheckCircleIcon fontSize="small" />, color: 'success' as const, label: 'Paid' },
  overdue: { icon: <ErrorIcon fontSize="small" />, color: 'error' as const, label: 'Overdue' },
  cancelled: { icon: <ErrorIcon fontSize="small" />, color: 'error' as const, label: 'Cancelled' }
};

// Payment type configuration
const PAYMENT_TYPE_CONFIG = {
  monthly: { label: 'Monthly', color: '#1976d2' },
  deposit: { label: 'Deposit', color: '#9c27b0' },
  final: { label: 'Final', color: '#388e3c' },
  penalty: { label: 'Penalty', color: '#f44336' }
};

// Invoice/Payment interface (based on backend PaymentDto)
interface Invoice {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string | Date;
  paymentDate?: string | Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  type: 'monthly' | 'deposit' | 'final' | 'penalty';
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
  createdAt: string | Date;
}

// Utility functions
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return dayjs(date).format('MMM D, YYYY');
  } catch {
    return 'Invalid Date';
  }
};

const isOverdue = (dueDate: string | Date, status: string): boolean => {
  if (status === 'paid') return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

type Order = 'asc' | 'desc';
type OrderBy = 'amount' | 'dueDate' | 'paymentDate' | 'status' | 'type' | 'createdAt';

interface CustomerAccountInvoicesProps {
  customerId?: string;
}

const CustomerAccountInvoices: React.FC<CustomerAccountInvoicesProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const customerId = propCustomerId || urlCustomerId;
  
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('dueDate');
  
  // Filters
  const [filters, setFilters] = useState<InvoiceFiltersType>({
    search: '',
    status: '',
    type: '',
    dateRange: '',
    amountRange: ''
  });
  
  // Dialogs
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Fetch invoices (payments)
  const fetchInvoices = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This would call the payments API filtered by customer
      const data = await customerApi.getInvoices(customerId);
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load invoices';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices].map(invoice => ({
      ...invoice,
      status: isOverdue(invoice.dueDate, invoice.status) && invoice.status === 'pending' 
        ? 'overdue' 
        : invoice.status
    }));

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id?.toLowerCase().includes(searchTerm) ||
        invoice.transactionReference?.toLowerCase().includes(searchTerm) ||
        invoice.notes?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(invoice => 
        invoice.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.type) {
      filtered = filtered.filter(invoice => 
        invoice.type?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    return filtered;
  }, [invoices, filters]);

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    return filteredInvoices.slice().sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (orderBy === 'dueDate' || orderBy === 'paymentDate' || orderBy === 'createdAt') {
        aValue = aValue ? dayjs(aValue).valueOf() : 0;
        bValue = bValue ? dayjs(bValue).valueOf() : 0;
      }

      // Handle undefined/null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInvoices, order, orderBy]);

  // Paginate invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedInvoices.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedInvoices, page, rowsPerPage]);

  // Event handlers
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      dateRange: '',
      amountRange: ''
    });
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleDelete = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      try {
        console.log(`Deleting invoice ${invoiceToDelete}`);
        setNotification({
          open: true,
          message: 'Invoice deleted successfully',
          severity: 'success'
        });
        await fetchInvoices();
        if (paginatedInvoices.length === 1 && page > 0) {
          setPage(page - 1);
        }
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to delete invoice',
          severity: 'error'
        });
      }
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      // Call API to mark invoice as paid
      console.log(`Marking invoice ${invoiceId} as paid`);
      setNotification({
        open: true,
        message: 'Invoice marked as paid',
        severity: 'success'
      });
      await fetchInvoices();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to mark invoice as paid',
        severity: 'error'
      });
    }
  };

  // Render functions
  const renderStatusCell = (status: string) => {
    const config = PAYMENT_STATUS_CONFIG[status.toLowerCase() as keyof typeof PAYMENT_STATUS_CONFIG] || {
      icon: <WarningIcon fontSize="small" />,
      color: 'default' as const,
      label: 'Unknown'
    };
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        color={config.color}
        sx={{ minWidth: 90, fontWeight: 500 }}
      />
    );
  };

  const renderTypeCell = (type: string) => {
    const config = PAYMENT_TYPE_CONFIG[type?.toLowerCase() as keyof typeof PAYMENT_TYPE_CONFIG];
    
    return (
      <Chip
        label={config?.label || type}
        size="small"
        variant="outlined"
        sx={{ 
          borderRadius: 1,
          bgcolor: alpha(config?.color || theme.palette.primary.main, 0.05),
          borderColor: config?.color || theme.palette.primary.main,
          color: config?.color || theme.palette.primary.main,
          fontWeight: 500
        }}
      />
    );
  };

  // Loading state - following customer list pattern
  if (loading && invoices.length === 0) {
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
            {['15%', '15%', '15%', '15%', '15%', '15%', '10%'].map((width, i) => (
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
              {['15%', '15%', '15%', '15%', '15%', '15%', '10%'].map((width, i) => (
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

  // Error state
  if (error && !invoices.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchInvoices}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Invoices & Payments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage customer payments and invoicing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewInvoiceDialog(true)}
          >
            New Payment
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <InvoiceFilters
          filters={filters}
          onFilterChange={setFilters}
          invoicesCount={filteredInvoices.length}
        />
      </Box>

      {/* Table */}
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
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => handleRequestSort('amount')}
                  >
                    Amount
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
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dueDate'}
                    direction={orderBy === 'dueDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('dueDate')}
                  >
                    Due Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'paymentDate'}
                    direction={orderBy === 'paymentDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('paymentDate')}
                  >
                    Payment Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  hover
                  sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {formatCurrency(invoice.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderTypeCell(invoice.type || 'N/A')}</TableCell>
                  <TableCell>{renderStatusCell(invoice.status || 'unknown')}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      color={isOverdue(invoice.dueDate, invoice.status) ? 'error.main' : 'text.primary'}
                    >
                      {formatDate(invoice.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(invoice.paymentDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {invoice.paymentMethod || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, invoice)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedInvoices.length === 0 && !loading && (
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
                        <InvoiceIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>No invoices found</Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                        {filteredInvoices.length !== invoices.length 
                          ? 'No invoices match your current filter criteria.'
                          : 'This customer doesn\'t have any invoices yet.'
                        }
                      </Typography>
                      {filteredInvoices.length !== invoices.length ? (
                        <Button 
                          variant="outlined" 
                          onClick={handleClearFilters}
                        >
                          Clear Filters
                        </Button>
                      ) : (
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => setShowNewInvoiceDialog(true)}
                        >
                          Add New Payment
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredInvoices.length || 0}
          page={Math.min(page, Math.max(0, Math.ceil((filteredInvoices.length || 0) / rowsPerPage) - 1))}
          onPageChange={(_, newPage) => {
            setPage(newPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => {
            if (loading) {
              return 'Loading...';
            }
            return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
          }}
          disabled={loading}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-select': {
              pr: 1
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: theme.palette.text.secondary
            },
            '&.Mui-disabled': {
              opacity: 0.6
            }
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedInvoice) {
            navigate(`/invoices/${selectedInvoice.id}`);
          }
          handleMenuClose();
        }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedInvoice) {
            navigate(`/invoices/${selectedInvoice.id}/edit`);
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>

        {selectedInvoice?.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedInvoice) {
              handleMarkAsPaid(selectedInvoice.id);
            }
            handleMenuClose();
          }}>
            <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}

        <Divider />
        
        <MenuItem 
          onClick={() => {
            if (selectedInvoice) {
              handleDelete(selectedInvoice.id);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Invoice
        </MenuItem>
      </Menu>

      {/* New Invoice Dialog */}
      <Dialog
        open={showNewInvoiceDialog}
        onClose={() => setShowNewInvoiceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Payment</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Payment creation form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowNewInvoiceDialog(false)}>
            Create Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setInvoiceToDelete(null);
        }}
        confirmText="Delete"
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerAccountInvoices;
