import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material';
import { InvoiceFilters, InvoiceFilterState } from '../types/invoiceFilters.types';
import { 
  hasActiveFilters, 
  getFilterCount, 
  getStatusOption, 
  getTypeOption, 
  getDateRangeOption, 
  getAmountRangeOption,
  createEmptyFilters
} from '../utils/invoiceFiltersUtils';

export const useInvoiceFilters = (
  filters: InvoiceFilters,
  onFilterChange: (newFilters: InvoiceFilters) => void
) => {
  const theme = useTheme();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const filterState = useMemo((): InvoiceFilterState => ({
    advancedOpen,
    hasActiveFilters: hasActiveFilters(filters),
    filterCount: getFilterCount(filters)
  }), [advancedOpen, filters]);

  const handleFilterChange = useCallback((key: keyof InvoiceFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange(createEmptyFilters());
  }, [onFilterChange]);

  const toggleAdvancedFilters = useCallback(() => {
    setAdvancedOpen(prev => !prev);
  }, []);

  // Filter option getters
  const filterOptionGetters = useMemo(() => ({
    getStatusOption: (value: string) => getStatusOption(value),
    getTypeOption: (value: string) => getTypeOption(value),
    getDateRangeOption: (value: string) => getDateRangeOption(value),
    getAmountRangeOption: (value: string) => getAmountRangeOption(value)
  }), []);

  return {
    theme,
    filterState,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters,
    ...filterOptionGetters
  };
};
