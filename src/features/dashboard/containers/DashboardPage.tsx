import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Container,
  Paper,
  Divider,
  Alert,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Refresh } from '@mui/icons-material';
import { 
  MetricCard, 
  PieChart, 
  LineChart, 
  BarChart, 
  ActivityFeed 
} from '../components';
import { useDashboard } from '../hooks';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { data, loading, error, refreshData } = useDashboard();
  
  console.log('Dashboard data:', data);
  console.log('Dashboard loading:', loading);
  console.log('Dashboard error:', error);
  
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={refreshData}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        py: { xs: 2, md: 4 }
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            bgcolor: 'transparent',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              color: theme.palette.text.primary,
              letterSpacing: '-0.02em',
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Fleet Management Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.25rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Real-time overview of your fleet operations and performance metrics
          </Typography>
        </Paper>

        {/* Key Metrics Section */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary
              }}
            >
              Key Metrics
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={refreshData}
              disabled={loading}
              sx={{ minWidth: 'auto' }}
            >
              Refresh
            </Button>
          </Box>
          <Grid container spacing={3}>
            {data.metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <MetricCard metric={metric} loading={loading} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Analytics Section */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: theme.palette.text.primary
            }}
          >
            Analytics & Reports
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <PieChart 
                title="Vehicle Status Distribution" 
                data={data.vehicleStatusChart}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <BarChart 
                title="Quarterly Contracts" 
                data={data.contractsChart}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Revenue Trends Section */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: theme.palette.text.primary
            }}
          >
            Financial Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LineChart 
                title="Revenue vs Expenses (2024)" 
                data={data.revenueChart}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Activity Section */}
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: theme.palette.text.primary
            }}
          >
            Recent Activity
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ActivityFeed 
                title="" 
                activities={data.recentActivity}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};