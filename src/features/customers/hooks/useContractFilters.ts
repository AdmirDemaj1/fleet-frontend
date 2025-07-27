import { useState, useCallback, useMemo } from 'react';
import { ContractFilters, FilterKey, StatusOption, FilterOption } from '../types/contractFilters.types';
import { STATUS_OPTIONS } from '../constants/statusOptions';
import { TYPE_OPTIONS, DATE_RANGE_OPTIONS, AMOUNT_RANGE_OPTIONS } from '../constants/filterOptions';

export const useContractFilters = (
  filters: ContractFilters,
  onFilterChange: (newFilters: ContractFilters) => void
) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== null
    ), [filters]
  );

  const filterCount = useMemo(() => 
    Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length, [filters]
  );

  const handleFilterChange = useCallback((key: FilterKey, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange({
      search: '',
      status: '',
      type: '',
      dateRange: '',
      amountRange: ''
    });
    setAdvancedOpen(false);
  }, [onFilterChange]);

  const toggleAdvancedFilters = useCallback(() => {
    setAdvancedOpen(prev => !prev);
  }, []);

  return {
    advancedOpen,
    hasActiveFilters,
    filterCount,
    handleFilterChange,
    handleClearFilters,
    toggleAdvancedFilters
  };
};

export const useFilterOptions = () => {
  const getStatusOption = useCallback((value: string): StatusOption | undefined => 
    STATUS_OPTIONS.find(option => option.value === value), []
  );

  const getTypeOption = useCallback((value: string): FilterOption | undefined => 
    TYPE_OPTIONS.find(option => option.value === value), []
  );

  const getDateRangeOption = useCallback((value: string): FilterOption | undefined => 
    DATE_RANGE_OPTIONS.find(option => option.value === value), []
  );

  const getAmountRangeOption = useCallback((value: string): FilterOption | undefined => 
    AMOUNT_RANGE_OPTIONS.find(option => option.value === value), []
  );

  return {
    getStatusOption,
    getTypeOption,
    getDateRangeOption,
    getAmountRangeOption,
    statusOptions: STATUS_OPTIONS,
    typeOptions: TYPE_OPTIONS,
    dateRangeOptions: DATE_RANGE_OPTIONS,
    amountRangeOptions: AMOUNT_RANGE_OPTIONS
  };
};
