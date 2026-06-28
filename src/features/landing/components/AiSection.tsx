import React from 'react';
import { Box, Chip, Stack, Typography, alpha } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { Reveal } from './Reveal';
import { AI_PERSONAS } from '../data/aiPersonas.data';
import { BG, BLUE, INDIGO } from '../constants/theme';

export const AiSection: React.FC = () => (
  <Box
    sx={{
      mx: { xs: 0, md: 6 },
      my: { xs: 6, md: 10 },
      px: { xs: 3, md: 6 },
      py: { xs: 6, md: 8 },
      borderRadius: { xs: 0, md: 4 },
      background: `linear-gradient(135deg, ${alpha(BLUE, 0.08)} 0%, ${alpha(INDIGO, 0.08)} 100%)`,
      border: `1px solid ${alpha(BLUE, 0.15)}`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background glow */}
    <Box
      sx={{
        position: 'absolute',
        top: '-30%',
        right: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${alpha(INDIGO, 0.12)} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }}
    />

    <Reveal>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 24px ${alpha(BLUE, 0.4)}`,
            flexShrink: 0,
          }}
        >
          <SmartToy sx={{ fontSize: 28, color: '#fff' }} />
        </Box>
        <Box>
          <Chip
            label="Premium feature"
            size="small"
            sx={{
              backgroundColor: alpha(INDIGO, 0.2),
              color: '#a78bfa',
              fontWeight: 600,
              mb: 0.5,
              fontSize: '0.7rem',
            }}
          />
          <Typography sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 800, lineHeight: 1.2 }}>
            Meet your AI Financial Assistant
          </Typography>
        </Box>
      </Stack>

      <Typography sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620, mb: 6, lineHeight: 1.7 }}>
        Ask questions in plain language. The AI queries live data — contracts, payments, customers,
        vehicles, EURIBOR rates and reports — and responds with precise, actionable answers.
        No SQL. No filters. Just ask.
      </Typography>
    </Reveal>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        gap: 3,
      }}
    >
      {AI_PERSONAS.map((p, i) => (
        <Reveal key={p.role} delay={i * 0.1}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: alpha(BG, 0.6),
              border: `1px solid ${alpha(p.color, 0.2)}`,
              backdropFilter: 'blur(8px)',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                }}
              />
              <Typography fontWeight={700} sx={{ color: p.color }}>
                For {p.role}
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {p.queries.map((q) => (
                <Box
                  key={q}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    backgroundColor: alpha(p.color, 0.07),
                    border: `1px solid ${alpha(p.color, 0.15)}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      fontStyle: 'italic',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {q}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Reveal>
      ))}
    </Box>
  </Box>
);
