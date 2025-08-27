import React, { useState } from 'react';
import {
  Box,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import { SettingsNavigation } from './SettingsNavigation';
import {
  PersonalInformation,
  ContactInformation,
  DocumentsSettings,
  SecuritySettings,
  NotificationSettings,
  PaymentSettings,
  PreferencesSettings,
  DataPrivacySettings
} from './settings';

export interface SettingsMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  component: React.ComponentType<{ customerId: string }>;
  badge?: string | number;
  disabled?: boolean;
  subItems?: SettingsMenuItem[];
}

interface CustomerSettingsPageProps {
  customerId: string;
  onClose?: () => void;
}

export const CustomerSettingsPage: React.FC<CustomerSettingsPageProps> = ({
  customerId,
  onClose
}) => {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState('personal');
  const [expandedSections, setExpandedSections] = useState<string[]>(['account']);

  // Settings menu configuration
  const settingsMenu: SettingsMenuItem[] = [
    {
      id: 'account',
      label: 'Account Settings',
      icon: () => null,
      component: PersonalInformation,
      subItems: [
        {
          id: 'personal',
          label: 'Personal Information',
          icon: () => null,
          component: PersonalInformation
        },
        {
          id: 'contact',
          label: 'Contact Information',
          icon: () => null,
          component: ContactInformation
        },
        {
          id: 'documents',
          label: 'Documents & Verification',
          icon: () => null,
          component: DocumentsSettings,
          badge: '2'
        }
      ]
    },
    {
      id: 'security',
      label: 'Security & Privacy',
      icon: () => null,
      component: SecuritySettings,
      subItems: [
        {
          id: 'security',
          label: 'Security Settings',
          icon: () => null,
          component: SecuritySettings
        },
        {
          id: 'privacy',
          label: 'Data & Privacy',
          icon: () => null,
          component: DataPrivacySettings
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: () => null,
      component: NotificationSettings,
      badge: 'New'
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      icon: () => null,
      component: PaymentSettings
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: () => null,
      component: PreferencesSettings
    }
  ];

  // Find the active component
  const getActiveComponent = () => {
    for (const item of settingsMenu) {
      if (item.id === activeSection) {
        return item.component;
      }
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.id === activeSection) {
            return subItem.component;
          }
        }
      }
    }
    return PersonalInformation;
  };

  const ActiveComponent = getActiveComponent();

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleToggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default
    }}>
      <Grid container spacing={0}>
        {/* Navigation Sidebar */}
        <Grid item xs={12} md={3} lg={2.5}>
          <Box sx={{ 
            position: 'sticky',
            top: 0,
            pr: { md: 1.5 }
          }}>
            <SettingsNavigation
              menuItems={settingsMenu}
              activeSection={activeSection}
              expandedSections={expandedSections}
              onSectionChange={handleSectionChange}
              onToggleExpanded={handleToggleExpanded}
              onClose={onClose}
            />
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9} lg={9.5}>
          <Box sx={{
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 3,
            overflow: 'hidden',
            minHeight: '100vh',
            ml: { md: 1.5 }
          }}>
            <ActiveComponent customerId={customerId} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
