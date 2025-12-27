import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { MenuItem } from '../types/customerMenu.types';

export const ADMINISTRATOR_MENU_ITEMS: MenuItem[] = [
  { 
    text: 'Summary', 
    path: 'summary', 
    icon: <DashboardIcon />,
    description: 'Administrator overview and details'
  },
  { 
    text: 'Settings', 
    path: 'edit', 
    icon: <SettingsIcon />,
    description: 'Edit administrator information'
  },
];

