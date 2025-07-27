import { Chip, alpha, useTheme } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { PAYMENT_STATUS_CONFIG, PAYMENT_TYPE_CONFIG } from '../constants/invoiceConstants';

// Render status cell with chip for invoices
export const renderInvoiceStatusCell = (status: string) => {
  const config = PAYMENT_STATUS_CONFIG[status.toLowerCase()] || {
    icon: <WarningIcon fontSize="small" />,
    color: 'default' as const,
    label: 'Unknown'
  };
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      color={config.color}
      sx={{ minWidth: 90, fontWeight: 500 }}
    />
  );
};

// Render type cell with chip for invoices
export const renderInvoiceTypeCell = (type: string) => {
  const theme = useTheme();
  const config = PAYMENT_TYPE_CONFIG[type?.toLowerCase()];
  
  return (
    <Chip
      label={config?.label || type}
      size="small"
      variant="outlined"
      sx={{ 
        borderRadius: 1,
        bgcolor: alpha(config?.color || theme.palette.primary.main, 0.05),
        borderColor: config?.color || theme.palette.primary.main,
        color: config?.color || theme.palette.primary.main,
        fontWeight: 500
      }}
    />
  );
};
