import { createTheme, alpha } from '@mui/material/styles';

// Define a premium color palette with modern design principles for dark mode
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

// Surface colors for depth and hierarchy in dark mode
const surfaceColors = {
  background: '#0f172a', // Dark navy background
  paper: '#1e293b', // Slightly lighter navy for cards
  elevated: '#334155', // Medium slate for elevated surfaces
  accent: '#475569', // Lighter slate for subtle accents
};

export const darkTheme = createTheme({
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
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: grayColor,
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    background: {
      default: surfaceColors.background,
      paper: surfaceColors.paper,
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
    },
    divider: alpha('#475569', 0.8),
    action: {
      active: primaryColor,
      hover: alpha(accentColor, 0.08),
      selected: alpha(accentColor, 0.12),
      disabled: '#475569',
      disabledBackground: '#334155',
      focus: alpha(accentColor, 0.16),
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
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      color: '#f8fafc',
      marginBottom: '0.5em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.267,
      letterSpacing: '-0.01em',
      color: '#f8fafc',
      marginBottom: '0.5em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.334,
      letterSpacing: '-0.005em',
      color: '#f8fafc',
      marginBottom: '0.5em',
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
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.3)',
    '0px 2px 4px rgba(0, 0, 0, 0.32)',
    '0px 4px 8px rgba(0, 0, 0, 0.32)',
    '0px 6px 12px rgba(0, 0, 0, 0.35)',
    '0px 8px 16px rgba(0, 0, 0, 0.35)',
    '0px 12px 20px rgba(0, 0, 0, 0.38)',
    '0px 16px 24px rgba(0, 0, 0, 0.38)',
    '0px 20px 28px rgba(0, 0, 0, 0.4)',
    '0px 24px 32px rgba(0, 0, 0, 0.4)',
    '0px 28px 36px rgba(0, 0, 0, 0.42)',
    '0px 32px 40px rgba(0, 0, 0, 0.42)',
    '0px 36px 44px rgba(0, 0, 0, 0.44)',
    '0px 40px 48px rgba(0, 0, 0, 0.44)',
    '0px 44px 52px rgba(0, 0, 0, 0.46)',
    '0px 48px 56px rgba(0, 0, 0, 0.46)',
    '0px 52px 60px rgba(0, 0, 0, 0.48)',
    '0px 56px 64px rgba(0, 0, 0, 0.48)',
    '0px 60px 68px rgba(0, 0, 0, 0.5)',
    '0px 64px 72px rgba(0, 0, 0, 0.5)',
    '0px 68px 76px rgba(0, 0, 0, 0.52)',
    '0px 72px 80px rgba(0, 0, 0, 0.52)',
    '0px 76px 84px rgba(0, 0, 0, 0.54)',
    '0px 80px 88px rgba(0, 0, 0, 0.54)',
    '0px 80px 88px rgba(0, 0, 0, 0.54)',
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
        },
        '#root': {
          height: '100%',
        },
        '#nprogress .bar': {
          backgroundColor: accentColor,
          zIndex: 2000,
          height: '3px',
        },
        '#nprogress .peg': {
          boxShadow: `0 0 10px ${accentColor}, 0 0 5px ${accentColor}`,
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
          borderRadius: 10,
          padding: '10px 20px',
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
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
            transform: 'translateY(-2px)',
            '&:before': {
              left: '100%',
            },
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        contained: {
          color: '#0f172a',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 100%)`,
          boxShadow: `0 4px 14px 0 ${alpha(primaryColor, 0.25)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryColor} 100%)`,
            boxShadow: `0 6px 20px 0 ${alpha(primaryColor, 0.35)}`,
          },
          '&:disabled': {
            background: '#334155',
            color: '#64748b',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: alpha(primaryColor, 0.3),
          color: primaryColor,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: primaryColor,
            background: alpha(primaryColor, 0.04),
            boxShadow: `0 4px 12px 0 ${alpha(primaryColor, 0.15)}`,
          },
        },
        text: {
          color: primaryColor,
          '&:hover': {
            background: alpha(primaryColor, 0.04),
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
          borderRadius: 8,
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '24px',
          background: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#475569', 0.8)}`,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha('#f8fafc', 0.2)}, transparent)`,
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha('#000000', 0.3)}`,
            borderColor: alpha(accentColor, 0.2),
            background: 'rgba(30, 41, 59, 0.95)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '24px 24px 0',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '0 24px 24px',
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
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#475569', 0.6)}`,
        },
        elevation1: {
          boxShadow: `0 2px 8px ${alpha('#000000', 0.2)}`,
        },
        elevation2: {
          boxShadow: `0 4px 12px ${alpha('#000000', 0.25)}`,
        },
        elevation3: {
          boxShadow: `0 8px 16px ${alpha('#000000', 0.3)}`,
        },
        outlined: {
          borderColor: alpha('#475569', 0.8),
          background: 'rgba(51, 65, 85, 0.8)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          borderBottom: `1px solid ${alpha('#475569', 0.6)}`,
          fontSize: '0.875rem',
        },
        head: {
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#f8fafc',
          backgroundColor: alpha('#334155', 0.8),
          borderBottom: `2px solid ${alpha('#475569', 0.8)}`,
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
          background: `linear-gradient(135deg, ${alpha('#334155', 0.9)} 0%, ${alpha('#475569', 0.9)} 100%)`,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 150ms ease',
          '&:nth-of-type(even)': {
            backgroundColor: alpha('#334155', 0.3),
          },
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: alpha(accentColor, 0.08),
            transform: 'scale(1.005)',
            boxShadow: `0 2px 8px ${alpha(accentColor, 0.2)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 200ms ease',
            '& fieldset': {
              borderColor: alpha('#64748b', 0.8),
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: alpha('#94a3b8', 0.9),
            },
            '&.Mui-focused fieldset': {
              borderColor: accentColor,
              borderWidth: '2px',
              boxShadow: `0 0 0 3px ${alpha(accentColor, 0.2)}`,
            },
            '&.Mui-error fieldset': {
              borderColor: errorColor,
              '&:focus': {
                boxShadow: `0 0 0 3px ${alpha(errorColor, 0.2)}`,
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
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
            color: '#64748b',
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: primaryColor,
            borderWidth: '1.5px',
          },
        },
        notchedOutline: {
          borderColor: '#64748b',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#94a3b8',
          '&.Mui-focused': {
            color: primaryColor,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8125rem',
          height: 32,
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 8px ${alpha('#000000', 0.3)}`,
          },
          '&.MuiChip-colorPrimary': {
            background: `linear-gradient(135deg, ${alpha(primaryColor, 0.2)} 0%, ${alpha(primaryColor, 0.25)} 100%)`,
            color: primaryColor,
            border: `1px solid ${alpha(primaryColor, 0.3)}`,
          },
          '&.MuiChip-colorSecondary': {
            background: `linear-gradient(135deg, ${alpha(secondaryColor, 0.2)} 0%, ${alpha(secondaryColor, 0.25)} 100%)`,
            color: secondaryColor,
            border: `1px solid ${alpha(secondaryColor, 0.3)}`,
          },
          '&.MuiChip-colorSuccess': {
            background: `linear-gradient(135deg, ${alpha(successColor, 0.2)} 0%, ${alpha(successColor, 0.25)} 100%)`,
            color: successColor,
            border: `1px solid ${alpha(successColor, 0.3)}`,
          },
          '&.MuiChip-colorError': {
            background: `linear-gradient(135deg, ${alpha(errorColor, 0.2)} 0%, ${alpha(errorColor, 0.25)} 100%)`,
            color: errorColor,
            border: `1px solid ${alpha(errorColor, 0.3)}`,
          },
          '&.MuiChip-colorWarning': {
            background: `linear-gradient(135deg, ${alpha(warningColor, 0.2)} 0%, ${alpha(warningColor, 0.25)} 100%)`,
            color: warningColor,
            border: `1px solid ${alpha(warningColor, 0.3)}`,
          },
          '&.MuiChip-colorInfo': {
            background: `linear-gradient(135deg, ${alpha(infoColor, 0.2)} 0%, ${alpha(infoColor, 0.25)} 100%)`,
            color: infoColor,
            border: `1px solid ${alpha(infoColor, 0.3)}`,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 16px',
        },
        standardSuccess: {
          backgroundColor: alpha(successColor, 0.2),
          color: successColor,
        },
        standardError: {
          backgroundColor: alpha(errorColor, 0.2),
          color: errorColor,
        },
        standardWarning: {
          backgroundColor: alpha(warningColor, 0.2),
          color: warningColor,
        },
        standardInfo: {
          backgroundColor: alpha(infoColor, 0.2),
          color: infoColor,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(primaryColor, 0.2),
          color: primaryColor,
          fontWeight: 600,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 8,
          paddingBottom: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(accentColor, 0.12),
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${alpha(accentColor, 0.2)} 0%, ${alpha(accentColor, 0.25)} 100%)`,
            borderLeft: `3px solid ${accentColor}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(accentColor, 0.25)} 0%, ${alpha(accentColor, 0.3)} 100%)`,
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
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: `4px 0 24px ${alpha('#000000', 0.3)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(20px)',
          color: '#f8fafc',
          border: 'none',
          borderBottom: `1px solid ${alpha('#475569', 0.6)}`,
          boxShadow: `0 1px 3px ${alpha('#000000', 0.2)}`,
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
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 100,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 8,
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
          backgroundColor: alpha('#94a3b8', 0.2),
          borderRadius: 4,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '8px 12px',
          boxShadow: `0 4px 12px ${alpha('#000000', 0.4)}`,
          color: '#0f172a',
        },
        arrow: {
          color: 'rgba(248, 250, 252, 0.9)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 28,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          transition: 'transform 200ms ease',
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              background: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
              borderColor: 'transparent',
            },
            '& .MuiSwitch-thumb': {
              boxShadow: `0 2px 8px ${alpha(accentColor, 0.5)}`,
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
          background: '#ffffff',
          boxShadow: `0 2px 8px ${alpha('#000000', 0.3)}`,
          transition: 'all 200ms ease',
        },
        track: {
          borderRadius: 14,
          opacity: 1,
          backgroundColor: alpha('#64748b', 0.8),
          border: `1px solid ${alpha('#475569', 0.8)}`,
          transition: 'all 200ms ease',
        },
      },
    },
  },
});
