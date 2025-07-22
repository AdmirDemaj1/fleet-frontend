import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import CustomerAccountLogs from '../../components/CustomerAccount/CustomerAccountLogs';
import CustomerAccountMenu from '../../components/CustomerAccount/CustomerAccountMenu';

const CustomerLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Customer ID is required</div>;
  }

  return (
    <Container maxWidth="lg">
     
      
     
        <CustomerAccountLogs customerId={id} />
      
    </Container>
  );
};

export default CustomerLogsPage;