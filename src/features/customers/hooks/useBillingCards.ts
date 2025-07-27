import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { getStatusIcon, getStatusColor, getSeverityIcon, formatInvoiceId } from '../utils/billingCardsUtils';
import { InvoiceStatus, LogSeverity } from '../types/customerBillingCards.types';

export const useBillingCards = (customerId: string, onInvoicesClick?: () => void, onLogsClick?: () => void) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleInvoicesClick = useCallback(() => {
    if (onInvoicesClick) {
      onInvoicesClick();
    } else {
      navigate(`/customers/${customerId}/invoices`);
    }
  }, [customerId, navigate, onInvoicesClick]);

  const handleLogsClick = useCallback(() => {
    if (onLogsClick) {
      onLogsClick();
    } else {
      navigate(`/customers/${customerId}/logs`);
    }
  }, [customerId, navigate, onLogsClick]);

  const getInvoiceStatusIcon = useCallback((status: InvoiceStatus) => {
    return getStatusIcon(status, theme);
  }, [theme]);

  const getInvoiceStatusColor = useCallback((status: InvoiceStatus) => {
    return getStatusColor(status);
  }, []);

  const getLogSeverityIcon = useCallback((severity: LogSeverity) => {
    return getSeverityIcon(severity, theme);
  }, [theme]);

  const formatInvoiceNumber = useCallback((id: string) => {
    return formatInvoiceId(id);
  }, []);

  return {
    theme,
    handleInvoicesClick,
    handleLogsClick,
    getInvoiceStatusIcon,
    getInvoiceStatusColor,
    getLogSeverityIcon,
    formatInvoiceNumber
  };
};
