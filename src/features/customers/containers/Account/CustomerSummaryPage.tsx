import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import CustomerAccountSidebar from '../../components/CustomerAccount/CustomerAccountSummarySidebar';
import CustomerAssetSummary from './../../components/CustomerAccount/CustomerAssetSummary';
import CustomerBillingAndLogsCards from '../../components/CustomerAccount/CustomerBillingLogCards';

const CustomerSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

  // Dummy invoice data
  const recentInvoices = [
    { id: 'INV-2580', date: 'Jul 01, 2025', amount: '$450.00', status: 'paid' as const },
    { id: 'INV-2571', date: 'Jun 01, 2025', amount: '$450.00', status: 'paid' as const },
    { id: 'INV-2562', date: 'May 01, 2025', amount: '$350.56', status: 'paid' as const },
    { id: 'INV-2553', date: 'Apr 01, 2025', amount: '$350.56', status: 'paid' as const },
    { id: 'INV-2544', date: 'Mar 01, 2025', amount: '$350.56', status: 'paid' as const },
  ];

  // Dummy log entries
  const recentLogs = [
    { 
      id: 'LOG-9821', 
      timestamp: 'Jul 14, 2025 13:45', 
      message: 'Login attempt from new IP address', 
      severity: 'warning' as const,
      assetName: 'ford focus' 
    },
    { 
      id: 'LOG-9815', 
      timestamp: 'Jul 14, 2025 10:22', 
      message: 'Configuration updated', 
      severity: 'info' as const,
      assetName: 'another-asset.example.com' 
    },
    { 
      id: 'LOG-9802', 
      timestamp: 'Jul 13, 2025 16:10', 
      message: 'System restarted successfully', 
      severity: 'info' as const,
      assetName: 'ford focus' 
    },
    { 
      id: 'LOG-9788', 
      timestamp: 'Jul 12, 2025 22:45', 
      message: 'Connection timeout detected', 
      severity: 'error' as const,
      assetName: 'another-asset.example.com' 
    },
    { 
      id: 'LOG-9774', 
      timestamp: 'Jul 12, 2025 15:17', 
      message: 'Security update installed', 
      severity: 'info' as const 
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomerAccountSidebar customerId={id} />
      <Box sx={{ flexGrow: 1, pl: 3 }}>
        <CustomerBillingAndLogsCards 
          recentInvoices={recentInvoices} 
          recentLogs={recentLogs} 
        />
        <CustomerAssetSummary assets={assetData} />
      </Box>
    </Box>
  );
};

export default CustomerSummaryPage;