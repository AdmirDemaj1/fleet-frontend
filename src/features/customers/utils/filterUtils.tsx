import { FilterChipData, ContractFilters } from '../types/contractFilters.types';
import {
  Search,
  CheckCircle,
  Category,
  CalendarMonth,
  AttachMoney,
} from '@mui/icons-material';
import { ReactElement } from 'react';

export const getActiveFilterChips = (
  filters: ContractFilters,
  getStatusOption: (value: string) => any,
  getTypeOption: (value: string) => any,
  getDateRangeOption: (value: string) => any,
  getAmountRangeOption: (value: string) => any
): FilterChipData[] => {
  const chips: FilterChipData[] = [];

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `Search: ${filters.search}`,
      icon: <Search fontSize="small" />
    });
  }

  if (filters.status) {
    const statusOption = getStatusOption(filters.status);
    chips.push({
      key: 'status',
      label: `Status: ${statusOption?.label}`,
      icon: (statusOption?.icon as ReactElement) || <CheckCircle fontSize="small" />
    });
  }

  if (filters.type) {
    const typeOption = getTypeOption(filters.type);
    chips.push({
      key: 'type',
      label: `Type: ${typeOption?.label}`,
      icon: <Category fontSize="small" />
    });
  }

  if (filters.dateRange) {
    const dateOption = getDateRangeOption(filters.dateRange);
    chips.push({
      key: 'dateRange',
      label: `Date: ${dateOption?.label}`,
      icon: <CalendarMonth fontSize="small" />
    });
  }

  if (filters.amountRange) {
    const amountOption = getAmountRangeOption(filters.amountRange);
    chips.push({
      key: 'amountRange',
      label: `Amount: ${amountOption?.label}`,
      icon: <AttachMoney fontSize="small" />
    });
  }

  return chips;
};
