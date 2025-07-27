import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Receipt as InvoiceIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Local imports
import { CustomerAccountInvoicesProps } from '../../types/customerInvoices.types';
import { 
  useInvoices, 
  useInvoicesTable, 
  useInvoiceDialogStates, 
  useInvoiceMenuState, 
  useInvoiceNotification,
  useInvoiceOperations
} from '../../hooks/useCustomerInvoices';
import { formatCurrency, formatDate, isOverdue } from '../../utils/invoiceUtils';
import { renderInvoiceStatusCell, renderInvoiceTypeCell } from '../../utils/invoiceRenderUtils';
import { INVOICE_ROWS_PER_PAGE_OPTIONS } from '../../constants/invoiceConstants';
import InvoiceFilters, { InvoiceFilters as InvoiceFiltersType } from './InvoiceFilters';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';

// Export types for external use
export type { CustomerAccountInvoicesProps };

const CustomerAccountInvoices: React.FC<CustomerAccountInvoicesProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Custom hooks
  const { invoices, loading, error, fetchInvoices } = useInvoices(propCustomerId);
  const { notification, showNotification, hideNotification } = useInvoiceNotification();
  const { handleDeleteInvoice } = useInvoiceOperations();
  const { 
    showNewInvoiceDialog, 
    deleteDialogOpen, 
    invoiceToDelete,
    openNewInvoiceDialog,
    closeNewInvoiceDialog,
    openDeleteDialog,
    closeDeleteDialog 
  } = useInvoiceDialogStates();
  const { anchorEl, selectedInvoice, openMenu, closeMenu } = useInvoiceMenuState();
  
  // Filters state
  const [filters, setFilters] = useState<InvoiceFiltersType>({
    search: '',
    status: '',
    type: '',
    dateRange: '',
    amountRange: ''
  });
  
  // Table state and logic
  const {
    page,
    rowsPerPage,
    order,
    orderBy,
    filteredInvoices,
    paginatedInvoices,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  } = useInvoicesTable(invoices, filters);

  // Event handlers
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      dateRange: '',
      amountRange: ''
    });
  };

  const handleDelete = (invoiceId: string) => {
    openDeleteDialog(invoiceId);
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      // Call API to mark invoice as paid
      console.log(`Marking invoice ${invoiceId} as paid`);
      showNotification('Invoice marked as paid', 'success');
      await fetchInvoices();
    } catch (error) {
      showNotification('Failed to mark invoice as paid', 'error');
    }
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
            onClick={openNewInvoiceDialog}
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
                  <TableCell>{renderInvoiceTypeCell(invoice.type || 'N/A')}</TableCell>
                  <TableCell>{renderInvoiceStatusCell(invoice.status || 'unknown')}</TableCell>
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
                      onClick={(event) => openMenu(event, invoice)}
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
                          onClick={openNewInvoiceDialog}
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
            handlePageChange(newPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            handleRowsPerPageChange(newRowsPerPage);
          }}
          rowsPerPageOptions={INVOICE_ROWS_PER_PAGE_OPTIONS}
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
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedInvoice) {
            navigate(`/invoices/${selectedInvoice.id}`);
          }
          closeMenu();
        }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedInvoice) {
            navigate(`/invoices/${selectedInvoice.id}/edit`);
          }
          closeMenu();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>

        {selectedInvoice?.status === 'pending' && (
          <MenuItem onClick={() => {
            if (selectedInvoice) {
              handleMarkAsPaid(selectedInvoice.id);
            }
            closeMenu();
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
            closeMenu();
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
        onClose={closeNewInvoiceDialog}
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
          <Button onClick={closeNewInvoiceDialog}>Cancel</Button>
          <Button variant="contained" onClick={closeNewInvoiceDialog}>
            Create Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
            <ConfirmDialog
        open={deleteDialogOpen}
        onConfirm={() => handleDeleteInvoice(invoiceToDelete!)}
        onCancel={closeDeleteDialog}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice #${invoiceToDelete}?`}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
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
