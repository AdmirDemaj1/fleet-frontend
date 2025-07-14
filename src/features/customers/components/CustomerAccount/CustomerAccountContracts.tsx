import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Pagination
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridCellParams,
} from '@mui/x-data-grid';
import {
  Visibility,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Contract type definition
interface Contract {
  id: string;
  contractNumber: string;
  type: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  totalAmount: number;
  remainingAmount: number;
  customer: {
    id: string;
    name: string;
  };
  lastUpdated: string;
}

// Dummy data for demonstration
const dummyContracts: Contract[] = [
  {
    id: '1',
    contractNumber: 'CT-2025-001',
    type: 'Lease',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    totalAmount: 12500,
    remainingAmount: 9375,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-06-15'
  },
  {
    id: '2',
    contractNumber: 'CT-2025-002',
    type: 'Maintenance',
    status: 'pending',
    startDate: '2025-02-15',
    endDate: '2025-08-15',
    totalAmount: 4800,
    remainingAmount: 4800,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-06-10'
  },
  {
    id: '3',
    contractNumber: 'CT-2024-045',
    type: 'Rental',
    status: 'completed',
    startDate: '2024-10-01',
    endDate: '2025-04-01',
    totalAmount: 7200,
    remainingAmount: 0,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-04-05'
  },
  {
    id: '4',
    contractNumber: 'CT-2025-015',
    type: 'Fleet Management',
    status: 'active',
    startDate: '2025-03-01',
    endDate: '2026-03-01',
    totalAmount: 24000,
    remainingAmount: 20000,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-06-01'
  },
  {
    id: '5',
    contractNumber: 'CT-2025-018',
    type: 'Lease',
    status: 'cancelled',
    startDate: '2025-04-01',
    endDate: '2026-04-01',
    totalAmount: 9600,
    remainingAmount: 9600,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-04-15'
  },
  {
    id: '6',
    contractNumber: 'CT-2025-022',
    type: 'Insurance',
    status: 'active',
    startDate: '2025-05-01',
    endDate: '2026-05-01',
    totalAmount: 3600,
    remainingAmount: 3300,
    customer: {
      id: '1',
      name: 'Acme Corporation'
    },
    lastUpdated: '2025-06-01'
  },
];

// Custom DataGrid Toolbar component
const CustomToolbar = () => {
  return (
    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <Button size="small" startIcon={<DownloadIcon />}>
        Export
      </Button>
    </Box>
  );
};

const CustomerAccountContracts: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Filter contracts by search term
  const filteredContracts = dummyContracts.filter(contract => 
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, contractId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contractId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Render status chip with appropriate icon and color
  const renderStatusCell = (params: GridRenderCellParams) => {
    const status = params.value as string;
    let icon = null;
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    
    switch (status?.toLowerCase()) {
      case 'active':
        icon = <CheckCircleIcon fontSize="small" />;
        color = 'success';
        break;
      case 'pending':
        icon = <PendingIcon fontSize="small" />;
        color = 'warning';
        break;
      case 'completed':
        icon = <CheckCircleIcon fontSize="small" />;
        color = 'default';
        break;
      case 'cancelled':
        icon = <ErrorIcon fontSize="small" />;
        color = 'error';
        break;
      default:
        icon = <WarningIcon fontSize="small" />;
        color = 'default';
    }
    
    return (
      <Chip
        icon={icon}
        label={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
        size="small"
        color={color}
        sx={{ 
          minWidth: 90,
          '& .MuiChip-icon': { 
            fontSize: '0.875rem',
            ml: 0.5
          }
        }}
      />
    );
  };

  // Render actions cell with menu
  const renderActionsCell = (params: GridRenderCellParams) => {
    return (
      <Box>
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row.id)}
          aria-label="actions"
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  // Table columns configuration
  const columns: GridColDef[] = [
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
      flex: 1
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
      headerName: 'Total Amount', 
      minWidth: 130,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueFormatter: (params) => {
        if (params.value == null) return '';
        return `$${Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        return `$${Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
      cellClassName: (params: GridCellParams) => {
        // Safe access with type guard
        if (params.value == null) return '';
        return Number(params.value) > 0 ? '' : 'completed-amount';
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      sortable: false,
      minWidth: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: renderActionsCell,
      disableColumnMenu: true
    }
  ];

  return (
    <Box sx={{ p: 0 }}>
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              Customer Contracts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              New Contract
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage all contracts for this customer. View details, update status, or create new contracts.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
            <TextField
              placeholder="Search contracts..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box>
              <Button 
                startIcon={<FilterListIcon />}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
              <Button startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
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
          rows={filteredContracts}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          disableSelectionOnClick
          disableColumnMenu
          loading={false}
          autoHeight
          components={{
            Toolbar: CustomToolbar,
          }}
          sx={{
            border: 'none',
          }}
        />
      </Paper>

      {/* Actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180, borderRadius: 2 }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Contract
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: theme.palette.error.main }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Cancel Contract
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomerAccountContracts;