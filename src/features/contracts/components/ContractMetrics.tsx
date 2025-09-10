import React from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Speed
} from '@mui/icons-material';

export const ContractMetrics: React.FC = () => {
  const theme = useTheme();

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
        Key Metrics
      </Typography>
      
      <Stack spacing={3}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Compliance
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              98%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={98}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: 'success.main'
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Risk Score
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
              Low
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={25}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: 'warning.main'
              }
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mx: 'auto',
              mb: 2
            }}
          >
            <Speed sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
            A+
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Contract Rating
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
