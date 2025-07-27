import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const drawerWidth = 280;
const collapsedDrawerWidth = 80; // Optimized for better icon and mini-text display

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header 
        onMenuClick={handleDrawerToggle} 
        collapsed={collapsed}
        onToggleCollapse={handleSidebarCollapse}
      />
      <Sidebar
        drawerWidth={collapsed ? collapsedDrawerWidth : drawerWidth}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        collapsed={collapsed}
        onCollapse={handleSidebarCollapse}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} />
        <Box sx={{ 
          mt: 2,
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};