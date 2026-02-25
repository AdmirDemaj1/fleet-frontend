import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close,
  AddCircle,
  Edit,
  SwapHoriz,
  AccountBalance,
  TrendingUp,
  Schedule,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useGetPaymentHistoryQuery } from '../api/paymentsApi';
import { PaymentHistoryEntry, PaymentHistoryEventType } from '../types/invoice.types';

interface PaymentHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
}

const EVENT_CONFIG: Record<PaymentHistoryEventType, { icon: React.ElementType; color: string; label: string }> = {
  entity_created: { icon: AddCircle, color: '#4caf50', label: 'Created' },
  entity_updated: { icon: Edit, color: '#ff9800', label: 'Updated' },
  status_changed: { icon: SwapHoriz, color: '#2196f3', label: 'Status Changed' },
  prepayment_applied: { icon: AccountBalance, color: '#9c27b0', label: 'Prepayment Applied' },
  euribor_rate_changed: { icon: TrendingUp, color: '#009688', label: 'Euribor Rate Changed' },
  schedule_changed: { icon: Schedule, color: '#757575', label: 'Schedule Changed' },
};

function camelToReadable(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function formatCurrency(value: unknown): string {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : NaN;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num);
}

function formatPercent(value: unknown): string {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : NaN;
  if (isNaN(num)) return String(value);
  return `${(num * 100).toFixed(3)}%`;
}

