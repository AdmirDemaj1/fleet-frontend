import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import { AutoAwesome, Cancel, CheckCircle, Group } from '@mui/icons-material';
import { Reveal } from './Reveal';
import { PLANS } from '../data/plans.data';
import { CARD, BORDER, BLUE, INDIGO } from '../constants/theme';

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ px: { xs: 3, md: 8 }, py: 10 }}>
      <Reveal>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" sx={{ color: BLUE, letterSpacing: 2, fontWeight: 700 }}>
            Transparent pricing
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, fontWeight: 800, mt: 1, color: '#fff' }}>
            One plan per company. Every seat included.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', mt: 2, lineHeight: 1.7, maxWidth: 560, mx: 'auto' }}>
            All plans are billed per company — not per user. Every seat within your plan is included.
            14-day free trial. No credit card required.
          </Typography>
        </Box>
      </Reveal>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.1}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                backgroundColor: plan.highlight ? alpha(BLUE, 0.07) : CARD,
                border: plan.highlight
                  ? `1.5px solid ${alpha(BLUE, 0.45)}`
                  : `1px solid ${BORDER}`,
                position: 'relative',
                boxShadow: plan.highlight ? `0 0 60px ${alpha(BLUE, 0.1)}` : 'none',
                transform: plan.highlight ? { md: 'scale(1.03)' } : 'none',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  boxShadow: `0 8px 48px ${alpha(plan.color, 0.18)}`,
                  transform: plan.highlight ? { md: 'scale(1.06)' } : 'translateY(-5px)',
                },
              }}
            >
              {plan.highlight && (
                <Chip
                  label="Most popular"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    boxShadow: `0 0 20px ${alpha(BLUE, 0.5)}`,
                  }}
                />
              )}

              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: plan.color, letterSpacing: 1.5, fontWeight: 700, display: 'block' }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
                    {plan.tagline}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    backgroundColor: alpha(plan.color, 0.12),
                    border: `1px solid ${alpha(plan.color, 0.25)}`,
                  }}
                />
              </Stack>

              {/* Price */}
              <Stack direction="row" alignItems="flex-end" spacing={0.5} mb={2.5}>
                <Typography sx={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, color: '#fff' }}>
                  {plan.price}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', mb: 0.5, fontSize: '0.85rem' }}>
                  {plan.period}
                </Typography>
              </Stack>

              {/* Users */}
              <Stack spacing={0.75} mb={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Group sx={{ fontSize: 15, color: plan.color }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: plan.color }}>
                    {plan.users}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', pl: 3 }}>
                  {plan.userRoles}
                </Typography>
              </Stack>

              {/* AI badge — Premium only */}
              {plan.ai && (
                <Box
                  sx={{
                    mb: 3,
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha('#a78bfa', 0.12)}, ${alpha(INDIGO, 0.12)})`,
                    border: `1px solid ${alpha('#a78bfa', 0.3)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 16, color: '#a78bfa' }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', lineHeight: 1.2 }}>
                      AI Assistant included
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                      {plan.ai} · €0.50 per extra query
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ height: '1px', backgroundColor: BORDER, mb: 3 }} />

              {/* Features */}
              <Stack spacing={1.25} mb={4}>
                {plan.features.map((feat) => (
                  <Stack key={feat.label} direction="row" alignItems="flex-start" spacing={1.25}>
                    {feat.included ? (
                      <CheckCircle sx={{ fontSize: 16, color: plan.color, mt: 0.15, flexShrink: 0 }} />
                    ) : (
                      <Cancel sx={{ fontSize: 16, color: 'rgba(255,255,255,0.15)', mt: 0.15, flexShrink: 0 }} />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: feat.included ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)',
                          lineHeight: 1.4,
                          fontSize: '0.82rem',
                        }}
                      >
                        {feat.label}
                      </Typography>
                      {feat.note && feat.included && (
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', mt: 0.1 }}>
                          {feat.note}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Button
                fullWidth
                variant={plan.highlight ? 'contained' : 'outlined'}
                onClick={() => navigate('/signup')}
                sx={
                  plan.highlight
                    ? {
                        background: `linear-gradient(135deg, ${BLUE}, ${INDIGO})`,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        py: 1.35,
                        boxShadow: `0 0 20px ${alpha(BLUE, 0.3)}`,
                        '&:hover': { boxShadow: `0 0 36px ${alpha(BLUE, 0.5)}` },
                      }
                    : {
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.35,
                        borderColor: alpha(plan.color, 0.4),
                        color: plan.color,
                        '&:hover': {
                          borderColor: plan.color,
                          backgroundColor: alpha(plan.color, 0.06),
                        },
                      }
                }
              >
                {plan.cta}
              </Button>
            </Box>
          </Reveal>
        ))}
      </Box>

      {/* Per-company note */}
      <Reveal delay={0.3}>
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.8 }}>
            Plans are licensed per company. Users share the seat pool — mix Admins, Managers,
            Accountants and Basic Users freely within your limit.
            <br />
            Need more than 50 users?{' '}
            <Box
              component="span"
              sx={{ color: BLUE, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Talk to us about an Enterprise plan.
            </Box>
          </Typography>
        </Box>
      </Reveal>
    </Box>
  );
};
