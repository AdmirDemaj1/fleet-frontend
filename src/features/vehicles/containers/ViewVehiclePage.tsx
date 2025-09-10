import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Skeleton,
  Alert,
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete
} from '@mui/icons-material';

// Components
import VehicleHeader from '../components/VehicleAccount/VehicleHeader';
import VehicleMenu from '../components/VehicleAccount/VehicleMenu';
import VehicleSidebar from '../components/VehicleAccount/VehicleSidebar';
import VehicleOverview from '../components/VehicleAccount/VehicleOverview';
import VehicleFinancial from '../components/VehicleAccount/VehicleFinancial';
import VehicleDocuments from '../components/VehicleAccount/VehicleDocuments';
import VehicleCustomer from '../components/VehicleAccount/VehicleCustomer';

// Types and API
import { Vehicle } from '../types/vehicleType';
import { vehicleApi } from '../api/vehicleApi';

export const ViewVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // State
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get current tab from URL
  const getCurrentTab = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    switch (lastSegment) {
      case 'financial':
        return 'financial';
      case 'documents':
        return 'documents';
      case 'customer':
        return 'customer';
      default:
        return 'overview';
    }
  };

  const currentTab = getCurrentTab();

  // Fetch vehicle data
  useEffect(() => {
    if (id) {
      fetchVehicle(id);
    }
  }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleApi.getVehicleById(vehicleId);
      setVehicle(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleEdit = () => {
    navigate(`/vehicles/${id}/edit`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await vehicleApi.deleteVehicle(id);
      navigate('/vehicles');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete vehicle');
    }
    setDeleteDialogOpen(false);
  };

  // Render tab content
  const renderTabContent = () => {
    if (!vehicle) return null;

    switch (currentTab) {
      case 'financial':
        return <VehicleFinancial vehicle={vehicle} />;
      case 'documents':
        return <VehicleDocuments vehicle={vehicle} />;
      case 'customer':
        return <VehicleCustomer vehicle={vehicle} />;
      default:
        return <VehicleOverview vehicle={vehicle} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ width: 350 }}>
            <Skeleton variant="rectangular" width="100%" height={600} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/vehicles')} 
          startIcon={<ArrowBack />}
        >
          Back to Vehicles
        </Button>
      </Container>
    );
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          Vehicle not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/vehicles')} 
          startIcon={<ArrowBack />}
        >
          Back to Vehicles
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Vehicle Header */}
      <VehicleHeader
        vehicle={vehicle}
        onEdit={handleEdit}
        onMenuOpen={handleMenuOpen}
      />

      {/* Vehicle Menu */}
      <VehicleMenu />

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
        {/* Tab Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {renderTabContent()}
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: 350, flexShrink: 0, pt: 3 }}>
          <VehicleSidebar vehicle={vehicle} />
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
              gap: 2,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); handleEdit(); }}>
          <Edit fontSize="small" />
          Edit Vehicle
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => { 
            handleMenuClose(); 
            setDeleteDialogOpen(true); 
          }}
          sx={{ 
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Delete fontSize="small" />
          Delete Vehicle
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Vehicle
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vehicle? This action cannot be undone.
            All associated data including documents and history will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete Vehicle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewVehiclePage;
