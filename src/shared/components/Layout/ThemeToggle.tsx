import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme, alpha } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleTheme} 
        size="medium"
        sx={{ 
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
            transform: 'scale(1.05) rotate(30deg)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
        aria-label="toggle theme"
      >
        {mode === 'light' ? 
          <DarkMode 
            fontSize="small" 
            sx={{ 
              color: muiTheme.palette.text.secondary,
              transition: 'color 0.2s ease-in-out',
            }} 
          /> : 
          <LightMode 
            fontSize="small" 
            sx={{ 
              color: muiTheme.palette.warning.main,
              transition: 'color 0.2s ease-in-out',
            }} 
          />
        }
      </IconButton>
    </Tooltip>
  );
};