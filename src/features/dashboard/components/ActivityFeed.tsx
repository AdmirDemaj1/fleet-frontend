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
  Chip
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
import { ActivityItem } from '../types/dashboard.types';
import { useTheme } from '@mui/material/styles';

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
}

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

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ title, activities }) => {
  const theme = useTheme();
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
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </Typography>
        
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
