import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Alert,
  Chip
} from '@mui/material';
import { api } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/utils/constants';
import { VehicleForm } from '../components/VehicleForm/VehicleForm';
import { Vehicle } from '../types/vehicleType';
import { STEP_CONFIG } from '../utils/vehicleFormValidation';

export const CreateVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = STEP_CONFIG.map(config => config.label);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setError(null); // Clear errors when navigating between steps
  };

  const handleCreateVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Creating vehicle with data:', vehicleData);
      
      const response = await api.post(API_ENDPOINTS.VEHICLES, vehicleData);
      const newVehicle = response.data;
      
      setSuccess(`Vehicle ${vehicleData.licensePlate} created successfully!`);
      
      // Redirect to the vehicle details page after a short delay
      setTimeout(() => {
        navigate(`/vehicles/${newVehicle.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error ||
        'Failed to create vehicle. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header matching CustomersPage style */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Add New Vehicle</Typography>
        <Chip 
          label={`Step ${activeStep + 1}/${steps.length}`} 
          color="primary" 
          variant="outlined"
        />
      </Box>

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Creation Failed
          </Typography>
          {error}
        </Alert>
      )}
      
      {/* Enhanced Vehicle Form */}
      <VehicleForm 
        onSubmit={handleCreateVehicle}
        loading={loading}
        activeStep={activeStep}
        onStepChange={handleStepChange}
        steps={steps}
        isEdit={false}
      />
    </Box>
  );
};

export default CreateVehiclePage;