import React from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info,
  AttachMoney,
  Assignment,
  Person
} from '@mui/icons-material';

interface VehicleMenuProps {
  vehicleId?: string;
  vehicleName?: string;
}

const VehicleMenu: React.FC<VehicleMenuProps> = ({ vehicleId, vehicleName }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const currentVehicleId = vehicleId || id;
  const displayName = vehicleName || 'Vehicle';

  const menuItems = [
    {
      path: 'overview',
      text: 'Overview',
      description: 'General vehicle information',
      icon: <Info />
    },
    {
      path: 'financial',
      text: 'Financial',
      description: 'Valuation and financial data',
      icon: <AttachMoney />
    },
    {
      path: 'documents',
      text: 'Documents',
      description: 'Vehicle documentation',
      icon: <Assignment />
    },
    {
      path: 'customer',
      text: 'Customer',
      description: 'Associated customer information',
      icon: <Person />
    }
  ];

  const handleBackClick = () => {
    navigate('/vehicles');
  };

  const getCurrentTab = () => {
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    const tabIndex = menuItems.findIndex(item => item.path === lastSegment);
    return tabIndex >= 0 ? tabIndex : 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const selectedItem = menuItems[newValue];
    if (selectedItem && currentVehicleId) {
      navigate(`/vehicles/${currentVehicleId}/${selectedItem.path}`);
    }
  };

  if (!currentVehicleId) {
    return (
      <AppBar 
        position="static" 
        color="inherit" 
        elevation={1} 
        sx={{ backgroundColor: theme.palette.background.paper }}
      >
        <Toolbar>
          <IconButton 
            color="primary" 
            onClick={handleBackClick}
            sx={{
              mr: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.2),
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" color="error" sx={{ ml: 2 }}>
            Vehicle not found
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={1} 
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 52, sm: 64 },
          px: { xs: 0.5, sm: 1.5 },
        }}
      >
        {/* Navigation Tabs - Full Width Centered */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}>
          <Tabs
            value={getCurrentTab()}
            onChange={handleTabChange}
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons="auto"
            allowScrollButtonsMobile
            centered={!isSmallScreen}
            aria-label="Vehicle account navigation"
            sx={{
              width: '100%',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTabs-scrollButtons': {
                width: isSmallScreen ? 24 : 32,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                minWidth: isSmallScreen ? 60 : 100,
                maxWidth: isSmallScreen ? 120 : 160,
                minHeight: isSmallScreen ? 48 : 64,
                px: isSmallScreen ? 1 : 1.5,
                color: theme.palette.text.secondary,
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
                '&:hover:not(.Mui-selected)': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
            }}
          >
            {menuItems.map((item) => (
              <Tab
                key={item.path}
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: isSmallScreen ? 0.5 : 1,
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    width: '100%',
                  }}>
                    <Box sx={{ 
                      fontSize: isSmallScreen ? 18 : 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography 
                      variant={isSmallScreen ? "caption" : "body2"}
                      sx={{ 
                        lineHeight: 1,
                        textAlign: 'center',
                        fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                }
                component={Link}
                to={`/vehicles/${currentVehicleId}/${item.path}`}
                sx={{
                  py: isSmallScreen ? 1 : 1.5,
                }}
                aria-label={`${item.text} - ${item.description}`}
              />
            ))}
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default VehicleMenu;
