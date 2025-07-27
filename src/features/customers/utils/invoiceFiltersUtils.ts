import { InvoiceFilters } from '../types/invoiceFilters.types';
import { 
  STATUS_OPTIONS, 
  TYPE_OPTIONS, 
  DATE_RANGE_OPTIONS, 
  AMOUNT_RANGE_OPTIONS 
} from '../constants/invoiceFiltersConstants';

export const hasActiveFilters = (filters: InvoiceFilters): boolean => {
  return Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );
};

export const getFilterCount = (filters: InvoiceFilters): number => {
  return Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;
};

export const getStatusOption = (value: string) => 
  STATUS_OPTIONS.find(option => option.value === value);

export const getTypeOption = (value: string) => 
  TYPE_OPTIONS.find(option => option.value === value);

export const getDateRangeOption = (value: string) => 
  DATE_RANGE_OPTIONS.find(option => option.value === value);

export const getAmountRangeOption = (value: string) => 
  AMOUNT_RANGE_OPTIONS.find(option => option.value === value);

export const createEmptyFilters = (): InvoiceFilters => ({
  search: '',
  status: '',
  type: '',
  dateRange: '',
  amountRange: ''
});
