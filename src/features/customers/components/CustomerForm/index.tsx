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
  const [customerType, setCustomerType] = useState<CustomerType>(
    initialData?.individualDetails ? CustomerType.INDIVIDUAL : CustomerType.BUSINESS
  );

  const methods = useForm<CreateCustomerDto>({
    resolver: yupResolver(getValidationSchema(customerType)) as any,
    defaultValues: initialData || {}
  });

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: CustomerType | null
  ) => {
    if (newType !== null) {
      setCustomerType(newType);
      methods.reset({});
    }
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    const formattedData: CreateCustomerDto = {};
    
    if (customerType === CustomerType.INDIVIDUAL) {
      formattedData.individualDetails = data.individualDetails!;
    } else {
      formattedData.businessDetails = data.businessDetails!;
    }

    await onSubmit(formattedData);
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