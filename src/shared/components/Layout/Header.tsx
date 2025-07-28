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
  useTheme,
  alpha,
  Stack,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Logout, 
  Settings,
  Person,
  Help,
  KeyboardArrowDown
} from '@mui/icons-material';
import { ThemeToggle } from '../Layout/ThemeToggle';

interface HeaderProps {
  // No props needed since we removed sidebar functionality
}

export const Header: React.FC<HeaderProps> = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        boxShadow: theme.palette.mode === 'dark' 
          ? `0 1px 3px ${alpha('#000', 0.3)}` 
          : `0 1px 3px ${alpha('#000', 0.1)}`,
      }}
      elevation={0}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Logo/App Name */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mr: 3
        }}>
          <Typography 
            variant="h6" 
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontSize: '1rem',
            }}
          >
            Antigone Financial
          </Typography>
        </Box>
        
        {/* Spacer to push right content to the end */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <IconButton
            size="medium"
            aria-label="account menu"
            onClick={handleMenu}
            sx={{
              borderRadius: 1.5,
              border: `1px solid transparent`,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.2),
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                JD
              </Avatar>
              <KeyboardArrowDown 
                fontSize="small" 
                sx={{ 
                  display: { xs: 'none', md: 'block' },
                  transition: 'transform 0.2s ease',
                  transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                }} 
              />
            </Stack>
          </IconButton>

          {/* User Menu */}
          <Menu
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
