import React from 'react';
import { 
  Box, Typography, Divider, Chip, Tooltip, Paper, 
  List, ListItem, ListItemText, Avatar,
  LinearProgress, alpha
} from '@mui/material';
import { 
  AccountCircle, AttachMoney, Event, LocalShipping,
  Domain, Link, CalendarMonth
} from '@mui/icons-material';

interface CustomerAccountSidebarProps {
  accountNumber: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalDue: string;
  nextBill: string;
  createdAt?: string;
  accountTypes?: string[];
  domains?: number;
  relations?: number;
}

const statusConfig: Record<string, { color: string, bgcolor: string, icon: React.ReactNode }> = {
  Active: { 
    color: 'success.main', 
    bgcolor: '#e6f7ed',
    icon: '●' 
  },
  Inactive: { 
    color: 'error.main', 
    bgcolor: '#fce8e8',
    icon: '●' 
  },
  Pending: { 
    color: 'warning.main', 
    bgcolor: '#fff4e5',
    icon: '●' 
  },
};

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  accountNumber,
  status,
  totalDue,
  nextBill,
  createdAt = 'Jan 15, 2023',
  accountTypes = ['Fleet', 'Enterprise'],
  domains = 3,
  relations = 12
}) => {
  // Calculate a mock percentage for the progress bar
  const dueAmount = parseFloat(totalDue.replace(/[^0-9.-]+/g, ''));
  const progress = Math.min(100, Math.max(0, (1 - dueAmount / 5000) * 100));
  
  return (
    <Paper
      elevation={3}
      sx={{
        width: 280,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {/* Status indicator top bar */}
      <Box 
        sx={{ 
          height: 6, 
          width: '100%', 
          bgcolor: statusConfig[status].color 
        }} 
      />
      
      {/* Account header */}
      <Box 
        sx={{ 
          p: 3, 
          pb: 2,
          background: (theme) => `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0)})`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              boxShadow: 2,
              width: 40,
              height: 40
            }}
          >
            <AccountCircle />
          </Avatar>
          
          <Chip
            label={status}
            size="small"
            icon={<Box component="span" sx={{ fontSize: '10px', ml: 1, color: statusConfig[status].color }}>{statusConfig[status].icon}</Box>}
            sx={{ 
              fontWeight: 'bold', 
              px: 1,
              borderRadius: 1.5,
              color: statusConfig[status].color,
              bgcolor: statusConfig[status].bgcolor,
              border: 1,
              borderColor: (theme) => alpha(theme.palette.divider, 0.1)
            }}
          />
        </Box>
        
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          Account {accountNumber}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarMonth sx={{ fontSize: 14 }} /> Created {createdAt}
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Billing section */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AttachMoney fontSize="small" sx={{ color: 'primary.main' }} />
          Financial Summary
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Balance Due</Typography>
            <Typography variant="body2" fontWeight={600} color={dueAmount > 0 ? 'error.main' : 'text.primary'}>
              {totalDue}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: dueAmount > 0 ? 'error.main' : 'success.main',
              }
            }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event fontSize="small" color="primary" />
            <Typography variant="body2">Next Bill</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600}>{nextBill}</Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Account details section */}
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocalShipping fontSize="small" sx={{ color: 'primary.main' }} />
          Account Details
        </Typography>
        
        <List dense disablePadding>
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Account Types" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {accountTypes.map(type => (
                <Chip 
                  key={type}
                  label={type} 
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }} 
                />
              ))}
            </Box>
          </ListItem>
          
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Domains" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Tooltip title="View domains">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <Domain fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>{domains}</Typography>
              </Box>
            </Tooltip>
          </ListItem>
          
          <ListItem sx={{ py: 0.75, px: 0 }}>
            <ListItemText 
              primary="Relations" 
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} 
            />
            <Tooltip title="View related entities">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <Link fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>{relations}</Typography>
              </Box>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default CustomerAccountSidebar;