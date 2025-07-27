import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  Stack,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Logout, 
  Settings,
  Person,
  Search,
  Help,
  KeyboardArrowDown,
  Home,
  NavigateNext
} from '@mui/icons-material';
import { ThemeToggle } from '../Layout/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, collapsed, onToggleCollapse }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const location = useLocation();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [
      <Link key="home" color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
        <Home sx={{ mr: 0.5, fontSize: 18 }} />
        Dashboard
      </Link>
    ];

    pathnames.forEach((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const label = value.charAt(0).toUpperCase() + value.slice(1);

      if (isLast) {
        breadcrumbs.push(
          <Typography key={to} color="text.primary" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        );
      } else {
        breadcrumbs.push(
          <Link key={to} color="inherit" href={to}>
            {label}
          </Link>
        );
      }
    });

    return breadcrumbs;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
      elevation={0}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            borderRadius: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop collapse toggle */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onToggleCollapse}
          sx={{ 
            mr: 2, 
            display: { xs: 'none', sm: 'flex' },
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              transform: 'scale(1.05)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Breadcrumbs */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: theme.palette.text.disabled,
              },
              '& .MuiBreadcrumbs-li': {
                display: 'flex',
                alignItems: 'center',
              }
            }}
          >
            {generateBreadcrumbs()}
          </Breadcrumbs>
        </Box>

        {/* Right side actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Search button */}
          <IconButton
            size="medium"
            aria-label="search"
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                transform: 'scale(1.05)',
              }
            }}
          >
            <Search fontSize="small" />
          </IconButton>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <Box sx={{ ml: 1 }}>
            <IconButton
              size="medium"
              aria-label="account menu"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                borderRadius: 2,
                border: `2px solid transparent`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  JD
                </Avatar>
                <KeyboardArrowDown 
                  fontSize="small" 
                  sx={{ 
                    display: { xs: 'none', md: 'block' },
                    transition: 'transform 0.2s ease-in-out',
                    transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} 
                />
              </Stack>
            </IconButton>
          </Box>

          {/* User Menu */}
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary">
                john.doe@fleet.com
              </Typography>
            </Box>
            <Divider sx={{ mx: 1 }} />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Help fontSize="small" />
              </ListItemIcon>
              <ListItemText>Help & Support</ListItemText>
            </MenuItem>
            <Divider sx={{ mx: 1 }} />
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                }
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
