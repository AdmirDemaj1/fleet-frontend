import { useMemo, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAdministrator } from './useAdministrator';
import { getCustomerDisplayName, getCurrentTabIndex } from '../utils/menuUtils';
import { ADMINISTRATOR_MENU_ITEMS } from '../constants/administratorMenuConstants';

export const useAdministratorMenu = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch administrator data using dedicated hook
  const { administrator } = useAdministrator(id || '');

  // Get administrator display name
  const administratorName = useMemo(() => 
    getCustomerDisplayName(administrator), 
    [administrator]
  );

  // Get current active tab based on pathname
  const currentTab = useMemo(() => 
    getCurrentTabIndex(location.pathname, ADMINISTRATOR_MENU_ITEMS), 
    [location.pathname]
  );

  // Handle tab change - use administrators base path
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    const selectedItem = ADMINISTRATOR_MENU_ITEMS[newValue];
    if (selectedItem && id) {
      // Prevent navigation if already on the selected tab
      const currentPath = location.pathname;
      const targetPath = `/administrators/${id}/${selectedItem.path}`;
      if (currentPath !== targetPath) {
        navigate(targetPath);
      }
    }
  }, [id, navigate, location.pathname]);

  // Handle back button click - navigate to administrators list
  const handleBackClick = useCallback(() => {
    navigate('/customers'); // Navigate to customers page which shows administrators table
  }, [navigate]);

  return {
    id,
    administrator: administrator,
    administratorName,
    currentTab,
    isSmallScreen,
    theme,
    handleTabChange,
    handleBackClick,
    menuItems: ADMINISTRATOR_MENU_ITEMS
  };
};

