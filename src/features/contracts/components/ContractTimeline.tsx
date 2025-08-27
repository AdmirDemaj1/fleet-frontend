import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  Timeline,
  CalendarToday,
  EventNote,
  Schedule,
  History
} from '@mui/icons-material';
import { ContractResponse } from '../types/contract.types';
import dayjs from 'dayjs';

interface ContractTimelineProps {
  contract: ContractResponse;
}

export const ContractTimeline: React.FC<ContractTimelineProps> = ({ contract }) => {
  const theme = useTheme();

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM DD, YYYY');
  };

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
          Contract Duration
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, dayjs().diff(dayjs(contract.startDate), 'day') / dayjs(contract.endDate).diff(dayjs(contract.startDate), 'day') * 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[500], 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: theme.palette.info.main
                }
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
            {dayjs(contract.endDate).diff(dayjs(contract.startDate), 'month')} months
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
