import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Alert, Chip, CircularProgress } from "@mui/material";
import { VehicleForm } from "../components/VehicleForm/VehicleForm";
import { Vehicle } from "../types/vehicleType";
import { vehicleApi } from "../api/vehicleApi";
import { STEP_CONFIG } from "../utils/vehicleFormValidation";
import { useNotification } from "../../../shared/hooks/useNotification";

export const EditVehiclePage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  const steps = STEP_CONFIG.map((config) => config.label);

  // Fetch vehicle data on mount
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError("Vehicle ID is required");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        const vehicle = await vehicleApi.getVehicleById(id);
        setVehicleData(vehicle);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching vehicle:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load vehicle data. Please try again."
        );
        showError("Failed to load vehicle data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchVehicle();
  }, [id, showError]);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setError(null); // Clear errors when navigating between steps
  };

  const handleUpdateVehicle = async (
    updatedVehicleData:
      | Partial<Vehicle>
      | { vehicleData: Partial<Vehicle>; files?: File[]; documents?: any[] }
  ) => {
    if (!id) {
      setError("Vehicle ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log("Updating vehicle with data:", updatedVehicleData);

      // Extract vehicle data from the submission (handle both old and new format)
      const vehicleDataToUpdate =
        "vehicleData" in updatedVehicleData
          ? updatedVehicleData.vehicleData
          : updatedVehicleData;

      const response = await vehicleApi.updateVehicle(id, vehicleDataToUpdate);

      console.log("Update response:", response);

      // Check if response indicates approval is required
      if (response.requiresApproval) {
        showSuccess("Action requires approval. Request has been submitted.");
        // Navigate back to vehicle details page
        setTimeout(() => {
          navigate(`/vehicles/${id}`);
        }, 1500);
      } else {
        setSuccess(
          `Vehicle ${
            vehicleDataToUpdate.licensePlate || vehicleData?.licensePlate
          } updated successfully!`
        );
        showSuccess("Vehicle updated successfully");

        // Redirect to the vehicle details page after a short delay
        setTimeout(() => {
          navigate(`/vehicles/${id}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error updating vehicle:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update vehicle. Please check your input and try again.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching
  if (fetchLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading vehicle data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error if vehicle couldn't be loaded
  if (error && !vehicleData) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Edit Vehicle
        </Typography>
        <Alert severity="error">
          <Typography variant="subtitle2" gutterBottom>
            Failed to Load Vehicle
          </Typography>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header matching CreateVehiclePage style */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4">Edit Vehicle</Typography>
          {vehicleData && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {vehicleData.make} {vehicleData.model} ({vehicleData.year}) -{" "}
              {vehicleData.licensePlate}
            </Typography>
          )}
        </Box>
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
      {error && vehicleData && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Update Failed
          </Typography>
          {error}
        </Alert>
      )}

      {/* Enhanced Vehicle Form */}
      {vehicleData && (
        <VehicleForm
          initialData={vehicleData}
          onSubmit={handleUpdateVehicle}
          loading={loading}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          steps={steps}
          isEdit={true}
        />
      )}
    </Box>
  );
};

export default EditVehiclePage;
