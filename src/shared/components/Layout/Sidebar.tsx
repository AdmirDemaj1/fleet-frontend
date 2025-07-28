import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  Collapse,
  Zoom,
  Fade,
  Stack
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as VehiclesIcon,
  Description as ContractsIcon,
  AccountBalance as AssetsIcon,
  Article as ArticleIcon,
  BusinessCenter,
  ExpandLess,
  ExpandMore,
  Analytics as AnalyticsIcon,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight
} from '@mui/icons-material';

interface MenuItem {
  id: string;
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  isMobile: boolean;
  drawerWidth: number;
  collapsedWidth: number;
}

// Enhanced menu items with better organization
const menuItems: MenuItem[] = [
  { 
    id: 'dashboard',
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/' 
  },
  { 
    id: 'customers',
    text: 'Customers', 
    icon: <PeopleIcon />, 
    path: '/customers'
  },
  { 
    id: 'vehicles',
    text: 'Vehicles', 
    icon: <VehiclesIcon />, 
    path: '/vehicles'
  },
  { 
    id: 'contracts',
    text: 'Contracts', 
    icon: <ContractsIcon />, 
    path: '/contracts' 
  },
  { 
    id: 'assets',
    text: 'Assets', 
    icon: <AssetsIcon />, 
    path: '/assets' 
  },
  {
    id: 'reports',
    text: 'Reports',
    icon: <AnalyticsIcon />,
    children: [
      { id: 'audit-logs', text: 'Audit Logs', icon: <ArticleIcon />, path: '/logs' },
      { id: 'analytics', text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' }
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
}> = React.memo(({ item, collapsed, isSelected, onNavigate, onClose, level = 0 }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);

  const handleClick = useCallback(() => {
    if (item.disabled) return;
    
    if (hasChildren) {
      setOpen(prev => !prev);
    } else if (item.path) {
      onNavigate(item.path);
      onClose();
    }
  }, [hasChildren, item.path, item.disabled, onNavigate, onClose]);

  const menuItemStyles = useMemo(() => ({
    minHeight: 48,
    borderRadius: 2,
    mx: 1,
    my: 0.5,
    pl: level > 0 ? 4 : 2.5,
    pr: 2,
    position: 'relative',
    overflow: 'hidden',
    transition: theme.transitions.create([
      'background-color', 
      'transform', 
      'box-shadow',
      'border-color'
    ], {
      duration: theme.transitions.duration.shorter,
    }),
    
    // Active state
    ...(isSelected && {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      fontWeight: 600,
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 3,
        height: '60%',
        bgcolor: theme.palette.primary.main,
        borderRadius: '0 2px 2px 0',
      },
    }),
    
    // Hover state
    '&:hover': {
      bgcolor: isSelected 
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.action.hover, 0.08),
      transform: level === 0 ? 'translateX(2px)' : 'none',
      boxShadow: level === 0 ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
    },
    
    // Disabled state
    ...(item.disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
      '&:hover': {
        bgcolor: 'transparent',
        transform: 'none',
        boxShadow: 'none',
      },
    }),
  }), [theme, isSelected, level, item.disabled]);

  const iconStyles = useMemo(() => ({
    minWidth: collapsed ? 0 : 40,
    mr: collapsed ? 0 : 1.5,
    justifyContent: 'center',
    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: theme.transitions.create(['color', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
    '& svg': {
      fontSize: 22,
      ...(isSelected && {
        transform: 'scale(1.1)',
      }),
    },
  }), [theme, isSelected, collapsed]);

  const buttonContent = (
    <ListItemButton
      selected={isSelected}
      onClick={handleClick}
      disabled={item.disabled}
      sx={menuItemStyles}
    >
      <ListItemIcon sx={iconStyles}>
        {item.icon}
      </ListItemIcon>
      
      <Fade in={!collapsed} timeout={200}>
        <Box sx={{ display: collapsed ? 'none' : 'flex', alignItems: 'center', flex: 1 }}>
          <ListItemText 
            primary={item.text}
            primaryTypographyProps={{ 
              fontWeight: isSelected ? 600 : 500,
              fontSize: '0.875rem',
              color: isSelected ? theme.palette.primary.main : 'inherit',
            }} 
          />
          
          {item.badge && (
            <Box
              sx={{
                bgcolor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                borderRadius: '50%',
                minWidth: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                mx: 1,
              }}
            >
              {item.badge}
            </Box>
          )}
          
          {hasChildren && (
            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
              <Zoom in={!collapsed} timeout={150}>
                <Box>
                  {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </Box>
              </Zoom>
            </Box>
          )}
        </Box>
      </Fade>
    </ListItemButton>
  );

  if (collapsed && !hasChildren) {
    return (
      <ListItem disablePadding>
        <Tooltip 
          title={item.text} 
          placement="right" 
          arrow
          enterDelay={300}
          leaveDelay={0}
        >
          <Box sx={{ width: '100%' }}>
            {buttonContent}
          </Box>
        </Tooltip>
      </ListItem>
    );
  }

  return (
    <ListItem disablePadding>
      <Box sx={{ width: '100%' }}>
        {buttonContent}
        {hasChildren && !collapsed && (
          <Collapse in={open} timeout={300} unmountOnExit>
            <List component="div" disablePadding sx={{ mt: 0.5 }}>
              {item.children?.map((child) => {
                const childIsSelected = location.pathname === child.path;
                return (
                  <SidebarMenuItem
                    key={child.id}
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
});

export const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  collapsed, 
  onClose, 
  onToggleCollapse,
  isMobile, 
  drawerWidth, 
  collapsedWidth 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  }, [navigate, isMobile, onClose]);

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  // Enhanced logo section with better animations
  const LogoSection = useMemo(() => (
    <Box sx={{ 
      p: collapsed && !isMobile ? 1.5 : 3, 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      minHeight: 72,
      position: 'relative',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
      transition: theme.transitions.create(['padding', 'justify-content'], {
        duration: theme.transitions.duration.standard,
      }),
    }}>
      <Zoom in timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed && !isMobile ? 40 : 48,
            height: collapsed && !isMobile ? 40 : 48,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            mr: (!collapsed || isMobile) ? 2 : 0,
            transition: theme.transitions.create(['width', 'height', 'margin'], {
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <BusinessCenter 
            sx={{ 
              fontSize: collapsed && !isMobile ? 22 : 26, 
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              transition: theme.transitions.create('font-size', {
                duration: theme.transitions.duration.standard,
              }),
            }} 
          />
        </Box>
      </Zoom>
      
      <Fade in={!collapsed || isMobile} timeout={200}>
        <Box sx={{ 
          display: (collapsed && !isMobile) ? 'none' : 'block',
          overflow: 'hidden',
        }}>
          <Typography 
            variant="h6" 
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '1.1rem',
              lineHeight: 1.2,
              mb: 0.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Fleet Manager
          </Typography>
          <Typography 
            variant="caption" 
            sx={{
              color: alpha(theme.palette.text.secondary, 0.8),
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            Management System
          </Typography>
        </Box>
      </Fade>
    </Box>
  ), [theme, collapsed, isMobile]);

  // Enhanced navigation section
  const NavigationSection = useMemo(() => (
    <Box sx={{ 
      flex: 1, 
      overflowY: 'auto',
      overflowX: 'hidden',
      py: 2,
      position: 'relative',
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: alpha(theme.palette.background.paper, 0.1),
        borderRadius: 3,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderRadius: 3,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
        },
      },
      // Custom scrollbar for Firefox
      scrollbarWidth: 'thin',
      scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} ${alpha(theme.palette.background.paper, 0.1)}`,
    }}>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isSelected = item.path ? (
            location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          ) : false;
          
          return (
            <SidebarMenuItem
              key={item.id}
              item={item}
              collapsed={collapsed && !isMobile}
              isSelected={isSelected}
              onNavigate={handleNavigate}
              onClose={onClose}
            />
          );
        })}
      </List>
    </Box>
  ), [theme, collapsed, isMobile, location.pathname, handleNavigate, onClose]);

  // Enhanced collapse toggle section
  const CollapseToggleSection = useMemo(() => (
    !isMobile && (
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(10px)',
      }}>
        <Stack 
          direction="row" 
          justifyContent={collapsed ? 'center' : 'space-between'} 
          alignItems="center"
        >
          {!collapsed && (
            <Fade in={!collapsed} timeout={200}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: alpha(theme.palette.text.secondary, 0.7),
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  letterSpacing: 0.5,
                }}
              >
                NAVIGATION
              </Typography>
            </Fade>
          )}
          
          <Tooltip 
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"} 
            placement="top"
            arrow
          >
            <IconButton 
              onClick={onToggleCollapse}
              size="small"
              sx={{ 
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: 'scale(1.05)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                transition: theme.transitions.create(['all'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              {collapsed ? (
                <KeyboardDoubleArrowRight fontSize="small" />
              ) : (
                <KeyboardDoubleArrowLeft fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    )
  ), [theme, collapsed, isMobile, onToggleCollapse]);

  const drawerContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: theme.palette.background.paper,
      position: 'relative',
    }}>
      {LogoSection}
      {NavigationSection}
      {CollapseToggleSection}
    </Box>
  );

  const drawerStyles = useMemo(() => ({
    width: currentWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': { 
      boxSizing: 'border-box', 
      width: currentWidth,
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      transition: theme.transitions.create(['width', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.standard,
      }),
      overflowX: 'hidden',
      ...(isMobile ? {
        boxShadow: `8px 0 32px ${alpha('#000', 0.12)}`,
      } : {
        top: 64,
        height: 'calc(100vh - 64px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? `4px 0 16px ${alpha('#000', 0.3)}` 
          : `4px 0 16px ${alpha('#000', 0.08)}`,
      }),
    }
  }), [theme, currentWidth, isMobile]);

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ 
            keepMounted: true,
            sx: {
              '& .MuiBackdrop-root': {
                backgroundColor: alpha('#000', 0.3),
                backdropFilter: 'blur(4px)',
              },
            },
          }}
          sx={drawerStyles}
        >
          {drawerContent}
        </Drawer>
      )}
      
      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={drawerStyles}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};