import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton
} from '@mui/material';
import { BarChartProps } from '../types/dashboard.types';
import { useTheme } from '@mui/material/styles';

export const BarChart: React.FC<BarChartProps> = ({ title, data, loading = false }) => {
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
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Skeleton variant="rectangular" width={400} height={250} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { labels, data: values, colors } = data;
  
  const maxValue = Math.max(...values);
  const chartWidth = 400;
  const chartHeight = 250;
  const padding = 40;
  const plotHeight = chartHeight - 2 * padding;
  const barWidth = (chartWidth - 2 * padding) / labels.length * 0.6;
  const barSpacing = (chartWidth - 2 * padding) / labels.length;

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
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 3,
            fontSize: '1.25rem'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + plotHeight * (1 - ratio);
              const value = Math.round(maxValue * ratio);
              return (
                <g key={index}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={padding - 5}
                    y={y + 4}
                    fontSize="10"
                    fill="#64748b"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            
            {/* Bars */}
            {values.map((value, index) => {
              const barHeight = (value / maxValue) * plotHeight;
              const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
              const y = padding + plotHeight - barHeight;
              const color = colors?.[index] || '#3b82f6';
              
              return (
                <g key={index}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    rx="4"
                    ry="4"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                  
                  {/* Value label on top of bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    fontSize="12"
                    fill="#374151"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {value}
                  </text>
                  
                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - padding + 15}
                    fontSize="12"
                    fill="#64748b"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {labels[index]}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
};
