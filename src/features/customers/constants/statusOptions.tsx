import {
  CheckCircle,
  AccessTime,
  ErrorOutline,
} from '@mui/icons-material';
import { StatusOption } from '../types/contractFilters.types';

// Status configuration for chips and dropdowns
export const STATUS_OPTIONS: StatusOption[] = [
  { value: '', label: 'All Statuses', icon: null },
  { value: 'draft', label: 'Draft', icon: <AccessTime fontSize="small" /> },
  { value: 'active', label: 'Active', icon: <CheckCircle fontSize="small" /> },
  { value: 'pending', label: 'Pending', icon: <AccessTime fontSize="small" /> },
  { value: 'completed', label: 'Completed', icon: <CheckCircle fontSize="small" /> },
  { value: 'cancelled', label: 'Cancelled', icon: <ErrorOutline fontSize="small" /> }
];
