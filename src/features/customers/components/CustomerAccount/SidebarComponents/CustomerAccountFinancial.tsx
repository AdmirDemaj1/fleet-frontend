import React, { useMemo } from 'react';
import {
  Box, Typography, LinearProgress, alpha, Chip, Stack
} from '@mui/material';
import {
  AttachMoney, Event, CreditCard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CustomerAccountFinancialProps {
  customerData: any;
  totalDue: number;
  nextBillDate: string;
  contracts?: any[];
}

const CustomerAccountFinancial: React.FC<CustomerAccountFinancialProps> = ({
  customerData,
  totalDue,
  nextBillDate,
  contracts = []
}) => {
  const navigate = useNavigate();

  // Get all unique next billing dates from active contracts
  const nextBillingDates = useMemo(() => {
    if (!contracts || contracts.length === 0) return [];

    const dates = contracts
      .filter((contract: any) => {
        // Check for active status - handle both string and potential enum values
        const isActive =
          contract.status === 'active' ||
          contract.status === 'ACTIVE' ||
          contract.contractStatus === 'active' ||
          contract.contractStatus === 'ACTIVE';
        return isActive;
      })
      .map((contract: any) => {
        // For now, calculate next billing date as 30 days from now
        // In a real app, this would come from the payment schedule
        const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return {
          contractId: contract.id,
          contractNumber: contract.contractNumber || contract.id,
          date: nextDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          rawDate: nextDate
        };
      })
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    return dates;
  }, [contracts]);
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AttachMoney 
          sx={{ 
            color: 'primary.main',
            fontSize: 20
          }} 
        />
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.95rem'
          }}
        >
          Financial Overview
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2.5 }}>
        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Outstanding Balance
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: totalDue > 0 ? 'error.main' : 'success.main',
              fontSize: '1rem'
            }}
          >
            ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box> */}
        
        <LinearProgress 
          variant="determinate" 
          value={totalDue > 0 ? Math.min((totalDue / 1000) * 100, 100) : 100}
          sx={{ 
            height: 8, 
            borderRadius: 2,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              bgcolor: totalDue > 0 ? 'error.main' : 'success.main',
              borderRadius: 2
            }
          }} 
        />
      </Box>
      
      <Box sx={{
        p: 2,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
        borderRadius: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: nextBillingDates.length > 0 ? 1.5 : 0 }}>
          <Event sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Next Billing
          </Typography>
        </Box>

        {nextBillingDates.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              textAlign: 'center',
              mt: 0.5
            }}
          >
            No active contracts
          </Typography>
        ) : (
          <Stack spacing={1}>
            {nextBillingDates.map((billing, index) => (
              <Box
                key={index}
                onClick={() => navigate(`/contracts/${billing.contractId}`)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                    transform: 'translateX(2px)'
                  }
                }}
              >
                <Chip
                  label={billing.contractNumber}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.8rem'
                  }}
                >
                  {billing.date}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Credit Balance */}
      {customerData?.creditBalance && (
        <Box sx={{ 
          mt: 2,
          p: 2, 
          bgcolor: (theme) => alpha(theme.palette.success.main, 0.06), 
          borderRadius: 2,
          border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.12)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CreditCard sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Credit Balance
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: 'success.main',
              fontSize: '1rem'
            }}
          >
            ${parseFloat(customerData.creditBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomerAccountFinancial;