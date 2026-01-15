import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  TrendingUp,
  Percent,
} from '@mui/icons-material';
import { useUpdateEuriborRateMutation } from '../api/contractApi';
import { useNotification } from '../../../shared/hooks/useNotification';
import { euriborApi } from '../../euribor/api/euriborApi';
import { EuriborTenor } from '../../euribor/types/euribor.types';
import { EuriborRate } from '../../euribor/types/euribor.types';
import dayjs from 'dayjs';

interface UpdateEuriborRateDialogProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
  currentEuriborRate?: number;
  currentMargin?: number;
}

export const UpdateEuriborRateDialog: React.FC<UpdateEuriborRateDialogProps> = ({
  open,
  onClose,
  contractId,
  currentEuriborRate,
  currentMargin,
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [selectedEuriborRateId, setSelectedEuriborRateId] = useState<string>('');
  const [availableEuriborRates, setAvailableEuriborRates] = useState<EuriborRate[]>([]);
  const [loadingEuriborRates, setLoadingEuriborRates] = useState<boolean>(false);
  const [margin, setMargin] = useState<string>('');
  const [errors, setErrors] = useState<{ euriborRate?: string; margin?: string }>({});

  const [updateEuriborRate, { isLoading }] = useUpdateEuriborRateMutation();

  // Fetch available Euribor rates when dialog opens
  useEffect(() => {
    const fetchAvailableEuriborRates = async () => {
      if (open) {
        setLoadingEuriborRates(true);
        try {
          const response = await euriborApi.getAll({
            tenor: EuriborTenor.TWELVE_MONTHS,
            isActive: true,
            limit: 100,
          });
          const rates = response.data || [];
          setAvailableEuriborRates(rates);
          console.log('📊 Available Euribor rates for selection:', rates.length);
        } catch (error) {
          console.error('❌ Error fetching available Euribor rates:', error);
          showError('Failed to load Euribor rates. Please try again.');
        } finally {
          setLoadingEuriborRates(false);
        }
      }
    };

    fetchAvailableEuriborRates();
  }, [open, showError]);

  // Initialize form with current values when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedEuriborRateId('');
      setMargin(currentMargin?.toString() || '');
      setErrors({});
    }
  }, [open, currentMargin]);

  const validateForm = (): boolean => {
    const newErrors: { euriborRate?: string; margin?: string } = {};

    // Validate Euribor rate selection
    if (!selectedEuriborRateId || selectedEuriborRateId.trim() === '') {
      newErrors.euriborRate = 'Please select a Euribor rate';
    } else {
      const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
      if (!selectedRate) {
        newErrors.euriborRate = 'Selected rate not found';
      }
    }

    // Validate margin (optional)
    if (margin && margin.trim() !== '') {
      const marginValue = parseFloat(margin);
      if (isNaN(marginValue)) {
        newErrors.margin = 'Please enter a valid number';
      } else if (marginValue < 0) {
        newErrors.margin = 'Margin must be greater than or equal to 0';
      } else if (marginValue > 1) {
        // If > 1, assume it's percentage format and convert
        // We'll handle this in handleSubmit
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
      if (!selectedRate) {
        showError('Selected Euribor rate not found');
        return;
      }

      const updateData: any = {
        euriborRateId: selectedEuriborRateId, // Send the rate ID instead of the rate value
      };

      // Only include margin if provided
      if (margin && margin.trim() !== '') {
        let marginValue = parseFloat(margin);
        // If margin > 1, assume it's percentage format and convert to decimal
        if (marginValue > 1) {
          marginValue = marginValue / 100;
        }
        updateData.margin = marginValue;
      }

      console.log('🔄 Updating Euribor rate with:', {
        euriborRateId: updateData.euriborRateId,
        margin: updateData.margin,
        selectedRateValue: selectedRate.rateValue,
        selectedRateDate: selectedRate.rateDate,
      });

      await updateEuriborRate({
        contractId,
        data: updateData,
      }).unwrap();

      showSuccess('Euribor rate updated successfully');
      handleClose();
    } catch (error: any) {
      console.error('Error updating Euribor rate:', error);
      showError(
        error?.data?.message ||
        error?.message ||
        'Failed to update Euribor rate. Please try again.'
      );
    }
  };

  const handleClose = () => {
    setSelectedEuriborRateId('');
    setMargin('');
    setErrors({});
    onClose();
  };

  const selectedRate = availableEuriborRates.find(r => r.id === selectedEuriborRateId);
  const isFormValid = selectedEuriborRateId && !errors.euriborRate && !errors.margin;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: 'info.main',
              width: 40,
              height: 40,
            }}
          >
            <TrendingUp />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Update Euribor Rate
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update the Euribor rate for this contract. This will recalculate the amortization schedule with the new rate.
        </Typography>

        {currentEuriborRate !== undefined && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Current Euribor Rate:</strong> {(currentEuriborRate * 100).toFixed(4)}%
              {currentMargin !== undefined && (
                <> | <strong>Current Margin:</strong> {(currentMargin * 100).toFixed(2)}%</>
              )}
            </Typography>
          </Alert>
        )}

        <FormControl fullWidth error={!!errors.euriborRate} required sx={{ mb: 3 }}>
          <InputLabel id="euribor-rate-select-label">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" />
              New Euribor Rate
            </Box>
          </InputLabel>
          <Select
            labelId="euribor-rate-select-label"
            value={selectedEuriborRateId}
            onChange={(e) => {
              setSelectedEuriborRateId(e.target.value);
              if (errors.euriborRate) {
                setErrors({ ...errors, euriborRate: undefined });
              }
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                New Euribor Rate
              </Box>
            }
            disabled={loadingEuriborRates}
            renderValue={(value) => {
              if (loadingEuriborRates) {
                return 'Loading rates...';
              }
              if (!value) {
                return 'Select Euribor Rate';
              }
              const rate = availableEuriborRates.find(r => r.id === value);
              if (rate) {
                return `${(rate.rateValue * 100).toFixed(4)}% (${dayjs(rate.rateDate).format('MMM DD, YYYY')})`;
              }
              return 'Select Euribor Rate';
            }}
          >
            {loadingEuriborRates ? (
              <MenuItem disabled value="">
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Loading rates...
              </MenuItem>
            ) : availableEuriborRates.length === 0 ? (
              <MenuItem disabled value="">
                No Euribor rates available
              </MenuItem>
            ) : (
              availableEuriborRates.map((rate) => (
                <MenuItem key={rate.id} value={rate.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {(rate.rateValue * 100).toFixed(4)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(rate.rateDate).format('MMM DD, YYYY')}
                      {rate.rateSource && ` • ${rate.rateSource}`}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
          <FormHelperText>
            {errors.euriborRate ||
              (selectedRate
                ? `Selected rate: ${(selectedRate.rateValue * 100).toFixed(4)}% from ${dayjs(selectedRate.rateDate).format('MMM DD, YYYY')}`
                : 'Select a 12-month Euribor rate to apply')}
          </FormHelperText>
        </FormControl>

        <TextField
          fullWidth
          label="Margin (Optional)"
          type="number"
          value={margin}
          onChange={(e) => {
            setMargin(e.target.value);
            if (errors.margin) {
              setErrors({ ...errors, margin: undefined });
            }
          }}
          placeholder="0.03"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Percent sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            inputProps: {
              step: '0.01',
              min: 0,
            },
          }}
          sx={{ mb: 2 }}
          error={!!errors.margin}
          helperText={
            errors.margin ||
            'Enter the margin as a decimal (e.g., 0.03 for 3%). Leave empty to keep current margin.'
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !isFormValid}
          startIcon={isLoading ? <CircularProgress size={16} /> : <TrendingUp />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: 'info.main',
            '&:hover': {
              bgcolor: 'info.dark',
            },
          }}
        >
          {isLoading ? 'Updating...' : 'Update Rate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

