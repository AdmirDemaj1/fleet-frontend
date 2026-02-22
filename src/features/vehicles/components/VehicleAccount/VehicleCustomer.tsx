import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  useTheme,
  alpha,
  Stack,
  Alert,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Business,
  Phone,
  Email,
  LocationOn,
  CalendarMonth,
  Badge,
  AccountBalance,
  Visibility,
  Edit,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types/vehicleType';
import { customerRtkApi } from '../../../customers/api/customerRtkApi';

interface VehicleCustomerProps {
  vehicle: Vehicle;
}

export const VehicleCustomer: React.FC<VehicleCustomerProps> = ({ vehicle }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch customer data using the currentClientId
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError
  } = customerRtkApi.useGetCustomerByIdQuery(vehicle.currentClientId!, {
    skip: !vehicle.currentClientId,
  });

  const handleViewCustomer = () => {
    if (vehicle.currentClientId) {
      navigate(`/customers/${vehicle.currentClientId}`);
    }
  };

  const handleEditCustomer = () => {
    if (vehicle.currentClientId) {
      navigate(`/customers/${vehicle.currentClientId}/edit`);
    }
  };

  const handleViewContracts = () => {
    if (vehicle.currentClientId) {
      navigate(`/customers/${vehicle.currentClientId}/contracts`);
    }
  };

  const getCustomerInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'success.main';
    if (score >= 650) return 'warning.main';
    return 'error.main';
  };

  const getCustomerName = () => {
    if (!customer) return '';
    if (customer.type === 'individual') {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    } else if (customer.type === 'business') {
      return customer.legalName || customer.companyName || '';
    }
    return customer.companyName || '';
  };

  // Loading state
  if (isLoadingCustomer) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (customerError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load customer information. Please try again.
        </Alert>
      </Box>
    );
  }

  // No customer assigned
  if (!vehicle.currentClientId || !customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            "& .MuiAlert-message": {
              width: "100%",
              textAlign: "center",
            },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 4 }}>
            <Person sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              No Customer Assigned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This vehicle is not currently associated with any customer. You can assign a customer to track usage and billing.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Person />}
              sx={{ textTransform: "none" }}
            >
              Assign Customer
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  const customerName = getCustomerName();

  return (
    <Box sx={{ p: 3 }}>
      {/* Customer Header Card */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              {getCustomerInitials(customerName)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {customerName}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip
                  icon={customer.type === 'individual' ? <Person /> : <Business />}
                  label={customer.type === 'individual' ? 'Individual' : 'Business'}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                {customer.createdAt && (
                  <Typography variant="body2" color="text.secondary">
                    Customer since {new Date(customer.createdAt).getFullYear()}
                  </Typography>
                )}
              </Stack>

              <Typography variant="body1" color="text.secondary">
                Customer ID: {customer.id}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={handleViewCustomer}
                sx={{ textTransform: 'none' }}
              >
                View Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditCustomer}
                sx={{ textTransform: 'none' }}
              >
                Edit Customer
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Customer Details Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Contact Information */}
        <Card sx={{ 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontWeight: 600,
              mb: 3
            }}>
              <Person sx={{ color: 'primary.main' }} />
              Contact Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {customer.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {customer.email}
                    </Typography>
                  </Box>
                </Box>
              )}

              {customer.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {customer.phone}
                    </Typography>
                  </Box>
                </Box>
              )}

              {customer.address && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOn sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {customer.address}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card sx={{ 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontWeight: 600,
              mb: 3
            }}>
              <Badge sx={{ color: 'primary.main' }} />
              Personal Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {customer.type === 'individual' && (
                <>
                  {customer.dateOfBirth && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarMonth sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(customer.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {customer.idNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">ID Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                          {customer.idNumber}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {customer.type === 'business' && customer.nuisNipt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">NUIS/NIPT</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {customer.nuisNipt}
                    </Typography>
                  </Box>
                </Box>
              )}

              {customer.type === 'individual' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Individual Customer
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            mb: 3
          }}>
            <Assignment sx={{ color: 'primary.main' }} />
            Quick Actions
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={handleViewContracts}
              sx={{ textTransform: 'none' }}
            >
              View Contracts
            </Button>
            <Button
              variant="outlined"
              startIcon={<Business />}
              onClick={() => navigate(`/vehicles?customerId=${customer.id}`)}
              sx={{ textTransform: 'none' }}
            >
              View Other Vehicles
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
              onClick={() => navigate(`/payments?customerId=${customer.id}`)}
              sx={{ textTransform: 'none' }}
            >
              Payment History
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleCustomer;
