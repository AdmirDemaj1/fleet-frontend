import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Close
} from '@mui/icons-material';
import { CreateCustomerDto } from '../../../features/customers/types/customer.types';
import { CustomerForm } from '../../../features/customers/components/CustomerForm/CustomerForm';

export interface CustomerCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerDto) => Promise<void>;
  isCreating: boolean;
  title?: string;
}

export const CustomerCreationModal: React.FC<CustomerCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
  isCreating,
  title = "Create New Customer"
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Customer Type', 'Customer Details', 'Additional Information'];

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh',
          maxHeight: '85vh',
          width: '90%',
          maxWidth: '1000px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the form below to add a new customer
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isCreating}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 2, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(85vh - 100px)'
      }}>
        <Box sx={{ 
          transform: 'scale(0.9)', 
          transformOrigin: 'top center',
          width: '111%',
          marginLeft: '-5.5%'
        }}>
          <CustomerForm
            onSubmit={onSubmit}
            loading={isCreating}
            activeStep={activeStep}
            onStepChange={handleStepChange}
            steps={steps}
            isEdit={false}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
