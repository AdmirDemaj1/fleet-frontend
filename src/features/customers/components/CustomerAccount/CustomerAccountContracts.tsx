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
  DescriptionOutlined as ContractIcon,
  Receipt as InvoiceIcon
} from '@mui/icons-material';

// Local imports
import { CustomerAccountContractsProps } from '../../types/customerContracts.types';
import { 
  useContracts, 
  useContractsTable, 
  useDialogStates, 
  useMenuState, 
  useNotification 
} from '../../hooks/useCustomerContracts';
import { formatCurrency, formatDate } from '../../utils/contractUtils';
import { renderStatusCell, renderTypeCell } from '../../utils/renderUtils';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants/contractConstants';
import { ContractFilters, ContractFiltersType } from './ContractFilters';
import { ConfirmDialog } from '../../../../shared/components/ConfirmDialog';

// Export types for external use
export type { CustomerAccountContractsProps };

const CustomerAccountContracts: React.FC<CustomerAccountContractsProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Custom hooks
  const { contracts, loading, error, fetchContracts } = useContracts(propCustomerId);
  const { notification, showNotification, hideNotification } = useNotification();
  const { 
    showNewContractDialog, 
    deleteDialogOpen, 
    contractToDelete,
    openNewContractDialog,
    closeNewContractDialog,
    openDeleteDialog,
    closeDeleteDialog 
  } = useDialogStates();
  const { anchorEl, selectedContract, openMenu, closeMenu } = useMenuState();
  
  // Filters state
  const [filters, setFilters] = useState<ContractFiltersType>({
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
    filteredContracts,
    paginatedContracts,
    handleRequestSort,
    handlePageChange,
    handleRowsPerPageChange
  } = useContractsTable(contracts, filters);

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

  const handleDelete = (contractId: string) => {
    openDeleteDialog(contractId);
  };

  const confirmDelete = async () => {
    if (contractToDelete) {
      try {
        console.log(`Deleting contract ${contractToDelete}`);
        showNotification('Contract deleted successfully', 'success');
        await fetchContracts();
        // Note: Page adjustment logic would be handled by the table hook
      } catch (error) {
        showNotification('Failed to delete contract', 'error');
      }
      closeDeleteDialog();
    }
  };

  // Loading state - following customer list pattern
  if (loading && contracts.length === 0) {
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
            {['20%', '15%', '15%', '15%', '15%', '20%'].map((width, i) => (
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
              {['20%', '15%', '15%', '15%', '15%', '20%'].map((width, i) => (
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
  if (error && !contracts.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchContracts}
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
            Contracts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track customer contracts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewContractDialog}
          >
            New Contract
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <ContractFilters
          filters={filters}
          onFilterChange={setFilters}
          contractsCount={filteredContracts.length}
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
                    active={orderBy === 'contractNumber'}
                    direction={orderBy === 'contractNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('contractNumber')}
                  >
                    Contract #
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
                    active={orderBy === 'startDate'}
                    direction={orderBy === 'startDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('startDate')}
                  >
                    Start Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'endDate'}
                    direction={orderBy === 'endDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('endDate')}
                  >
                    End Date
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'totalAmount'}
                    direction={orderBy === 'totalAmount' ? order : 'asc'}
                    onClick={() => handleRequestSort('totalAmount')}
                  >
                    Total Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'remainingAmount'}
                    direction={orderBy === 'remainingAmount' ? order : 'asc'}
                    onClick={() => handleRequestSort('remainingAmount')}
                  >
                    Remaining
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedContracts.map((contract) => (
                <TableRow 
                  key={contract.id} 
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
                      {contract.contractNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderTypeCell(contract.type || 'N/A')}</TableCell>
                  <TableCell>{renderStatusCell(contract.status || 'unknown')}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contract.startDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contract.endDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(contract.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
                      color={contract.remainingAmount === 0 ? 'success.main' : 'text.primary'}
                    >
                      {formatCurrency(contract.remainingAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(event) => openMenu(event, contract)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedContracts.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
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
                        <ContractIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h6" gutterBottom>No contracts found</Typography>
                      <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                        {filteredContracts.length !== contracts.length 
                          ? 'No contracts match your current filter criteria.'
                          : 'This customer doesn\'t have any contracts yet.'
                        }
                      </Typography>
                      {filteredContracts.length !== contracts.length ? (
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
                          onClick={openNewContractDialog}
                        >
                          Add New Contract
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
          count={filteredContracts.length || 0}
          page={Math.min(page, Math.max(0, Math.ceil((filteredContracts.length || 0) / rowsPerPage) - 1))}
          onPageChange={(_, newPage) => {
            handlePageChange(newPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            const newRowsPerPage = parseInt(e.target.value, 10);
            handleRowsPerPageChange(newRowsPerPage);
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
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
          if (selectedContract) {
            navigate(`/contracts/${selectedContract.id}`);
          }
          closeMenu();
        }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedContract) {
            navigate(`/contracts/${selectedContract.id}/edit`);
          }
          closeMenu();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Contract
        </MenuItem>

        <MenuItem onClick={() => {
          if (selectedContract) {
            navigate(`/contracts/${selectedContract.id}/invoices`);
          }
          closeMenu();
        }}>
          <InvoiceIcon fontSize="small" sx={{ mr: 1 }} />
          View Invoices
        </MenuItem>

        <Divider />
        
        <MenuItem 
          onClick={() => {
            if (selectedContract) {
              handleDelete(selectedContract.id);
            }
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Contract
        </MenuItem>
      </Menu>

      {/* New Contract Dialog */}
      <Dialog
        open={showNewContractDialog}
        onClose={closeNewContractDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Contract</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Contract creation form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewContractDialog}>Cancel</Button>
          <Button variant="contained" onClick={closeNewContractDialog}>
            Create Contract
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Contract"
        message="Are you sure you want to delete this contract? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
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

export default CustomerAccountContracts;
