import React, { useMemo, useCallback } from 'react';
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
  Fade,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { CustomerType } from '../../types/customer.types';
import { CreateCustomerDto, CreateIndividualCustomerDto, CreateBusinessCustomerDto, CreateEndorserDto } from '../../types/customer.types';

// Form data type that includes customerType for validation
interface CustomerFormData {
  customerType: CustomerType;
  individualDetails?: CreateIndividualCustomerDto;
  businessDetails?: CreateBusinessCustomerDto;
  endorserDetails?: CreateEndorserDto;
}
import {
  STEP_FIELDS,
  REQUIRED_FIELDS,
  STEP_CONFIG
} from '../../utils/customerFormValidation';
import { CustomerTypeStep, IndividualDetailsStep, BusinessDetailsStep, EndorserDetailsStep } from './Steps';

interface CustomerFormProps {
  initialData?: Partial<CreateCustomerDto>;
  onSubmit: (data: CreateCustomerDto) => Promise<void>;
  loading: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
  isEdit?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  loading,
  activeStep,
  onStepChange,
  isEdit = false
}) => {
  const [customerType, setCustomerType] = React.useState<CustomerType>(
    initialData?.individualDetails ? CustomerType.INDIVIDUAL : 
    initialData?.businessDetails ? CustomerType.BUSINESS :
    initialData?.endorserDetails ? CustomerType.ENDORSER :
    CustomerType.INDIVIDUAL
  );
  
  const methods = useForm<CustomerFormData>({
    defaultValues: {
      customerType: customerType,
      individualDetails: customerType === CustomerType.INDIVIDUAL ? {
        type: CustomerType.INDIVIDUAL,
        firstName: '',
        lastName: '',
        idNumber: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        secondaryPhone: '',
        secondaryEmail: '',
        additionalNotes: ''
      } : undefined,
      businessDetails: customerType === CustomerType.BUSINESS ? {
        type: CustomerType.BUSINESS,
        legalName: '',
        nuisNipt: '',
        administratorName: '',
        administratorId: '',
        administratorPosition: '',
        mainShareholders: '',
        address: '',
        phone: '',
        email: '',
        secondaryPhone: '',
        secondaryEmail: '',
        additionalNotes: ''
      } : undefined,
      endorserDetails: customerType === CustomerType.ENDORSER ? {
        type: CustomerType.ENDORSER,
        firstName: '',
        lastName: '',
        idNumber: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        secondaryPhone: '',
        secondaryEmail: '',
        additionalNotes: '',
        guaranteedAmount: undefined,
        relationshipToCustomer: '',
        financialInformation: undefined,
        active: true,
        notes: ''
      } : undefined,
      ...initialData
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const { 
    handleSubmit, 
    formState: { errors, isValid }, 
    trigger, 
    getValues,
    reset,
    setValue
  } = methods;

  // Update form when customer type changes
  React.useEffect(() => {
    const currentFormData = getValues();
    
    // Update the customerType field in the form
    setValue('customerType', customerType);
    
    // Reset form sections when type changes
    if (customerType === CustomerType.INDIVIDUAL) {
      setValue('businessDetails', undefined);
      setValue('endorserDetails', undefined);
      if (!currentFormData.individualDetails) {
        setValue('individualDetails', {
          type: CustomerType.INDIVIDUAL,
          firstName: '',
          lastName: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: ''
        });
      }
    } else if (customerType === CustomerType.BUSINESS) {
      setValue('individualDetails', undefined);
      setValue('endorserDetails', undefined);
      if (!currentFormData.businessDetails) {
        setValue('businessDetails', {
          type: CustomerType.BUSINESS,
          legalName: '',
          nuisNipt: '',
          administratorName: '',
          administratorId: '',
          administratorPosition: '',
          mainShareholders: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: ''
        });
      }
    } else if (customerType === CustomerType.ENDORSER) {
      setValue('individualDetails', undefined);
      setValue('businessDetails', undefined);
      if (!currentFormData.endorserDetails) {
        setValue('endorserDetails', {
          type: CustomerType.ENDORSER,
          firstName: '',
          lastName: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: '',
          guaranteedAmount: undefined,
          relationshipToCustomer: '',
          financialInformation: undefined,
          active: true,
          notes: ''
        });
      }
    }
  }, [customerType, setValue, getValues]);

  // Get step-specific validation fields
  const getStepFields = useCallback((step: number): string[] => {
    switch (step) {
      case 0: return STEP_FIELDS.CUSTOMER_TYPE;
      case 1: return customerType === CustomerType.INDIVIDUAL 
        ? STEP_FIELDS.INDIVIDUAL_DETAILS 
        : customerType === CustomerType.BUSINESS
        ? STEP_FIELDS.BUSINESS_DETAILS
        : STEP_FIELDS.ENDORSER_DETAILS;
      case 2: return []; // Review step
      default: return [];
    }
  }, [customerType]);

  // Get required fields for each step
  const getRequiredFields = useCallback((step: number): string[] => {
    switch (step) {
      case 0: return REQUIRED_FIELDS.CUSTOMER_TYPE;
      case 1: return customerType === CustomerType.INDIVIDUAL 
        ? REQUIRED_FIELDS.INDIVIDUAL_DETAILS 
        : customerType === CustomerType.BUSINESS
        ? REQUIRED_FIELDS.BUSINESS_DETAILS
        : REQUIRED_FIELDS.ENDORSER_DETAILS;
      case 2: return []; // Review step
      default: return [];
    }
  }, [customerType]);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const stepFields = getStepFields(activeStep);
    const requiredFields = getRequiredFields(activeStep);
    
    // Check if all required fields are filled and have no errors
    const hasRequiredValues = requiredFields.every((field: string) => {
      const value = getValues(field as any);
      return value !== null && value !== undefined && value !== '';
    });
    
    // Check if any step fields have errors
    const hasNoErrors = stepFields.every((field: string) => {
      const fieldPath = field.split('.');
      let error = errors;
      for (const key of fieldPath) {
        error = (error as any)?.[key];
      }
      return !error;
    });
    
    return hasRequiredValues && hasNoErrors;
  }, [activeStep, errors, getStepFields, getRequiredFields, getValues]);

  // Validate current step before navigation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(activeStep);
    const result = await trigger(stepFields as any);
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
  const handleFinalSubmit = useCallback(async (data: CustomerFormData) => {
    try {
      // Trigger validation for all fields
      const isFormValid = await trigger();
      
      if (!isFormValid) {
        console.error('Form validation failed');
        return;
      }
      
      // Transform form data to DTO (remove customerType and handle nulls)
      const transformedData: CreateCustomerDto = {
        individualDetails: data.individualDetails ? {
          ...data.individualDetails,
          secondaryPhone: data.individualDetails.secondaryPhone || undefined,
          secondaryEmail: data.individualDetails.secondaryEmail || undefined,
          additionalNotes: data.individualDetails.additionalNotes || undefined
        } : undefined,
        businessDetails: data.businessDetails ? {
          ...data.businessDetails,
          secondaryPhone: data.businessDetails.secondaryPhone || undefined,
          secondaryEmail: data.businessDetails.secondaryEmail || undefined,
          additionalNotes: data.businessDetails.additionalNotes || undefined,
          mainShareholders: data.businessDetails.mainShareholders || undefined
        } : undefined,
        endorserDetails: data.endorserDetails ? {
          ...data.endorserDetails,
          secondaryPhone: data.endorserDetails.secondaryPhone || undefined,
          secondaryEmail: data.endorserDetails.secondaryEmail || undefined,
          additionalNotes: data.endorserDetails.additionalNotes || undefined,
          guaranteedAmount: data.endorserDetails.guaranteedAmount || undefined,
          relationshipToCustomer: data.endorserDetails.relationshipToCustomer || undefined,
          financialInformation: data.endorserDetails.financialInformation || undefined,
          active: data.endorserDetails.active ?? true,
          notes: data.endorserDetails.notes || undefined
        } : undefined
      };
      
      await onSubmit(transformedData);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  }, [onSubmit, trigger]);

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        customerType: customerType,
        individualDetails: customerType === CustomerType.INDIVIDUAL ? {
          type: CustomerType.INDIVIDUAL,
          firstName: '',
          lastName: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: '',
          ...initialData.individualDetails
        } : undefined,
        businessDetails: customerType === CustomerType.BUSINESS ? {
          type: CustomerType.BUSINESS,
          legalName: '',
          nuisNipt: '',
          administratorName: '',
          administratorId: '',
          administratorPosition: '',
          mainShareholders: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: '',
          ...initialData.businessDetails
        } : undefined,
        endorserDetails: customerType === CustomerType.ENDORSER ? {
          type: CustomerType.ENDORSER,
          firstName: '',
          lastName: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
          phone: '',
          email: '',
          secondaryPhone: '',
          secondaryEmail: '',
          additionalNotes: '',
          guaranteedAmount: undefined,
          relationshipToCustomer: '',
          financialInformation: undefined,
          active: true,
          notes: '',
          ...initialData.endorserDetails
        } : undefined
      });
    }
  }, [initialData, reset, customerType]);

  // Step content renderer
  const renderStepContent = useCallback(() => {
    switch (activeStep) {
      case 0:
        return <CustomerTypeStep customerType={customerType} onCustomerTypeChange={setCustomerType} />;
      case 1:
        return customerType === CustomerType.INDIVIDUAL ? (
          <IndividualDetailsStep />
        ) : customerType === CustomerType.BUSINESS ? (
          <BusinessDetailsStep />
        ) : (
          <EndorserDetailsStep />
        );
      case 2:
        return (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Review & Confirm
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please review your information and click save to create the customer
            </Typography>
            
            <Box sx={{ 
              p: 3, 
              bgcolor: (theme) => theme.palette.grey[50], 
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'left'
            }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Customer Type: {
                  customerType === CustomerType.INDIVIDUAL ? 'Individual' :
                  customerType === CustomerType.BUSINESS ? 'Business' :
                  'Endorser'
                }
              </Typography>
              
              {customerType === CustomerType.INDIVIDUAL && getValues('individualDetails') && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {getValues('individualDetails.firstName')} {getValues('individualDetails.lastName')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {getValues('individualDetails.email')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {getValues('individualDetails.phone')}
                  </Typography>
                </>
              )}
              
              {customerType === CustomerType.BUSINESS && getValues('businessDetails') && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Business:</strong> {getValues('businessDetails.legalName')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>NUIS/NIPT:</strong> {getValues('businessDetails.nuisNipt')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {getValues('businessDetails.email')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {getValues('businessDetails.phone')}
                  </Typography>
                </>
              )}

              {customerType === CustomerType.ENDORSER && getValues('endorserDetails') && (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {getValues('endorserDetails.firstName')} {getValues('endorserDetails.lastName')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>ID Number:</strong> {getValues('endorserDetails.idNumber')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {getValues('endorserDetails.email')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {getValues('endorserDetails.phone')}
                  </Typography>
                  {getValues('endorserDetails.guaranteedAmount') && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Max Guarantee:</strong> ${getValues('endorserDetails.guaranteedAmount')}
                    </Typography>
                  )}
                  {getValues('endorserDetails.relationshipToCustomer') && (
                    <Typography variant="body2">
                      <strong>Relationship:</strong> {getValues('endorserDetails.relationshipToCustomer')}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  }, [activeStep, customerType, getValues]);

  // Get current step errors for display
  const currentStepErrors = useMemo(() => {
    const stepFields = getStepFields(activeStep);
    return stepFields.filter((field: string) => {
      const fieldPath = field.split('.');
      let error = errors;
      for (const key of fieldPath) {
        error = (error as any)?.[key];
      }
      return error;
    }).map((field: string) => ({
      field,
      message: (() => {
        const fieldPath = field.split('.');
        let error = errors;
        for (const key of fieldPath) {
          error = (error as any)?.[key];
        }
        return (error as any)?.message;
      })()
    }));
  }, [activeStep, errors, getStepFields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {isEdit ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEdit ? 'Update customer information' : 'Enter customer details in the form below'}
            </Typography>
          </Box>

          {/* Stepper */}
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEP_CONFIG.map((stepConfig: any, index: number) => (
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
                  {currentStepErrors.map(({ field, message }: any) => (
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
                  onClick={handleSubmit((data) => handleFinalSubmit(data as unknown as CustomerFormData))}
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
                  {loading ? 'Saving...' : (isEdit ? 'Update Customer' : 'Create Customer')}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};