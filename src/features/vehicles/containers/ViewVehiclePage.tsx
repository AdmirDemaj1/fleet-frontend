import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Skeleton,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  DirectionsCar,
  Build,
  AttachMoney,
  Security,
  NavigateNext,
  Speed,
  Person,
  Warning,
  CheckCircle,
  Schedule,
  Assignment,
  Download,
  Share,
  Print,
  Visibility,
  TrendingUp,
  Info,
  History,
  Assessment,
  Favorite,
  FavoriteBorder,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleStatus, ConditionStatus } from '../types/vehicleType';

// Enhanced interfaces for the professional view
interface VehicleMetrics {
  utilizationRate: number;
  maintenanceCost: number;
  revenueGenerated: number;
  profitability: number;
  depreciationRate: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const getStatusColor = (status: VehicleStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return 'success';
    case VehicleStatus.LEASED:
      return 'primary';
    case VehicleStatus.MAINTENANCE:
      return 'warning';
    case VehicleStatus.SOLD:
      return 'info';
    case VehicleStatus.LIQUID_ASSET:
      return 'secondary';
    default:
      return 'default';
  }
};

const getConditionColor = (condition: ConditionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (condition) {
    case ConditionStatus.EXCELLENT:
      return 'success';
    case ConditionStatus.GOOD:
      return 'primary';
    case ConditionStatus.FAIR:
      return 'warning';
    case ConditionStatus.POOR:
    case ConditionStatus.NEEDS_REPAIR:
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMileage = (mileage: number | undefined): string => {
  if (!mileage) return 'N/A';
  return new Intl.NumberFormat('en-US').format(mileage) + ' miles';
};

export const ProfessionalViewVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock metrics - in a real app, these would come from API
  const [metrics] = useState<VehicleMetrics>({
    utilizationRate: 85,
    maintenanceCost: 2500,
    revenueGenerated: 15000,
    profitability: 75,
    depreciationRate: 12
  });

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

  const handleRefresh = async () => {
    if (id) {
      setRefreshing(true);
      await fetchVehicle(id);
      setRefreshing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/vehicles/${id}/edit`);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Calculate days until insurance/registration expiry
  const getDaysUntilExpiry = (expiryDate: string | undefined): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (expiryDate: string | undefined, days: number = 30): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil <= days && daysUntil > 0;
  };

  const isExpired = (expiryDate: string | undefined): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil < 0;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Skeleton variant="rectangular" width="100%" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/vehicles')} startIcon={<ArrowBack />}>
          Back to Vehicles
        </Button>
      </Box>
    );
  }

  if (!vehicle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Vehicle not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/vehicles')} startIcon={<ArrowBack />}>
          Back to Vehicles
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link color="inherit" href="/vehicles" onClick={(e) => { e.preventDefault(); navigate('/vehicles'); }}>
          Vehicles
        </Link>
        <Typography color="text.primary">{vehicle.make} {vehicle.model}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
            <DirectionsCar fontSize="large" />
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {vehicle.make} {vehicle.model}
              </Typography>
              <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {vehicle.year} • {vehicle.licensePlate}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={vehicle.status} 
                color={getStatusColor(vehicle.status)} 
                size="small" 
              />
              {vehicle.condition && (
                <Chip 
                  label={vehicle.condition} 
                  color={getConditionColor(vehicle.condition)} 
                  size="small" 
                />
              )}
              {vehicle.isLiquidAsset && (
                <Chip label="Liquid Asset" color="secondary" size="small" />
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outlined" startIcon={<Share />}>
            Share
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(vehicle.currentValuation)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatMileage(vehicle.mileage)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mileage
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {metrics.utilizationRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Utilization Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {metrics.profitability}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profitability
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts for expiring documents */}
      {(isExpiringSoon(vehicle.insuranceExpiryDate) || isExpiringSoon(vehicle.registrationExpiryDate) || isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate)) && (
        <Alert 
          severity={isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate) ? "error" : "warning"} 
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate) ? "Expired Documents" : "Expiring Soon"}
          </Typography>
          <List dense>
            {(isExpiringSoon(vehicle.insuranceExpiryDate) || isExpired(vehicle.insuranceExpiryDate)) && (
              <ListItem>
                <ListItemText 
                  primary={`Insurance ${isExpired(vehicle.insuranceExpiryDate) ? 'expired' : 'expires'} ${vehicle.insuranceExpiryDate ? format(new Date(vehicle.insuranceExpiryDate), 'MMM dd, yyyy') : ''}`}
                />
              </ListItem>
            )}
            {(isExpiringSoon(vehicle.registrationExpiryDate) || isExpired(vehicle.registrationExpiryDate)) && (
              <ListItem>
                <ListItemText 
                  primary={`Registration ${isExpired(vehicle.registrationExpiryDate) ? 'expired' : 'expires'} ${vehicle.registrationExpiryDate ? format(new Date(vehicle.registrationExpiryDate), 'MMM dd, yyyy') : ''}`}
                />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<Info />} iconPosition="start" />
          <Tab label="Financial" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Maintenance" icon={<Build />} iconPosition="start" />
          <Tab label="Documents" icon={<Assignment />} iconPosition="start" />
          <Tab label="History" icon={<History />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar />
                    Vehicle Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">VIN</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.vin}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">License Plate</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.licensePlate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Make & Model</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.make} {vehicle.model}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Year</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.year}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Color</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.color || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Fuel Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.fuelType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Transmission</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{vehicle.transmission || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Mileage</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{formatMileage(vehicle.mileage)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person />
                    Customer Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {vehicle.customerId ? (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                        {vehicle.customerName || 'Unknown Customer'}
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/customers/${vehicle.customerId}`)}
                      >
                        View Customer Profile
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No customer assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Insurance Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security />
                    Insurance & Registration
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Insurance Provider</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.insuranceProvider || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Policy Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.insurancePolicyNumber || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Insurance Expiry</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {vehicle.insuranceExpiryDate ? format(new Date(vehicle.insuranceExpiryDate), 'MMM dd, yyyy') : 'N/A'}
                        </Typography>
                        {isExpiringSoon(vehicle.insuranceExpiryDate) && <Warning color="warning" fontSize="small" />}
                        {isExpired(vehicle.insuranceExpiryDate) && <Warning color="error" fontSize="small" />}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Registration Expiry</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {vehicle.registrationExpiryDate ? format(new Date(vehicle.registrationExpiryDate), 'MMM dd, yyyy') : 'N/A'}
                        </Typography>
                        {isExpiringSoon(vehicle.registrationExpiryDate) && <Warning color="warning" fontSize="small" />}
                        {isExpired(vehicle.registrationExpiryDate) && <Warning color="error" fontSize="small" />}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Legal Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment />
                    Legal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Legal Owner</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.legalOwner || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Purchase Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.purchaseDate ? format(new Date(vehicle.purchaseDate), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Registration Date</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {vehicle.registrationDate ? format(new Date(vehicle.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Financial Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {/* Valuation Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                    {formatCurrency(vehicle.currentValuation)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Current Valuation</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {formatCurrency(vehicle.marketValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Market Value</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                    {formatCurrency(vehicle.purchasePrice)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Financial Performance</Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Revenue Generated (YTD)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {formatCurrency(metrics.revenueGenerated)}
                        </Typography>
                        <Chip label="+12%" color="success" size="small" />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Maintenance Costs (YTD)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {formatCurrency(metrics.maintenanceCost)}
                        </Typography>
                        <Chip label="-5%" color="info" size="small" />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Depreciation Rate (Annual)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {metrics.depreciationRate}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={metrics.depreciationRate} 
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Profitability Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {metrics.profitability}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={metrics.profitability} 
                          color="success"
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Maintenance Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Maintenance History</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                    <Timeline>
                      {vehicle.maintenanceHistory.map((record, index) => (
                        <TimelineItem key={record.id}>
                          <TimelineOppositeContent color="text.secondary">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color={record.performed ? 'success' : 'warning'}>
                              {record.performed ? <CheckCircle /> : <Schedule />}
                            </TimelineDot>
                            {index < vehicle.maintenanceHistory!.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="subtitle2" gutterBottom>
                              {record.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Cost: {formatCurrency(record.cost)} • Mileage: {formatMileage(record.mileage)}
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No maintenance history available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vehicle Documents</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {vehicle.documents && vehicle.documents.length > 0 ? (
                    <List>
                      {vehicle.documents.map((doc) => (
                        <ListItem key={doc.id} divider>
                          <ListItemText
                            primary={doc.name}
                            secondary={`${doc.type} • Uploaded ${format(new Date(doc.uploadDate), 'MMM dd, yyyy')}`}
                          />
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No documents available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vehicle History</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Timeline>
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        {format(new Date(vehicle.createdAt), 'MMM dd, yyyy')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <DirectionsCar />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">Vehicle Added to Fleet</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle was registered in the system
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                    
                    {vehicle.purchaseDate && (
                      <TimelineItem>
                        <TimelineOppositeContent color="text.secondary">
                          {format(new Date(vehicle.purchaseDate), 'MMM dd, yyyy')}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color="success">
                            <AttachMoney />
                          </TimelineDot>
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="subtitle2">Vehicle Purchased</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Purchase price: {formatCurrency(vehicle.purchasePrice)}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    )}
                    
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        {format(new Date(vehicle.updatedAt), 'MMM dd, yyyy')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="info">
                          <Edit />
                        </TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">Last Updated</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle information was last modified
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={currentTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Utilization Rate</Typography>
                      <Typography variant="body2">{metrics.utilizationRate}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.utilizationRate} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Profitability</Typography>
                      <Typography variant="body2">{metrics.profitability}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.profitability} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Depreciation Rate</Typography>
                      <Typography variant="body2">{metrics.depreciationRate}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.depreciationRate} 
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Quick Insights</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="High Performer"
                        secondary="This vehicle generates above-average revenue"
                      />
                      <CheckCircle color="success" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Low Maintenance"
                        secondary="Maintenance costs are below fleet average"
                      />
                      <CheckCircle color="success" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Insurance Due Soon"
                        secondary="Insurance expires in 15 days"
                      />
                      <Warning color="warning" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); handleEdit(); }}>
          <Edit sx={{ mr: 1 }} />
          Edit Vehicle
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* handleDuplicate(); */ }}>
          <Assignment sx={{ mr: 1 }} />
          Duplicate Vehicle
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* handleExport(); */ }}>
          <Download sx={{ mr: 1 }} />
          Export Details
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* handlePrint(); */ }}>
          <Print sx={{ mr: 1 }} />
          Print
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { handleMenuClose(); setDeleteDialogOpen(true); }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Vehicle
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewVehiclePage;
