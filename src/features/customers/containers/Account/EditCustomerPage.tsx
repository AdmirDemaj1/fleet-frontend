import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { CustomerForm } from '../../components/CustomerForm';
import { useCustomer } from '../../hooks/useCustomer';
import { useUpdateCustomer } from '../../hooks/useUpdateCustomer';
import { CreateCustomerDto, CustomerType } from '../../types/customer.types';

export const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading: customerLoading, error } = useCustomer(id!);
  const { updateCustomer, loading: updateLoading } = useUpdateCustomer();

  const handleSubmit = async (data: CreateCustomerDto) => {
    await updateCustomer(id!, {
      id: id!,
      individualDetails: data.individualDetails,
      businessDetails: data.businessDetails
    });
  };

  if (customerLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!customer) {
    return null;
  }

  // Prepare initial data based on customer type
  const initialData: Partial<CreateCustomerDto> = {};
  
  // Safely access customer data
  const customerData = customer.customer;
  
  if (!customerData) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">Customer data not found</Alert>
      </Box>
    );
  }
  
  if (!customerData.type) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">Customer type is missing</Alert>
      </Box>
    );
  }
  
  if (customerData.type === CustomerType.INDIVIDUAL) {
    initialData.individualDetails = {
      type: CustomerType.INDIVIDUAL,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      idNumber: customerData.idNumber,
      dateOfBirth: customerData.dateOfBirth,
      address: customerData.address,
      phone: customerData.phone,
      email: customerData.email,
      secondaryPhone: customerData.secondaryPhone,
      secondaryEmail: customerData.secondaryEmail,
      additionalNotes: customerData.additionalNotes
    };
  } else {
    initialData.businessDetails = {
      type: CustomerType.BUSINESS,
      legalName: customerData.legalName,
      nuisNipt: customerData.nuisNipt,
      administratorName: customerData.administratorName,
      administratorId: customerData.administratorId,
      administratorPosition: customerData.administratorPosition,
      mainShareholders: customerData.mainShareholders,
      address: customerData.address,
      phone: customerData.phone,
      email: customerData.email,
      secondaryPhone: customerData.secondaryPhone,
      secondaryEmail: customerData.secondaryEmail,
      additionalNotes: customerData.additionalNotes
    };
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Customer
      </Typography>
      
      <Paper sx={{ p: 3, flex: 1, overflow: 'hidden' }}>
        <CustomerForm
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={updateLoading}
        />
      </Paper>
    </Box>
  );
};