import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

interface CustomerAccountSidebarProps {
  /* Define the props you need to pass to this component, e.g., customer data */
  accountNumber: string;
  status: string;
  totalDue: string;
  nextBill: string;
}

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  accountNumber,
  status,
  totalDue,
  nextBill,
}) => {
  return (
    <Box sx={{ width: 240, bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Account: {accountNumber}
      </Typography>
      <Typography variant="subtitle1">Bills</Typography>
      <List>
        <ListItem disablePadding>
          <ListItemText primary={`Status: ${status}`} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={`Total Due: ${totalDue}`} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={`Next Bill: ${nextBill}`} />
        </ListItem>
      </List>
      <Typography variant="subtitle1">Account Details</Typography>
      <List>
        <ListItem disablePadding>
          <ListItemText primary="Order Date" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Types" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Domains" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Relations" />
        </ListItem>
      </List>
    </Box>
  );
};

export default CustomerAccountSidebar;