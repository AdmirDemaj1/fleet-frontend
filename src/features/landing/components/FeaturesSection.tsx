import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { Reveal } from './Reveal';
import { FEATURES } from '../data/features.data';
import { CARD, BORDER, BLUE } from '../constants/theme';

export const FeaturesSection: React.FC = () => (
  <Box sx={{ px: { xs: 3, md: 8 }, py: 10 }}>
    <Reveal>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="overline" sx={{ color: BLUE, letterSpacing: 2, fontWeight: 700 }}>
          Everything in one place
        </Typography>
        <Typography
          sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, fontWeight: 800, mt: 1, lineHeight: 1.2 }}
        >
          Built for the full lifecycle
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', mt: 2, maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
          From first enquiry to final payment — every module works together out of the box.
        </Typography>
      </Box>
    </Reveal>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 2.5,
      }}
    >
      {FEATURES.map((f, i) => (
        <Reveal key={f.title} delay={i * 0.07}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              height: '100%',
              cursor: 'default',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: alpha(f.color, 0.4),
                boxShadow: `0 8px 32px ${alpha(f.color, 0.15)}`,
              },
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                backgroundColor: alpha(f.color, 0.12),
                border: `1px solid ${alpha(f.color, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: f.color,
                mb: 2,
              }}
            >
              {f.icon}
            </Box>
            <Typography fontWeight={700} mb={1}>
              {f.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
              {f.desc}
            </Typography>
          </Box>
        </Reveal>
      ))}
    </Box>
  </Box>
);
