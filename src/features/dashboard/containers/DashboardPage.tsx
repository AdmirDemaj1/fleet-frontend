import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  MetricCard, 
  PieChart, 
  LineChart, 
  BarChart, 
  ActivityFeed 
} from '../components';
import { mockDashboardData } from '../utils/mockData';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        py: 4
      }}
    >
      <Container maxWidth="xl">
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1
              }}
            >
              Fleet Management Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color={theme.palette.text.secondary}
              sx={{ fontWeight: 400 }}
            >
              Real-time overview of your fleet operations
            </Typography>
          </Box>

          {/* Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {mockDashboardData.metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <MetricCard metric={metric} />
              </Grid>
            ))}
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Vehicle Status Pie Chart */}
            <Grid item xs={12} md={6}>
              <PieChart 
                title="Vehicle Status Distribution" 
                data={mockDashboardData.vehicleStatusChart} 
              />
            </Grid>

            {/* Contracts Bar Chart */}
            <Grid item xs={12} md={6}>
              <BarChart 
                title="Quarterly Contracts" 
                data={mockDashboardData.contractsChart} 
              />
            </Grid>
          </Grid>

          {/* Revenue Line Chart */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <LineChart 
                title="Revenue vs Expenses (2024)" 
                data={mockDashboardData.revenueChart} 
              />
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ActivityFeed 
                title="Recent Activity" 
                activities={mockDashboardData.recentActivity} 
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};