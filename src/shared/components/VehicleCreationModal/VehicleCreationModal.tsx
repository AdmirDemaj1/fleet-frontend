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
import { Vehicle } from '../../../features/vehicles/types/vehicleType';
import { VehicleForm } from '../../../features/vehicles/components/VehicleForm/VehicleForm';

export interface VehicleCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Vehicle>) => Promise<void>;
  isCreating: boolean;
  title?: string;
}

export const VehicleCreationModal: React.FC<VehicleCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
  isCreating,
  title = "Create New Vehicle"
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Information', 'Details & Specifications', 'Documentation & Valuation'];

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
            Complete the form below to add a new vehicle to the fleet
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
        maxHeight: 'calc(85vh - 100px)' // Account for title and potential action bars
      }}>
        <Box sx={{ 
          transform: 'scale(0.9)', 
          transformOrigin: 'top center',
          width: '111%', // Compensate for the scale
          marginLeft: '-5.5%' // Center the scaled content
        }}>
          <VehicleForm
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
