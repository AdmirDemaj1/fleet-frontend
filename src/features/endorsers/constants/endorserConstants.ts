import { Person, Group, Phone, Badge } from '@mui/icons-material';

export const ENDORSER_FILTER_OPTIONS = [
  { value: '', label: 'All Endorsers' },
  { value: 'active', label: 'Active Relationships' },
  { value: 'inactive', label: 'Inactive Relationships' },
];

export const RELATIONSHIP_FILTER_OPTIONS = [
  { value: '', label: 'All Relationships' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Child', label: 'Child' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Business Partner', label: 'Business Partner' },
  { value: 'Colleague', label: 'Colleague' },
  { value: 'Other', label: 'Other' },
];

export const ENDORSER_SORT_OPTIONS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
];

export const ENDORSER_MENU_ITEMS = [
  {
    label: 'View Details',
    icon: Person,
    action: 'view',
    color: 'primary'
  },
  {
    label: 'Edit Endorser',
    icon: Person,
    action: 'edit',
    color: 'primary'
  },
  {
    label: 'Manage Relationships',
    icon: Group,
    action: 'relationships',
    color: 'info'
  },
  {
    label: 'Contact Info',
    icon: Phone,
    action: 'contact',
    color: 'secondary'
  },
  {
    label: 'Delete Endorser',
    icon: Person,
    action: 'delete',
    color: 'error'
  },
];

export const ENDORSER_QUICK_ACTIONS = [
  {
    label: 'New Endorser',
    icon: Person,
    action: 'create',
    color: 'primary',
    variant: 'contained'
  },
  {
    label: 'Import Endorsers',
    icon: Badge,
    action: 'import',
    color: 'secondary',
    variant: 'outlined'
  },
  {
    label: 'Export Data',
    icon: Badge,
    action: 'export',
    color: 'info',
    variant: 'outlined'
  },
];

export const ENDORSER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'success',
    bgcolor: 'success.light',
    textColor: 'success.dark',
  },
  inactive: {
    label: 'Inactive',
    color: 'error',
    bgcolor: 'error.light',
    textColor: 'error.dark',
  },
} as const;
