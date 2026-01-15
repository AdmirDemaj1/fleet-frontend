import React, { useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Divider,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  Fade,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Vehicle, VehicleStatus } from "../../types/vehicleType";
import { VehicleDocumentFile } from "../VehicleDocumentUpload";
import { BasicInfoStep } from "../Steps/BasicInfoStep";
import { DetailsStep } from "../Steps/DetailsStep";
import { DocumentationStep } from "../Steps/DocumentationStep";
import { VehicleDocumentUpload } from "../VehicleDocumentUpload";
import {
  createVehicleValidationSchema,
  STEP_FIELDS,
  REQUIRED_FIELDS,
  STEP_CONFIG,
} from "../../utils/vehicleFormValidation";

// Type for the new submission data format with documents
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

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: VehicleSubmissionData | Partial<Vehicle>) => Promise<void>;
  loading: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
  isEdit?: boolean;
  vehicleId?: string;
  initialDocuments?: VehicleDocumentFile[];
  onPendingDocumentIdsChange?: (ids: string[]) => void;
  onCancel?: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  loading,
  activeStep,
  onStepChange,
  steps = STEP_CONFIG.map((config) => config.label), // Used in stepper component below
  isEdit = false,
  vehicleId,
  initialDocuments = [],
  onPendingDocumentIdsChange,
  onCancel,
}) => {
  const validationSchema = useMemo(() => createVehicleValidationSchema(), []);

  // Add state for vehicle documents (stored locally until submission)
  const [vehicleDocuments, setVehicleDocuments] =
    React.useState<VehicleDocumentFile[]>(initialDocuments);
  const [pendingDocumentIds, setPendingDocumentIds] = React.useState<string[]>(
    []
  );

  console.log("📄 Vehicle Documents Count:", vehicleDocuments.length);

  const methods = useForm<Partial<Vehicle>>({
    defaultValues: {
      licensePlate: "",
      vin: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      status: VehicleStatus.AVAILABLE,
      // mileage: null,
      fuelType: undefined,
      // transmission: '',
      // condition: '',
      legalOwner: "",
      isLiquidAsset: false,
      purchaseDate: undefined,
      // purchasePrice: null,
      // registrationDate: null,
      // registrationExpiryDate: null,
      // insuranceProvider: '',
      // insurancePolicyNumber: '',
      // insuranceExpiryDate: null,
      currentValuation: undefined,
      marketValue: undefined,
      depreciatedValue: undefined,
      ...initialData,
    },
    // @ts-ignore - Validation schema mismatch due to commented out fields
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    getValues,
    reset,
  } = methods;

  console.log("isValid", isValid, errors);

  // Get step-specific validation fields
  const getStepFields = useCallback((step: number) => {
    switch (step) {
      case 0:
        return STEP_FIELDS.BASIC_INFO;
      case 1:
        return STEP_FIELDS.DETAILS;
      case 2:
        return STEP_FIELDS.DOCUMENTATION;
      case 3:
        return STEP_FIELDS.DOCUMENTS;
      default:
        return [];
    }
  }, []);

  // Get required fields for each step
  const getRequiredFields = useCallback((step: number) => {
    switch (step) {
      case 0:
        return REQUIRED_FIELDS.BASIC_INFO;
      case 1:
        return REQUIRED_FIELDS.DETAILS;
      case 2:
        return REQUIRED_FIELDS.DOCUMENTATION;
      case 3:
        return REQUIRED_FIELDS.DOCUMENTS;
      default:
        return [];
    }
  }, []);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const stepFields = getStepFields(activeStep);
    const requiredFields = getRequiredFields(activeStep);

    // Special handling for documents step
    if (activeStep === 3) {
      // For now, allow the documents step to proceed even without documents
      // This can be made more strict later if needed
      return true;
    }

    // Check if all required fields are filled and have no errors
    const hasRequiredValues = requiredFields.every((field) => {
      const value = getValues(field);
      return value !== null && value !== undefined && value !== "";
    });

    // Check if any step fields have errors
    const hasNoErrors = stepFields.every((field) => !errors[field]);

    return hasRequiredValues && hasNoErrors;
  }, [activeStep, errors, getStepFields, getRequiredFields, getValues]);

  // Validate current step before navigation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(activeStep);
    const result = await trigger(stepFields);
    return result;
  }, [activeStep, getStepFields, trigger]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid) {
      onStepChange(activeStep + 1);
    }
  }, [activeStep, onStepChange, validateCurrentStep]);

  const handleBack = useCallback(() => {
    onStepChange(activeStep - 1);
  }, [activeStep, onStepChange]);

  // Final submission with full validation
  const handleFinalSubmit = useCallback(
    async (data: Partial<Vehicle>) => {
      try {
        // Trigger validation for all fields
        const isFormValid = await trigger();

        if (!isFormValid) {
          console.error("Form validation failed");
          return;
        }

        console.log("🚗 Submitting vehicle data");
        console.log("📄 Documents to upload:", vehicleDocuments.length);
        console.log("📋 Vehicle data:", data);

        // Extract files and document metadata from the documents array
        const files: File[] = [];
        const documentMetadata: {
          type: string;
          title: string;
          description?: string;
          expiryDate: string;
          parentDocumentId?: string; // For document replacements
          version?: number;
        }[] = [];
        const documentReplacements: {
          oldDocumentId: string;
          newDocumentId: string;
        }[] = [];

        if (vehicleDocuments && vehicleDocuments.length > 0) {
          vehicleDocuments.forEach((doc) => {
            // Only process documents with files (new uploads or pending replacements)
            if (doc.file) {
              files.push(doc.file);
              documentMetadata.push({
                type: doc.category,
                title: doc.name,
                description: doc.description || "",
                expiryDate:
                  doc.expiryDate ||
                  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                parentDocumentId: doc.parentDocumentId, // Link to document being replaced
                version: doc.version,
              });

              // Track replacements
              if (doc.parentDocumentId) {
                documentReplacements.push({
                  oldDocumentId: doc.parentDocumentId,
                  newDocumentId: doc.id,
                });
              }
            }
          });
        }

        console.log("  📁 Files to upload:", files.length);
        console.log("  📋 Document metadata:", documentMetadata);

        // Clean up vehicle data - remove empty/null licensePlate and ensure numeric fields are numbers
        const cleanedData = { ...data };
        if (
          !cleanedData.licensePlate ||
          cleanedData.licensePlate.trim() === ""
        ) {
          delete cleanedData.licensePlate;
        }

        // Ensure numeric fields are proper numbers (not empty strings or invalid values)
        if (cleanedData.currentValuation !== undefined && cleanedData.currentValuation !== null) {
          const numValue = typeof cleanedData.currentValuation === 'string' 
            ? parseFloat(cleanedData.currentValuation) 
            : Number(cleanedData.currentValuation);
          if (isNaN(numValue) || !isFinite(numValue) || numValue < 0) {
            delete cleanedData.currentValuation;
          } else {
            cleanedData.currentValuation = numValue;
          }
        }

        if (cleanedData.marketValue !== undefined && cleanedData.marketValue !== null) {
          const numValue = typeof cleanedData.marketValue === 'string' 
            ? parseFloat(cleanedData.marketValue) 
            : Number(cleanedData.marketValue);
          if (isNaN(numValue) || !isFinite(numValue) || numValue < 0) {
            delete cleanedData.marketValue;
          } else {
            cleanedData.marketValue = numValue;
          }
        }

        if (cleanedData.depreciatedValue !== undefined && cleanedData.depreciatedValue !== null) {
          const numValue = typeof cleanedData.depreciatedValue === 'string' 
            ? parseFloat(cleanedData.depreciatedValue) 
            : Number(cleanedData.depreciatedValue);
          if (isNaN(numValue) || !isFinite(numValue) || numValue < 0) {
            delete cleanedData.depreciatedValue;
          } else {
            cleanedData.depreciatedValue = numValue;
          }
        }

        // Submit vehicle data with files and document metadata
        const vehicleDataWithDocuments = {
          vehicleData: cleanedData,
          files: files.length > 0 ? files : undefined,
          documents: documentMetadata.length > 0 ? documentMetadata : undefined,
          documentReplacements:
            documentReplacements.length > 0 ? documentReplacements : undefined,
          pendingDocumentIds:
            pendingDocumentIds.length > 0 ? pendingDocumentIds : undefined,
        };

        console.log("🚀 Final submission data:", vehicleDataWithDocuments);
        await onSubmit(vehicleDataWithDocuments);
      } catch (error) {
        console.error("Submission failed:", error);
      }
    },
    [onSubmit, trigger, vehicleDocuments]
  );

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        licensePlate: "",
        vin: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        status: VehicleStatus.AVAILABLE,
        // mileage: null,
        fuelType: undefined,
        // transmission: '',
        // condition: '',
        legalOwner: "",
        isLiquidAsset: false,
        // purchaseDate: null,
        // purchasePrice: null,
        // registrationDate: null,
        // registrationExpiryDate: null,
        // insuranceProvider: '',
        // insurancePolicyNumber: '',
        // insuranceExpiryDate: null,
        currentValuation: undefined,
        marketValue: undefined,
        depreciatedValue: undefined,
        ...initialData,
      });
    }
  }, [initialData, reset]);

  // Step content renderer
  const renderStepContent = useCallback(() => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <DetailsStep />;
      case 2:
        return <DocumentationStep />;
      case 3:
        return (
          <VehicleDocumentUpload
            documents={vehicleDocuments}
            onDocumentsChange={setVehicleDocuments}
            error={errors.documents?.message}
            vehicleId={vehicleId}
            onPendingDocumentIdsChange={(ids) => {
              setPendingDocumentIds(ids);
              onPendingDocumentIdsChange?.(ids);
            }}
          />
        );
      default:
        return null;
    }
  }, [activeStep, vehicleDocuments, errors.documents?.message]);

  // Get current step errors for display
  const currentStepErrors = useMemo(() => {
    const stepFields = getStepFields(activeStep);
    return stepFields
      .filter((field) => errors[field])
      .map((field) => ({
        field,
        message: errors[field]?.message,
      }));
  }, [activeStep, errors, getStepFields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Stepper */}
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEP_CONFIG.map((stepConfig, index) => (
                <Step key={stepConfig.label}>
                  <StepLabel
                    error={activeStep === index && currentStepErrors.length > 0}
                  >
                    {stepConfig.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Error Alert */}
          {currentStepErrors.length > 0 && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Please fix the following errors:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {currentStepErrors.map(({ field, message }) => (
                    <li key={field}>
                      <Typography variant="body2">{message}</Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            </Fade>
          )}

          {/* Step Content */}
          <Box mb={4}>{renderStepContent()}</Box>

          <Divider sx={{ my: 3 }} />

          {/* Navigation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              {isEdit && onCancel && (
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  onClick={onCancel}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Step indicator */}
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {STEP_CONFIG.length}
              </Typography>

              {activeStep < STEP_CONFIG.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: 2,
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={loading || !isValid}
                  onClick={handleSubmit(handleFinalSubmit)}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: 2,
                  }}
                >
                  {loading
                    ? "Saving..."
                    : isEdit
                    ? "Update Vehicle"
                    : "Create Vehicle"}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};