function formatOptionLabel(value: unknown): string {
  const str = String(value);
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(ts: string): string {
  try {
    return format(new Date(ts), 'MMM dd, yyyy HH:mm:ss');
  } catch {
    return ts;
  }
}

const EventDetails: React.FC<{ entry: PaymentHistoryEntry }> = ({ entry }) => {
  const theme = useTheme();

  if (entry.eventType === 'entity_created' && entry.newValues) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Initial Values
        </Typography>
        {Object.entries(entry.newValues).map(([key, val]) => (
          <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
              {camelToReadable(key)}:
            </Typography>
            <Typography variant="caption" fontWeight={500}>{formatValue(val)}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (entry.eventType === 'entity_updated' && (entry.oldValues || entry.newValues)) {
    const keys = new Set([
      ...Object.keys(entry.oldValues || {}),
      ...Object.keys(entry.newValues || {}),
    ]);
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Changes
        </Typography>
        {Array.from(keys).map((key) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
              {camelToReadable(key)}:
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.error.main, textDecoration: 'line-through' }}>
              {formatValue(entry.oldValues?.[key])}
            </Typography>
            <Typography variant="caption" color="text.secondary">→</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
              {formatValue(entry.newValues?.[key])}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  if (entry.eventType === 'status_changed') {
    const oldStatus = entry.oldValues?.status as string | undefined;
    const newStatus = entry.newValues?.status as string | undefined;
    return (
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        {oldStatus && (
          <Chip label={oldStatus} size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, fontSize: '0.7rem' }} />
        )}
        <Typography variant="caption" color="text.secondary">→</Typography>
        {newStatus && (
          <Chip label={newStatus} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontSize: '0.7rem' }} />
        )}
      </Box>
    );
  }

  if (entry.eventType === 'prepayment_applied' && entry.metadata) {
    const meta = entry.metadata;
    const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
      <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>{label}:</Typography>
        <Typography variant="caption" fontWeight={500}>{value}</Typography>
      </Box>
    );
    return (
      <Box sx={{ mt: 1 }}>
        {meta.prepaymentAmount != null && (
          <DetailRow label="Prepayment Amount" value={formatCurrency(meta.prepaymentAmount)} />
        )}
        {meta.option != null && (
          <DetailRow label="Option" value={formatOptionLabel(meta.option)} />
        )}
        {meta.remainingLoanAmount != null && (
          <DetailRow label="Remaining Loan Amount" value={formatCurrency(meta.remainingLoanAmount)} />
        )}
        {meta.oldMonthlyPayment != null && meta.monthlyPaymentAmount != null && (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>Monthly Payment:</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.error.main, textDecoration: 'line-through' }}>
              {formatCurrency(meta.oldMonthlyPayment)}
            </Typography>
            <Typography variant="caption" color="text.secondary">→</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
              {formatCurrency(meta.monthlyPaymentAmount)}
            </Typography>
          </Box>
        )}
        {meta.oldTermMonths != null && meta.newTermMonths != null && (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>Term (months):</Typography>
            {meta.oldTermMonths !== meta.newTermMonths ? (
              <>
                <Typography variant="caption" sx={{ color: theme.palette.error.main, textDecoration: 'line-through' }}>
                  {formatValue(meta.oldTermMonths)}
                </Typography>
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                  {formatValue(meta.newTermMonths)}
                </Typography>
              </>
            ) : (
              <Typography variant="caption" fontWeight={500}>{formatValue(meta.newTermMonths)}</Typography>
            )}
          </Box>
        )}
        {meta.interestRate != null && (
          <DetailRow label="Interest Rate" value={formatPercent(meta.interestRate)} />
        )}
        {meta.euriborRate != null && (
          <DetailRow label="Euribor Rate" value={formatPercent(meta.euriborRate)} />
        )}
        {meta.margin != null && (
          <DetailRow label="Margin" value={formatPercent(meta.margin)} />
        )}
        {meta.effectiveDate != null && (
          <DetailRow label="Effective Date" value={(() => {
            try { return format(new Date(String(meta.effectiveDate)), 'MMM dd, yyyy'); } catch { return String(meta.effectiveDate); }
          })()} />
        )}
        {meta.versionNumber != null && (
          <DetailRow label="Version" value={`#${formatValue(meta.versionNumber)}`} />
        )}
      </Box>
    );
  }

  if (entry.eventType === 'euribor_rate_changed' && entry.metadata) {
    const meta = entry.metadata;
    return (
      <Box sx={{ mt: 1 }}>
        {(meta.oldRate != null || meta.newRate != null) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>Euribor Rate:</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.error.main, textDecoration: 'line-through' }}>
              {meta.oldRate != null ? formatPercent(meta.oldRate) : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">→</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
              {meta.newRate != null ? formatPercent(meta.newRate) : '-'}
            </Typography>
          </Box>
        )}
        {meta.interestRate != null && (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>Interest Rate:</Typography>
            <Typography variant="caption" fontWeight={500}>{formatPercent(meta.interestRate)}</Typography>
          </Box>
        )}
        {meta.margin != null && (
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 180 }}>Margin:</Typography>
            <Typography variant="caption" fontWeight={500}>{formatPercent(meta.margin)}</Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (entry.eventType === 'schedule_changed' && entry.metadata) {
    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(entry.metadata).map(([key, val]) => (
          <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
              {camelToReadable(key)}:
            </Typography>
            <Typography variant="caption" fontWeight={500}>{formatValue(val)}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

const TimelineEvent: React.FC<{ entry: PaymentHistoryEntry; isLast: boolean }> = ({ entry, isLast }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[entry.eventType] || EVENT_CONFIG.entity_updated;
  const Icon = config.icon;

  const hasDetails =
    entry.oldValues || entry.newValues || entry.metadata;

  return (
    <Box sx={{ display: 'flex', gap: 2, position: 'relative', pb: isLast ? 0 : 3 }}>
      {/* Vertical line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 40,
            bottom: 0,
            borderLeft: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
          }}
        />
      )}

      {/* Icon */}
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(config.color, 0.12),
          color: config.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Chip
              label={config.label}
              size="small"
              sx={{
                bgcolor: alpha(config.color, 0.1),
                color: config.color,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
            {hasDetails && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ p: 0.25 }}>
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
            {formatTimestamp(entry.timestamp)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 0.5, color: theme.palette.text.primary }}>
          {entry.description}
        </Typography>

        {entry.userId && (
          <Typography variant="caption" color="text.secondary">
            By: {entry.userId}
          </Typography>
        )}

        {hasDetails && (
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.default, 0.7),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <EventDetails entry={entry} />
            </Box>
          </Collapse>
        )}
      </Box>
    </Box>
  );
};

export const PaymentHistoryDialog: React.FC<PaymentHistoryDialogProps> = ({ open, onClose, paymentId }) => {

  const { data, isLoading, isError, error } = useGetPaymentHistoryQuery(paymentId, {
    skip: !open,
  });

  const sortedHistory = useMemo(() => {
    if (!data?.history) return [];
    return [...data.history].reverse();
  }, [data?.history]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '80vh' },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Payment History
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error ? String((error as any)?.data?.message || error) : 'Failed to load payment history'}
          </Alert>
        )}

        {!isLoading && !isError && sortedHistory.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No history available for this payment.</Typography>
          </Box>
        )}

        {!isLoading && !isError && sortedHistory.length > 0 && (
          <Box sx={{ py: 1 }}>
            {sortedHistory.map((entry, index) => (
              <TimelineEvent
                key={`${entry.timestamp}-${index}`}
                entry={entry}
                isLast={index === sortedHistory.length - 1}
              />
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
