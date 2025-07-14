import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  Description,
  AccountBalance,
  Article,
  ChevronLeft,
  ChevronRight,
  BusinessCenter
} from '@mui/icons-material';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
  { text: 'Contracts', icon: <Description />, path: '/contracts' },
  { text: 'Logs', icon: <Article />, path: '/logs' },
  { text: 'Assets', icon: <AccountBalance />, path: '/assets' }
];

export const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, onClose, collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: theme.palette.background.paper
    }}>
      {/* Logo and branding area */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <BusinessCenter color="primary" sx={{ fontSize: 28, mr: collapsed ? 0 : 1 }} />
        {!collapsed && (
          <Typography variant="h6" color="primary" fontWeight="bold">
            Fleet Manager
          </Typography>
        )}
      </Box>

      {/* Navigation menu */}
      <List sx={{ pt: 2, pb: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'initial',
                    borderRadius: '8px',
                    mx: 1,
                    transition: theme.transitions.create(['background-color', 'margin'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main + '20',
                      '&:hover': {
                        bgcolor: theme.palette.primary.main + '30',
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiListItemText-primary': {
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: collapsed ? 0 : 36, 
                      mr: collapsed ? 0 : 3,
                      justifyContent: collapsed ? 'center' : 'initial',
                      color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {collapsed ? (
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        fontSize: '0.65rem',
                        lineHeight: 1,
                        opacity: 0.8,
                        display: 'block',
                        color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary
                      }}
                    >
                      {item.text}
                    </Typography>
                  ) : (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isSelected ? 'bold' : 'regular',
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      
      {/* Collapse toggle button */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Tooltip title={collapsed ? "Expand" : "Collapse"}>
          <IconButton 
            onClick={onCollapse}
            sx={{ 
              bgcolor: theme.palette.background.default,
              '&:hover': {
                bgcolor: theme.palette.action.hover
              },
              transition: theme.transitions.create('all', {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: drawerWidth }, 
        flexShrink: { sm: 0 } 
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
          }
        }}
        open={true}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};