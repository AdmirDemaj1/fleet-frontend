import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomerAccountSidebar from '../../components/CustomerAccount/CustomerAccountSummarySidebar';
import CustomerAssetSummary from './../../components/CustomerAccount/CustomerAssetSummary'; 

const CustomerSummaryPage: React.FC = () => {
  // Dummy data for testing
  const customerData = {
    accountNumber: '362668',
    status: 'Active',
    totalDue: '$1250.56',
    nextBill: '2025-08-11',
  };

  const assetData = [
    { name: 'mean-oxygen.metalseed.net', ipAddress: '67.227.228.4' },
    { name: 'another-asset.example.com', ipAddress: '192.168.1.1' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomerAccountSidebar {...customerData} />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6">Customer Summary</Typography>
        <Typography>Displaying summary for this customer.</Typography>
        <CustomerAssetSummary assets={assetData} />
      </Box>
    </Box>
  );
};

export default CustomerSummaryPage;