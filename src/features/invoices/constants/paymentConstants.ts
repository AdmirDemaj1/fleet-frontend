import { 
  CheckCircle, 
  Schedule, 
  Warning, 
  Error,
  Cancel,
  Undo,
  AttachMoney,
  CreditCard,
  AccountBalance,
  Payment as PaymentIcon,
  LocalAtm,
  MoneyOff
} from '@mui/icons-material';
import { PaymentStatus, PaymentType } from '../types/invoice.types';

export const PAYMENT_STATUS_CONFIG = {
  [PaymentStatus.PENDING]: {
    label: 'Pending',
    color: 'warning.main',
    bgcolor: 'warning.light',
    icon: Schedule,
    textColor: 'warning.dark'
  },
  [PaymentStatus.PAID]: {
    label: 'Paid',
    color: 'success.main',
    bgcolor: 'success.light',
    icon: CheckCircle,
    textColor: 'success.dark'
  },
  [PaymentStatus.OVERDUE]: {
    label: 'Overdue',
    color: 'error.main',
    bgcolor: 'error.light',
    icon: Warning,
    textColor: 'error.dark'
  },
  [PaymentStatus.PARTIAL]: {
    label: 'Partial',
    color: 'info.main',
    bgcolor: 'info.light',
    icon: AttachMoney,
    textColor: 'info.dark'
  },
  [PaymentStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'grey.main',
    bgcolor: 'grey.light',
    icon: Cancel,
    textColor: 'grey.dark'
  },
  [PaymentStatus.REFUNDED]: {
    label: 'Refunded',
    color: 'secondary.main',
    bgcolor: 'secondary.light',
    icon: Undo,
    textColor: 'secondary.dark'
  }
};

export const PAYMENT_TYPE_CONFIG = {
  [PaymentType.SCHEDULED]: {
    label: 'Scheduled',
    color: 'primary.main',
    icon: Schedule,
    description: 'Regular scheduled payment'
  },
  [PaymentType.MANUAL]: {
    label: 'Manual',
    color: 'info.main',
    icon: PaymentIcon,
    description: 'Manually processed payment'
  },
  [PaymentType.LATE_FEE]: {
    label: 'Late Fee',
    color: 'warning.main',
    icon: Warning,
    description: 'Late payment fee'
  },
  [PaymentType.PENALTY]: {
    label: 'Penalty',
    color: 'error.main',
    icon: Error,
    description: 'Penalty charge'
  },
  [PaymentType.REFUND]: {
    label: 'Refund',
    color: 'secondary.main',
    icon: Undo,
    description: 'Refund payment'
  },
  [PaymentType.ADVANCE]: {
    label: 'Advance',
    color: 'success.main',
    icon: AttachMoney,
    description: 'Advance payment'
  }
};

export const PAYMENT_METHODS = [
  {
    value: 'cash',
    label: 'Cash',
    icon: LocalAtm,
    color: 'success.main'
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: AccountBalance,
    color: 'primary.main'
  },
  {
    value: 'online_banking',
    label: 'Online Banking',
    icon: AccountBalance,
    color: 'info.main'
  },
  {
    value: 'credit_card',
    label: 'Credit Card',
    icon: CreditCard,
    color: 'warning.main'
  },
  {
    value: 'debit_card',
    label: 'Debit Card',
    icon: CreditCard,
    color: 'secondary.main'
  },
  {
    value: 'check',
    label: 'Check',
    icon: PaymentIcon,
    color: 'grey.main'
  },
  {
    value: 'other',
    label: 'Other',
    icon: MoneyOff,
    color: 'text.secondary'
  }
];

export const PAYMENT_FILTER_OPTIONS = {
  status: [
    { value: '', label: 'All Statuses' },
    { value: PaymentStatus.PENDING, label: 'Pending' },
    { value: PaymentStatus.PAID, label: 'Paid' },
    { value: PaymentStatus.OVERDUE, label: 'Overdue' },
    { value: PaymentStatus.PARTIAL, label: 'Partial' },
    { value: PaymentStatus.CANCELLED, label: 'Cancelled' },
    { value: PaymentStatus.REFUNDED, label: 'Refunded' }
  ],
  type: [
    { value: '', label: 'All Types' },
    { value: PaymentType.SCHEDULED, label: 'Scheduled' },
    { value: PaymentType.MANUAL, label: 'Manual' },
    { value: PaymentType.LATE_FEE, label: 'Late Fee' },
    { value: PaymentType.PENALTY, label: 'Penalty' },
    { value: PaymentType.REFUND, label: 'Refund' },
    { value: PaymentType.ADVANCE, label: 'Advance' }
  ],
  paymentMethod: [
    { value: '', label: 'All Methods' },
    ...PAYMENT_METHODS.map(method => ({
      value: method.value,
      label: method.label
    }))
  ]
};

export const PAYMENTS_TABLE_COLUMNS = [
  { id: 'id', label: 'Payment ID', sortable: true, width: 120 },
  { id: 'amount', label: 'Amount', sortable: true, width: 120 },
  { id: 'dueDate', label: 'Due Date', sortable: true, width: 120 },
  { id: 'paymentDate', label: 'Payment Date', sortable: true, width: 120 },
  { id: 'status', label: 'Status', sortable: true, width: 100 },
  { id: 'type', label: 'Type', sortable: true, width: 100 },
  { id: 'paymentMethod', label: 'Method', sortable: false, width: 120 },
  { id: 'customerName', label: 'Customer', sortable: true, width: 150 },
  { id: 'contractNumber', label: 'Contract', sortable: true, width: 120 },
  { id: 'actions', label: 'Actions', sortable: false, width: 100 }
];

export const DEFAULT_PAGINATION = {
  page: 0,
  rowsPerPage: 25,
  rowsPerPageOptions: [10, 25, 50, 100]
};

export const PAYMENT_FORM_VALIDATION = {
  amount: {
    required: 'Amount is required',
    min: 'Amount must be greater than 0'
  },
  dueDate: {
    required: 'Due date is required'
  },
  type: {
    required: 'Payment type is required'
  },
  contractId: {
    required: 'Contract is required'
  }
};
