import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  Divider,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarQuickFilter,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Visibility,
  Add as AddIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
  DescriptionOutlined as ContractIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { customerApi } from '../../api/customerApi';
import { ContractSummary } from '../../types/customer.types';

// Status configuration for consistent styling
const STATUS_CONFIG = {
  active: {
    icon: <CheckCircleIcon fontSize="small" />,
    color: 'success' as const,
    label: 'Active'
  },
  pending: {
    icon: <PendingIcon fontSize="small" />,
    color: 'warning' as const,
    label: 'Pending'
  },
  completed: {
    icon: <CheckCircleIcon fontSize="small" />,
    color: 'default' as const,
    label: 'Completed'
  },
  cancelled: {
    icon: <ErrorIcon fontSize="small" />,
    color: 'error' as const,
    label: 'Cancelled'
  }
};

// Modern DataGrid toolbar with search and export
function CustomToolbar({ onExport }: { onExport: () => void }) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <GridToolbarQuickFilter 
        sx={{ 
          '& .MuiInputBase-root': { 
            borderRadius: 2,
            minWidth: 300
          }
        }} 
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<DownloadIcon />}
        onClick={onExport}
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
          }
        }}
      >
        Export
      </Button>
    </Box>
  );
}

// Format currency consistently
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

interface CustomerAccountContractsProps {
  customerId?: string; // Optional because we can get it from URL params too
}

const CustomerAccountContracts: React.FC<CustomerAccountContractsProps> = ({ customerId: propCustomerId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: urlCustomerId } = useParams<{ id: string }>();
  const customerId = propCustomerId || urlCustomerId;
  
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showNewContractDialog, setShowNewContractDialog] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  // Fetch contracts data
  useEffect(() => {
    if (!customerId) return;
    
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const data = await customerApi.getContracts(customerId);
        setContracts(data);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContracts();
  }, [customerId]);

  // Action handlers
  const handleViewContract = useCallback((contractId: string) => {
    navigate(`/contracts/${contractId}`);
    handleMenuClose();
  }, [navigate]);
  
  const handleEditContract = useCallback((contractId: string) => {
    navigate(`/contracts/${contractId}/edit`);
    handleMenuClose();
  }, [navigate]);
  
  const handleCancelContract = useCallback((contractId: string) => {
    // This would typically show a confirmation dialog before cancellation
    console.log(`Cancelling contract ${contractId}`);
    handleMenuClose();
  }, []);
  
  const handleExport = useCallback(() => {
    setIsExporting(true);
    // Export logic would go here
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  }, []);

  // Menu handlers
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>, contractId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contractId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedContract(null);
  }, []);

  const toggleNewContractDialog = useCallback(() => {
    setShowNewContractDialog(prev => !prev);
  }, []);

  const handleCreateNewContract = useCallback(() => {
    navigate(`/contracts/new?customerId=${customerId}`);
    toggleNewContractDialog();
  }, [navigate, customerId, toggleNewContractDialog]);

  // Cell renderers
  const renderStatusCell = useCallback((params: GridRenderCellParams) => {
    const status = params.value as keyof typeof STATUS_CONFIG;
    const config = STATUS_CONFIG[status] || {
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
        sx={{ 
          minWidth: 90,
          fontWeight: 500,
          '& .MuiChip-icon': { 
            fontSize: '0.875rem',
            ml: 0.5
          }
        }}
      />
    );
  }, []);

  const getActions = useCallback((params: GridRenderCellParams) => [
    <GridActionsCellItem
      icon={
        <Tooltip title="View contract">
          <Visibility fontSize="small" />
        </Tooltip>
      }
      label="View"
      onClick={() => handleViewContract(params.id.toString())}
    />,
    <GridActionsCellItem
      icon={
        <Tooltip title="Edit contract">
          <Edit fontSize="small" />
        </Tooltip>
      }
      label="Edit"
      onClick={() => handleEditContract(params.id.toString())}
    />,
    <GridActionsCellItem
      icon={
        <Tooltip title="More options">
          <MoreVertIcon fontSize="small" />
        </Tooltip>
      }
      label="More"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => 
        handleMenuOpen(event, params.id.toString())
      }
    />
  ], [handleViewContract, handleEditContract, handleMenuOpen]);

  // Table columns
  const columns = useMemo<GridColDef[]>(() => [
    { 
      field: 'contractNumber', 
      headerName: 'Contract #', 
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'type', 
      headerName: 'Type', 
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      minWidth: 130,
      flex: 1,
      renderCell: renderStatusCell
    },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value.toString()).format('MMM D, YYYY');
      }
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return dayjs(params.value.toString()).format('MMM D, YYYY');
      }
    },
    { 
      field: 'totalAmount', 
      headerName: 'Total Value', 
      minWidth: 130,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return formatCurrency(Number(params.value));
      }
    },
    { 
      field: 'remainingAmount', 
      headerName: 'Remaining', 
      minWidth: 130,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return formatCurrency(Number(params.value));
      },
      cellClassName: (params) => {
        return params.value === 0 ? 'completed-amount' : '';
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      type: 'actions',
      width: 120,
      getActions: getActions
    }
  ], [theme, renderStatusCell, getActions]);

  return (
    <Box sx={{ p: 0 }}>
      {/* Header Card */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[2]
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ContractIcon 
                color="primary" 
                sx={{ mr: 1.5, fontSize: 28 }} 
              />
              <Typography variant="h5" color="primary" fontWeight="bold">
                Customer Contracts
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={toggleNewContractDialog}
              sx={{ 
                borderRadius: 2,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              New Contract
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage all contracts for this customer. View details, update status, or create new contracts.
          </Typography>
        </CardContent>
      </Card>

      {/* DataGrid */}
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: theme.palette.divider,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[2]
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme.palette.background.paper,
          },
          '& .completed-amount': {
            color: theme.palette.success.main,
            fontWeight: 500,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <DataGrid
          rows={contracts}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          loading={isLoading}
          autoHeight
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: CircularProgress,
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
                <Typography color="text.secondary" align="center">
                  No contracts found for this customer
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={toggleNewContractDialog}
                >
                  Create Contract
                </Button>
              </Box>
            ),
          }}
          slotProps={{
            toolbar: {
              onExport: handleExport,
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            }
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': {
              cursor: 'pointer'
            }
          }}
        />
      </Paper>

      {/* Contract Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 200, 
            borderRadius: 2,
            overflow: 'hidden',
            mt: 0.5
          }
        }}
      >
        <MenuItem 
          onClick={() => selectedContract && handleViewContract(selectedContract)}
          sx={{ py: 1 }}
        >
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>
        <MenuItem 
          onClick={() => selectedContract && handleEditContract(selectedContract)}
          sx={{ py: 1 }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Contract
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedContract && handleCancelContract(selectedContract)}
          sx={{ 
            py: 1,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08)
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Cancel Contract
        </MenuItem>
      </Menu>

      {/* New Contract Dialog */}
      <Dialog 
        open={showNewContractDialog} 
        onClose={toggleNewContractDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 600
          }
        }}
      >
        <DialogTitle fontWeight="bold">
          New Contract
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new contract for this customer. You can specify contract type, duration, value, and other details on the next screen.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="outlined" 
            onClick={toggleNewContractDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateNewContract}
            sx={{ borderRadius: 2, ml: 1 }}
          >
            Create Contract
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerAccountContracts;