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
  Typography
} from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  Description,
  AccountBalance,
  Article,
  ChevronLeft,
  ChevronRight
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

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box>
        <Toolbar>
          <IconButton onClick={onCollapse}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={collapsed ? '' : item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} /> {/* This will push the collapse button to the bottom */}
      <Divider />
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <IconButton onClick={onCollapse} sx={{ width: '100%' }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          <Typography variant="body2" sx={{ ml: 1, display: collapsed ? 'none' : 'inline' }}>
            Collapse
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
        open={true}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};