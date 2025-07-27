import { FilterOption } from '../types/contractFilters.types';

export const TYPE_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Types' },
  { value: 'loan', label: 'Loan' },
  { value: 'leasing', label: 'Leasing' }
];

export const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

export const AMOUNT_RANGE_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any Amount' },
  { value: '0-10000', label: 'Under $10,000' },
  { value: '10000-50000', label: '$10,000 - $50,000' },
  { value: '50000-100000', label: '$50,000 - $100,000' },
  { value: '100000-500000', label: '$100,000 - $500,000' },
  { value: '500000+', label: 'Over $500,000' }
];
