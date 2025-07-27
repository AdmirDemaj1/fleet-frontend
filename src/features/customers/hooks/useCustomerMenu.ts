import { useMemo, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useCustomer } from './useCustomer';
import { getCustomerDisplayName, getCurrentTabIndex } from '../utils/menuUtils';
import { MENU_ITEMS } from '../constants/menuConstants';

export const useCustomerMenu = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch customer data
  const { customer } = useCustomer(id || '');

  // Get customer display name
  const customerName = useMemo(() => 
    getCustomerDisplayName(customer), 
    [customer]
  );

  // Get current active tab based on pathname
  const currentTab = useMemo(() => 
    getCurrentTabIndex(location.pathname, MENU_ITEMS), 
    [location.pathname]
  );

  // Handle tab change
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    const selectedItem = MENU_ITEMS[newValue];
    if (selectedItem && id) {
      // Prevent navigation if already on the selected tab
      const currentPath = location.pathname;
      const targetPath = `/customers/${id}/${selectedItem.path}`;
      if (currentPath !== targetPath) {
        navigate(targetPath);
      }
    }
  }, [id, navigate, location.pathname]);

  // Handle back button click
  const handleBackClick = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  return {
    id,
    customer,
    customerName,
    currentTab,
    isSmallScreen,
    theme,
    handleTabChange,
    handleBackClick,
    menuItems: MENU_ITEMS
  };
};
