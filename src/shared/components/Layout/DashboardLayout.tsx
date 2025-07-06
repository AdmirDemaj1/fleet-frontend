import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const drawerWidth = 240;
const collapsedDrawerWidth = 64; // Width when only icons are visible

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // New state for collapsed sidebar

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar
        drawerWidth={collapsed ? collapsedDrawerWidth : drawerWidth} // Use different width based on collapsed state
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        collapsed={collapsed} // Pass collapsed state
        onCollapse={handleSidebarCollapse} // Pass collapse handler
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          // Adjust margin based on collapsed state
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};