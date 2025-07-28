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

  const assetData = [
    { 
      name: 'ford focus', 
      ipAddress: '67.227.228.4', 
      type: 'endpoint' as const, 
      status: 'active' as const, 
      lastUpdated: '2025-07-12'
    },
    { 
      name: 'another-asset.example.com', 
      ipAddress: '192.168.1.1', 
      type: 'server' as const, 
      status: 'maintenance' as const, 
      lastUpdated: '2025-07-10'
    },
    // ...other assets
  ];

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
        <CustomerAssetSummary assets={assetData} />
      </Box>
    </Box>
  );
};

export default CustomerSummaryPage;