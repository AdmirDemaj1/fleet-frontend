export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  assetName?: string;
}

export interface CustomerBillingAndLogsCardsProps {
  customerId: string;
  recentInvoices: Invoice[];
  recentLogs: LogEntry[];
  onInvoicesClick?: () => void;
  onLogsClick?: () => void;
  invoicesLoading?: boolean;
  invoicesError?: string | null;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue';
export type LogSeverity = 'info' | 'warning' | 'error';
