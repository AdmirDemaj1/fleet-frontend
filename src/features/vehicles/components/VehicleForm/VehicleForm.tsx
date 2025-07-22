import React, { useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { 
  Box, 
  Button, 
  Divider, 
  Grid, 
  Typography, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Fade
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Vehicle, VehicleStatus } from '../../types/vehicleType';
import { BasicInfoStep } from '../Steps/BasicInfoStep';
import { DetailsStep } from '../Steps/DetailsStep';
import { DocumentationStep } from '../Steps/DocumentationStep';
import { 
  createVehicleValidationSchema, 
  STEP_FIELDS, 
  REQUIRED_FIELDS, 
  STEP_CONFIG 
} from '../../utils/vehicleFormValidation';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => Promise<void>;
  loading: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
  isEdit?: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  loading,
  activeStep,
  onStepChange,
  steps,
  isEdit = false
}) => {
  const validationSchema = useMemo(() => createVehicleValidationSchema(), []);
  
  const methods = useForm<Partial<Vehicle>>({
    defaultValues: {
      licensePlate: '',
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      status: VehicleStatus.AVAILABLE,
      mileage: null,
      fuelType: '',
      transmission: '',
      condition: '',
      legalOwner: '',
      isLiquidAsset: false,
      purchaseDate: null,
      purchasePrice: null,
      registrationDate: null,
      registrationExpiryDate: null,
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpiryDate: null,
      currentValuation: null,
      marketValue: null,
      depreciatedValue: null,
      ...initialData
    },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const { 
    handleSubmit, 
    formState: { errors, isValid, touchedFields }, 
    trigger, 
    getValues,
    reset
  } = methods;

  // Get step-specific validation fields
  const getStepFields = useCallback((step: number) => {
    switch (step) {
      case 0: return STEP_FIELDS.BASIC_INFO;
      case 1: return STEP_FIELDS.DETAILS;
      case 2: return STEP_FIELDS.DOCUMENTATION;
      default: return [];
    }
  }, []);

  // Get required fields for each step
  const getRequiredFields = useCallback((step: number) => {
    switch (step) {
      case 0: return REQUIRED_FIELDS.BASIC_INFO;
      case 1: return REQUIRED_FIELDS.DETAILS;
      case 2: return REQUIRED_FIELDS.DOCUMENTATION;
      default: return [];
    }
  }, []);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const stepFields = getStepFields(activeStep);
    const requiredFields = getRequiredFields(activeStep);
    
    // Check if all required fields are filled and have no errors
    const hasRequiredValues = requiredFields.every(field => {
      const value = getValues(field);
      return value !== null && value !== undefined && value !== '';
    });
    
    // Check if any step fields have errors
    const hasNoErrors = stepFields.every(field => !errors[field]);
    
    return hasRequiredValues && hasNoErrors;
  }, [activeStep, errors, getStepFields, getRequiredFields, getValues]);

  // Validate current step before navigation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(activeStep);
    const result = await trigger(stepFields);
    return result;
  }, [activeStep, getStepFields, trigger]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
      onStepChange(activeStep + 1);
    }
  }, [activeStep, onStepChange, validateCurrentStep]);

  const handleBack = useCallback(() => {
    onStepChange(activeStep - 1);
  }, [activeStep, onStepChange]);

  // Final submission with full validation
  const handleFinalSubmit = useCallback(async (data: Partial<Vehicle>) => {
    try {
      // Trigger validation for all fields
      const isFormValid = await trigger();
      
      if (!isFormValid) {
        console.error('Form validation failed');
        return;
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  }, [onSubmit, trigger]);

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        licensePlate: '',
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        status: VehicleStatus.AVAILABLE,
        mileage: null,
        fuelType: '',
        transmission: '',
        condition: '',
        legalOwner: '',
        isLiquidAsset: false,
        purchaseDate: null,
        purchasePrice: null,
        registrationDate: null,
        registrationExpiryDate: null,
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: null,
        currentValuation: null,
        marketValue: null,
        depreciatedValue: null,
        ...initialData
      });
    }
  }, [initialData, reset]);

  // Step content renderer
  const renderStepContent = useCallback(() => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <DetailsStep />;
      case 2:
        return <DocumentationStep />;
      default:
        return null;
    }
  }, [activeStep]);

  // Get current step errors for display
  const currentStepErrors = useMemo(() => {
    const stepFields = getStepFields(activeStep);
    return stepFields.filter(field => errors[field]).map(field => ({
      field,
      message: errors[field]?.message
    }));
  }, [activeStep, errors, getStepFields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEdit ? 'Update vehicle information' : 'Enter vehicle details in the form below'}
            </Typography>
          </Box>

          {/* Stepper */}
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEP_CONFIG.map((stepConfig, index) => (
                <Step key={stepConfig.label}>
                  <StepLabel
                    error={activeStep === index && currentStepErrors.length > 0}
                  >
                    {stepConfig.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Error Alert */}
          {currentStepErrors.length > 0 && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Please fix the following errors:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {currentStepErrors.map(({ field, message }) => (
                    <li key={field}>
                      <Typography variant="body2">{message}</Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            </Fade>
          )}

          {/* Step Content */}
          <Box mb={4}>
            {renderStepContent()}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Step indicator */}
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {STEP_CONFIG.length}
              </Typography>
              
              {activeStep < STEP_CONFIG.length - 1 ? (
                <Button 
                  type="button"
                  variant="contained" 
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={loading || !isValid}
                  onClick={handleSubmit(handleFinalSubmit)}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2
                  }}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};