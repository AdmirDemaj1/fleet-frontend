import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { BG, BORDER, BLUE, INDIGO } from '../constants/theme';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        px: { xs: 3, md: 8 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(16px)',
        backgroundColor: alpha(BG, 0.8),
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DirectionsCar sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Typography fontWeight={800} fontSize="1.1rem" letterSpacing={0.5}>
          FleetCredit
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: '#fff' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/signup')}
          sx={{
            background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            boxShadow: `0 0 20px ${alpha(BLUE, 0.35)}`,
            '&:hover': { boxShadow: `0 0 28px ${alpha(BLUE, 0.5)}` },
          }}
        >
          Get Started
        </Button>
      </Stack>
    </Box>
  );
};
