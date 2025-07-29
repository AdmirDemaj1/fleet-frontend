import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { PieChartData } from '../types/dashboard.types';
import { useTheme } from '@mui/material/styles';

interface PieChartProps {
  title: string;
  data: PieChartData;
}

export const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  const theme = useTheme();
  const total = data.data.reduce((sum, value) => sum + value, 0);

  // Calculate angles for each segment
  const segments = data.data.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    return {
      label: data.labels[index],
      value,
      percentage,
      angle,
      color: data.colors[index]
    };
  });

  // Create SVG path for each segment
  let cumulativeAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const createPath = (startAngle: number, endAngle: number) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* SVG Pie Chart */}
          <Box sx={{ flex: '0 0 200px' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment, index) => {
                const path = createPath(cumulativeAngle, cumulativeAngle + segment.angle);
                cumulativeAngle += segment.angle;
                
                return (
                  <path
                    key={index}
                    d={path}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="2"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </svg>
          </Box>
          
          {/* Legend */}
          <Box sx={{ flex: 1 }}>
            <List dense>
              {segments.map((segment, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Circle sx={{ color: segment.color, fontSize: 12 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {segment.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {segment.value} ({segment.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
