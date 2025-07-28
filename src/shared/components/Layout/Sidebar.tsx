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
  isMobile: boolean;
}> = React.memo(({ item, collapsed, isSelected, onNavigate, onClose, level = 0, isMobile }) => {
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
    minHeight: collapsed && !isMobile ? 52 : 48,
    borderRadius: collapsed && !isMobile ? 2.5 : 2,
    mx: collapsed && !isMobile ? 1.5 : 1,
    my: collapsed && !isMobile ? 1 : 0.5,
    pl: level > 0 ? 4 : (collapsed && !isMobile ? 0 : 2.5),
    pr: collapsed && !isMobile ? 0 : 2,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
    transition: theme.transitions.create([
      'background-color', 
      'transform', 
      'box-shadow',
      'border-color',
      'min-height',
      'margin',
      'padding'
    ], {
      duration: theme.transitions.duration.shorter,
    }),
    
    // Active state
    ...(isSelected && {
      bgcolor: collapsed && !isMobile 
        ? alpha(theme.palette.primary.main, 0.15)
        : alpha(theme.palette.primary.main, 0.08),
      color: theme.palette.primary.main,
      fontWeight: 600,
      boxShadow: collapsed && !isMobile 
        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
        : 'none',
      ...(!collapsed && {
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
    }),
    
    // Hover state
    '&:hover': {
      bgcolor: isSelected 
        ? (collapsed && !isMobile 
            ? alpha(theme.palette.primary.main, 0.2)
            : alpha(theme.palette.primary.main, 0.12))
        : (collapsed && !isMobile 
            ? alpha(theme.palette.action.hover, 0.15)
            : alpha(theme.palette.action.hover, 0.08)),
      transform: collapsed && !isMobile 
        ? 'scale(1.05)' 
        : (level === 0 ? 'translateX(2px)' : 'none'),
      boxShadow: collapsed && !isMobile 
        ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
        : (level === 0 ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` : 'none'),
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
  }), [theme, isSelected, level, item.disabled, collapsed, isMobile]);

  const iconStyles = useMemo(() => ({
    minWidth: collapsed && !isMobile ? 0 : 40,
    mr: collapsed && !isMobile ? 0 : 1.5,
    justifyContent: 'center',
    color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: theme.transitions.create(['color', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
    '& svg': {
      fontSize: collapsed && !isMobile ? 26 : 22,
      ...(isSelected && {
        transform: 'scale(1.1)',
      }),
      ...(collapsed && !isMobile && {
        filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.3)})`,
      }),
    },
  }), [theme, isSelected, collapsed, isMobile]);

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
      
      <Fade in={!collapsed || isMobile} timeout={200}>
        <Box sx={{ display: (collapsed && !isMobile) ? 'none' : 'flex', alignItems: 'center', flex: 1 }}>
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
              <Zoom in={!collapsed || isMobile} timeout={150}>
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

  if (collapsed && !isMobile && !hasChildren) {
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
        {hasChildren && (!collapsed || isMobile) && (
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
                    isMobile={isMobile}
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
      p: collapsed && !isMobile ? 2 : 3, 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      minHeight: collapsed && !isMobile ? 64 : 72,
      position: 'relative',
      background: collapsed && !isMobile 
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
      transition: theme.transitions.create(['padding', 'justify-content', 'min-height', 'background'], {
        duration: theme.transitions.duration.standard,
      }),
    }}>
      <Zoom in timeout={300}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed && !isMobile ? 44 : 48,
            height: collapsed && !isMobile ? 44 : 48,
            borderRadius: collapsed && !isMobile ? 3 : 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: collapsed && !isMobile 
              ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
              : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            mr: (!collapsed || isMobile) ? 2 : 0,
            position: 'relative',
            transition: theme.transitions.create(['width', 'height', 'margin', 'border-radius', 'box-shadow'], {
              duration: theme.transitions.duration.standard,
            }),
            '&:hover': collapsed && !isMobile ? {
              transform: 'scale(1.1)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
            } : {},
          }}
        >
          <BusinessCenter 
            sx={{ 
              fontSize: collapsed && !isMobile ? 24 : 26, 
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              transition: theme.transitions.create(['font-size', 'transform'], {
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
      py: collapsed && !isMobile ? 3 : 2,
      px: collapsed && !isMobile ? 0.5 : 0,
      position: 'relative',
      '&::-webkit-scrollbar': {
        width: collapsed && !isMobile ? 4 : 6,
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
      <List sx={{ px: collapsed && !isMobile ? 0 : 1 }}>
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
              isMobile={isMobile}
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
        p: collapsed ? 1.5 : 2, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        background: collapsed 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
          : alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(10px)',
        transition: theme.transitions.create(['padding', 'background'], {
          duration: theme.transitions.duration.standard,
        }),
      }}>
        <Stack 
          direction="row" 
          justifyContent="center"
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
                  mr: 2,
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
                width: collapsed ? 44 : 36,
                height: collapsed ? 44 : 36,
                bgcolor: collapsed 
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, collapsed ? 0.3 : 0.2)}`,
                color: theme.palette.primary.main,
                borderRadius: collapsed ? 3 : 2,
                boxShadow: collapsed 
                  ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                  : 'none',
                '&:hover': {
                  bgcolor: collapsed 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  transform: collapsed ? 'scale(1.1)' : 'scale(1.05)',
                  boxShadow: collapsed 
                    ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                    : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                transition: theme.transitions.create(['all'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              {collapsed ? (
                <KeyboardDoubleArrowRight fontSize={collapsed ? "medium" : "small"} />
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
      transition: theme.transitions.create(['width', 'transform', 'box-shadow'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.standard,
      }),
      overflowX: 'hidden',
      ...(isMobile ? {
        boxShadow: `8px 0 32px ${alpha('#000', 0.12)}`,
      } : {
        top: 64,
        height: 'calc(100vh - 64px)',
        boxShadow: collapsed 
          ? `6px 0 20px ${alpha(theme.palette.primary.main, 0.08)}, 2px 0 8px ${alpha('#000', 0.06)}`
          : (theme.palette.mode === 'dark' 
              ? `4px 0 16px ${alpha('#000', 0.3)}` 
              : `4px 0 16px ${alpha('#000', 0.08)}`),
        '&:hover': collapsed ? {
          boxShadow: `8px 0 25px ${alpha(theme.palette.primary.main, 0.12)}, 4px 0 12px ${alpha('#000', 0.08)}`,
        } : {},
      }),
    }
  }), [theme, currentWidth, isMobile, collapsed]);

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