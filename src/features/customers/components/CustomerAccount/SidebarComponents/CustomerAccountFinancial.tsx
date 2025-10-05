import React from 'react';
import { 
  Box, Typography, LinearProgress, alpha
} from '@mui/material';
import { 
  AttachMoney, Event, CreditCard
} from '@mui/icons-material';

interface CustomerAccountFinancialProps {
  customerData: any;
  totalDue: number;
  nextBillDate: string;
}

const CustomerAccountFinancial: React.FC<CustomerAccountFinancialProps> = ({
  customerData,
  totalDue,
  nextBillDate
}) => {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
        </Box>
        
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
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 2, 
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06), 
        borderRadius: 2.5,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Event sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Next Billing
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {nextBillDate}
        </Typography>
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