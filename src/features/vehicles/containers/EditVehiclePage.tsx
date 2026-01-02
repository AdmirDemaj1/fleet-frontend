import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Alert, Chip, CircularProgress } from "@mui/material";
import { VehicleForm } from "../components/VehicleForm/VehicleForm";
import { STEP_CONFIG } from "../utils/vehicleFormValidation";
import { useNotification } from "../../../shared/hooks/useNotification";
import { usePendingDocuments } from "../../../shared/hooks/usePendingDocuments";
import { useVehicleDataLoader } from "../hooks/useVehicleDataLoader";
import { handleVehicleUpdate } from "../utils/vehicleUpdateHandler";
import { Vehicle } from "../types/vehicleType";

export const EditVehiclePage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const steps = STEP_CONFIG.map((config) => config.label);

  // Pending documents management
  const {
    pendingDocumentIds,
    setPendingDocumentIds,
    cleanupPendingDocuments,
    cleanupOnCancel,
  } = usePendingDocuments({
    entityType: "vehicle",
    entityId: id,
    enabled: !!id,
    cleanupOnUnmount: false,
    cleanupOnCancel: false,
  });

  // Vehicle data loading hook
  const {
    vehicleData,
    vehicleDocuments,
    loading: fetchLoading,
    error: fetchError,
    loadVehicleData,
  } = useVehicleDataLoader({
    vehicleId: id,
    setPendingDocumentIds,
  });

  // Load vehicle data on mount
  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  // Sync fetch error with local error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
      showError("Failed to load vehicle data");
    }
  }, [fetchError, showError]);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setError(null); // Clear errors when navigating between steps
  };

  const handleCancel = async () => {
    console.log("🧹 Cleaning up pending vehicle documents on cancel", cleanupOnCancel);
    // Cleanup pending documents when user cancels
    if (cleanupOnCancel && pendingDocumentIds.length > 0) {
      try {
        console.log(
          `🧹 Cleaning up ${pendingDocumentIds.length} pending documents on cancel`
        );
        await cleanupPendingDocuments();
      } catch (error) {
        console.error("Failed to cleanup pending documents on cancel:", error);
        // Continue with navigation even if cleanup fails
      }
    }
    // Navigate back to vehicle detail page
    navigate(`/vehicles/${id}`);
  };

  const handleUpdateVehicle = async (
    updatedVehicleData:
      | Partial<Vehicle>
      | {
          vehicleData: Partial<Vehicle>;
          files?: File[];
          documents?: any[];
          documentReplacements?: any[];
          pendingDocumentIds?: string[];
        }
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

      await handleVehicleUpdate({
        vehicleId: id,
        updatedVehicleData,
        pendingDocumentIds,
        setPendingDocumentIds,
        onSuccess: (message: string) => {
          setSuccess(
            `Vehicle ${
              (updatedVehicleData as any).vehicleData?.licensePlate ||
              vehicleData?.licensePlate
            } updated successfully!`
          );
          showSuccess(message);
        },
        onError: (message: string) => {
          setError(message);
          showError(message);
        },
        onNavigate: (path: string) => {
          navigate(path);
        },
      });
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

  // ============================================================================
  // Render
  // ============================================================================

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
  if (fetchError && !vehicleData) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Edit Vehicle
        </Typography>
        <Alert severity="error">
          <Typography variant="subtitle2" gutterBottom>
            Failed to Load Vehicle
          </Typography>
          {fetchError}
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
          vehicleId={id}
          initialDocuments={vehicleDocuments}
          onPendingDocumentIdsChange={setPendingDocumentIds}
          onCancel={handleCancel}
        />
      )}
    </Box>
  );
};

export default EditVehiclePage;
