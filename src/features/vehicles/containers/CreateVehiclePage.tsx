import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, Chip, Button, Stack } from "@mui/material";
import { VehicleForm } from "../components/VehicleForm/VehicleForm";
import { Vehicle, VehicleDocumentType } from "../types/vehicleType";
import { vehicleApi } from "../api/vehicleApi";
import { STEP_CONFIG } from "../utils/vehicleFormValidation";
import { useNotification } from "../../../shared/hooks/useNotification";
import { useUploadDocumentMutation } from "../api/vehicleDocumentApi";

// Type for the new submission data format
interface VehicleSubmissionData {
  vehicleData: Partial<Vehicle>;
  files?: File[];
  documents?: {
    type: string;
    title: string;
    description?: string;
    expiryDate: string;
  }[];
}

type UploadFailure = {
  key: string;
  fileName: string;
  message: string;
  index: number;
};

type DocumentUploadState = {
  status: "none" | "success" | "partial" | "failed";
  total: number;
  uploaded: number;
  failed: number;
  failures: UploadFailure[];
};

export const CreateVehiclePage: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const [uploadDocument] = useUploadDocumentMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [createdVehicleId, setCreatedVehicleId] = useState<string | null>(null);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [uploadState, setUploadState] = useState<DocumentUploadState>({
    status: "none",
    total: 0,
    uploaded: 0,
    failed: 0,
    failures: [],
  });
  const [lastUpload, setLastUpload] = useState<{
    vehicleId: string;
    files: File[];
    documents?: VehicleSubmissionData["documents"];
  } | null>(null);

  const steps = STEP_CONFIG.map((config) => config.label);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    setError(null); // Clear errors when navigating between steps
  };

  const failureKey = (file: File, meta: any) =>
    `${meta?.type || "other"}:${meta?.title || file.name}:${file.name}`;

  const uploadVehicleDocuments = async (params: {
    vehicleId: string;
    files: File[];
    documents?: VehicleSubmissionData["documents"];
    onlyKeys?: Set<string>;
  }): Promise<DocumentUploadState> => {
    const { vehicleId, files, documents, onlyKeys } = params;
    if (!vehicleId || !files || files.length === 0) {
      return { status: "none", total: 0, uploaded: 0, failed: 0, failures: [] };
    }

    let uploaded = 0;
    let failed = 0;
    const failures: UploadFailure[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = documents?.[i];
      const key = failureKey(file, meta);
      if (onlyKeys && !onlyKeys.has(key)) continue;

      try {
        const docType =
          (meta?.type as VehicleDocumentType) || VehicleDocumentType.OTHER;

        await uploadDocument({
          file,
          data: {
            type: docType,
            title: meta?.title || file.name,
            description: meta?.description || "",
            expiryDate:
              meta?.expiryDate ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            vehicleId,
          },
        }).unwrap();
        uploaded++;
      } catch (e: any) {
        failed++;
        failures.push({
          key,
          index: i,
          fileName: file.name,
          message: e?.data?.message || e?.message || "Upload failed",
        });
      }
    }

    const total = onlyKeys ? uploaded + failed : files.length;
    const status: DocumentUploadState["status"] =
      total === 0
        ? "none"
        : failed === 0
        ? "success"
        : uploaded === 0
        ? "failed"
        : "partial";

    return { status, total, uploaded, failed, failures };
  };

  const retryFailedUploads = async () => {
    if (!lastUpload) {
      showError("Nothing to retry.");
      return;
    }
    if (uploadState.failures.length === 0) {
      showSuccess("All documents are already uploaded.");
      return;
    }

    const onlyKeys = new Set(uploadState.failures.map((f) => f.key));
    setIsUploadingDocs(true);
    try {
      const retryState = await uploadVehicleDocuments({
        ...lastUpload,
        onlyKeys,
      });

      const stillFailing = new Map<string, UploadFailure>();
      for (const f of retryState.failures) stillFailing.set(f.key, f);

      const remainingFailures = uploadState.failures
        .filter((f) => onlyKeys.has(f.key))
        .map((f) => stillFailing.get(f.key) || null)
        .filter(Boolean) as UploadFailure[];

      const total = uploadState.total;
      const uploaded = Math.min(
        total,
        uploadState.uploaded + retryState.uploaded
      );
      const failed = Math.max(0, total - uploaded);
      const status: DocumentUploadState["status"] =
        total === 0
          ? "none"
          : remainingFailures.length === 0 && failed === 0
          ? "success"
          : uploaded === 0
          ? "failed"
          : "partial";

      const nextState: DocumentUploadState = {
        status,
        total,
        uploaded,
        failed,
        failures: remainingFailures,
      };
      setUploadState(nextState);

      if (nextState.status === "success") {
        showSuccess("All documents uploaded successfully.");
        setTimeout(() => {
          if (createdVehicleId) navigate(`/vehicles/${createdVehicleId}`);
        }, 800);
      } else {
        showError(
          `${nextState.failed} document(s) are still failing. You can retry again or upload later from the vehicle page.`
        );
      }
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const rollbackVehicle = async () => {
    if (!createdVehicleId) {
      showError("No vehicle to rollback.");
      return;
    }
    setIsRollingBack(true);
    try {
      const res = await vehicleApi.delete(createdVehicleId);
      if ((res as any)?.requiresApproval) {
        showError(
          res.message ||
            "Rollback requested, but deletion requires approval. Check approvals."
        );
        return;
      }
      showSuccess(res.message || "Vehicle rolled back (deleted) successfully.");
      setCreatedVehicleId(null);
      setLastUpload(null);
      setUploadState({
        status: "none",
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      });
      setSuccess(null);
    } catch (e: any) {
      showError(e?.message || "Failed to rollback vehicle.");
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleCreateVehicle = async (
    submissionData: VehicleSubmissionData | Partial<Vehicle>
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setCreatedVehicleId(null);
      setLastUpload(null);
      setUploadState({
        status: "none",
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      });

      console.log("Creating vehicle with data:", submissionData);

      // Backend responses can vary (direct Vehicle, wrapped { data }, or approval response)
      // so we keep this flexible and then safely extract the id.
      let response: any;

      // Check if this is the new format with files
      const hasDocs =
        "vehicleData" in submissionData &&
        ((submissionData.files?.length || 0) > 0 ||
          (submissionData.documents?.length || 0) > 0);

      // Always create the vehicle first; then upload docs so we can retry/rollback safely.
      console.log("📝 Creating vehicle (step 1/2)");
      const vehicleData =
        "vehicleData" in submissionData
          ? submissionData.vehicleData
          : submissionData;
      response = await vehicleApi.createVehicle(vehicleData);

      console.log("Vehicle creation response:", response);

      // Check if response indicates approval is required
      if (response?.requiresApproval) {
        showSuccess("Action requires approval. Request has been submitted.");
        // When approval is required, the vehicle may not be created yet (no id to navigate to)
        return;
      } else {
        setSuccess(
          vehicleData.licensePlate
            ? `Vehicle ${vehicleData.licensePlate} created successfully!`
            : "Vehicle created successfully!"
        );
      }

      // Extract vehicle id from response (handle multiple backend response shapes)
      const createdVehicle =
        response?.vehicle ||
        response?.data?.vehicle ||
        response?.data ||
        response;
      const vehicleId =
        createdVehicle?.id ||
        response?.vehicle?.id ||
        response?.data?.vehicle?.id ||
        response?.data?.id ||
        response?.id;

      if (!vehicleId) {
        console.error(
          "Vehicle created but no vehicle ID was returned:",
          response
        );
        setError(
          "Vehicle was created but no vehicle ID was returned. Please refresh and check the Vehicles list."
        );
        return;
      }

      setCreatedVehicleId(vehicleId);

      // Step 2: upload docs if any
      if (hasDocs) {
        const files = (submissionData as VehicleSubmissionData).files || [];
        const documents =
          (submissionData as VehicleSubmissionData).documents || [];
        setLastUpload({ vehicleId, files, documents });

        setIsUploadingDocs(true);
        showInfo(`Uploading ${files.length} document(s)...`);
        const state = await uploadVehicleDocuments({
          vehicleId,
          files,
          documents,
        });
        setUploadState(state);
        setIsUploadingDocs(false);

        if (state.status === "partial" || state.status === "failed") {
          showError(
            `Vehicle created, but ${state.failed} document(s) failed to upload. You can retry uploads or rollback.`
          );
          // Don't auto-navigate; let user decide (retry/rollback/go to vehicle).
          return;
        }
      }

      // If we got here, either no docs or all docs uploaded successfully
      setTimeout(() => {
        navigate(`/vehicles/${vehicleId}`);
      }, 800);
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

      {createdVehicleId && uploadState.status !== "none" && (
        <Box sx={{ mb: 3 }}>
          {uploadState.status === "success" ? (
            <Alert severity="success">
              Documents uploaded: {uploadState.uploaded}/{uploadState.total}
            </Alert>
          ) : (
            <Alert severity="warning">
              Vehicle created, but documents uploaded: {uploadState.uploaded}/
              {uploadState.total}. Failed: {uploadState.failed}.
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/vehicles/${createdVehicleId}`)}
              disabled={isUploadingDocs || isRollingBack}
            >
              Go to Vehicle
            </Button>
            {(uploadState.status === "partial" ||
              uploadState.status === "failed") && (
              <>
                <Button
                  variant="outlined"
                  onClick={retryFailedUploads}
                  disabled={isUploadingDocs || isRollingBack}
                >
                  Retry Failed Uploads
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={rollbackVehicle}
                  disabled={isUploadingDocs || isRollingBack}
                >
                  Rollback (Delete Vehicle)
                </Button>
              </>
            )}
          </Stack>
        </Box>
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
