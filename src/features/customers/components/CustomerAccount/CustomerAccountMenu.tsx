import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { CustomerAccountMenuProps } from '../../types/customer.types';

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { text: 'Summary', path: 'summary', icon: <DashboardIcon /> },
  { text: 'Contracts', path: 'contracts', icon: <DescriptionIcon /> },
  { text: 'Invoices', path: 'invoices', icon: <ReceiptIcon /> },
  { text: 'Vehicles', path: 'vehicles', icon: <LocalShippingIcon /> },
  { text: 'Logs', path: 'logs', icon: <HistoryIcon /> },
];

const CustomerAccountMenu: React.FC<CustomerAccountMenuProps> = ({ customerId }) => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getValue = () => {
    const path = location.pathname;
    if (path.includes('summary')) return 0;
    if (path.includes('contracts')) return 1;
    if (path.includes('invoices')) return 2;
    if (path.includes('vehicles')) return 3;
    if (path.includes('logs')) return 4;
    return 0;
  };

  const [value, setValue] = React.useState(getValue());

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{
      backgroundColor: theme.palette.background.paper,
    }}>
      <Toolbar sx={{
        justifyContent: 'space-between',
      }}>
        {isSmallScreen ? (
          <Tooltip title="Back to Customers">
            <IconButton color="primary" component={Link} to="/customers">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="h6" color="primary">
            Customer Account
          </Typography>
        )}
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Customer account menu"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
            },
          }}
        >
          {menuItems.map((item, index) => (
            <Tab
              key={item.text}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon}
                  <Typography variant="body2">{item.text}</Typography>
                </Box>
              }
              component={Link}
              to={`/customers/${id}/${item.path}`}
            />
          ))}
        </Tabs>
        <Tooltip title="Account Settings">
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default CustomerAccountMenu;