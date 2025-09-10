import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  IconButton,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  ContactPhone,
  Description,
  Security,
  Settings,
  ExpandLess,
  ExpandMore,
  Close,
  AccountCircle,
  Shield,
  NotificationsActive,
  CreditCard,
  Tune
} from '@mui/icons-material';
import { SettingsMenuItem } from './CustomerSettingsPage';

interface SettingsNavigationProps {
  menuItems: SettingsMenuItem[];
  activeSection: string;
  expandedSections: string[];
  onSectionChange: (sectionId: string) => void;
  onToggleExpanded: (sectionId: string) => void;
  onClose?: () => void;
}

const iconMap = {
  'account': AccountCircle,
  'personal': Person,
  'contact': ContactPhone,
  'documents': Description,
  'security': Shield,
  'privacy': Security,
  'notifications': NotificationsActive,
  'payments': CreditCard,
  'preferences': Tune
};

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  menuItems,
  activeSection,
  expandedSections,
  onSectionChange,
  onToggleExpanded,
  onClose
}) => {
  const theme = useTheme();

  const getIcon = (id: string) => {
    const IconComponent = iconMap[id as keyof typeof iconMap] || Settings;
    return IconComponent;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Customer Settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage account preferences
            </Typography>
          </Box>
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.2)
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: 0 }}>
        {menuItems.map((item, index) => (
          <Box key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.subItems) {
                    onToggleExpanded(item.id);
                  } else {
                    onSectionChange(item.id);
                  }
                }}
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 0,
                  bgcolor: activeSection === item.id && !item.subItems 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'transparent',
                  borderRight: activeSection === item.id && !item.subItems
                    ? `3px solid ${theme.palette.primary.main}`
                    : '3px solid transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                disabled={item.disabled}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {React.createElement(getIcon(item.id), {
                    sx: {
                      color: activeSection === item.id && !item.subItems
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      fontSize: 20
                    }
                  })}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: activeSection === item.id && !item.subItems ? 600 : 500,
                    fontSize: '0.875rem',
                    color: activeSection === item.id && !item.subItems
                      ? theme.palette.primary.main
                      : 'inherit'
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color={typeof item.badge === 'string' ? 'secondary' : 'primary'}
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mr: 1
                    }}
                  />
                )}
                {item.subItems && (
                  expandedSections.includes(item.id) ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {/* Sub-items */}
            {item.subItems && (
              <Collapse in={expandedSections.includes(item.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.id} disablePadding>
                      <ListItemButton
                        onClick={() => onSectionChange(subItem.id)}
                        sx={{
                          py: 1.5,
                          pl: 6,
                          pr: 3,
                          bgcolor: activeSection === subItem.id 
                            ? alpha(theme.palette.primary.main, 0.1) 
                            : 'transparent',
                          borderRight: activeSection === subItem.id
                            ? `3px solid ${theme.palette.primary.main}`
                            : '3px solid transparent',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                        disabled={subItem.disabled}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {React.createElement(getIcon(subItem.id), {
                            sx: {
                              color: activeSection === subItem.id
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                              fontSize: 18
                            }
                          })}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.label}
                          primaryTypographyProps={{
                            fontWeight: activeSection === subItem.id ? 600 : 400,
                            fontSize: '0.8125rem',
                            color: activeSection === subItem.id
                              ? theme.palette.primary.main
                              : 'inherit'
                          }}
                        />
                        {subItem.badge && (
                          <Chip
                            label={subItem.badge}
                            size="small"
                            color={typeof subItem.badge === 'string' ? 'secondary' : 'primary'}
                            sx={{
                              height: 18,
                              fontSize: '0.6875rem',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}

            {/* Divider between main sections */}
            {index < menuItems.length - 1 && !item.subItems && (
              <Divider sx={{ my: 1, mx: 3 }} />
            )}
          </Box>
        ))}
      </List>
    </Paper>
  );
};
