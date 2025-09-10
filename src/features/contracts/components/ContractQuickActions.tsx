import React from 'react';
import {
  Typography,
  Paper,
  Button,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person,
  DirectionsCar,
  Security,
  Analytics
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ContractQuickActionsProps {
  contractId: string;
  customerId: string;
}

export const ContractQuickActions: React.FC<ContractQuickActionsProps> = ({ 
  contractId, 
  customerId 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Stack spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Person />}
          onClick={() => navigate(`/customers/${customerId}`)}
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          View Customer Profile
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DirectionsCar />}
          onClick={() => navigate(`/contracts/${contractId}/vehicles`)}
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: 'info.main',
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }
          }}
        >
          Vehicle Details
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Security />}
          onClick={() => navigate(`/contracts/${contractId}/collaterals`)}
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: 'warning.main',
              bgcolor: alpha(theme.palette.warning.main, 0.05)
            }
          }}
        >
          Collateral Information
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Analytics />}
          onClick={() => navigate(`/contracts/${contractId}/analytics`)}
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: 'secondary.main',
              bgcolor: alpha(theme.palette.secondary.main, 0.05)
            }
          }}
        >
          Performance Analytics
        </Button>
      </Stack>
    </Paper>
  );
};
