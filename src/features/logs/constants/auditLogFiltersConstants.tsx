import React from 'react';
import {
  Add as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as UserIcon,
  DirectionsCar as VehicleIcon,
  Assignment as ContractIcon,
  Business as CustomerIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { AuditLogFilterOption } from '../types/auditLogFilters.types';

export const AUDIT_LOG_EVENT_TYPE_OPTIONS: AuditLogFilterOption[] = [
  { value: '', label: 'All Events' },
  { value: 'create', label: 'Create', icon: <CreateIcon fontSize="small" /> },
  { value: 'update', label: 'Update', icon: <UpdateIcon fontSize="small" /> },
  { value: 'delete', label: 'Delete', icon: <DeleteIcon fontSize="small" /> },
  { value: 'login', label: 'Login', icon: <LoginIcon fontSize="small" /> },
  { value: 'logout', label: 'Logout', icon: <LogoutIcon fontSize="small" /> },
  { value: 'entity_created', label: 'Entity Created', icon: <CreateIcon fontSize="small" /> },
  { value: 'entity_updated', label: 'Entity Updated', icon: <UpdateIcon fontSize="small" /> },
  { value: 'status_changed', label: 'Status Changed', icon: <UpdateIcon fontSize="small" /> }
];

export const AUDIT_LOG_ENTITY_TYPE_OPTIONS: AuditLogFilterOption[] = [
  { value: '', label: 'All Entities' },
  { value: 'customer', label: 'Customer', icon: <CustomerIcon fontSize="small" /> },
  { value: 'vehicle', label: 'Vehicle', icon: <VehicleIcon fontSize="small" /> },
  { value: 'contract', label: 'Contract', icon: <ContractIcon fontSize="small" /> },
  { value: 'payment', label: 'Payment', icon: <PaymentIcon fontSize="small" /> },
  { value: 'user', label: 'User', icon: <UserIcon fontSize="small" /> },
  { value: 'collateral', label: 'Collateral', icon: <ContractIcon fontSize="small" /> }
];
