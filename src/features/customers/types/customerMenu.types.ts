import React from 'react';

export interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

export interface CustomerAccountMenuProps {
  // Add any props if needed in the future
}

export interface MenuState {
  currentTab: number;
  isSmallScreen: boolean;
}
