import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import { InvoiceStatusConfig, InvoiceTypeConfig } from '../types/customerInvoices.types';

// Payment/Invoice status configuration
export const PAYMENT_STATUS_CONFIG: Record<string, InvoiceStatusConfig> = {
  pending: { icon: <PendingIcon fontSize="small" />, color: 'warning' as const, label: 'Pending' },
  paid: { icon: <CheckCircleIcon fontSize="small" />, color: 'success' as const, label: 'Paid' },
  overdue: { icon: <ErrorIcon fontSize="small" />, color: 'error' as const, label: 'Overdue' },
  cancelled: { icon: <ErrorIcon fontSize="small" />, color: 'error' as const, label: 'Cancelled' }
};

// Payment type configuration
export const PAYMENT_TYPE_CONFIG: Record<string, InvoiceTypeConfig> = {
  monthly: { label: 'Monthly', color: '#1976d2' },
  deposit: { label: 'Deposit', color: '#9c27b0' },
  final: { label: 'Final', color: '#388e3c' },
  penalty: { label: 'Penalty', color: '#f44336' }
};

// Table configuration for invoices
export const INVOICE_DEFAULT_ROWS_PER_PAGE = 10;
export const INVOICE_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
