import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';
import { useCustomer } from '../../hooks/useCustomer';
import { CustomerInfo } from '../../components/CustomerDetails/CustomerInfo';
import { CustomerContracts } from '../../components/CustomerDetails/CustomerContracts';
import { CustomerCollateral } from '../../components/CustomerDetails/CustomerCollateral';
import { CustomerLogs } from '../../components/CustomerDetails/CustomerLogs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomer(id!);
  const [tabValue, setTabValue] = useState(0);

  if (loading) {
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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/customers')}
          sx={{ mt: 2 }}
        >
          Back to Customers
        </Button>
      </Box>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/customers')}
          >
            Back
          </Button>
          <Typography variant="h4">Customer Details</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/customers/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Information" />
            <Tab label="Contracts" />
            <Tab label="Collateral" />
            <Tab label="Activity Log" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <CustomerInfo customer={customer} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <CustomerContracts customerId={id!} contracts={customer.contracts} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <CustomerCollateral customerId={id!} collateral={customer.collateral} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <CustomerLogs customerId={id!} logs={customer.logs} />
        </TabPanel>
      </Paper>
    </Box>
  );
};