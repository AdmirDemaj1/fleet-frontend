import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit,
  MoreVert,
  Email as EmailIcon,
  Phone as PhoneIcon,
  BusinessCenter,
  Person,
  FileDownload,
  Receipt,
  DirectionsCar,
  History,
  AccountBox,
  Dashboard,
  Delete
} from '@mui/icons-material';
import { Customer, CustomerType } from '../../types/customer.types';
import dayjs from 'dayjs';

interface CustomerListItemProps {
  customer: Customer;
  onDelete: (id: string) => void;
}

export const CustomerListItem: React.FC<CustomerListItemProps> = ({
  customer,
  onDelete
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Format the email for display as a name
  const getDisplayName = (customer: Customer): string => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      const individual = customer as any;
      if (individual.firstName && individual.lastName) {
        return `${individual.firstName} ${individual.lastName}`;
      }
    } else if (customer.type === CustomerType.BUSINESS) {
      const business = customer as any;
      if (business.legalName) {
        return business.legalName;
      }
    }
    
    if (customer.email) {
      // Use the part before @ in the email as name
      const emailName = customer.email.split('@')[0];
      // Format it by replacing dots and hyphens with spaces and capitalizing
      return emailName
        .split(/[.-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    
    // Fallback to ID if no email
    return `Customer ${customer.id?.substring(0, 8)}`;
  };

  // Format date for display
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const isIndividual = customer.type === CustomerType.INDIVIDUAL;

  return (
    <>
      <TableRow 
        hover
        sx={{ 
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.02)
          }
        }}
      >
        <TableCell sx={{ py: 1.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main
              }
            }}
            onClick={() => navigate(`/customers/${customer.id}`)}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(
                  isIndividual 
                    ? theme.palette.primary.main 
                    : theme.palette.secondary.main,
                  0.1
                ),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5
              }}
            >
              {isIndividual ? (
                <Person 
                  fontSize="small"
                  sx={{ color: theme.palette.primary.main }} 
                />
              ) : (
                <BusinessCenter 
                  fontSize="small"
                  sx={{ color: theme.palette.secondary.main }} 
                />
              )}
            </Box>
            <Box>
              <Typography 
                variant="body1" 
                fontWeight={500}
                id={`customer-${customer.id}`}
                sx={{ 
                  transition: 'color 0.2s ease',
                  borderBottom: '1px dotted transparent',
                  '&:hover': {
                    borderBottomColor: theme.palette.primary.main,
                  }
                }}
              >
                {getDisplayName(customer)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                ID: {customer.id?.slice(0, 8)}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        
        <TableCell>
          <Chip
            label={isIndividual ? 'Individual' : 'Business'}
            size="small"
            color={isIndividual ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{ 
              fontWeight: 500,
              px: 0.5,
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmailIcon 
              fontSize="small" 
              sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} 
            />
            <Tooltip title={customer.email}>
              <Typography 
                variant="body2" 
                noWrap 
                sx={{ maxWidth: 150 }}
              >
                {customer.email}
              </Typography>
            </Tooltip>
          </Box>
        </TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon 
              fontSize="small" 
              sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} 
            />
            <Typography variant="body2">{customer.phone}</Typography>
          </Box>
        </TableCell>
        
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(customer.createdAt)}
          </Typography>
        </TableCell>
        
        <TableCell align="right">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-haspopup="true"
                sx={{ 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 200,
            borderRadius: 1,
            overflow: 'hidden'
          }
        }}
      >
        {/* Overview group */}
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}`);
            handleMenuClose();
          }}
          dense
        >
          <AccountBox fontSize="small" sx={{ mr: 1.5 }} />
          Customer Details
        </MenuItem>
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/summary`);
            handleMenuClose();
          }}
          dense
        >
          <Dashboard fontSize="small" sx={{ mr: 1.5 }} />
          Dashboard
        </MenuItem>
        
        <Divider />
        
        {/* Assets & Contracts group */}
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/contracts`);
            handleMenuClose();
          }}
          dense
        >
          <BusinessCenter fontSize="small" sx={{ mr: 1.5 }} />
          Contracts
        </MenuItem>
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/vehicles`);
            handleMenuClose();
          }}
          dense
        >
          <DirectionsCar fontSize="small" sx={{ mr: 1.5 }} />
          Vehicles
        </MenuItem>
        
        <Divider />
        
        {/* Finance group */}
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/invoices`);
            handleMenuClose();
          }}
          dense
        >
          <Receipt fontSize="small" sx={{ mr: 1.5 }} />
          Invoices
        </MenuItem>
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/export`);
            handleMenuClose();
          }}
          dense
        >
          <FileDownload fontSize="small" sx={{ mr: 1.5 }} />
          Export Data
        </MenuItem>
        
        <Divider />
        
        {/* History group */}
        <MenuItem 
          onClick={() => {
            navigate(`/customers/${customer.id}/logs`);
            handleMenuClose();
          }}
          dense
        >
          <History fontSize="small" sx={{ mr: 1.5 }} />
          Activity Logs
        </MenuItem>
        
        <Divider />
        
        {/* Danger zone */}
        <MenuItem 
          onClick={() => {
            onDelete(customer.id!);
            handleMenuClose();
          }}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1.5 }} />
          Delete Customer
        </MenuItem>
      </Menu>
    </>
  );
};
