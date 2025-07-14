import { createTheme, alpha } from '@mui/material/styles';

// Define a custom color palette
const primaryColor = '#2563eb'; // Modern blue
const secondaryColor = '#7c3aed'; // Purple for accents
const successColor = '#10b981'; // Emerald green
const warningColor = '#f59e0b'; // Amber
const errorColor = '#ef4444'; // Red
const infoColor = '#3b82f6'; // Light blue
const grayColor = '#64748b'; // Slate gray

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      light: alpha(primaryColor, 0.8),
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.8),
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: successColor,
      light: alpha(successColor, 0.8),
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: warningColor,
      light: alpha(warningColor, 0.8),
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: errorColor,
      light: alpha(errorColor, 0.8),
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    info: {
      main: infoColor,
      light: alpha(infoColor, 0.8),
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    grey: {
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: grayColor,
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    action: {
      active: grayColor,
      hover: alpha(grayColor, 0.05),
      selected: alpha(primaryColor, 0.1),
      disabled: '#cbd5e1',
      disabledBackground: '#f1f5f9',
      focus: alpha(primaryColor, 0.12),
    },
  },
  typography: {
    fontFamily: [
      'Inter',
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
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      marginBottom: '0.5em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      marginBottom: '0.5em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      marginBottom: '0.5em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      marginBottom: '0.5em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#475569',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#475569',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#64748b',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.08)',
    '0px 2px 4px rgba(15, 23, 42, 0.08)',
    '0px 4px 8px rgba(15, 23, 42, 0.08)',
    '0px 6px 12px rgba(15, 23, 42, 0.08)',
    '0px 8px 16px rgba(15, 23, 42, 0.08)',
    '0px 12px 24px rgba(15, 23, 42, 0.12)',
    '0px 16px 32px rgba(15, 23, 42, 0.12)',
    '0px 20px 40px rgba(15, 23, 42, 0.12)',
    '0px 24px 48px rgba(15, 23, 42, 0.16)',
    '0px 28px 56px rgba(15, 23, 42, 0.16)',
    '0px 32px 64px rgba(15, 23, 42, 0.16)',
    '0px 36px 72px rgba(15, 23, 42, 0.16)',
    '0px 40px 80px rgba(15, 23, 42, 0.2)',
    '0px 44px 88px rgba(15, 23, 42, 0.2)',
    '0px 48px 96px rgba(15, 23, 42, 0.2)',
    '0px 52px 104px rgba(15, 23, 42, 0.2)',
    '0px 56px 112px rgba(15, 23, 42, 0.24)',
    '0px 60px 120px rgba(15, 23, 42, 0.24)',
    '0px 64px 128px rgba(15, 23, 42, 0.24)',
    '0px 68px 136px rgba(15, 23, 42, 0.24)',
    '0px 72px 144px rgba(15, 23, 42, 0.24)',
    '0px 76px 152px rgba(15, 23, 42, 0.24)',
    '0px 80px 160px rgba(15, 23, 42, 0.24)',
    '0px 80px 160px rgba(15, 23, 42, 0.24)',
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
          backgroundColor: primaryColor,
          zIndex: 2000,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 150ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(15, 23, 42, 0.08)',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '24px',
          transition: 'box-shadow 200ms ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(15, 23, 42, 0.08)',
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
        elevation: 2,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
        outlined: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
        },
        head: {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#1e293b',
          backgroundColor: '#f8fafc',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '2px solid #e2e8f0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: alpha('#f8fafc', 0.5),
          },
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: alpha(primaryColor, 0.04),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#cbd5e1',
              transition: 'all 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryColor,
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: '#94a3b8',
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
          borderColor: '#cbd5e1',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#64748b',
          '&.Mui-focused': {
            color: primaryColor,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: alpha(primaryColor, 0.1),
            color: primaryColor,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: alpha(secondaryColor, 0.1),
            color: secondaryColor,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: alpha(successColor, 0.1),
            color: successColor,
          },
          '&.MuiChip-colorError': {
            backgroundColor: alpha(errorColor, 0.1),
            color: errorColor,
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: alpha(warningColor, 0.1),
            color: warningColor,
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: alpha(infoColor, 0.1),
            color: infoColor,
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
          backgroundColor: alpha(successColor, 0.1),
          color: successColor,
        },
        standardError: {
          backgroundColor: alpha(errorColor, 0.1),
          color: errorColor,
        },
        standardWarning: {
          backgroundColor: alpha(warningColor, 0.1),
          color: warningColor,
        },
        standardInfo: {
          backgroundColor: alpha(infoColor, 0.1),
          color: infoColor,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(primaryColor, 0.1),
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
          borderRadius: 8,
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: alpha(primaryColor, 0.1),
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.15),
            },
            '& .MuiListItemIcon-root': {
              color: primaryColor,
            },
            '& .MuiTypography-root': {
              color: primaryColor,
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
          boxShadow: '0px 8px 16px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.08)',
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
            boxShadow: '0px 4px 8px rgba(15, 23, 42, 0.08)',
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
          backgroundColor: alpha('#64748b', 0.1),
          borderRadius: 4,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e293b',
          borderRadius: 6,
          fontSize: '0.75rem',
          padding: '6px 12px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: primaryColor,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: '#cbd5e1',
        },
      },
    },
  },
});