import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        sx={{ 
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'rotate(30deg)',
            backgroundColor: 'action.hover'
          } 
        }}
        aria-label="toggle theme"
      >
        {mode === 'light' ? 
          <DarkMode fontSize="small" /> : 
          <LightMode fontSize="small" sx={{ color: muiTheme.palette.warning.main }} />
        }
      </IconButton>
    </Tooltip>
  );
};