import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { usePenaltyCalculator } from '../../hooks/usePenaltyCalculator';
import { Payment } from '../../types/invoice.types';

interface PenaltyCalculatorProps {
  payment: Payment;
  onClose?: () => void;
}

type CalculationMode = 'today' | 'days' | 'date';

/**
 * PenaltyCalculator Component
 * 
 * Allows users to preview late payment penalties for different scenarios:
 * - Calculate to today
 * - Calculate for specific number of days late
 * - Calculate to a specific date
 * 
 * @example
 * ```tsx
 * <PenaltyCalculator payment={payment} />
 * ```
 */
export const PenaltyCalculator: React.FC<PenaltyCalculatorProps> = ({
  payment,
  onClose,
}) => {
  const { calculatePenalties, result, isLoading, error, clearResult } =
    usePenaltyCalculator();

  const [mode, setMode] = useState<CalculationMode>('today');
  const [daysLate, setDaysLate] = useState<string>('30');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const handleCalculate = async () => {
    clearResult();

    switch (mode) {
      case 'today':
        await calculatePenalties(payment.id);
        break;
      case 'days':
        const days = parseInt(daysLate, 10);
        if (days > 0) {
          await calculatePenalties(payment.id, { daysLate: days });
        }
        break;
      case 'date':
        if (customEndDate) {
          await calculatePenalties(payment.id, { customEndDate });
        }
        break;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const isCalculateDisabled = (): boolean => {
    if (mode === 'days') {
      const days = parseInt(daysLate, 10);
      return isNaN(days) || days <= 0;
    }
    if (mode === 'date') {
      return !customEndDate;
    }
    return false;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Late Payment Penalty Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preview what penalties would be applied for late payment
          </Typography>
        </Box>

        {/* Payment Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Payment Amount
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {formatCurrency(Number(payment.amount))}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {formatDate(String(payment.dueDate))}
              </Typography>
            </Grid>
            {payment.latePenaltyRatePerDay && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Daily Penalty Rate
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatPercentage(Number(payment.latePenaltyRatePerDay))}
                </Typography>
              </Grid>
            )}
            {payment.paidAmount && Number(payment.paidAmount) > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Already Paid
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(Number(payment.paidAmount))}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Calculation Mode Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Calculate Penalties
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_e, newMode) => {
              if (newMode !== null) {
                setMode(newMode);
                clearResult();
              }
            }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="today">To Today</ToggleButton>
            <ToggleButton value="days">By Days</ToggleButton>
            <ToggleButton value="date">To Date</ToggleButton>
          </ToggleButtonGroup>

          {/* Days Input */}
          {mode === 'days' && (
            <TextField
              fullWidth
              type="number"
              label="Number of Days Late"
              value={daysLate}
              onChange={(e) => setDaysLate(e.target.value)}
              inputProps={{ min: 1 }}
              size="small"
            />
          )}

          {/* Date Input */}
          {mode === 'date' && (
            <TextField
              fullWidth
              type="date"
              label="Calculate To Date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          )}
        </Box>

        {/* Calculate Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
          onClick={handleCalculate}
          disabled={isLoading || isCalculateDisabled()}
          sx={{ mb: 3 }}
        >
          {isLoading ? 'Calculating...' : 'Calculate Penalties'}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <Box>
            <Divider sx={{ mb: 3 }} />

            {/* Warning if penalties are disabled */}
            {!result.penaltiesEnabled && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                {result.note}
              </Alert>
            )}

            {/* Summary */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Penalty Calculation Summary
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Calculation Period
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(result.dueDate)} → {formatDate(result.calculationEndDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Days Late
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {result.daysLate} days
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining Due
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(result.remainingDue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Daily Rate
                  </Typography>
                  <Typography variant="body2">
                    {formatPercentage(result.dailyPenaltyRate)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Total Amount Due */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'error.light',
                borderColor: 'error.main',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="error.dark">
                    Total Penalty
                  </Typography>
                  <Typography variant="h6" color="error.dark" fontWeight="bold">
                    {formatCurrency(result.totalPenalty)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="error.dark">
                    Total Amount Due
                  </Typography>
                  <Typography variant="h6" color="error.dark" fontWeight="bold">
                    {formatCurrency(result.totalAmountDue)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Daily Breakdown Toggle */}
            <Box sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                endIcon={showBreakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                {showBreakdown ? 'Hide' : 'Show'} Daily Breakdown
              </Button>
            </Box>

            {/* Daily Breakdown Table */}
            <Collapse in={showBreakdown}>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Base Amount</TableCell>
                      <TableCell align="right">Daily Penalty</TableCell>
                      <TableCell align="right">Cumulative</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.dailyBreakdown.map((day) => (
                      <TableRow key={day.day}>
                        <TableCell>{day.day}</TableCell>
                        <TableCell>{formatDate(day.date)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(day.baseAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(day.penaltyAmount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                          {formatCurrency(day.cumulativePenalty)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        )}

        {/* Close Button */}
        {onClose && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
