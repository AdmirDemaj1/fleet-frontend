import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  CalendarToday,
  EventNote,
  Schedule,
  History
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ContractResponse } from '../types/contract.types';
import { useGetPaymentsByContractQuery } from '../../invoices/api/paymentsApi';
import dayjs from 'dayjs';

interface ContractTimelineProps {
  contract: ContractResponse;
}

export const ContractTimeline: React.FC<ContractTimelineProps> = ({ contract }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch payment data for this contract
  const { data: paymentsResponse } = useGetPaymentsByContractQuery({
    contractId: contract.id,
    limit: 100 // Get all payments to show complete timeline
  });

  const payments = paymentsResponse?.data || [];

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  // Create a map of payment statuses by month
  const getPaymentStatusByMonth = () => {
    const startDate = dayjs(contract.startDate);
    const endDate = dayjs(contract.endDate);
    const totalMonths = endDate.diff(startDate, 'month');
    const monthlyStatuses = [];

    for (let i = 0; i < totalMonths; i++) {
      const monthDate = startDate.add(i, 'month');
      
      // Find payment for this month
      const monthPayment = payments.find(payment => {
        const paymentDue = dayjs(payment.dueDate);
        return paymentDue.year() === monthDate.year() && 
               paymentDue.month() === monthDate.month();
      });

      monthlyStatuses.push({
        month: monthDate,
        payment: monthPayment,
        status: monthPayment?.status || 'pending'
      });
    }

    return monthlyStatuses;
  };

  const monthlyStatuses = getPaymentStatusByMonth();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: 'info.main',
            mr: 2,
            width: 48,
            height: 48
          }}
        >
          <Timeline />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Contract Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Key dates and milestones
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday sx={{ fontSize: 14, mr: 1, color: 'success.main' }} />
              Start Date
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.startDate)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventNote sx={{ fontSize: 14, mr: 1, color: 'warning.main' }} />
              End Date
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.endDate)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ fontSize: 14, mr: 1, color: 'info.main' }} />
              Created
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.createdAt)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <History sx={{ fontSize: 14, mr: 1, color: 'secondary.main' }} />
              Last Updated
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.updatedAt)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Payment Timeline
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
            {dayjs(contract.endDate).diff(dayjs(contract.startDate), 'month')} months total
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {monthlyStatuses.filter(m => m.status === 'paid').length} paid
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {monthlyStatuses.filter(m => {
              const currentDate = dayjs();
              const isCurrentMonth = m.month.year() === currentDate.year() && 
                                   m.month.month() === currentDate.month();
              return !isCurrentMonth && (m.status === 'pending' || m.status === 'scheduled');
            }).length} pending
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {monthlyStatuses.filter(m => m.status === 'overdue').length} overdue
          </Typography>
          {monthlyStatuses.some(m => {
            const currentDate = dayjs();
            return m.month.year() === currentDate.year() && m.month.month() === currentDate.month();
          }) && (
            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
              • 1 current month
            </Typography>
          )}
        </Box>
        
        {/* Payment Status Progress Bar */}
        <Box sx={{ flex: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
            {monthlyStatuses.map((monthStatus, index) => {
              const currentDate = dayjs();
              const isCurrentMonth = monthStatus.month.year() === currentDate.year() && 
                                   monthStatus.month.month() === currentDate.month();
              
              let segmentColor;
              let statusLabel = monthStatus.status;
              
              if (isCurrentMonth) {
                segmentColor = theme.palette.info.main; // Current month - blue (distinct color)
                statusLabel = 'current month';
              } else {
                switch (monthStatus.status) {
                  case 'paid':
                    segmentColor = theme.palette.success.main; // Paid - green
                    break;
                  case 'overdue':
                    segmentColor = theme.palette.error.main; // Overdue - red
                    break;
                  case 'pending':
                  case 'scheduled':
                  default:
                    segmentColor = alpha(theme.palette.warning.main, 0.3); // Pending - light orange
                    break;
                }
              }

              // Format currency helper
              const formatCurrency = (amount: string | number | undefined): string => {
                if (!amount) return 'N/A';
                const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                }).format(numAmount);
              };

              // Handle click to navigate to payment/invoice
              const handleSegmentClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (monthStatus.payment?.id) {
                  // Navigate to the specific payment/invoice page
                  navigate(`/payments/${monthStatus.payment.id}`);
                } else {
                  // If no payment exists, navigate to payments page filtered by this contract
                  navigate(`/payments?contractId=${contract.id}&month=${monthStatus.month.format('YYYY-MM')}`);
                }
              };

              // Create detailed tooltip content
              const tooltipContent = (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {monthStatus.month.format('MMMM YYYY')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Status: <strong style={{ textTransform: 'capitalize' }}>{statusLabel}</strong>
                  </Typography>
                  {monthStatus.payment && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Amount: <strong>{formatCurrency(monthStatus.payment.amount)}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Due: <strong>{dayjs(monthStatus.payment.dueDate).format('MMM DD, YYYY')}</strong>
                      </Typography>
                      {monthStatus.payment.paymentDate && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Paid: <strong>{dayjs(monthStatus.payment.paymentDate).format('MMM DD, YYYY')}</strong>
                        </Typography>
                      )}
                      {monthStatus.payment.notes && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Notes: <strong>{monthStatus.payment.notes}</strong>
                        </Typography>
                      )}
                    </>
                  )}
                  {!monthStatus.payment && (
                    <Typography variant="body2" color="text.secondary">
                      No payment data available
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'primary.main' }}>
                    Click to view {monthStatus.payment ? 'payment details' : 'payments page'}
                  </Typography>
                </Box>
              );
              
              return (
                <Tooltip
                  key={index}
                  title={tooltipContent}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 2,
                        boxShadow: theme.shadows[8],
                        maxWidth: 300,
                        '& .MuiTooltip-arrow': {
                          color: 'background.paper',
                          '&::before': {
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          },
                        },
                      },
                    },
                  }}
                >
                  <Box
                    onClick={handleSegmentClick}
                    sx={{
                      flex: 1,
                      height: '100%',
                      bgcolor: segmentColor,
                      borderRight: index < monthlyStatuses.length - 1 ? `1px solid ${theme.palette.background.paper}` : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                        transform: 'scaleY(1.3)',
                        zIndex: 1,
                        position: 'relative'
                      }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: theme.palette.success.main, 
                  borderRadius: 1 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                Paid
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: theme.palette.info.main, 
                  borderRadius: 1 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                Current Month
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: theme.palette.error.main, 
                  borderRadius: 1 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                Overdue
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: alpha(theme.palette.warning.main, 0.3), 
                  borderRadius: 1 
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
