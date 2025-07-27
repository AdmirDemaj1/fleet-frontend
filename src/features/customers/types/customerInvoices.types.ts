import { ReactElement } from 'react';

// Invoice/Payment types
export type InvoiceOrder = 'asc' | 'desc';
export type InvoiceOrderBy = 'amount' | 'dueDate' | 'paymentDate' | 'status' | 'type' | 'createdAt';

// Invoice status and type
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'monthly' | 'deposit' | 'final' | 'penalty';

// Invoice interface (based on backend PaymentDto)
export interface Invoice {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string | Date;
  paymentDate?: string | Date;
  status: InvoiceStatus;
  type: InvoiceType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
  createdAt: string | Date;
}

// Component props
export interface CustomerAccountInvoicesProps {
  customerId?: string;
}

// Status configuration type
export interface InvoiceStatusConfig {
  icon: ReactElement;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  label: string;
}

// Invoice type configuration
export interface InvoiceTypeConfig {
  label: string;
  color: string;
}

// Notification state
export interface InvoiceNotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Dialog states for invoices
export interface InvoiceDialogStates {
  showNewInvoiceDialog: boolean;
  deleteDialogOpen: boolean;
  invoiceToDelete: string | null;
}

// Menu state for invoices
export interface InvoiceMenuState {
  anchorEl: HTMLElement | null;
  selectedInvoice: Invoice | null;
}
