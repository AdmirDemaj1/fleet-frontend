import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  CssBaseline, 
  useTheme, 
  useMediaQuery,
  alpha
} from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 300;
const COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 64;

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  // Handle responsive changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Calculate content margins based on sidebar state
  const getContentMargin = () => {
    if (isMobile) return 0;
    return sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header
        onSidebarToggle={handleSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
      />
      
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={handleSidebarClose}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          marginTop: `${HEADER_HEIGHT}px`,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
          },
        }}
      >
        <Box sx={{ 
          p: { xs: 3, sm: 4 },
          maxWidth: '100%',
          animation: 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          '@keyframes slideInUp': {
            from: { 
              opacity: 0, 
              transform: 'translateY(20px)',
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0)',
            },
          },
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};