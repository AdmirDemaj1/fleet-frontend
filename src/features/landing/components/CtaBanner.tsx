import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Reveal } from './Reveal';
import { BLUE, INDIGO } from '../constants/theme';

export const CtaBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Reveal>
      <Box
        sx={{
          mx: { xs: 3, md: 8 },
          mb: 10,
          p: { xs: 5, md: 8 },
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(BLUE, 0.18)}, ${alpha(INDIGO, 0.18)})`,
          border: `1px solid ${alpha(BLUE, 0.2)}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${alpha(BLUE, 0.15)}, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 800, mb: 2 }}>
          Ready to streamline your fleet operations?
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
          Join leasing companies and fleet managers who use FleetCredit every day to manage contracts,
          payments, and customers — with AI built in.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/signup')}
            sx={{
              background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              boxShadow: `0 0 32px ${alpha(BLUE, 0.4)}`,
            }}
          >
            Start Free Trial
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderColor: alpha('#fff', 0.2),
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: alpha('#fff', 0.04),
              },
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Box>
    </Reveal>
  );
};
