import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Skeleton
} from '@mui/material';
import {
  Description,
  DirectionsCar,
  Person,
  Payment,
  CheckCircle,
  Warning,
  Error,
  Info
} from '@mui/icons-material';
import { ActivityFeedProps } from '../types/dashboard.types';
import { useTheme } from '@mui/material/styles';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'contract':
      return <Description />;
    case 'vehicle':
      return <DirectionsCar />;
    case 'customer':
      return <Person />;
    case 'payment':
      return <Payment />;
    default:
      return <Info />;
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle sx={{ fontSize: 16 }} />;
    case 'warning':
      return <Warning sx={{ fontSize: 16 }} />;
    case 'error':
      return <Error sx={{ fontSize: 16 }} />;
    default:
      return <Info sx={{ fontSize: 16 }} />;
  }
};

const getStatusColor = (status?: string) => {
  const colorMap: Record<string, string> = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };
  return colorMap[status || 'info'] || '#3b82f6';
};

const formatTimeAgo = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ title, activities, loading = false }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2]
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {title && (
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
          )}
          
          <List sx={{ pt: 0 }}>
            {[...Array(5)].map((_, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Skeleton variant="text" width="60%" />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={16} height={16} />
                        <Skeleton variant="text" width={50} />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                      <Skeleton variant="rounded" width={70} height={20} />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2]
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {title && (
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 3,
              fontSize: '1.25rem'
            }}
          >
            {title}
          </Typography>
        )}
        
        <List sx={{ pt: 0 }}>
          {activities.map((activity) => {
            const activityIcon = getActivityIcon(activity.type);
            const statusIcon = getStatusIcon(activity.status);
            const statusColor = getStatusColor(activity.status);
            
            return (
              <ListItem 
                key={activity.id} 
                sx={{ 
                  px: 0,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: statusColor,
                      width: 40,
                      height: 40
                    }}
                  >
                    {activityIcon}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {activity.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: statusColor }}>
                          {statusIcon}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activity.description}
                      </Typography>
                      <Chip
                        label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          borderColor: statusColor,
                          color: statusColor
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};
