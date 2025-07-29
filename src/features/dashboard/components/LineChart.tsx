import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { LineChartData } from '../types/dashboard.types';
import { useTheme } from '@mui/material/styles';

interface LineChartProps {
  title: string;
  data: LineChartData;
}

export const LineChart: React.FC<LineChartProps> = ({ title, data }) => {
  const theme = useTheme();
  const { labels, datasets } = data;
  
  // Find min and max values across all datasets
  const allValues = datasets.flatMap(dataset => dataset.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;
  const plotWidth = chartWidth - 2 * padding;
  const plotHeight = chartHeight - 2 * padding;
  
  // Calculate positions
  const getX = (index: number) => padding + (index / (labels.length - 1)) * plotWidth;
  const getY = (value: number) => padding + ((maxValue - value) / valueRange) * plotHeight;
  
  // Create grid lines
  const gridLines = [];
  const numGridLines = 5;
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding + (i / numGridLines) * plotHeight;
    const value = maxValue - (i / numGridLines) * valueRange;
    gridLines.push({ y, value });
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography 
            variant="h6" 
            component="h3"
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
          
          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {datasets.map((dataset, index) => (
              <Chip
                key={index}
                label={dataset.label}
                size="small"
                sx={{
                  bgcolor: dataset.color,
                  color: 'white',
                  fontWeight: 500
                }}
              />
            ))}
          </Box>
        </Box>
        
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
            {/* Grid lines */}
            {gridLines.map((line, index) => (
              <g key={index}>
                <line
                  x1={padding}
                  y1={line.y}
                  x2={chartWidth - padding}
                  y2={line.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 5}
                  y={line.y + 4}
                  fontSize="10"
                  fill="#64748b"
                  textAnchor="end"
                >
                  {line.value.toLocaleString()}
                </text>
              </g>
            ))}
            
            {/* X-axis labels */}
            {labels.map((label, index) => (
              <text
                key={index}
                x={getX(index)}
                y={chartHeight - padding + 15}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
            
            {/* Data lines */}
            {datasets.map((dataset, datasetIndex) => {
              const pathData = dataset.data
                .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`)
                .join(' ');
              
              return (
                <g key={datasetIndex}>
                  {/* Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={dataset.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                  
                  {/* Data points */}
                  {dataset.data.map((value, index) => (
                    <circle
                      key={index}
                      cx={getX(index)}
                      cy={getY(value)}
                      r="4"
                      fill={dataset.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
};
