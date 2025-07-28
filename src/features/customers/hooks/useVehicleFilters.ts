import { useState, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { VehicleFilters } from '../types/vehicleFilters.types';

export const useVehicleFilters = (
  filters: VehicleFilters, 
  onFilterChange: (filters: VehicleFilters) => void
) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleFilterChange = (key: keyof VehicleFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      make: '',
      model: '',
      year: ''
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
