import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Alert, 
  Stepper, 
  Step, 
  StepLabel,
  Button,
  IconButton,
  Container 
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { api } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/utils/constants';
import { VehicleForm } from '../components/VehicleForm/VehicleForm';
import { Vehicle } from '../types/vehicleType';

export const CreateVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = ['Basic Information', 'Details & Specifications', 'Documentation & Valuation'];

  const handleBack = () => {
    navigate('/vehicles');
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const handleCreateVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating vehicle with data:', vehicleData);
      
      const response = await api.post(API_ENDPOINTS.VEHICLES, vehicleData);
      const newVehicle = response.data;
      
      // Redirect to the vehicle details page
      navigate(`/vehicles/${newVehicle.id}`);
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      setError(err.response?.data?.message || 'Failed to create vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Add New Vehicle
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <VehicleForm 
          onSubmit={handleCreateVehicle}
          loading={loading}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          steps={steps}
        />
      </Paper>
    </Container>
  );
};

export default CreateVehiclePage;