import { useState, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LogFilters } from '../types/logFilters.types';

export const useLogFilters = (
  filters: LogFilters, 
  onFilterChange: (filters: LogFilters) => void
) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      eventType: '',
      entityType: '',
      startDate: '',
      endDate: ''
    });
    setAdvancedOpen(false);
  };

  const toggleAdvancedFilters = () => {
    setAdvancedOpen(!advancedOpen);
  };

  const filterState = useMemo(() => {
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    const filterCount = Object.values(filters).filter(value => value !== '').length;
    
    return {
      advancedOpen,
      hasActiveFilters,
      filterCount
    };
  }, [advancedOpen, filters]);

  return {
    theme,
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  };
};
