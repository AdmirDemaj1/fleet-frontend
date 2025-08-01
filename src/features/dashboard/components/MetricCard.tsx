import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton
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
  loading?: boolean;
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

export const MetricCard: React.FC<MetricCardProps> = ({ metric, loading = false }) => {
  const IconComponent = metric.icon || getIcon(metric.title);
  const isPositiveChange = (metric.change || 0) >= 0;
  const theme = useTheme();

  if (loading) {
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} />
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.main,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette[metric.color || 'primary'].main}, ${theme.palette[metric.color || 'primary'].light})`,
        }
      }}
    >
      <CardContent sx={{ p: 3, pb: '24px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${metric.color || 'primary'}.main`,
              color: 'white',
              boxShadow: `0 8px 16px -4px ${theme.palette[metric.color || 'primary'].main}40`,
              '& > svg': {
                fontSize: 28
              }
            }}
          >
            <IconComponent />
          </Box>
          {metric.change !== undefined && (
            <Chip
              icon={isPositiveChange ? <TrendingUp sx={{ fontSize: '16px !important' }} /> : <TrendingDown sx={{ fontSize: '16px !important' }} />}
              label={`${isPositiveChange ? '+' : ''}${metric.change}%`}
              size="small"
              color={isPositiveChange ? 'success' : 'error'}
              variant="outlined"
              sx={{ 
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                '& .MuiChip-icon': {
                  fontSize: 16
                }
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 800, 
            mb: 1,
            color: theme.palette.text.primary,
            fontSize: '2rem',
            lineHeight: 1.2
          }}
        >
          {metric.value}
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 1, 
            fontWeight: 600,
            color: theme.palette.text.primary,
            fontSize: '0.95rem'
          }}
        >
          {metric.title}
        </Typography>
        
        {metric.changeLabel && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            {metric.changeLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
