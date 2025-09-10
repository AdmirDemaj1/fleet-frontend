import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Paper
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Assessment,
  AccountBalance,
  Receipt
} from '@mui/icons-material';
import { Vehicle } from '../../types/vehicleType';

interface VehicleFinancialProps {
  vehicle: Vehicle;
}

export const VehicleFinancial: React.FC<VehicleFinancialProps> = ({ vehicle }) => {
  const theme = useTheme();

  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate financial metrics
  const currentValuation = vehicle.currentValuation || 0;
  const marketValue = vehicle.marketValue || 0;
  const purchasePrice = vehicle.purchasePrice || 0;
  const depreciatedValue = vehicle.depreciatedValue || 0;

  // Mock metrics for demonstration
  const revenueGenerated = 15000;
  const maintenanceCost = vehicle.maintenanceHistory?.reduce((sum, record) => sum + record.cost, 0) || 2500;
  const profitability = purchasePrice > 0 ? ((revenueGenerated - maintenanceCost - purchasePrice) / purchasePrice) * 100 : 0;
  const depreciationRate = purchasePrice > 0 ? ((purchasePrice - currentValuation) / purchasePrice) * 100 : 0;
  const utilizationRate = 85; // Mock data

  const getPerformanceColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 50 ? 'success.main' : value > 25 ? 'warning.main' : 'error.main';
    } else {
      return value < 25 ? 'success.main' : value < 50 ? 'warning.main' : 'error.main';
    }
  };

  const getPerformanceIcon = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 50 ? <TrendingUp /> : <TrendingDown />;
    } else {
      return value < 25 ? <TrendingUp /> : <TrendingDown />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Valuation Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            bgcolor: alpha(theme.palette.success.main, 0.05)
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AttachMoney sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                {formatCurrency(currentValuation)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Current Valuation
              </Typography>
              {marketValue > 0 && (
                <Chip
                  size="small"
                  label={currentValuation > marketValue ? '+Above Market' : '-Below Market'}
                  color={currentValuation > marketValue ? 'success' : 'warning'}
                  sx={{ mt: 1, fontSize: '0.75rem' }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AccountBalance sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {formatCurrency(marketValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Market Value
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Industry Standard
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            bgcolor: alpha(theme.palette.info.main, 0.05)
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Receipt sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                {formatCurrency(purchasePrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Purchase Price
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Original Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            bgcolor: alpha(theme.palette.warning.main, 0.05)
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrendingDown sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                {formatCurrency(depreciatedValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Depreciated Value
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Book Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 3
              }}>
                <Assessment sx={{ color: 'primary.main' }} />
                Financial Performance
              </Typography>
              
              <Grid container spacing={4}>
                {/* Revenue Generated */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Revenue Generated
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {formatCurrency(revenueGenerated)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((revenueGenerated / 20000) * 100, 100)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.success.main
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Total income from vehicle usage
                    </Typography>
                  </Box>
                </Grid>

                {/* Maintenance Cost */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Maintenance Cost
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {formatCurrency(maintenanceCost)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((maintenanceCost / 5000) * 100, 100)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.error.main
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Total maintenance expenses
                    </Typography>
                  </Box>
                </Grid>

                {/* Profitability */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Profitability
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(profitability, true)}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: getPerformanceColor(profitability, true)
                          }}
                        >
                          {profitability.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(Math.max(profitability, 0), 100)} 
                      color={profitability > 50 ? 'success' : profitability > 25 ? 'warning' : 'error'}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Return on investment
                    </Typography>
                  </Box>
                </Grid>

                {/* Depreciation Rate */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Depreciation Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(depreciationRate, false)}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: getPerformanceColor(depreciationRate, false)
                          }}
                        >
                          {depreciationRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(depreciationRate, 100)} 
                      color={depreciationRate < 25 ? 'success' : depreciationRate < 50 ? 'warning' : 'error'}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Value loss from purchase
                    </Typography>
                  </Box>
                </Grid>

                {/* Utilization Rate */}
                <Grid item xs={12}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Utilization Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(utilizationRate, true)}
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: getPerformanceColor(utilizationRate, true)
                          }}
                        >
                          {utilizationRate}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={utilizationRate} 
                      color={utilizationRate > 75 ? 'success' : utilizationRate > 50 ? 'warning' : 'error'}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Percentage of time vehicle is in use
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 600,
                mb: 3
              }}>
                Financial Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Net Asset Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(currentValuation - maintenanceCost)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total ROI
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: profitability > 0 ? 'success.main' : 'error.main' 
                  }}
                >
                  {profitability > 0 ? '+' : ''}{profitability.toFixed(1)}%
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Break-even Point
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {revenueGenerated >= purchasePrice + maintenanceCost ? 'Achieved' : 'In Progress'}
                </Typography>
              </Box>

              {/* Performance Indicators */}
              <Paper sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Performance Status
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    label={profitability > 50 ? "High Performer" : profitability > 25 ? "Moderate Performer" : "Underperformer"}
                    color={profitability > 50 ? "success" : profitability > 25 ? "warning" : "error"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                  
                  <Chip
                    label={depreciationRate < 25 ? "Low Depreciation" : depreciationRate < 50 ? "Moderate Depreciation" : "High Depreciation"}
                    color={depreciationRate < 25 ? "success" : depreciationRate < 50 ? "warning" : "error"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                  
                  <Chip
                    label={utilizationRate > 75 ? "High Utilization" : utilizationRate > 50 ? "Moderate Utilization" : "Low Utilization"}
                    color={utilizationRate > 75 ? "success" : utilizationRate > 50 ? "warning" : "error"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleFinancial;
