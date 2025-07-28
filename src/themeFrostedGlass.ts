import { createTheme, alpha } from '@mui/material/styles';

// Define a premium color palette with frosted glass design principles for dark mode
const primaryColor = '#f1f5f9'; // Light slate for primary text
const primaryLight = '#f8fafc'; // Very light slate
const primaryDark = '#e2e8f0'; // Slightly darker slate
const accentColor = '#60a5fa'; // Lighter blue for interactive elements
const secondaryColor = '#a78bfa'; // Light purple
const successColor = '#34d399'; // Light emerald green
const warningColor = '#fbbf24'; // Light amber
const errorColor = '#f87171'; // Light red
const infoColor = '#67e8f9'; // Light cyan
const grayColor = '#94a3b8'; // Light slate gray

// Frosted glass surface colors with enhanced transparency and blur effects
const frostedSurfaceColors = {
  background: '#0a0f1a', // Darker navy background for better glass contrast
  paper: 'rgba(30, 41, 59, 0.15)', // Much more transparent for glass effect
  elevated: 'rgba(51, 65, 85, 0.25)', // Semi-transparent elevated surfaces
  accent: 'rgba(71, 85, 105, 0.3)', // Subtle transparent accents
  overlay: 'rgba(15, 23, 42, 0.8)', // For modal overlays
};

