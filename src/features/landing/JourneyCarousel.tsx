import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Stack, alpha } from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  Description,
  AccountBalance,
  SwapHoriz,
  SmartToy,
} from '@mui/icons-material';

// ─── CDN base URL — set VITE_CDN_URL in your environment ─────────────────────
const CDN = (import.meta.env.VITE_CDN_URL ?? '').replace(/\/$/, '');
const img = (name: string) => `${CDN}/screenshots/${name}`;

// ─── Slide definitions ────────────────────────────────────────────────────────
interface Slide {
  step: string;
  category: string;
  title: string;
  description: string;
  img: string;
  accent: string;
  icon: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    step: '01',
    category: 'Dashboard',
    title: 'Start every day informed',
    description:
      'A live command centre showing active contracts, fleet status, monthly revenue and key alerts — everything that needs your attention before the first coffee.',
    img: img('dashboard.png'),
    accent: '#3b82f6',
    icon: <Dashboard sx={{ fontSize: 14 }} />,
  },
  {
    step: '02',
    category: 'Customers',
    title: 'Know every client completely',
    description:
      'Unified customer profiles with recent invoices, contract history, vehicle assignments, financial overview and a full audit trail — all in one place.',
    img: img('customers.png'),
    accent: '#06b6d4',
    icon: <People sx={{ fontSize: 14 }} />,
  },
  {
    step: '03',
    category: 'Fleet',
    title: 'Your entire fleet, always visible',
    description:
      'Filter by status, make, model or ownership type. Spot uninsured vehicles, leased assets and available units in seconds.',
    img: img('vehicles.png'),
    accent: '#10b981',
    icon: <DirectionsCar sx={{ fontSize: 14 }} />,
  },
  {
    step: '04',
    category: 'Contracts',
    title: 'Structure every deal',
    description:
      'Full contract detail — principal, interest, remaining balance and live interest rate — at a glance. The financial truth of every agreement, always up to date.',
    img: img('contracts-financial.png'),
    accent: '#6366f1',
    icon: <Description sx={{ fontSize: 14 }} />,
  },
  {
    step: '05',
    category: 'Contracts',
    title: 'Track the full lifecycle',
    description:
      'Contract timeline, linked vehicles, payment progress bar and quick actions — export schedules, preview amortisation, trigger early payoff — all from one screen.',
    img: img('contracts-detail.png'),
    accent: '#6366f1',
    icon: <Description sx={{ fontSize: 14 }} />,
  },
  {
    step: '06',
    category: 'Contracts',
    title: 'Adapt to rate changes in real time',
    description:
      'Prepayment impact analysis and EURIBOR rate change history show exactly how each financial event shifted the monthly payment and total interest cost.',
    img: img('contracts-rates.png'),
    accent: '#6366f1',
    icon: <AccountBalance sx={{ fontSize: 14 }} />,
  },
  {
    step: '07',
    category: 'Payments',
    title: 'Never miss a payment',
    description:
      'Every instalment for every contract in one filterable list. Late, pending and paid statuses are colour-coded so overdue items surface immediately.',
    img: img('payments.png'),
    accent: '#f59e0b',
    icon: <SwapHoriz sx={{ fontSize: 14 }} />,
  },
  {
    step: '08',
    category: 'AI Assistant',
    title: 'Ask anything, get answers instantly',
    description:
      'Type a question in plain language — "Show me all overdue payments" — and the AI queries live data across contracts, customers, vehicles and payments to respond in seconds.',
    img: img('ai-agent.png'),
    accent: '#a78bfa',
    icon: <SmartToy sx={{ fontSize: 14 }} />,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const INTERVAL_MS = 5000;
const BG = '#080e1a';
const SURFACE = '#0d1424';
const BORDER = 'rgba(255,255,255,0.07)';
const CHROME_H = 36;

// ─── Browser frame ────────────────────────────────────────────────────────────
const BrowserChrome: React.FC<{ accent: string }> = ({ accent }) => (
  <Box
    sx={{
      height: CHROME_H,
      backgroundColor: '#1a2234',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      alignItems: 'center',
      px: 2,
      gap: 1.5,
      borderBottom: `1px solid ${BORDER}`,
      flexShrink: 0,
    }}
  >
    {/* Traffic lights */}
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
    ))}

    {/* URL bar */}
    <Box
      sx={{
        flex: 1,
        mx: 2,
        height: 20,
        borderRadius: 1,
        backgroundColor: '#0f172a',
        border: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        gap: 1,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent, opacity: 0.8, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', lineHeight: 1 }}>
        app.fleetcredit.io
      </Typography>
    </Box>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const JourneyCarousel: React.FC = () => {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (index === active) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setTransitioning(false);
      setProgress(0);
      progressRef.current = 0;
      startRef.current = null;
    }, 280);
  }, [active]);

  const goNext = useCallback(() => {
    goTo((active + 1) % SLIDES.length);
  }, [active, goTo]);

  // RAF-based progress ticker
  useEffect(() => {
    const tick = (timestamp: number) => {
      if (pausedRef.current) {
        startRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const pct = Math.min((elapsed / INTERVAL_MS) * 100, 100);
      progressRef.current = pct;
      setProgress(pct);
      if (pct >= 100) {
        startRef.current = null;
        setActive(prev => {
          const next = (prev + 1) % SLIDES.length;
          setTransitioning(true);
          setTimeout(() => { setTransitioning(false); setProgress(0); progressRef.current = 0; }, 280);
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handlePause = () => { pausedRef.current = true; setIsPaused(true); };
  const handleResume = () => { pausedRef.current = false; setIsPaused(false); };

  const slide = SLIDES[active];

  // Unique categories for the chapter pills
  const categories = Array.from(new Set(SLIDES.map(s => s.category)));

  return (
    <Box sx={{ backgroundColor: SURFACE, py: { xs: 8, md: 12 }, px: { xs: 0, md: 0 } }}>
      {/* Section heading */}
      <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, px: 3 }}>
        <Typography variant="overline" sx={{ color: '#3b82f6', letterSpacing: 2, fontWeight: 700 }}>
          A guided tour
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, fontWeight: 800, mt: 1, color: '#fff' }}>
          Follow the journey
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', mt: 2, maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
          From opening the dashboard to closing a deal — see how FleetCredit guides you through every step.
        </Typography>
      </Box>

      {/* Chapter pills */}
      <Stack
        direction="row"
        justifyContent="center"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: { xs: 5, md: 6 }, px: 3 }}
      >
        {categories.map((cat) => {
          const catSlides = SLIDES.filter(s => s.category === cat);
          const firstIdx = SLIDES.findIndex(s => s.category === cat);
          const isActive = catSlides.some(s => s === slide);
          const accent = catSlides[0].accent;
          return (
            <Box
              key={cat}
              onClick={() => goTo(firstIdx)}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 5,
                border: `1px solid ${isActive ? accent : BORDER}`,
                backgroundColor: isActive ? alpha(accent, 0.12) : 'transparent',
                color: isActive ? accent : 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                '&:hover': {
                  borderColor: alpha(accent, 0.5),
                  color: accent,
                  backgroundColor: alpha(accent, 0.08),
                },
              }}
            >
              {catSlides[0].icon}
              {cat}
            </Box>
          );
        })}
      </Stack>

      {/* Main layout */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          gap: { xs: 4, lg: 6 },
          maxWidth: 1280,
          mx: 'auto',
          px: { xs: 3, md: 6, lg: 8 },
        }}
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
      >
        {/* Left: narrative text */}
        <Box
          sx={{
            width: { xs: '100%', lg: 300 },
            flexShrink: 0,
            order: { xs: 2, lg: 1 },
          }}
        >
          {/* Step counter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography
              sx={{
                fontSize: '3rem',
                fontWeight: 900,
                lineHeight: 1,
                background: `linear-gradient(135deg, ${slide.accent}, ${alpha(slide.accent, 0.3)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {slide.step}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 1,
                backgroundColor: alpha(slide.accent, 0.12),
                border: `1px solid ${alpha(slide.accent, 0.25)}`,
                color: slide.accent,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
            >
              {slide.category}
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: '1.4rem', md: '1.6rem' },
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.25,
              mb: 2,
              transition: 'opacity 0.3s ease',
              opacity: transitioning ? 0 : 1,
            }}
          >
            {slide.title}
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.75,
              fontSize: '0.9rem',
              mb: 4,
              transition: 'opacity 0.3s ease',
              opacity: transitioning ? 0 : 1,
            }}
          >
            {slide.description}
          </Typography>

          {/* Dot navigation */}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {SLIDES.map((s, i) => (
              <Box
                key={i}
                onClick={() => goTo(i)}
                sx={{
                  width: i === active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === active ? s.accent : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { backgroundColor: i === active ? s.accent : 'rgba(255,255,255,0.35)' },
                }}
              />
            ))}
          </Stack>

          {/* Pause indicator */}
          {isPaused && (
            <Typography sx={{ mt: 2, fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: 0.5 }}>
              ⏸ Paused
            </Typography>
          )}
        </Box>

        {/* Right: browser frame */}
        <Box
          sx={{
            flex: 1,
            order: { xs: 1, lg: 2 },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              borderRadius: '14px',
              border: `1px solid ${alpha(slide.accent, 0.25)}`,
              overflow: 'hidden',
              boxShadow: `0 0 0 1px ${BORDER}, 0 24px 80px ${alpha(slide.accent, 0.12)}, 0 8px 32px rgba(0,0,0,0.5)`,
              transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
              backgroundColor: BG,
            }}
          >
            {/* Chrome bar */}
            <BrowserChrome accent={slide.accent} />

            {/* Screenshot */}
            <Box sx={{ position: 'relative', overflow: 'hidden', lineHeight: 0 }}>
              <Box
                component="img"
                src={slide.img}
                alt={slide.title}
                sx={{
                  width: '100%',
                  display: 'block',
                  maxHeight: { xs: 280, sm: 400, md: 520 },
                  objectFit: 'cover',
                  objectPosition: 'top',
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning ? 'scale(1.015)' : 'scale(1)',
                  transition: 'opacity 0.28s ease, transform 0.28s ease',
                }}
              />

              {/* Subtle gradient overlay at bottom to blend into frame */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: `linear-gradient(to bottom, transparent, ${alpha(BG, 0.6)})`,
                  pointerEvents: 'none',
                }}
              />
            </Box>

            {/* Progress bar */}
            <Box sx={{ height: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: slide.accent,
                  transition: 'background-color 0.4s ease',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            </Box>
          </Box>

          {/* Prev / Next */}
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <Box
              onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' },
              }}
            >
              ‹
            </Box>
            <Box
              onClick={goNext}
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' },
              }}
            >
              ›
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
