import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Avatar, Divider } from '@mui/material';
import { AccountCircle, AttachMoney, Event, CheckCircle, Cancel, Pending } from '@mui/icons-material';

interface CustomerAccountSidebarProps {
  accountNumber: string;
  status: 'Active' | 'Inactive' | 'Pending';
  totalDue: string;
  nextBill: string;
}

const statusColors: { [key: string]: string } = {
  Active: 'success.main',
  Inactive: 'error.main',
  Pending: 'warning.main',
};

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  accountNumber,
  status,
  totalDue,
  nextBill,
}) => {
  return (
    <Box
      sx={{
        width: 240, // Increased width
        bgcolor: 'background.paper',
        borderRadius: 2, // Rounded corners
        boxShadow: 1, // Subtle shadow
        p: 3, // Increased padding
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
          <AccountCircle />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          Account: {accountNumber}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Billing Information
      </Typography>
      <List dense>
        <ListItem disablePadding>
          <ListItemIcon>
            {status === 'Active' && <CheckCircle sx={{ color: statusColors[status] }} />}
            {status === 'Inactive' && <Cancel sx={{ color: statusColors[status] }} />}
            {status === 'Pending' && <Pending sx={{ color: statusColors[status] }} />}
          </ListItemIcon>
          <ListItemText primary={`Status: ${status}`} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemIcon>
            <AttachMoney />
          </ListItemIcon>
          <ListItemText primary={`Total Due: ${totalDue}`} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemIcon>
            <Event />
          </ListItemIcon>
          <ListItemText primary={`Next Bill: ${nextBill}`} />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Account Details
      </Typography>
      <List dense>
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