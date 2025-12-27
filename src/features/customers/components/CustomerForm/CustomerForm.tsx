import React, { useMemo, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Divider,
  Alert,
  Fade,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { CustomerType } from "../../types/customer.types";
import {
  CreateCustomerDto,
  CreateIndividualCustomerDto,
  CreateBusinessCustomerDto,
  CreateAdministratorCustomerDto,
} from "../../types/customer.types";

// Form data type that includes customerType for validation
interface CustomerFormData {
  customerType: CustomerType;
  individualDetails?: CreateIndividualCustomerDto;
  businessDetails?: CreateBusinessCustomerDto;
  administratorDetails?: CreateAdministratorCustomerDto;
  administratorDocuments?: Array<{
    type: string;
    file: File;
    expiryDate: string;
    title: string;
  }>;
}
import {
  STEP_FIELDS,
  REQUIRED_FIELDS,
  STEP_CONFIG,
} from "../../utils/customerFormValidation";

// Administrator-specific step configuration
const ADMINISTRATOR_STEP_CONFIG = [
  {
    label: "Customer Type",
    description: "Select administrator customer type",
  },
  {
    label: "Administrator Details",
    description: "Enter administrator information",
  },
  {
    label: "Documents",
    description: "Upload required documents",
  },
  {
    label: "Review",
    description: "Review and confirm",
  },
] as const;
import {
  CustomerTypeStep,
  IndividualDetailsStep,
  BusinessDetailsStep,
  AdministratorDetailsStep,
  AdministratorDocumentsStep,
} from "./Steps";

interface CustomerFormProps {
  initialData?: Partial<CreateCustomerDto> & {
    administratorDocuments?: Array<{
      type: string;
      file?: File;
      expiryDate: string;
      title: string;
      documentId?: string;
      fileName?: string;
    }>;
  };
  onSubmit: (data: CreateCustomerDto) => Promise<void>;
  loading: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
  isEdit?: boolean;
  administratorId?: string; // Administrator ID for edit mode
}

// Helper function to normalize phone numbers (remove spaces and formatting)
const normalizePhoneNumber = (
  phone: string | undefined
): string | undefined => {
  if (!phone) return undefined;
  // Remove all spaces, dashes, parentheses, and keep only digits and + sign
  return phone.replace(/[\s\-\(\)]/g, "");
};

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  loading,
  activeStep,
  onStepChange,
  isEdit = false,
  administratorId,
}) => {
  const [customerType, setCustomerType] = React.useState<CustomerType>(
    initialData?.individualDetails
      ? CustomerType.INDIVIDUAL
      : initialData?.businessDetails
      ? CustomerType.BUSINESS
      : initialData?.administratorDetails
      ? CustomerType.ADMINISTRATOR
      : CustomerType.INDIVIDUAL
  );

  const methods = useForm<CustomerFormData>({
    defaultValues: {
      customerType: customerType,
      individualDetails:
        customerType === CustomerType.INDIVIDUAL
          ? {
              type: CustomerType.INDIVIDUAL,
              firstName: "",
              lastName: "",
              idNumber: "",
              dateOfBirth: "",
              address: "",
              phone: "",
              email: "",
              secondaryPhone: "",
              secondaryEmail: "",
              additionalNotes: "",
            }
          : undefined,
      businessDetails:
        customerType === CustomerType.BUSINESS
          ? {
              type: CustomerType.BUSINESS,
              legalName: "",
              nuisNipt: "",
              shareholders: [],
              administratorIds: [],
              address: "",
              phone: "",
              email: "",
              secondaryPhone: "",
              secondaryEmail: "",
              additionalNotes: "",
            }
          : undefined,
      administratorDetails:
        customerType === CustomerType.ADMINISTRATOR
          ? {
              type: CustomerType.ADMINISTRATOR,
              nuisNipt: "",
              companyName: "",
              companyEmail: "",
              companyPhone: "",
              administratorName: "",
              administratorId: "",
              administratorPosition: "",
              address: "",
              phone: "",
              email: "",
              secondaryPhone: "",
              secondaryEmail: "",
              additionalNotes: "",
            }
          : undefined,
      administratorDocuments:
        customerType === CustomerType.ADMINISTRATOR ? [] : undefined,
      ...initialData,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    getValues,
    reset,
    setValue,
  } = methods;

  // Update form when customer type changes
  React.useEffect(() => {
    const currentFormData = getValues();

    // Update the customerType field in the form
    setValue("customerType", customerType);

    // Reset form sections when type changes
    if (customerType === CustomerType.INDIVIDUAL) {
      // TODO: Why setting these to undefined
      setValue("businessDetails", undefined);
      setValue("administratorDetails", undefined);
      if (!currentFormData.individualDetails) {
        setValue("individualDetails", {
          type: CustomerType.INDIVIDUAL,
          firstName: "",
          lastName: "",
          idNumber: "",
          dateOfBirth: "",
          address: "",
          phone: "",
          email: "",
          secondaryPhone: "",
          secondaryEmail: "",
          additionalNotes: "",
        });
      }
    } else if (customerType === CustomerType.BUSINESS) {
      setValue("individualDetails", undefined);
      setValue("administratorDetails", undefined);
      if (!currentFormData.businessDetails) {
        setValue("businessDetails", {
          type: CustomerType.BUSINESS,
          legalName: "",
          nuisNipt: "",
          shareholders: [],
          administratorIds: [],
          address: "",
          phone: "",
          email: "",
          secondaryPhone: "",
          secondaryEmail: "",
          additionalNotes: "",
        });
      }
    } else if (customerType === CustomerType.ADMINISTRATOR) {
      setValue("individualDetails", undefined);
      setValue("businessDetails", undefined);
      if (!currentFormData.administratorDetails) {
        setValue("administratorDetails", {
          type: CustomerType.ADMINISTRATOR,
          nuisNipt: "",
          companyName: "",
          companyEmail: "",
          companyPhone: "",
          administratorName: "",
          administratorId: "",
          administratorPosition: "",
          address: "",
          phone: "",
          email: "",
          secondaryPhone: "",
          secondaryEmail: "",
          additionalNotes: "",
        });
      }
      if (!currentFormData.administratorDocuments) {
        setValue("administratorDocuments", []);
      }
    }
  }, [customerType, setValue, getValues]);

  // Get step-specific validation fields
  const getStepFields = useCallback(
    (step: number): string[] => {
      switch (step) {
        case 0:
          return STEP_FIELDS.CUSTOMER_TYPE;
        case 1:
          return customerType === CustomerType.INDIVIDUAL
            ? STEP_FIELDS.INDIVIDUAL_DETAILS
            : customerType === CustomerType.BUSINESS
            ? STEP_FIELDS.BUSINESS_DETAILS
            : STEP_FIELDS.ADMINISTRATOR_DETAILS;
        case 2:
          // Documents step for administrators, Review step for others
          return customerType === CustomerType.ADMINISTRATOR ? [] : [];
        case 3:
          return []; // Review step (only for administrators)
        default:
          return [];
      }
    },
    [customerType]
  );

  // Get required fields for each step
  const getRequiredFields = useCallback(
    (step: number): string[] => {
      switch (step) {
        case 0:
          return REQUIRED_FIELDS.CUSTOMER_TYPE;
        case 1:
          return customerType === CustomerType.INDIVIDUAL
            ? REQUIRED_FIELDS.INDIVIDUAL_DETAILS
            : customerType === CustomerType.BUSINESS
            ? REQUIRED_FIELDS.BUSINESS_DETAILS
            : REQUIRED_FIELDS.ADMINISTRATOR_DETAILS;
        case 2:
          // Documents step for administrators - check if required documents are uploaded
          if (customerType === CustomerType.ADMINISTRATOR) {
            const documents = getValues("administratorDocuments") || [];
            const uploadedTypes = documents.map((doc: any) => doc?.type);
            const hasRequired = ["business_administrator_id_card"].every(
              (type) => uploadedTypes.includes(type)
            );
            return hasRequired ? [] : ["administratorDocuments"];
          }
          return [];
        case 3:
          return []; // Review step (only for administrators)
        default:
          return [];
      }
    },
    [customerType, getValues]
  );

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const stepFields = getStepFields(activeStep);
    const requiredFields = getRequiredFields(activeStep);

    // Special validation for documents step (step 2 for administrators)
    if (activeStep === 2 && customerType === CustomerType.ADMINISTRATOR) {
      const documents = getValues("administratorDocuments") || [];
      const uploadedTypes = documents.map((doc: any) => doc?.type);
      const hasRequiredDocuments = ["business_administrator_id_card"].every(
        (type) => uploadedTypes.includes(type)
      );
      return hasRequiredDocuments;
    }

    // Check if all required fields are filled and have no errors
    const hasRequiredValues = requiredFields.every((field: string) => {
      const value = getValues(field as any);
      return value !== null && value !== undefined && value !== "";
    });

    // Check if any step fields have errors
    const hasNoErrors = stepFields.every((field: string) => {
      const fieldPath = field.split(".");
      let error = errors;
      for (const key of fieldPath) {
        error = (error as any)?.[key];
      }
      return !error;
    });

    return hasRequiredValues && hasNoErrors;
  }, [
    activeStep,
    customerType,
    errors,
    getStepFields,
    getRequiredFields,
    getValues,
  ]);

  // Validate current step before navigation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepFields = getStepFields(activeStep);
    const result = await trigger(stepFields as any);
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
    async (data: CustomerFormData) => {
      try {
        // Trigger validation for all fields
        const isFormValid = await trigger();

        if (!isFormValid) {
          console.error("Form validation failed");
          return;
        }

        // Transform form data to DTO (remove customerType and handle nulls)
        let transformedData: any;

        // For administrator, flatten the data to root level (no wrapper)
        // Note: type property is excluded as per backend requirements
        if (data.administratorDetails) {
          transformedData = {
            nuisNipt: data.administratorDetails.nuisNipt,
            companyName: data.administratorDetails.companyName,
            companyEmail: data.administratorDetails.companyEmail,
            companyPhone: normalizePhoneNumber(
              data.administratorDetails.companyPhone
            ),
            administratorName: data.administratorDetails.administratorName,
            administratorId: data.administratorDetails.administratorId,
            administratorPosition:
              data.administratorDetails.administratorPosition,
            address: data.administratorDetails.address,
            phone: normalizePhoneNumber(data.administratorDetails.phone),
            email: data.administratorDetails.email,
            secondaryPhone: normalizePhoneNumber(
              data.administratorDetails.secondaryPhone
            ),
            secondaryEmail:
              data.administratorDetails.secondaryEmail || undefined,
            additionalNotes:
              data.administratorDetails.additionalNotes || undefined,
            // Include documents for upload after creation
            administratorDocuments: data.administratorDocuments || [],
          };
        } else {
          // For individual and business, keep the wrapper structure
          transformedData = {
            individualDetails: data.individualDetails
              ? {
                  ...data.individualDetails,
                  phone: normalizePhoneNumber(data.individualDetails.phone),
                  secondaryPhone: normalizePhoneNumber(
                    data.individualDetails.secondaryPhone
                  ),
                  secondaryEmail:
                    data.individualDetails.secondaryEmail || undefined,
                  additionalNotes:
                    data.individualDetails.additionalNotes || undefined,
                }
              : undefined,
            businessDetails: data.businessDetails
              ? {
                  type: data.businessDetails.type,
                  legalName: data.businessDetails.legalName,
                  nuisNipt: data.businessDetails.nuisNipt,
                  address: data.businessDetails.address,
                  phone: normalizePhoneNumber(data.businessDetails.phone),
                  email: data.businessDetails.email,
                  secondaryPhone: normalizePhoneNumber(
                    data.businessDetails.secondaryPhone
                  ),
                  secondaryEmail:
                    data.businessDetails.secondaryEmail || undefined,
                  additionalNotes:
                    data.businessDetails.additionalNotes || undefined,
                  shareholders:
                    data.businessDetails.shareholders &&
                    data.businessDetails.shareholders.length > 0
                      ? data.businessDetails.shareholders
                          .map((s: any) => s.name)
                          .filter((name: string) => name.trim() !== "")
                      : undefined,
                  administratorIds:
                    data.businessDetails.administratorIds &&
                    data.businessDetails.administratorIds.length > 0
                      ? data.businessDetails.administratorIds
                      : undefined,
                }
              : undefined,
          };
        }

        await onSubmit(transformedData);
      } catch (error) {
        console.error("Submission failed:", error);
      }
    },
    [onSubmit, trigger]
  );

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        customerType: customerType,
        individualDetails:
          customerType === CustomerType.INDIVIDUAL
            ? {
                type: CustomerType.INDIVIDUAL,
                firstName: "",
                lastName: "",
                idNumber: "",
                dateOfBirth: "",
                address: "",
                phone: "",
                email: "",
                secondaryPhone: "",
                secondaryEmail: "",
                additionalNotes: "",
                ...initialData.individualDetails,
              }
            : undefined,
        businessDetails:
          customerType === CustomerType.BUSINESS
            ? {
                type: CustomerType.BUSINESS,
                legalName: "",
                nuisNipt: "",
                shareholders: [],
                administratorIds: [],
                address: "",
                phone: "",
                email: "",
                secondaryPhone: "",
                secondaryEmail: "",
                additionalNotes: "",
                ...initialData.businessDetails,
              }
            : undefined,
        administratorDetails:
          customerType === CustomerType.ADMINISTRATOR
            ? {
                type: CustomerType.ADMINISTRATOR,
                nuisNipt: "",
                companyName: "",
                companyEmail: "",
                companyPhone: "",
                administratorName: "",
                administratorId: "",
                administratorPosition: "",
                address: "",
                phone: "",
                email: "",
                secondaryPhone: "",
                secondaryEmail: "",
                additionalNotes: "",
                ...initialData.administratorDetails,
              }
            : undefined,
        administratorDocuments:
          customerType === CustomerType.ADMINISTRATOR
            ? initialData?.administratorDocuments || []
            : undefined,
      });
    }
  }, [initialData, reset, customerType]);

  // Get total steps based on customer type
  const getTotalSteps = useCallback(() => {
    return customerType === CustomerType.ADMINISTRATOR ? 4 : 3;
  }, [customerType]);

  // Step content renderer
  const renderStepContent = useCallback(() => {
    switch (activeStep) {
      case 0:
        return (
          <CustomerTypeStep
            customerType={customerType}
            onCustomerTypeChange={setCustomerType}
          />
        );
      case 1:
        return customerType === CustomerType.INDIVIDUAL ? (
          <IndividualDetailsStep />
        ) : customerType === CustomerType.BUSINESS ? (
          <BusinessDetailsStep />
        ) : (
          <AdministratorDetailsStep />
        );
      case 2:
        // Documents step for administrators, Review step for others
        if (customerType === CustomerType.ADMINISTRATOR) {
          return <AdministratorDocumentsStep administratorId={administratorId} />;
        }
        // Review step for non-administrators
        return (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Review & Confirm
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please review your information and click save to create the
              customer
            </Typography>

            <Box
              sx={{
                p: 3,
                bgcolor: (theme) => theme.palette.grey[50],
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                maxWidth: 600,
                mx: "auto",
                textAlign: "left",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Customer Type:{" "}
                {customerType === CustomerType.INDIVIDUAL
                  ? "Individual"
                  : customerType === CustomerType.BUSINESS
                  ? "Business"
                  : "Administrator"}
              </Typography>

              {customerType === CustomerType.INDIVIDUAL &&
                getValues("individualDetails") && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Name:</strong>{" "}
                      {getValues("individualDetails.firstName")}{" "}
                      {getValues("individualDetails.lastName")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong>{" "}
                      {getValues("individualDetails.email")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong>{" "}
                      {getValues("individualDetails.phone")}
                    </Typography>
                  </>
                )}

              {customerType === CustomerType.BUSINESS &&
                getValues("businessDetails") && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Business:</strong>{" "}
                      {getValues("businessDetails.legalName")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>NUIS/NIPT:</strong>{" "}
                      {getValues("businessDetails.nuisNipt")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong>{" "}
                      {getValues("businessDetails.email")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong>{" "}
                      {getValues("businessDetails.phone")}
                    </Typography>
                  </>
                )}

              {(customerType === CustomerType.INDIVIDUAL ||
                customerType === CustomerType.BUSINESS) && (
                <>
                  {customerType === CustomerType.INDIVIDUAL &&
                    getValues("individualDetails") && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Name:</strong>{" "}
                          {getValues("individualDetails.firstName")}{" "}
                          {getValues("individualDetails.lastName")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Email:</strong>{" "}
                          {getValues("individualDetails.email")}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {getValues("individualDetails.phone")}
                        </Typography>
                      </>
                    )}

                  {customerType === CustomerType.BUSINESS &&
                    getValues("businessDetails") && (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Business:</strong>{" "}
                          {getValues("businessDetails.legalName")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>NUIS/NIPT:</strong>{" "}
                          {getValues("businessDetails.nuisNipt")}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Email:</strong>{" "}
                          {getValues("businessDetails.email")}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {getValues("businessDetails.phone")}
                        </Typography>
                      </>
                    )}
                </>
              )}
            </Box>
          </Box>
        );
      case 3:
        // Review step for administrators only
        if (customerType === CustomerType.ADMINISTRATOR) {
          return (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Review & Confirm
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Please review your information and click save to create the
                administrator
              </Typography>

              <Box
                sx={{
                  p: 3,
                  bgcolor: (theme) => theme.palette.grey[50],
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                  maxWidth: 600,
                  mx: "auto",
                  textAlign: "left",
                }}
              >
                {getValues("administratorDetails") && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Company:</strong>{" "}
                      {getValues("administratorDetails.companyName")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>NUIS/NIPT:</strong>{" "}
                      {getValues("administratorDetails.nuisNipt")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Administrator:</strong>{" "}
                      {getValues("administratorDetails.administratorName")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong>{" "}
                      {getValues("administratorDetails.email")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Phone:</strong>{" "}
                      {getValues("administratorDetails.phone")}
                    </Typography>
                    {getValues("administratorDocuments") &&
                      Array.isArray(getValues("administratorDocuments")) &&
                      getValues("administratorDocuments")!.length > 0 && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Documents:</strong>{" "}
                          {getValues("administratorDocuments")!.length} uploaded
                        </Typography>
                      )}
                  </>
                )}
              </Box>
            </Box>
          );
        }
        return null;
      default:
        return null;
    }
  }, [activeStep, customerType, getValues]);

  // Get current step errors for display
  const currentStepErrors = useMemo(() => {
    const stepFields = getStepFields(activeStep);
    return stepFields
      .filter((field: string) => {
        const fieldPath = field.split(".");
        let error = errors;
        for (const key of fieldPath) {
          error = (error as any)?.[key];
        }
        return error;
      })
      .map((field: string) => ({
        field,
        message: (() => {
          const fieldPath = field.split(".");
          let error = errors;
          for (const key of fieldPath) {
            error = (error as any)?.[key];
          }
          return (error as any)?.message;
        })(),
      }));
  }, [activeStep, errors, getStepFields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              {isEdit ? "Edit Customer" : "Add New Customer"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isEdit
                ? "Update customer information"
                : "Enter customer details in the form below"}
            </Typography>
          </Box>

          {/* Stepper */}
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {(customerType === CustomerType.ADMINISTRATOR
                ? ADMINISTRATOR_STEP_CONFIG
                : STEP_CONFIG
              ).map((stepConfig: any, index: number) => (
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
                  {currentStepErrors.map(({ field, message }: any) => (
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

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Step indicator */}
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {getTotalSteps()}
              </Typography>

              {activeStep < getTotalSteps() - 1 ? (
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
                  onClick={handleSubmit((data) =>
                    handleFinalSubmit(data as unknown as CustomerFormData)
                  )}
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
                    ? "Update Customer"
                    : "Create Customer"}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};
