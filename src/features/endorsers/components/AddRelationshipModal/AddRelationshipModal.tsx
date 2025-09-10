import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Business,
  Close,
  Save,
  AttachMoney,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { CustomerPicker } from '../../../contracts/components/CreateContractComponents/CustomerPicker/CustomerPicker';
import { CustomerSummary } from '../../../contracts/types/contract.types';
import { 
  CreateEndorserRelationshipDto, 
  RELATIONSHIP_TYPES, 
  RelationshipType 
} from '../../types/endorser.types';
import { useCreateEndorserRelationshipMutation } from '../../api/endorserApi';

interface AddRelationshipModalProps {
  open: boolean;
  onClose: () => void;
  endorserId: string;
  onSuccess?: () => void;
}

interface FormData {
  customerId: string;
  relationshipType: RelationshipType;
  endorsementDate: Dayjs | null;
  expirationDate: Dayjs | null;
  maximumGuaranteeAmount: number;
  guaranteeScope: string;
  notificationRequired: boolean;
  maxSingleTransaction: number;
  renewalRequired: boolean;
  specialConditions: string;
  notes: string;
}

export const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
  open,
  onClose,
  endorserId,
  onSuccess,
}) => {
  const theme = useTheme();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [createRelationship, { isLoading, error: apiError }] = useCreateEndorserRelationshipMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      customerId: '',
      relationshipType: 'Business Partner',
      endorsementDate: dayjs().add(1, 'day'),
      expirationDate: dayjs().add(2, 'year'),
      maximumGuaranteeAmount: 50000,
      guaranteeScope: 'Vehicle loans only',
      notificationRequired: true,
      maxSingleTransaction: 25000,
      renewalRequired: true,
      specialConditions: '',
      notes: '',
    },
    mode: 'onChange',
  });

  const handleClose = useCallback(() => {
    reset();
    setSelectedCustomer(null);
    onClose();
  }, [onClose, reset]);

  const handleCustomerSelect = useCallback((customer: CustomerSummary | null) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer?.id || '', { shouldValidate: true });
  }, [setValue]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const relationshipData: CreateEndorserRelationshipDto = {
        customerId: data.customerId,
        endorserId,
        endorsementDate: data.endorsementDate?.format('YYYY-MM-DD') || '',
        expirationDate: data.expirationDate?.format('YYYY-MM-DD') || '',
        maximumGuaranteeAmount: data.maximumGuaranteeAmount,
        relationshipType: data.relationshipType,
        terms: {
          guaranteeScope: data.guaranteeScope,
          notificationRequired: data.notificationRequired,
          maxSingleTransaction: data.maxSingleTransaction,
          renewalRequired: data.renewalRequired,
          specialConditions: data.specialConditions || undefined,
        },
        notes: data.notes || undefined,
        active: true,
      };

      await createRelationship(relationshipData).unwrap();
      
      // Show success and close modal
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  }, [createRelationship, endorserId, onSuccess, handleClose]);

  const getRelationshipIcon = (type: string) => {
    return type.toLowerCase().includes('business') ? <Business /> : <Person />;
  };

  const getRelationshipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'spouse':
        return theme.palette.error.main;
      case 'parent':
        return theme.palette.warning.main;
      case 'child':
        return theme.palette.info.main;
      case 'sibling':
        return theme.palette.success.main;
      case 'business partner':
        return theme.palette.secondary.main;
      case 'friend':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Customer Relationship
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          size="small"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {(apiError as any)?.data?.message || 'Failed to create relationship. Please try again.'}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Customer Selection */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Business sx={{ fontSize: 20 }} />
                  Select Customer
                </Typography>
                <Controller
                  name="customerId"
                  control={control}
                  rules={{ required: 'Please select a customer' }}
                  render={({ field, fieldState }) => (
                    <CustomerPicker
                      selectedCustomerId={field.value}
                      onCustomerSelect={handleCustomerSelect}
                      error={fieldState.error?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>

              {/* Relationship Type and Dates */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="relationshipType"
                  control={control}
                  rules={{ required: 'Please select a relationship type' }}
                  render={({ field, fieldState }) => (
                    <FormControl 
                      fullWidth 
                      error={!!fieldState.error}
                      disabled={isLoading}
                    >
                      <InputLabel>Relationship Type</InputLabel>
                      <Select
                        {...field}
                        label="Relationship Type"
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          },
                        }}
                      >
                        {RELATIONSHIP_TYPES.map((type) => (
                          <MenuItem 
                            key={type} 
                            value={type}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getRelationshipColor(type),
                                mr: 1,
                              }}
                            />
                            {getRelationshipIcon(type)}
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>{fieldState.error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="endorsementDate"
                  control={control}
                  rules={{ required: 'Please select an endorsement date' }}
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Endorsement Date"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      disabled={isLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="expirationDate"
                  control={control}
                  rules={{ required: 'Please select an expiration date' }}
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Expiration Date"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      disabled={isLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Financial Terms */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="maximumGuaranteeAmount"
                  control={control}
                  rules={{ 
                    required: 'Please enter maximum guarantee amount',
                    min: { value: 1, message: 'Amount must be greater than 0' }
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Maximum Guarantee Amount"
                      type="number"
                      disabled={isLoading}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="maxSingleTransaction"
                  control={control}
                  rules={{ 
                    required: 'Please enter max single transaction amount',
                    min: { value: 1, message: 'Amount must be greater than 0' }
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Max Single Transaction"
                      type="number"
                      disabled={isLoading}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Terms */}
              <Grid item xs={12}>
                <Controller
                  name="guaranteeScope"
                  control={control}
                  rules={{ required: 'Please enter guarantee scope' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Guarantee Scope"
                      placeholder="e.g., Vehicle loans only"
                      disabled={isLoading}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || 'What types of transactions are covered'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="notificationRequired"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label="Notification Required"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="renewalRequired"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={isLoading}
                        />
                      }
                      label="Renewal Required"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="specialConditions"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Special Conditions"
                      placeholder="e.g., Endorser must approve any loan over $30,000"
                      multiline
                      rows={2}
                      disabled={isLoading}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || 'Any special conditions or requirements'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      placeholder="Additional notes about this relationship..."
                      multiline
                      rows={3}
                      disabled={isLoading}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Preview Card */}
            {selectedCustomer && (
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  mt: 3,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Relationship Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedCustomer.type === 'business' ? <Business /> : <Person />}
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedCustomer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({selectedCustomer.type})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={!isValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
          sx={{ 
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 120,
          }}
        >
          {isLoading ? 'Creating...' : 'Create Relationship'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
