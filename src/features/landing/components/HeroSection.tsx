import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import { ArrowForward, KeyboardArrowDown, SmartToy } from '@mui/icons-material';
import { BORDER, BLUE, INDIGO, CYAN } from '../constants/theme';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: { xs: 3, md: 8 },
        pt: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${alpha(BLUE, 0.15)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          animation: 'heroFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) both',
          '@keyframes heroFadeIn': {
            from: { opacity: 0, transform: 'translateY(32px)' },
            to:   { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Chip
          label="Now with AI Assistant"
          icon={<SmartToy sx={{ fontSize: '14px !important', color: `${CYAN} !important` }} />}
          size="small"
          sx={{
            mb: 4,
            backgroundColor: alpha(CYAN, 0.1),
            border: `1px solid ${alpha(CYAN, 0.3)}`,
            color: CYAN,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: 0.5,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.4rem', sm: '3.5rem', md: '4.8rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            mb: 3,
            background: `linear-gradient(135deg, #fff 30%, ${alpha('#fff', 0.55)})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Fleet & Leasing
          <br />
          <Box
            component="span"
            sx={{
              background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Reimagined
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 600,
            mx: 'auto',
            mb: 5,
            lineHeight: 1.7,
          }}
        >
          The all-in-one platform for leasing companies, fleet operators and finance teams.
          Manage contracts, customers, vehicles and payments — powered by an AI assistant that answers
          your questions in plain language.
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
              fontSize: '1rem',
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              boxShadow: `0 0 32px ${alpha(BLUE, 0.4)}`,
              '&:hover': { boxShadow: `0 0 48px ${alpha(BLUE, 0.6)}` },
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
              fontSize: '1rem',
              borderRadius: 2.5,
              px: 4,
              py: 1.5,
              borderColor: BORDER,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: alpha('#fff', 0.04),
              },
            }}
          >
            Sign In
          </Button>
        </Stack>

        {/* Scroll hint */}
        <Box
          sx={{
            mt: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            color: 'rgba(255,255,255,0.25)',
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%':       { transform: 'translateY(8px)' },
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}
          >
            Scroll to explore
          </Typography>
          <KeyboardArrowDown sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  );
};
