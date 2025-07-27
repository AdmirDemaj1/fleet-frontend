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
  useTheme,
  alpha,
  Collapse
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
  BusinessCenter,
  ExpandLess,
  ExpandMore,
  Analytics
} from '@mui/icons-material';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

const menuItems: MenuItem[] = [
  { 
    text: 'Dashboard', 
    icon: <Dashboard />, 
    path: '/' 
  },
  { 
    text: 'Customers', 
    icon: <People />, 
    path: '/customers'
  },
  { 
    text: 'Vehicles', 
    icon: <DirectionsCar />, 
    path: '/vehicles'
  },
  { 
    text: 'Contracts', 
    icon: <Description />, 
    path: '/contracts' 
  },
  { 
    text: 'Assets', 
    icon: <AccountBalance />, 
    path: '/assets' 
  },
  {
    text: 'Reports',
    icon: <Analytics />,
    children: [
      { text: 'Audit Logs', icon: <Article />, path: '/logs' },
      { text: 'Analytics', icon: <Analytics />, path: '/analytics' }
    ]
  }
];

const SidebarMenuItem: React.FC<{
  item: MenuItem;
  collapsed: boolean;
  isSelected: boolean;
  onNavigate: (path: string) => void;
  onClose: () => void;
  level?: number;
}> = ({ item, collapsed, isSelected, onNavigate, onClose, level = 0 }) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else if (item.path) {
      onNavigate(item.path);
      onClose();
    }
  };

  const buttonContent = (
    <ListItemButton
      selected={isSelected}
      onClick={handleClick}
      sx={{
        minHeight: 48,
        justifyContent: collapsed ? 'center' : 'initial',
        borderRadius: 2,
        mx: 1,
        my: 0.25,
        pl: level > 0 ? 4 : 2,
        transition: theme.transitions.create(['all'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&.Mui-selected': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.16),
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
          '& .MuiListItemText-primary': {
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
        },
        '&:hover': {
          bgcolor: alpha(theme.palette.action.hover, 0.08),
          transform: 'translateX(4px)',
        },
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: collapsed ? 0 : 36, 
          mr: collapsed ? 0 : 2,
          justifyContent: 'center',
          color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
          transition: theme.transitions.create(['color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {item.icon}
      </ListItemIcon>
      
      {!collapsed && (
        <>
          <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
              fontWeight: isSelected ? 600 : 400,
              fontSize: '0.875rem',
            }} 
          />
          {hasChildren && (
            <Box sx={{ ml: 1 }}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </>
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <ListItem disablePadding>
        <Tooltip title={item.text} placement="right">
          {buttonContent}
        </Tooltip>
      </ListItem>
    );
  }

  return (
    <ListItem disablePadding>
      <Box sx={{ width: '100%' }}>
        {buttonContent}
        {hasChildren && !collapsed && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => {
                const childIsSelected = location.pathname === child.path;
                return (
                  <SidebarMenuItem
                    key={child.text}
                    item={child}
                    collapsed={false}
                    isSelected={childIsSelected}
                    onNavigate={onNavigate}
                    onClose={onClose}
                    level={level + 1}
                  />
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    </ListItem>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, onClose, collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: theme.palette.background.paper,
      borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    }}>
      {/* Logo and branding area */}
      <Box sx={{ 
        p: collapsed ? 1 : 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        minHeight: 72,
        transition: theme.transitions.create(['padding'], {
          duration: theme.transitions.duration.shorter,
        }),
      }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed ? 40 : 'auto',
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            mr: collapsed ? 0 : 2,
            transition: theme.transitions.create(['all'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <BusinessCenter 
            sx={{ 
              fontSize: 24, 
              color: theme.palette.primary.main,
            }} 
          />
        </Box>
        {!collapsed && (
          <Box>
            <Typography 
              variant="h6" 
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '1.125rem',
                lineHeight: 1.2,
              }}
            >
              Fleet Manager
            </Typography>
            <Typography 
              variant="caption" 
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              Management System
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation menu */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        py: 2,
        '&::-webkit-scrollbar': {
          width: 4,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.text.secondary, 0.2),
          borderRadius: 2,
        },
      }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const isSelected = item.path ? (
              location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            ) : false;
            
            return (
              <SidebarMenuItem
                key={item.text}
                item={item}
                collapsed={collapsed}
                isSelected={isSelected}
                onNavigate={handleNavigate}
                onClose={onClose}
              />
            );
          })}
        </List>
      </Box>
      
      {/* Collapse toggle button */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }}
      >
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="top">
          <IconButton 
            onClick={onCollapse}
            sx={{ 
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                transform: 'scale(1.05)',
              },
              transition: theme.transitions.create(['all'], {
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
      {/* Mobile drawer */}
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
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            overflowX: 'hidden',
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            boxShadow: theme.palette.mode === 'dark' 
              ? '4px 0 20px rgba(0,0,0,0.2)' 
              : '4px 0 20px rgba(0,0,0,0.05)',
          }
        }}
        open={true}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};