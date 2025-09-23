import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import CustomerAccountSidebar from '../../components/CustomerAccount/CustomerAccountSummarySidebar';
import CustomerAssetSummary from './../../components/CustomerAccount/CustomerAssetSummary';
import CustomerBillingAndLogsCards from '../../components/CustomerAccount/CustomerBillingLogCards';
import { useRecentInvoices } from '../../hooks/useRecentInvoices';

const CustomerSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices: recentInvoices, loading: invoicesLoading, error: invoicesError } = useRecentInvoices(id || '');

  if (!id) {
    return <Box>Customer ID not found</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomerAccountSidebar customerId={id} />
      <Box sx={{ flexGrow: 1, pl: 3 }}>
        <CustomerBillingAndLogsCards 
          customerId={id}
          recentInvoices={recentInvoices} 
          invoicesLoading={invoicesLoading}
          invoicesError={invoicesError}
        />
        <CustomerAssetSummary customerId={id} />
      </Box>
    </Box>
  );
};

export default CustomerSummaryPage;