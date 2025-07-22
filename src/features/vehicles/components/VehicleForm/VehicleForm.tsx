import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, 
  Button, 
  Divider, 
  Grid, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import { Vehicle, VehicleStatus, FuelType, ConditionStatus, InsuranceCompany } from '../../types/vehicleType';
import { BasicInfoStep } from '../Steps/basicinfostep';
import { DetailsStep } from '../Steps/DetailsStep';
import { DocumentationStep } from '../Steps/DocumentationStep';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: Partial<Vehicle>) => Promise<void>;
  loading: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
}

// Step-specific validation schemas
const basicInfoSchema = yup.object({
  licensePlate: yup.string().required('License plate is required'),
  vin: yup.string().required('VIN is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  year: yup.number()
    .required('Year is required')
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, `Year must not exceed ${new Date().getFullYear() + 1}`),
  status: yup.string().required('Status is required'),
});

const detailsSchema = yup.object({
  mileage: yup.number().min(0, 'Mileage must be positive').nullable(),
  fuelType: yup.string().oneOf([...Object.values(FuelType), ''], 'Invalid fuel type').nullable(),
  transmission: yup.string().nullable(),
  condition: yup.string().oneOf([...Object.values(ConditionStatus), ''], 'Invalid condition').nullable(),
  legalOwner: yup.string().nullable(),
  isLiquidAsset: yup.boolean().nullable(),
  purchaseDate: yup.string().nullable(),
  purchasePrice: yup.number().min(0, 'Purchase price must be positive').nullable(),
});

const documentationSchema = yup.object({
  registrationDate: yup.string().nullable(),
  registrationExpiryDate: yup.string().nullable(),
  insuranceProvider: yup.string().oneOf([...Object.values(InsuranceCompany), ''], 'Invalid insurance provider').nullable(),
  insurancePolicyNumber: yup.string().nullable(),
  insuranceExpiryDate: yup.string().nullable(),
  currentValuation: yup.number().min(0, 'Valuation must be positive').nullable(),
  marketValue: yup.number().min(0, 'Market value must be positive').nullable(),
  depreciatedValue: yup.number().min(0, 'Depreciated value must be positive').nullable(),
});

// Complete validation schema for final submission
const validationSchema = yup.object({
  licensePlate: yup.string().required('License plate is required'),
  vin: yup.string().required('VIN is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  year: yup.number()
    .required('Year is required')
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, `Year must not exceed ${new Date().getFullYear() + 1}`),
  status: yup.string().required('Status is required'),
  mileage: yup.number().min(0, 'Mileage must be positive').nullable(),
  fuelType: yup.string().oneOf([...Object.values(FuelType), ''], 'Invalid fuel type').nullable(),
  transmission: yup.string().nullable(),
  condition: yup.string().oneOf([...Object.values(ConditionStatus), ''], 'Invalid condition').nullable(),
  legalOwner: yup.string().nullable(),
  isLiquidAsset: yup.boolean().nullable(),
  purchaseDate: yup.string().nullable(),
  purchasePrice: yup.number().min(0, 'Purchase price must be positive').nullable(),
  registrationDate: yup.string().nullable(),
  registrationExpiryDate: yup.string().nullable(),
  insuranceProvider: yup.string().oneOf([...Object.values(InsuranceCompany), ''], 'Invalid insurance provider').nullable(),
  insurancePolicyNumber: yup.string().nullable(),
  insuranceExpiryDate: yup.string().nullable(),
  currentValuation: yup.number().min(0, 'Valuation must be positive').nullable(),
  marketValue: yup.number().min(0, 'Market value must be positive').nullable(),
  depreciatedValue: yup.number().min(0, 'Depreciated value must be positive').nullable(),
});

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  loading,
  activeStep,
  onStepChange,
  steps
}) => {
  const methods = useForm<Partial<Vehicle>>({
    defaultValues: {
      licensePlate: '',
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      status: VehicleStatus.AVAILABLE,
      mileage: 0,
      fuelType: '',
      transmission: '',
      currentValuation: 0,
      isLiquidAsset: false,
      legalOwner: '',
      ...initialData
    },
    // Remove resolver from here - we'll validate step by step
    mode: 'onChange'
  });

  const { handleSubmit, formState: { errors }, trigger, getValues, clearErrors } = methods;

  // Get step-specific field names
  const getStepFields = (step: number): (keyof Vehicle)[] => {
    switch (step) {
      case 0:
        return ['licensePlate', 'vin', 'make', 'model', 'year', 'color', 'status'];
      case 1:
        return ['mileage', 'fuelType', 'transmission', 'condition', 'legalOwner', 'isLiquidAsset', 'purchaseDate', 'purchasePrice'];
      case 2:
        return ['registrationDate', 'registrationExpiryDate', 'insuranceProvider', 'insurancePolicyNumber', 'insuranceExpiryDate', 'currentValuation', 'marketValue', 'depreciatedValue'];
      default:
        return [];
    }
  };

  // Validate current step before allowing navigation
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentData = getValues();
    
    try {
      switch (activeStep) {
        case 0:
          await basicInfoSchema.validate(currentData, { abortEarly: false });
          break;
        case 1:
          await detailsSchema.validate(currentData, { abortEarly: false });
          break;
        case 2:
          await documentationSchema.validate(currentData, { abortEarly: false });
          break;
        default:
          return true;
      }
      
      // Clear any existing errors for this step
      const stepFields = getStepFields(activeStep);
      stepFields.forEach(field => clearErrors(field));
      
      return true;
    } catch (validationError: any) {
      // Trigger validation to show errors for current step fields
      const stepFields = getStepFields(activeStep);
      await trigger(stepFields);
      return false;
    }
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    onStepChange(activeStep - 1);
  };

  // Only called when user clicks "Create Vehicle" on the final step
  const handleFinalSubmit = async (data: Partial<Vehicle>) => {
    // Validate all data before final submission
    try {
      await validationSchema.validate(data, { abortEarly: false });
      await onSubmit(data);
    } catch (validationError: any) {
      console.error('Final validation failed:', validationError);
      // Trigger validation for all fields to show errors
      await trigger();
    }
  };

  // Check if current step is valid for button state
  const isCurrentStepValid = () => {
    const stepFields = getStepFields(activeStep);
    return stepFields.every(field => !errors[field]);
  };

  const renderStepContent = () => {
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
  };

  return (
    <FormProvider {...methods}>
      <Box>
        {renderStepContent()}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ 
              borderRadius: 1,
              px: 3
            }}
          >
            Back
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button 
                type="button"
                variant="contained" 
                onClick={handleNext}
                disabled={activeStep === 0 && !isCurrentStepValid()} // Only validate required first step
                sx={{ 
                  borderRadius: 1,
                  px: 3
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={handleSubmit(handleFinalSubmit)}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  borderRadius: 1,
                  px: 3
                }}
              >
                {loading ? 'Creating...' : 'Create Vehicle'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};