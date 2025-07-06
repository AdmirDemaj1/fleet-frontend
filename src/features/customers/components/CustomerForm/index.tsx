import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  CircularProgress
} from '@mui/material';
import { Person, Business } from '@mui/icons-material';
import { CustomerType, CreateCustomerDto } from '../../types/customer.types';
import { IndividualCustomerForm } from './IndividualCustomerForm';
import { BusinessCustomerForm } from './BusinessCustomerForm';
import { getValidationSchema } from '../../utils/customerValidation';
import { v4 as uuidv4 } from 'uuid'; // for generating a fake id
import { useDispatch } from 'react-redux';
import { addCustomer } from '../../slices/customerSlice';

interface CustomerFormProps {
  onSubmit: (data: CreateCustomerDto) => Promise<void>;
  initialData?: Partial<CreateCustomerDto>;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  const dispatch = useDispatch();
  const [customerType, setCustomerType] = useState<CustomerType>(
    initialData?.individualDetails ? CustomerType.INDIVIDUAL : CustomerType.BUSINESS
  );

  const methods = useForm<CreateCustomerDto>({
    resolver: yupResolver(getValidationSchema(customerType)) as any,
    defaultValues: initialData || {
      individualDetails: customerType === CustomerType.INDIVIDUAL ? { type: CustomerType.INDIVIDUAL } : undefined,
      businessDetails: customerType === CustomerType.BUSINESS ? { type: CustomerType.BUSINESS } : undefined
    }
  });

  const { formState: { errors, isValid } } = methods;

  console.log("Form errors:", errors);
  console.log("Form is valid:", isValid);

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: CustomerType | null
  ) => {
    if (newType !== null) {
      setCustomerType(newType);
      
      // Set the appropriate type field based on the new customer type
      if (newType === CustomerType.INDIVIDUAL) {
        methods.reset({
          individualDetails: { type: CustomerType.INDIVIDUAL },
          businessDetails: undefined
        });
      } else {
        methods.reset({
          businessDetails: { type: CustomerType.BUSINESS },
          individualDetails: undefined
        });
      }
    }
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    console.log("Form data received:", data);
    console.log("Customer type:", customerType);
    
    const formattedData: CreateCustomerDto = {};
    let newCustomer;
    if (customerType === CustomerType.INDIVIDUAL && data.individualDetails) {
      newCustomer = {
        ...data.individualDetails,
        id: uuidv4(),
      };
    } else if (customerType === CustomerType.BUSINESS && data.businessDetails) {
      newCustomer = {
        ...data.businessDetails,
        id: uuidv4(),
      };
    } else {
      // Optionally handle error here
      return;
    }
    dispatch(addCustomer(newCustomer));
    
    if (customerType === CustomerType.INDIVIDUAL) {
      formattedData.individualDetails = data.individualDetails!;
      console.log("Individual details:", formattedData.individualDetails);
    } else {
      formattedData.businessDetails = data.businessDetails!;
      console.log("Business details:", formattedData.businessDetails);
    }

    console.log("Formatted data to submit:", formattedData);
    
    try {
      await onSubmit(formattedData);
      console.log("Form submission completed successfully");
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <Card sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Type
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <ToggleButtonGroup
                value={customerType}
                exclusive
                onChange={handleTypeChange}
                aria-label="customer type"
                fullWidth
              >
                <ToggleButton value={CustomerType.INDIVIDUAL} aria-label="individual">
                  <Person sx={{ mr: 1 }} />
                  Individual
                </ToggleButton>
                <ToggleButton value={CustomerType.BUSINESS} aria-label="business">
                  <Business sx={{ mr: 1 }} />
                  Business
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {customerType === CustomerType.INDIVIDUAL ? (
              <IndividualCustomerForm />
            ) : (
              <BusinessCustomerForm />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Saving...' : 'Save Customer'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};