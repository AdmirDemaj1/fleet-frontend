import React, { useState, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { 
  ContractFormProps, 
  ContractFormData, 
  CreateContractDto,
  ContractType 
} from '../../types/contract.types';

import { CustomerPicker } from '../CustomerPicker/CustomerPicker';
import { VehiclePicker } from '../VehiclePicker/VehiclePicker';
import { EndorserPicker } from '../EndorserPicker/EndorserPicker';
import { LoanForm } from '../LoanForm/LoanForm';

// Steps configuration
const STEPS = [
  { id: 'customer', label: 'Select Customer', description: 'Choose the customer for this contract' },
  { id: 'contract', label: 'Contract Details', description: 'Basic contract information and terms' },
  { id: 'financial', label: 'Financial Details', description: 'Loan or leasing specific terms' },
  { id: 'vehicles', label: 'Vehicles', description: 'Select vehicles for this contract' },
  { id: 'endorsers', label: 'Endorsers', description: 'Add guarantors and endorsers' },
  { id: 'review', label: 'Review & Submit', description: 'Review all details before submission' }
];

export const ContractForm: React.FC<ContractFormProps> = ({
  initialData,
  onSubmit,
  loading,
  preSelectedCustomerId,
  isEdit = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string>('');

  const methods = useForm<ContractFormData>({
    defaultValues: {
      type: ContractType.LOAN,
      contractNumber: '',
      customerId: preSelectedCustomerId || '',
      startDate: '',
      endDate: '',
      totalAmount: 0,
      loanDetails: {
        interestRate: 0,
        loanTermMonths: 0,
        monthlyPayment: 0,
        paymentScheduleType: 'monthly_fixed'
      },
      selectedVehicles: [],
      selectedEndorsers: [],
      collaterals: [],
      endorserCollaterals: [],
      ...initialData
    },
    mode: 'onChange'
  });

  const { 
    watch, 
    setValue, 
    trigger, 
    formState: { errors, isValid },
    handleSubmit
  } = methods;

  const watchedData = watch();

  const handleNext = useCallback(async () => {
    const stepValid = await trigger();
    if (stepValid) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [trigger]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const onFormSubmit = useCallback(async (data: ContractFormData) => {
    try {
      setSubmitError('');
      
      // Transform form data to CreateContractDto
      const submitData: CreateContractDto = {
        type: data.type,
        contractNumber: data.contractNumber,
        customerId: data.customerId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount: data.totalAmount,
        interestRate: data.loanDetails?.interestRate || 0,
        vehicleIds: data.selectedVehicles,
        collaterals: data.collaterals,
        endorserCollaterals: data.endorserCollaterals,
        terms: data.terms
      };

      if (data.type === ContractType.LOAN && data.loanDetails) {
        submitData.loanDetails = {
          type: ContractType.LOAN,
          contractNumber: data.contractNumber,
          customerId: data.customerId,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: data.totalAmount,
          ...data.loanDetails
        };
      }

      await onSubmit(submitData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while creating the contract');
    }
  }, [onSubmit]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Customer Selection
        return (
          <CustomerPicker
            selectedCustomerId={watchedData.customerId}
            onCustomerSelect={(customer) => {
              setValue('customerId', customer?.id || '', { shouldValidate: true });
            }}
            preSelectedCustomerId={preSelectedCustomerId}
            error={errors.customerId?.message}
          />
        );

      case 1: // Contract Details
        return (
          <Grid container spacing={3}>
            {/* Contract type, dates, amount, etc. */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Contract Information
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                This step will contain contract type selection, dates, amounts, and basic terms.
                Implementation can be extended based on your specific requirements.
              </Alert>
            </Grid>
          </Grid>
        );

      case 2: // Financial Details
        return (
          <LoanForm
            data={watchedData.loanDetails}
            onChange={(loanData) => {
              // Only set values if required fields exist
              if (loanData.interestRate !== undefined && 
                  loanData.loanTermMonths !== undefined && 
                  loanData.monthlyPayment !== undefined) {
                setValue('loanDetails', {
                  interestRate: loanData.interestRate,
                  loanTermMonths: loanData.loanTermMonths,
                  monthlyPayment: loanData.monthlyPayment,
                  processingFee: loanData.processingFee,
                  earlyRepaymentPenalty: loanData.earlyRepaymentPenalty,
                  paymentScheduleType: loanData.paymentScheduleType
                }, { shouldValidate: true });
              }
            }}
            errors={errors.loanDetails as Record<string, string>}
            contractType={watchedData.type}
            totalAmount={watchedData.totalAmount}
          />
        );

      case 3: // Vehicles
        return (
          <VehiclePicker
            selectedVehicleIds={watchedData.selectedVehicles}
            onVehicleSelect={(vehicleIds) => {
              setValue('selectedVehicles', vehicleIds, { shouldValidate: true });
            }}
            error={errors.selectedVehicles?.message}
          />
        );

      case 4: // Endorsers
        return (
          <EndorserPicker
            selectedEndorserIds={watchedData.selectedEndorsers}
            onEndorserSelect={(endorserIds) => {
              setValue('selectedEndorsers', endorserIds, { shouldValidate: true });
            }}
            customerId={watchedData.customerId}
            onCreateEndorser={() => {
              // Handle create new endorser
              console.log('Create new endorser');
            }}
            error={errors.selectedEndorsers?.message}
          />
        );

      case 5: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Contract Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Contract Information</Typography>
                    <Typography variant="body2">Type: {watchedData.type}</Typography>
                    <Typography variant="body2">Customer ID: {watchedData.customerId}</Typography>
                    <Typography variant="body2">Total Amount: ${watchedData.totalAmount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Financial Details</Typography>
                    {watchedData.loanDetails && (
                      <>
                        <Typography variant="body2">Interest Rate: {(watchedData.loanDetails.interestRate || 0) * 100}%</Typography>
                        <Typography variant="body2">Term: {watchedData.loanDetails.loanTermMonths} months</Typography>
                        <Typography variant="body2">Monthly Payment: ${watchedData.loanDetails.monthlyPayment}</Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Vehicles ({watchedData.selectedVehicles.length})</Typography>
                    {watchedData.selectedVehicles.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No vehicles selected</Typography>
                    ) : (
                      <Typography variant="body2">{watchedData.selectedVehicles.length} vehicle(s) selected</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Endorsers ({watchedData.selectedEndorsers.length})</Typography>
                    {watchedData.selectedEndorsers.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No endorsers selected</Typography>
                    ) : (
                      <Typography variant="body2">{watchedData.selectedEndorsers.length} endorser(s) selected</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!watchedData.customerId;
      case 1:
        return true; // Basic validation for contract details
      case 2:
        return watchedData.loanDetails?.interestRate && watchedData.loanDetails?.loanTermMonths;
      case 3:
        return true; // Vehicles are optional
      case 4:
        return true; // Endorsers are optional
      default:
        return true;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Edit Contract' : 'Create New Contract'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((step, index) => (
              <Step key={step.id} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
                <StepLabel>
                  <Typography variant="body2">{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400, mb: 3 }}>
            {renderStepContent()}
          </Box>

          {/* Error Display */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              variant="outlined"
            >
              Back
            </Button>

            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {STEPS.length}
            </Typography>

            {activeStep === STEPS.length - 1 ? (
              <Button
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                onClick={handleSubmit(onFormSubmit)}
                disabled={!isValid || loading || !canProceed()}
                variant="contained"
                color="primary"
              >
                {loading ? 'Creating...' : 'Create Contract'}
              </Button>
            ) : (
              <Button
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={!canProceed() || loading}
                variant="contained"
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};
