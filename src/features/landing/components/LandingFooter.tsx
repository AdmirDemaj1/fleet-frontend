import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { BORDER, BLUE, INDIGO } from '../constants/theme';

export const LandingFooter: React.FC = () => (
  <Box
    component="footer"
    sx={{
      px: { xs: 3, md: 8 },
      py: 4,
      borderTop: `1px solid ${BORDER}`,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: 1,
          background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DirectionsCar sx={{ fontSize: 14, color: '#fff' }} />
      </Box>
      <Typography fontWeight={700} fontSize="0.9rem">
        FleetCredit
      </Typography>
    </Stack>
    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
      © {new Date().getFullYear()} FleetCredit. All rights reserved.
    </Typography>
  </Box>
);
