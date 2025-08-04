import React from 'react';
import {
  Grid,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { Person, Business, Security } from '@mui/icons-material';
import { CustomerType } from '../../../types/customer.types';

interface CustomerTypeStepProps {
  customerType: CustomerType;
  onCustomerTypeChange: (type: CustomerType) => void;
}

export const CustomerTypeStep: React.FC<CustomerTypeStepProps> = ({
  customerType,
  onCustomerTypeChange
}) => {
  const theme = useTheme();

  const handleTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: CustomerType | null) => {
    if (newType !== null) {
      onCustomerTypeChange(newType);
    }
  };

  const customerTypeOptions = [
    {
      value: CustomerType.INDIVIDUAL,
      label: 'Individual',
      icon: Person,
      color: 'primary' as const,
      description: 'Personal customer account for individuals'
    },
    {
      value: CustomerType.BUSINESS,
      label: 'Business',
      icon: Business,
      color: 'secondary' as const,
      description: 'Corporate customer account for businesses'
    },
    {
      value: CustomerType.ENDORSER,
      label: 'Endorser',
      icon: Security,
      color: 'info' as const,
      description: 'Endorser who provides guarantees for other customers'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
          Select Customer Type
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose the type of customer you want to add to your system
        </Typography>
      </Box>

      {/* Customer Type Selection */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <ToggleButtonGroup
            value={customerType}
            exclusive
            onChange={handleTypeChange}
            aria-label="customer type selection"
            sx={{
              width: '100%',
              '& .MuiToggleButton-root': {
                flex: 1,
                py: 4,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }
                }
              }
            }}
          >
            {customerTypeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = customerType === option.value;
              
              return (
                <ToggleButton
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2,
                    minHeight: 120
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '50%',
                      bgcolor: isSelected 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.action.selected, 0.05),
                      transition: 'all 0.2s ease'
                    }}>
                      <IconComponent sx={{ 
                        fontSize: 40,
                        color: isSelected 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary
                      }} />
                    </Box>
                    
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                        {option.description}
                      </Typography>
                      
                      {isSelected && (
                        <Box mt={1}>
                          <Chip 
                            label="Selected" 
                            color="primary" 
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Selected Type Summary */}
      {customerType && (
        <Box mt={4} textAlign="center">
          <Box sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Selected: {
                customerType === CustomerType.INDIVIDUAL ? 'Individual Customer' :
                customerType === CustomerType.BUSINESS ? 'Business Customer' :
                'Endorser Customer'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {customerType === CustomerType.INDIVIDUAL 
                ? 'You will enter personal information for an individual customer'
                : customerType === CustomerType.BUSINESS
                ? 'You will enter business information and administrator details'
                : 'You will enter endorser information and guarantee details'
              }
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