export const frostedGlassTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#0f172a',
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.8),
      dark: '#8b5cf6',
      contrastText: '#0f172a',
    },
    success: {
      main: successColor,
      light: '#6ee7b7',
      dark: '#10b981',
      contrastText: '#0f172a',
    },
    warning: {
      main: warningColor,
      light: '#fcd34d',
      dark: '#f59e0b',
      contrastText: '#0f172a',
    },
    error: {
      main: errorColor,
      light: '#fca5a5',
      dark: '#ef4444',
      contrastText: '#0f172a',
    },
    info: {
      main: infoColor,
      light: '#a7f3d0',
      dark: '#06b6d4',
      contrastText: '#0f172a',
    },
    grey: {
      50: '#0a0f1a',
      100: 'rgba(30, 41, 59, 0.3)',
      200: 'rgba(51, 65, 85, 0.4)',
      300: 'rgba(71, 85, 105, 0.5)',
      400: 'rgba(100, 116, 139, 0.6)',
      500: alpha(grayColor, 0.7),
      600: 'rgba(203, 213, 225, 0.8)',
      700: 'rgba(226, 232, 240, 0.9)',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    background: {
      default: frostedSurfaceColors.background,
      paper: frostedSurfaceColors.paper,
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
    },
    divider: alpha('#475569', 0.3),
    action: {
      active: primaryColor,
      hover: alpha(accentColor, 0.04),
      selected: alpha(accentColor, 0.08),
      disabled: alpha('#475569', 0.5),
      disabledBackground: alpha('#334155', 0.3),
      focus: alpha(accentColor, 0.12),
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'SF Pro Display',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.167,
      letterSpacing: '-0.02em',
      color: '#f8fafc',
      marginBottom: '0.5em',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      color: '#f8fafc',
      marginBottom: '0.5em',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.267,
      letterSpacing: '-0.01em',
      color: '#f8fafc',
      marginBottom: '0.5em',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.334,
      letterSpacing: '-0.005em',
      color: '#f8fafc',
      marginBottom: '0.5em',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#f8fafc',
      marginBottom: '0.5em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#f8fafc',
      marginBottom: '0.5em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#cbd5e1',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#cbd5e1',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#e2e8f0',
      letterSpacing: '0.005em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#e2e8f0',
      letterSpacing: '0.005em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#94a3b8',
      letterSpacing: '0.03em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#94a3b8',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.4), 0px 0px 16px rgba(96, 165, 250, 0.05)',
    '0px 2px 6px rgba(0, 0, 0, 0.4), 0px 0px 20px rgba(96, 165, 250, 0.08)',
    '0px 4px 12px rgba(0, 0, 0, 0.45), 0px 0px 24px rgba(96, 165, 250, 0.1)',
    '0px 6px 16px rgba(0, 0, 0, 0.45), 0px 0px 28px rgba(96, 165, 250, 0.12)',
    '0px 8px 20px rgba(0, 0, 0, 0.5), 0px 0px 32px rgba(96, 165, 250, 0.15)',
    '0px 12px 24px rgba(0, 0, 0, 0.5), 0px 0px 36px rgba(96, 165, 250, 0.18)',
    '0px 16px 28px rgba(0, 0, 0, 0.55), 0px 0px 40px rgba(96, 165, 250, 0.2)',
    '0px 20px 32px rgba(0, 0, 0, 0.55), 0px 0px 44px rgba(96, 165, 250, 0.22)',
    '0px 24px 36px rgba(0, 0, 0, 0.6), 0px 0px 48px rgba(96, 165, 250, 0.25)',
    '0px 28px 40px rgba(0, 0, 0, 0.6), 0px 0px 52px rgba(96, 165, 250, 0.28)',
    '0px 32px 44px rgba(0, 0, 0, 0.65), 0px 0px 56px rgba(96, 165, 250, 0.3)',
    '0px 36px 48px rgba(0, 0, 0, 0.65), 0px 0px 60px rgba(96, 165, 250, 0.32)',
    '0px 40px 52px rgba(0, 0, 0, 0.7), 0px 0px 64px rgba(96, 165, 250, 0.35)',
    '0px 44px 56px rgba(0, 0, 0, 0.7), 0px 0px 68px rgba(96, 165, 250, 0.38)',
    '0px 48px 60px rgba(0, 0, 0, 0.75), 0px 0px 72px rgba(96, 165, 250, 0.4)',
    '0px 52px 64px rgba(0, 0, 0, 0.75), 0px 0px 76px rgba(96, 165, 250, 0.42)',
    '0px 56px 68px rgba(0, 0, 0, 0.8), 0px 0px 80px rgba(96, 165, 250, 0.45)',
    '0px 60px 72px rgba(0, 0, 0, 0.8), 0px 0px 84px rgba(96, 165, 250, 0.48)',
    '0px 64px 76px rgba(0, 0, 0, 0.85), 0px 0px 88px rgba(96, 165, 250, 0.5)',
    '0px 68px 80px rgba(0, 0, 0, 0.85), 0px 0px 92px rgba(96, 165, 250, 0.52)',
    '0px 72px 84px rgba(0, 0, 0, 0.9), 0px 0px 96px rgba(96, 165, 250, 0.55)',
    '0px 76px 88px rgba(0, 0, 0, 0.9), 0px 0px 100px rgba(96, 165, 250, 0.58)',
    '0px 80px 92px rgba(0, 0, 0, 0.95), 0px 0px 104px rgba(96, 165, 250, 0.6)',
    '0px 80px 92px rgba(0, 0, 0, 0.95), 0px 0px 104px rgba(96, 165, 250, 0.6)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          // Add a subtle texture to the body for enhanced glass effect
          background: `${frostedSurfaceColors.background}`,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(96, 165, 250, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(167, 139, 250, 0.02) 0%, transparent 50%)
          `,
        },
        '#root': {
          height: '100%',
        },
        '#nprogress .bar': {
          backgroundColor: accentColor,
          zIndex: 2000,
          height: '3px',
          boxShadow: `0 0 10px ${accentColor}`,
        },
        '#nprogress .peg': {
          boxShadow: `0 0 10px ${accentColor}, 0 0 5px ${accentColor}`,
        },
        // Add frosted glass noise texture
        '*::before': {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: false,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            transition: 'left 600ms',
          },
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            '&:before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(0px) scale(1)',
          },
        },
        contained: {
          color: '#0f172a',
          background: `linear-gradient(135deg, ${alpha(primaryColor, 0.9)} 0%, ${alpha(primaryLight, 0.95)} 100%)`,
          border: `1px solid ${alpha(primaryColor, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(primaryColor, 0.15)}, inset 0 1px 0 ${alpha('#ffffff', 0.2)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryColor} 100%)`,
            boxShadow: `0 12px 40px ${alpha(primaryColor, 0.25)}, inset 0 1px 0 ${alpha('#ffffff', 0.3)}`,
            border: `1px solid ${alpha(primaryColor, 0.3)}`,
          },
          '&:disabled': {
            background: alpha('#334155', 0.3),
            color: '#64748b',
            boxShadow: 'none',
            backdropFilter: 'blur(10px)',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: alpha(primaryColor, 0.2),
          color: primaryColor,
          background: alpha('#1e293b', 0.3),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          '&:hover': {
            borderColor: alpha(primaryColor, 0.4),
            background: alpha(primaryColor, 0.06),
            boxShadow: `0 8px 32px ${alpha(primaryColor, 0.15)}, inset 0 1px 0 ${alpha('#ffffff', 0.15)}`,
          },
        },
        text: {
          color: primaryColor,
          background: 'transparent',
          '&:hover': {
            background: alpha(primaryColor, 0.04),
            backdropFilter: 'blur(10px)',
          },
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.8125rem',
          borderRadius: 10,
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '0.9375rem',
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '32px',
          background: alpha('#1e293b', 0.2),
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${alpha('#475569', 0.3)}`,
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            0 8px 32px ${alpha('#000000', 0.3)},
            inset 0 1px 0 ${alpha('#ffffff', 0.1)},
            0 0 0 1px ${alpha('#ffffff', 0.05)}
          `,
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha('#f8fafc', 0.3)}, transparent)`,
          },
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `
              0 20px 60px ${alpha('#000000', 0.4)},
              inset 0 1px 0 ${alpha('#ffffff', 0.15)},
              0 0 0 1px ${alpha(accentColor, 0.2)}
            `,
            background: alpha('#1e293b', 0.25),
            border: `1px solid ${alpha(accentColor, 0.3)}`,
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '32px 32px 0',
        },
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#f8fafc',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '32px',
          '&:last-child': {
            paddingBottom: '32px',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '0 32px 32px',
          justifyContent: 'flex-end',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          background: alpha('#1e293b', 0.15),
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: `1px solid ${alpha('#475569', 0.25)}`,
          boxShadow: `
            0 4px 16px ${alpha('#000000', 0.2)},
            inset 0 1px 0 ${alpha('#ffffff', 0.08)}
          `,
        },
        elevation1: {
          boxShadow: `
            0 2px 8px ${alpha('#000000', 0.25)},
            inset 0 1px 0 ${alpha('#ffffff', 0.1)}
          `,
        },
        elevation2: {
          boxShadow: `
            0 4px 16px ${alpha('#000000', 0.3)},
            inset 0 1px 0 ${alpha('#ffffff', 0.12)}
          `,
        },
        elevation3: {
          boxShadow: `
            0 8px 24px ${alpha('#000000', 0.35)},
            inset 0 1px 0 ${alpha('#ffffff', 0.15)}
          `,
        },
        outlined: {
          border: `1px solid ${alpha('#475569', 0.3)}`,
          background: alpha('#334155', 0.2),
          backdropFilter: 'blur(25px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          borderBottom: `1px solid ${alpha('#475569', 0.25)}`,
          fontSize: '0.875rem',
          background: 'transparent',
        },
        head: {
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#f8fafc',
          backgroundColor: alpha('#334155', 0.3),
          backdropFilter: 'blur(20px)',
          borderBottom: `2px solid ${alpha('#475569', 0.4)}`,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
        body: {
          fontSize: '0.875rem',
          color: '#e2e8f0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: alpha('#334155', 0.2),
          backdropFilter: 'blur(30px)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 200ms ease',
          '&:nth-of-type(even)': {
            backgroundColor: alpha('#334155', 0.1),
          },
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: alpha(accentColor, 0.06),
            backdropFilter: 'blur(20px)',
            transform: 'scale(1.005)',
            boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: alpha('#1e293b', 0.3),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition: 'all 250ms ease',
            border: `1px solid ${alpha('#64748b', 0.3)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              background: alpha('#1e293b', 0.4),
              border: `1px solid ${alpha('#94a3b8', 0.4)}`,
              boxShadow: `
                inset 0 1px 0 ${alpha('#ffffff', 0.1)},
                0 4px 16px ${alpha('#000000', 0.1)}
              `,
            },
            '&.Mui-focused': {
              background: alpha('#1e293b', 0.5),
              border: `1px solid ${alpha(accentColor, 0.5)}`,
              boxShadow: `
                0 0 0 3px ${alpha(accentColor, 0.15)},
                inset 0 1px 0 ${alpha('#ffffff', 0.12)},
                0 8px 24px ${alpha(accentColor, 0.2)}
              `,
            },
            '&.Mui-error': {
              border: `1px solid ${alpha(errorColor, 0.5)}`,
              '&:focus': {
                boxShadow: `
                  0 0 0 3px ${alpha(errorColor, 0.15)},
                  inset 0 1px 0 ${alpha('#ffffff', 0.1)}
                `,
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#94a3b8',
            '&.Mui-focused': {
              color: accentColor,
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: alpha('#64748b', 0.8),
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
        },
        notchedOutline: {
          borderColor: 'transparent',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#94a3b8',
          '&.Mui-focused': {
            color: accentColor,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          fontSize: '0.8125rem',
          height: 36,
          transition: 'all 250ms ease',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          '&:hover': {
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: `0 8px 24px ${alpha('#000000', 0.3)}`,
          },
          '&.MuiChip-colorPrimary': {
            background: alpha(primaryColor, 0.15),
            color: primaryColor,
            border: `1px solid ${alpha(primaryColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
          '&.MuiChip-colorSecondary': {
            background: alpha(secondaryColor, 0.15),
            color: secondaryColor,
            border: `1px solid ${alpha(secondaryColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
          '&.MuiChip-colorSuccess': {
            background: alpha(successColor, 0.15),
            color: successColor,
            border: `1px solid ${alpha(successColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
          '&.MuiChip-colorError': {
            background: alpha(errorColor, 0.15),
            color: errorColor,
            border: `1px solid ${alpha(errorColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
          '&.MuiChip-colorWarning': {
            background: alpha(warningColor, 0.15),
            color: warningColor,
            border: `1px solid ${alpha(warningColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
          '&.MuiChip-colorInfo': {
            background: alpha(infoColor, 0.15),
            color: infoColor,
            border: `1px solid ${alpha(infoColor, 0.25)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '16px 20px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
        },
        standardSuccess: {
          backgroundColor: alpha(successColor, 0.15),
          color: successColor,
          border: `1px solid ${alpha(successColor, 0.3)}`,
        },
        standardError: {
          backgroundColor: alpha(errorColor, 0.15),
          color: errorColor,
          border: `1px solid ${alpha(errorColor, 0.3)}`,
        },
        standardWarning: {
          backgroundColor: alpha(warningColor, 0.15),
          color: warningColor,
          border: `1px solid ${alpha(warningColor, 0.3)}`,
        },
        standardInfo: {
          backgroundColor: alpha(infoColor, 0.15),
          color: infoColor,
          border: `1px solid ${alpha(infoColor, 0.3)}`,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(primaryColor, 0.15),
          color: primaryColor,
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(primaryColor, 0.2)}`,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 10,
          paddingBottom: 10,
          transition: 'all 200ms ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: alpha(accentColor, 0.08),
            backdropFilter: 'blur(20px)',
            transform: 'translateX(6px) scale(1.02)',
            boxShadow: `0 4px 16px ${alpha(accentColor, 0.15)}`,
          },
          '&.Mui-selected': {
            background: alpha(accentColor, 0.15),
            backdropFilter: 'blur(20px)',
            borderLeft: `3px solid ${accentColor}`,
            boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.1)}`,
            '&:hover': {
              background: alpha(accentColor, 0.2),
              backdropFilter: 'blur(25px)',
            },
            '& .MuiListItemIcon-root': {
              color: accentColor,
            },
            '& .MuiTypography-root': {
              color: accentColor,
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          background: alpha('#1e293b', 0.2),
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: `
            8px 0 32px ${alpha('#000000', 0.4)},
            inset -1px 0 0 ${alpha('#ffffff', 0.08)}
          `,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha('#1e293b', 0.2),
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          color: '#f8fafc',
          border: 'none',
          borderBottom: `1px solid ${alpha('#475569', 0.3)}`,
          boxShadow: `
            0 1px 3px ${alpha('#000000', 0.2)},
            inset 0 -1px 0 ${alpha('#ffffff', 0.08)}
          `,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            background: `linear-gradient(90deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
            boxShadow: `0 0 8px ${alpha(accentColor, 0.5)}`,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 120,
          transition: 'all 200ms ease',
          '&:hover': {
            backgroundColor: alpha(accentColor, 0.04),
            backdropFilter: 'blur(10px)',
          },
          '&.Mui-selected': {
            fontWeight: 600,
            color: accentColor,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: alpha('#1e293b', 0.2),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#475569', 0.3)}`,
          boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.08)}`,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            boxShadow: `
              0 8px 24px ${alpha('#000000', 0.3)},
              inset 0 1px 0 ${alpha('#ffffff', 0.1)}
            `,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-expanded': {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          paddingTop: 0,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#94a3b8', 0.15),
          borderRadius: 6,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha('#f8fafc', 0.15),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 10,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '10px 14px',
          boxShadow: `
            0 8px 32px ${alpha('#000000', 0.4)},
            inset 0 1px 0 ${alpha('#ffffff', 0.2)},
            0 0 0 1px ${alpha('#ffffff', 0.1)}
          `,
          color: '#f8fafc',
          border: `1px solid ${alpha('#ffffff', 0.15)}`,
        },
        arrow: {
          color: alpha('#f8fafc', 0.15),
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          transition: 'transform 250ms ease',
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
              borderColor: 'transparent',
              boxShadow: `
                inset 0 1px 0 ${alpha('#ffffff', 0.2)},
                0 4px 16px ${alpha(accentColor, 0.3)}
              `,
            },
            '& .MuiSwitch-thumb': {
              boxShadow: `0 4px 16px ${alpha(accentColor, 0.4)}`,
            },
          },
          '&:hover': {
            backgroundColor: 'transparent',
            '& .MuiSwitch-thumb': {
              transform: 'scale(1.1)',
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
          boxShadow: `
            0 4px 12px ${alpha('#000000', 0.3)},
            inset 0 1px 0 ${alpha('#ffffff', 0.5)}
          `,
          transition: 'all 250ms ease',
        },
        track: {
          borderRadius: 16,
          opacity: 1,
          backgroundColor: alpha('#64748b', 0.3),
          border: `1px solid ${alpha('#475569', 0.4)}`,
          transition: 'all 250ms ease',
          backdropFilter: 'blur(10px)',
          boxShadow: `inset 0 1px 2px ${alpha('#000000', 0.2)}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: alpha('#1e293b', 0.15),
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${alpha('#475569', 0.3)}`,
          boxShadow: `
            0 24px 64px ${alpha('#000000', 0.5)},
            inset 0 1px 0 ${alpha('#ffffff', 0.1)}
          `,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: alpha('#0f172a', 0.8),
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
      },
    },
  },
});
