import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { MenuItem } from '../types/customerMenu.types';

export const MENU_ITEMS: MenuItem[] = [
  { 
    text: 'Summary', 
    path: 'summary', 
    icon: <DashboardIcon />,
    description: 'Customer overview and account details'
  },
  { 
    text: 'Contracts', 
    path: 'contracts', 
    icon: <DescriptionIcon />,
    description: 'Active and historical contracts'
  },
  { 
    text: 'Invoices', 
    path: 'invoices', 
    icon: <ReceiptIcon />,
    description: 'Payments and billing history'
  },
  { 
    text: 'Vehicles', 
    path: 'vehicles', 
    icon: <LocalShippingIcon />,
    description: 'Fleet vehicles and assets'
  },
  { 
    text: 'Logs', 
    path: 'logs', 
    icon: <HistoryIcon />,
    description: 'Activity and audit logs'
  },
  { 
    text: 'Settings', 
    path: 'edit', 
    icon: <SettingsIcon />,
    description: 'Edit customer information'
  },
];
