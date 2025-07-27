import { INVOICE_STATUS_CONFIG, LOG_SEVERITY_CONFIG } from '../constants/billingCardsConstants';
import { InvoiceStatus, LogSeverity } from '../types/customerBillingCards.types';

export const getStatusIcon = (status: InvoiceStatus, theme: any) => {
  const config = INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.pending;
  const IconComponent = config.icon;
  return <IconComponent fontSize="small" sx={{ color: theme.palette[config.color.split('.')[0]][config.color.split('.')[1]] }} />;
};

export const getStatusColor = (status: InvoiceStatus): string => {
  return INVOICE_STATUS_CONFIG[status]?.chipColor || 'default';
};

export const getSeverityIcon = (severity: LogSeverity, theme: any) => {
  const config = LOG_SEVERITY_CONFIG[severity] || LOG_SEVERITY_CONFIG.info;
  const IconComponent = config.icon;
  return <IconComponent fontSize="small" sx={{ color: theme.palette[config.color.split('.')[0]][config.color.split('.')[1]] }} />;
};

export const formatInvoiceId = (id: string): string => {
  return `INV-${id.split('-')[0].toUpperCase()}`;
};
