import {
  CheckCircle as PaidIcon,
  Error as OverdueIcon,
  Schedule as PendingIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { InvoiceStatus, LogSeverity } from '../types/customerBillingCards.types';

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { icon: any; color: string; chipColor: string }> = {
  paid: {
    icon: PaidIcon,
    color: 'success.main',
    chipColor: 'success'
  },
  overdue: {
    icon: OverdueIcon,
    color: 'error.main',
    chipColor: 'error'
  },
  pending: {
    icon: PendingIcon,
    color: 'warning.main',
    chipColor: 'warning'
  }
};

export const LOG_SEVERITY_CONFIG: Record<LogSeverity, { icon: any; color: string }> = {
  info: {
    icon: InfoIcon,
    color: 'info.main'
  },
  warning: {
    icon: WarningIcon,
    color: 'warning.main'
  },
  error: {
    icon: ErrorIcon,
    color: 'error.main'
  }
};

export const CARD_CONSTANTS = {
  MAX_HEIGHT: '300px',
  SKELETON_COUNT: 3,
  ICON_SIZE: 20,
  CHIP_HEIGHT: 20
};
