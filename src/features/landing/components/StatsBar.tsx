import React from 'react';
import { Box, Typography } from '@mui/material';
import { Reveal } from './Reveal';
import { SURFACE, BORDER, BLUE, CYAN } from '../constants/theme';
import type { Stat } from '../types/landing.types';

const STATS: Stat[] = [
  { value: '10 000+', label: 'Contracts managed' },
  { value: '€2.4B+',  label: 'Lease portfolio value' },
  { value: '98.5%',   label: 'Uptime SLA' },
  { value: '< 2 s',   label: 'AI response time' },
];

export const StatsBar: React.FC = () => (
  <Reveal>
    <Box
      sx={{
        mx: { xs: 3, md: 8 },
        my: 4,
        p: 4,
        borderRadius: 3,
        backgroundColor: SURFACE,
        border: `1px solid ${BORDER}`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 3,
      }}
    >
      {STATS.map((s) => (
        <Box key={s.label} sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              fontWeight: 800,
              background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {s.value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            {s.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Reveal>
);
