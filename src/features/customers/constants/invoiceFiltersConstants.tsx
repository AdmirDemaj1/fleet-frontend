import {
  CheckCircle,
  AccessTime,
  ErrorOutline
} from '@mui/icons-material';
import { FilterOption } from '../types/invoiceFilters.types';

export const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Statuses', icon: null },
  { value: 'pending', label: 'Pending', icon: <AccessTime fontSize="small" /> },
  { value: 'paid', label: 'Paid', icon: <CheckCircle fontSize="small" /> },
  { value: 'overdue', label: 'Overdue', icon: <ErrorOutline fontSize="small" /> },
  { value: 'cancelled', label: 'Cancelled', icon: <ErrorOutline fontSize="small" /> }
];

export const TYPE_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Types' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'final', label: 'Final' },
  { value: 'penalty', label: 'Penalty' }
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
  { value: '0-100', label: 'Under $100' },
  { value: '100-500', label: '$100 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-5000', label: '$1,000 - $5,000' },
  { value: '5000+', label: 'Over $5,000' }
];
