import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
  } from '@mui/material';
  import { useNavigate, useLocation } from 'react-router-dom';
  import AccountCircleIcon from '@mui/icons-material/AccountCircle';
  import Cusnav from '../customerview/cusnav'; // Import Cusnav
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customer', path: '/customer' },
  ];
  
  const Adminnav = () => {
    const navigate = useNavigate();
    const location = useLocation();
  
    // Check if the current route is under customer-related routes
    const isCustomerRoute =
      location.pathname.startsWith('/customer') ||
      location.pathname.startsWith('/summary') ||
      location.pathname.startsWith('/comments') ||
      location.pathname.startsWith('/contracts') ||
      location.pathname.startsWith('/activation') ||
      location.pathname.startsWith('/contact') ||
      location.pathname.startsWith('/logs');
  
    return (
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          {/* Left: Navigation buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', flexGrow: 1 }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  disableElevation
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    mx: 0.5,
                    my: 0.25,
                    px: 2,
                    py: 1,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'text.primary' : 'text.secondary',
                    backgroundColor: isActive ? '#eeeeee' : 'transparent',
                    border: isActive ? '1px solid #bdbdbd' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
  
          {/* Right: Profile Icon */}
          <IconButton>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
  
        {/* Render Cusnav for customer-related routes */}
        {isCustomerRoute && <Cusnav />}
      </AppBar>
    );
  };
  
  export default Adminnav;