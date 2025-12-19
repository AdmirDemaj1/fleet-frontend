import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, Chip } from "@mui/material";
import { VehicleForm } from "../components/VehicleForm/VehicleForm";
import { Vehicle } from "../types/vehicleType";
import { vehicleApi } from "../api/vehicleApi";
import { STEP_CONFIG } from "../utils/vehicleFormValidation";
import { useNotification } from "../../../shared/hooks/useNotification";

// Type for the new submission data format
interface VehicleSubmissionData {
  vehicleData: Partial<Vehicle>;
  files?: File[];
  documents?: { type: string; title: string; description?: string; expiryDate: string }[];
}

export const CreateVehiclePage: React.FC = () => {
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = STEP_CONFIG.map((config) => config.label);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setError(null); // Clear errors when navigating between steps
  };

  const handleCreateVehicle = async (submissionData: VehicleSubmissionData | Partial<Vehicle>) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("Creating vehicle with data:", submissionData);

      let response;
      
      // Check if this is the new format with files
      if ('vehicleData' in submissionData && (submissionData.files?.length || submissionData.documents?.length)) {
        console.log("🚗 Creating vehicle with documents using multipart/form-data");
        console.log("📁 Files:", submissionData.files?.length || 0);
        console.log("📋 Documents:", submissionData.documents?.length || 0);
        
        response = await vehicleApi.createVehicleWithDocuments({
          vehicleData: submissionData.vehicleData,
          files: submissionData.files,
          documents: submissionData.documents,
        });
      } else {
        // Legacy format or no documents
        console.log("📝 Creating vehicle without documents");
        const vehicleData = 'vehicleData' in submissionData ? submissionData.vehicleData : submissionData;
        response = await vehicleApi.createVehicle(vehicleData);
      }

      console.log("Vehicle creation response:", response);

      // Check if response indicates approval is required
      if (response.requiresApproval) {
        showSuccess("Action requires approval. Request has been submitted.");
      } else {
        const vehicleData = 'vehicleData' in submissionData ? submissionData.vehicleData : submissionData;
        setSuccess(`Vehicle ${vehicleData.licensePlate} created successfully!`);
      }

      // Extract vehicle from response (handle both old and new response formats)
      const newVehicle = response.data?.vehicle || response.vehicle || response;

      // Redirect to the vehicle details page after a short delay
      setTimeout(() => {
        navigate(`/vehicles/${newVehicle.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating vehicle:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create vehicle. Please check your input and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header matching CustomersPage style */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
