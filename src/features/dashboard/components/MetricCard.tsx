import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DirectionsCar,
  Description,
  People,
  AttachMoney
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DashboardMetric } from '../types/dashboard.types';

interface MetricCardProps {
  metric: DashboardMetric;
}

const getIcon = (title: string) => {
  const iconMap: Record<string, React.ComponentType> = {
    'Total Vehicles': DirectionsCar,
    'Active Contracts': Description,
    'Total Customers': People,
    'Monthly Revenue': AttachMoney
  };
  
  return iconMap[title] || DirectionsCar;
};

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const IconComponent = metric.icon || getIcon(metric.title);
  const isPositiveChange = (metric.change || 0) >= 0;
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[6]
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${metric.color || 'primary'}.main`,
              color: 'white'
            }}
          >
            <IconComponent />
          </Box>
          {metric.change !== undefined && (
            <Chip
              icon={isPositiveChange ? <TrendingUp /> : <TrendingDown />}
              label={`${isPositiveChange ? '+' : ''}${metric.change}%`}
              size="small"
              color={isPositiveChange ? 'success' : 'error'}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {metric.value}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 1, fontWeight: 500 }}
        >
          {metric.title}
        </Typography>
        
        {metric.changeLabel && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ opacity: 0.7 }}
          >
            {metric.changeLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
