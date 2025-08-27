import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Receipt,
  Schedule,
  Warning,
  Error as ErrorIcon,
  Pending
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Payment } from '../types/invoice.types';

interface PaymentHeaderProps {
  payment: Payment;
  onMarkAsPaid: () => void;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  payment,
  onMarkAsPaid
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/payments');
  };

  const handleEdit = () => {
    navigate(`/payments/${payment.id}/edit`);
  };

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const handleGenerateReceipt = () => {
    console.log('Generate receipt for:', payment.id);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMMM dd, yyyy');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          textColor: theme.palette.success.main,
          icon: CheckCircle
        };
      case 'pending':
        return {
          label: 'Pending',
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          textColor: theme.palette.warning.main,
          icon: Pending
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          textColor: theme.palette.error.main,
          icon: ErrorIcon
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          textColor: theme.palette.info.main,
          icon: Schedule
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: theme.palette.text.secondary,
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          textColor: theme.palette.text.secondary,
          icon: Warning
        };
    }
  };

  const statusConfig = getStatusConfig(String(payment.status));
  const StatusIcon = statusConfig.icon;

  return (
    <Box
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      {/* Back Button and Main Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleBack} 
          sx={{ 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            mr: 3,
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderColor: alpha(theme.palette.primary.main, 0.2),
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowBack sx={{ color: theme.palette.text.primary }} />
        </IconButton>
        
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
            Payment Details
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: 'monospace',
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              px: 2,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            ID: {payment.id}
          </Typography>
        </Box>
      </Box>

      {/* Payment Summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.primary.main,
              mr: 3,
              fontSize: '2rem',
              fontWeight: 700
            }}
          >
            $
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
              {formatCurrency(payment.amount)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<StatusIcon />}
                label={statusConfig.label}
                sx={{
                  bgcolor: statusConfig.bgcolor,
                  color: statusConfig.textColor,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 36,
                  '& .MuiChip-icon': {
                    color: statusConfig.color,
                    fontSize: 20
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Due: {formatDate(payment.dueDate)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {String(payment.status) !== 'paid' && (
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={onMarkAsPaid}
              sx={{
                bgcolor: theme.palette.success.main,
                color: theme.palette.success.contrastText,
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.4)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              Mark as Paid
            </Button>
          )}
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Receipt />}
            onClick={handleGenerateReceipt}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Receipt
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{
              borderColor: alpha(theme.palette.text.secondary, 0.3),
              color: theme.palette.text.secondary,
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
