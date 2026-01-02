import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Alert } from "@mui/material";
import { CustomerForm } from "../components/CustomerForm/CustomerForm";
import { useUpdateAdministrator } from "../hooks/useUpdateAdministrator";
import { usePendingDocuments } from "../../../shared/hooks/usePendingDocuments";
import { EditPageLoadingState, EditPageErrorState } from "../../../shared/components";
import { useAdministratorDataLoader } from "../hooks/useAdministratorDataLoader";
import { handleAdministratorUpdate } from "../utils/administratorUpdateHandler";

export const EditAdministratorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAdministrator, loading } = useUpdateAdministrator();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Track pending documents for optimistic updates
  const {
    pendingDocumentIds,
    setPendingDocumentIds,
    cleanupPendingDocuments,
    cleanupOnCancel,
  } = usePendingDocuments({
    entityType: "administrator",
    entityId: id,
    enabled: !!id,
    cleanupOnUnmount: false,
    cleanupOnCancel: false,
  });

  // Administrator data loading hook
  const {
    initialData,
    loading: loadingData,
    error: fetchError,
    loadAdministratorData,
  } = useAdministratorDataLoader({
    administratorId: id,
    setPendingDocumentIds,
  });

  // Load administrator data on mount
  useEffect(() => {
    loadAdministratorData();
  }, [loadAdministratorData]);

  // Sync fetch error with local error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  const handleCancel = async () => {
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
    // Navigate back to administrator detail page
    navigate(`/administrators/${id}`);
  };

  const handleSubmit = async (data: any) => {
    if (!id) {
      setError("Administrator ID is required");
      return;
    }

    try {
      await handleAdministratorUpdate({
        administratorId: id,
        data,
        pendingDocumentIds,
        setPendingDocumentIds,
        updateAdministrator,
        onSuccess: () => {
          navigate(`/administrators/${id}`);
        },
        onError: (message: string) => {
          setError(message);
        },
      });
    } catch (error: any) {
      console.error("Failed to update administrator:", error);
      setError("Failed to update administrator. Please try again.");
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loadingData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EditPageLoadingState message="Loading administrator data..." useContainer={false} />
      </Box>
    );
  }

  if (fetchError && !initialData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <EditPageErrorState error={fetchError} useContainer={false} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Edit Administrator
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Update administrator information and documents
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <CustomerForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          steps={[
            "Customer Type",
            "Administrator Details",
            "Documents",
            "Review",
          ]}
          isEdit={true}
          administratorId={id}
          onPendingDocumentIdsChange={(ids) => {
            // Update the hook's pending document IDs when documents are created/replaced
            console.log("📋 Pending document IDs updated:", ids);
            setPendingDocumentIds(ids);
          }}
          onCancel={handleCancel}
        />
      </Box>
    </Box>
  );
};
