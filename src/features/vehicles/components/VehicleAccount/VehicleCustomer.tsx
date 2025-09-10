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
  Alert
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

interface VehicleCustomerProps {
  vehicle: Vehicle;
}

export const VehicleCustomer: React.FC<VehicleCustomerProps> = ({ vehicle }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock customer data - in real app, this would be fetched based on vehicle.customerId
  const mockCustomer = vehicle.customerId ? {
    id: vehicle.customerId,
    name: vehicle.customerName || 'John Doe',
    type: 'INDIVIDUAL',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1985-03-15',
    idNumber: 'ID123456789',
    registrationDate: '2023-01-15',
    totalContracts: 3,
    activeContracts: 2,
    totalVehicles: 2,
    creditScore: 750,
    accountStatus: 'ACTIVE'
  } : null;

  const handleViewCustomer = () => {
    if (vehicle.customerId) {
      navigate(`/customers/${vehicle.customerId}`);
    }
  };

  const handleEditCustomer = () => {
    if (vehicle.customerId) {
      navigate(`/customers/${vehicle.customerId}/edit`);
    }
  };

  const handleViewContracts = () => {
    if (vehicle.customerId) {
      navigate(`/customers/${vehicle.customerId}/contracts`);
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

  if (!vehicle.customerId || !mockCustomer) {
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
              {getCustomerInitials(mockCustomer.name)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {mockCustomer.name}
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip
                  icon={mockCustomer.type === 'INDIVIDUAL' ? <Person /> : <Business />}
                  label={mockCustomer.type === 'INDIVIDUAL' ? 'Individual' : 'Business'}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={mockCustomer.accountStatus}
                  color={getStatusColor(mockCustomer.accountStatus) as any}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Customer since {new Date(mockCustomer.registrationDate).getFullYear()}
                </Typography>
              </Stack>

              <Typography variant="body1" color="text.secondary">
                Customer ID: {mockCustomer.id}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {mockCustomer.email}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {mockCustomer.phone}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {mockCustomer.address}
                  </Typography>
                </Box>
              </Box>
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
              {mockCustomer.type === 'INDIVIDUAL' && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarMonth sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(mockCustomer.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">ID Number</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {mockCustomer.idNumber}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalance sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 700,
                      color: getCreditScoreColor(mockCustomer.creditScore)
                    }}
                  >
                    {mockCustomer.creditScore}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Account Summary */}
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
            Account Summary
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, 
            gap: 3 
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {mockCustomer.totalContracts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Contracts
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                {mockCustomer.activeContracts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Contracts
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                {mockCustomer.totalVehicles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Vehicles
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: getCreditScoreColor(mockCustomer.creditScore),
                  mb: 1 
                }}
              >
                {mockCustomer.creditScore >= 750 ? 'A+' : mockCustomer.creditScore >= 650 ? 'B' : 'C'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credit Rating
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
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
              sx={{ textTransform: 'none' }}
            >
              View Other Vehicles
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
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
