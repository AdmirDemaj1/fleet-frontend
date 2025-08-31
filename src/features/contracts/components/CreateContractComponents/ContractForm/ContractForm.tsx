import React, { useState, useCallback, useEffect } from "react";
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
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Calculate,
  AttachMoney,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import {
  ContractFormProps,
  ContractFormData,
  ContractType,
  CreateContractDto,
} from "../../../types/contract.types";
import { generateContractNumber } from "../../../utils/contractNumberGenerator";

import { CustomerPicker } from "../CustomerPicker/CustomerPicker";
import { VehiclePicker } from "../VehiclePicker/VehiclePicker";
import { EndorserPicker } from "../EndorserPicker/EndorserPicker";
import { CollateralForm } from "../CollateralForm/CollateralForm";
import { DocumentUpload } from "../DocumentUpload/DocumentUpload";

// Steps configuration
const STEPS = [
  {
    id: "customer",
    label: "Select Customer",
    description: "Choose the customer for this contract",
  },
  {
    id: "contract",
    label: "Contract Details",
    description: "Basic contract information and financial terms",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    description: "Select vehicles for this contract",
  },
  {
    id: "collaterals",
    label: "Collaterals",
    description: "Add additional vehicle collaterals",
  },
  {
    id: "endorsers",
    label: "Endorsers",
    description: "Add guarantors and endorsers",
  },
  {
    id: "documents",
    label: "Documents",
    description: "Upload required documents for contract approval",
  },
  {
    id: "review",
    label: "Review & Submit",
    description: "Review all details before submission",
  },
];

export const ContractForm: React.FC<ContractFormProps> = ({
  initialData,
  onSubmit,
  loading,
  preSelectedCustomerId,
  isEdit = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string>("");
  const [sessionKey, setSessionKey] = useState<string | null>(null); // Backend will generate session key on first upload

  // Debug session key changes
  const handleSessionKeyChange = useCallback((newSessionKey: string) => {
    console.log("🔑 ContractForm: Session key being set:", newSessionKey);
    setSessionKey(newSessionKey);
  }, []);

  const methods = useForm<ContractFormData>({
    defaultValues: {
      type: ContractType.LOAN,
      contractNumber: "",
      customerId: preSelectedCustomerId || "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      totalAmount: 0,
      loanDetails: {
        interestRate: 0.12,
        loanTermMonths: 36,
        monthlyPayment: 0,
        processingFee: 0,
        earlyRepaymentPenalty: 0.03,
        paymentScheduleType: "monthly_fixed",
      },
      selectedVehicles: [],
      selectedVehicleData: [], // Initialize vehicle data array
      selectedEndorsers: [],
      collaterals: [],
      endorserCollaterals: [],
      documents: [],
      terms: {
        insuranceRequired: true,
        penaltyRate: 0.05,
        gracePeriodDays: 15,
        defaultInterestRate: 0.18,
        earlyPaymentDiscount: 0.02,
      },
      ...initialData,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
    handleSubmit,
  } = methods;

  const watchedData = watch();

  // Auto-generate contract number when contract type changes (frontend only)
  useEffect(() => {
    if (watchedData.type && !isEdit && !watchedData.contractNumber) {
      const newContractNumber = generateContractNumber(watchedData.type);
      console.log(
        "🔢 Auto-generated contract number:",
        newContractNumber,
        "for type:",
        watchedData.type
      );
      setValue("contractNumber", newContractNumber, {
        shouldValidate: true,
      });
    }
  }, [watchedData.type, isEdit, watchedData.contractNumber, setValue]);

  // Debug logging
  useEffect(() => {
    console.log("📋 Contract Form Debug:");
    console.log("  - Contract Type:", watchedData.type);
    console.log("  - Current Contract Number:", watchedData.contractNumber);
    console.log("  - Is Edit Mode:", isEdit);
  }, [watchedData.type, watchedData.contractNumber, isEdit]);

  // Financial calculation effect
  useEffect(() => {
    const { totalAmount, loanDetails } = watchedData;

    if (
      totalAmount > 0 &&
      loanDetails?.interestRate &&
      loanDetails.interestRate > 0 &&
      loanDetails.loanTermMonths &&
      loanDetails.loanTermMonths > 0
    ) {
      // Calculate monthly payment using standard loan formula
      // M = P [ r(1 + r)^n ] / [ (1 + r)^n – 1 ]
      const P = totalAmount; // Principal
      const r = loanDetails.interestRate / 12; // Monthly interest rate
      const n = loanDetails.loanTermMonths; // Number of payments

      const monthlyPayment =
        (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

      if (!isNaN(monthlyPayment) && isFinite(monthlyPayment)) {
        setValue(
          "loanDetails.monthlyPayment",
          Math.round(monthlyPayment * 100) / 100,
          { shouldValidate: true }
        );

        // Update end date based on term
        const endDate = dayjs(watchedData.startDate)
          .add(loanDetails.loanTermMonths, "months")
          .format("YYYY-MM-DD");
        setValue("endDate", endDate, { shouldValidate: true });
      }
    }
  }, [
    watchedData.totalAmount,
    watchedData.loanDetails?.interestRate,
    watchedData.loanDetails?.loanTermMonths,
    watchedData.startDate,
    setValue,
  ]);

  const handleNext = useCallback(async () => {
    const stepValid = await trigger();
    if (stepValid) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [trigger]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const onFormSubmit = useCallback(
    async (data: ContractFormData) => {
      try {
        setSubmitError("");

        // Debug logging
        console.log("🚀 Contract Submission Debug:");
        console.log("  📋 Form Data:", data);
        console.log("  🔑 Current Session Key:", sessionKey);
        console.log("  📄 Documents Count:", data.documents?.length || 0);
        console.log(
          "  📤 Has Documents:",
          data.documents && data.documents.length > 0
        );
        console.log("  📤 Session Key Type:", typeof sessionKey);
        console.log("  📤 Session Key Truthy:", !!sessionKey);

        // Build base contract data
        const baseContractData = {
          type: data.type,
          contractNumber: data.contractNumber,
          customerId: data.customerId,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: data.totalAmount,
          interestRate: data.loanDetails?.interestRate || 0,
          vehicleIds: data.selectedVehicles || [],
          collaterals:
            data.collaterals?.map((collateral) => ({
              type: "vehicle" as const,
              description: collateral.description,
              value: collateral.value,
              active: collateral.active,
              make: collateral.make,
              model: collateral.model,
              year: collateral.year,
              licensePlate: collateral.licensePlate,
              vinNumber: collateral.vinNumber,
              color: collateral.color,
              engineNumber: collateral.engineNumber,
              registrationCertificate: collateral.registrationCertificate,
              insurancePolicy: collateral.insurancePolicy,
            })) || [],
          endorserCollaterals:
            data.selectedEndorsers?.map((endorserId) => ({
              type: "endorser" as const,
              description: `Personal guarantee by endorser ${endorserId}`,
              value: data.totalAmount * 0.5, // Default to 50% of contract amount
              endorserId: endorserId,
              guaranteedAmount: data.totalAmount * 0.5,
              guaranteeType: "personal_guarantee",
              requiresNotarization: false,
              guaranteeExpirationDate: data.endDate,
              legalDocumentReference: `GUARANTEE-${data.contractNumber}-${endorserId}`,
            })) || [],
          // Documents are handled separately via the document upload API
          terms: data.terms || {},
        };

        // Build the submit data with proper type safety
        const submitData: CreateContractDto = {
          ...baseContractData,
          // Only add sessionKey if documents were uploaded
          ...(sessionKey ? { sessionKey } : {}),
        };

        if (sessionKey) {
          console.log("  ✅ Using backend-generated session key:", sessionKey);
        } else {
          console.log(
            "  📝 No documents uploaded, creating contract without session key"
          );
        }

        // Add loan details if it's a loan contract
        if (data.type === ContractType.LOAN && data.loanDetails) {
          submitData.loanDetails = {
            type: data.type,
            contractNumber: data.contractNumber,
            customerId: data.customerId,
            startDate: data.startDate,
            endDate: data.endDate,
            totalAmount: data.totalAmount,
            interestRate: data.loanDetails.interestRate,
            loanTermMonths: data.loanDetails.loanTermMonths,
            monthlyPayment: data.loanDetails.monthlyPayment,
            processingFee: data.loanDetails.processingFee,
            earlyRepaymentPenalty: data.loanDetails.earlyRepaymentPenalty,
            paymentScheduleType:
              data.loanDetails.paymentScheduleType || "monthly_fixed",
          };
        }

        // Add leasing details if it's a leasing contract
        if (data.type === ContractType.LEASING && data.leasingDetails) {
          submitData.leasingDetails = {
            type: data.type,
            contractNumber: data.contractNumber,
            customerId: data.customerId,
            startDate: data.startDate,
            endDate: data.endDate,
            totalAmount: data.totalAmount,
            residualValue: data.leasingDetails.residualValue,
            leaseTermMonths: data.leasingDetails.leaseTermMonths,
            monthlyPayment: data.leasingDetails.monthlyPayment,
            advancePayment: data.leasingDetails.advancePayment,
            withPurchaseOption: data.leasingDetails.withPurchaseOption,
            purchaseOptionPrice: data.leasingDetails.purchaseOptionPrice,
          };
        }

        console.log(
          "📤 Submitting contract data:",
          JSON.stringify(submitData, null, 2)
        );
        console.log("🚀 Final contract submission data:", submitData);

        await onSubmit(submitData);
      } catch (error) {
        console.error("❌ Contract submission error:", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "An error occurred while creating the contract"
        );
      }
    },
    [onSubmit, sessionKey]
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Customer Selection
        return (
          <CustomerPicker
            selectedCustomerId={watchedData.customerId}
            onCustomerSelect={(customer) => {
              setValue("customerId", customer?.id || "", {
                shouldValidate: true,
              });
            }}
            preSelectedCustomerId={preSelectedCustomerId}
            error={errors.customerId?.message}
            onCreateCustomer={() => {
              // Handle create new customer - could open a modal or navigate to customer creation
              console.log("Create new customer");
              // For now, open in new tab
              window.open("/customers/new", "_blank");
            }}
          />
        );

      case 1: // Contract Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AttachMoney />
                Basic Contract Information
              </Typography>
            </Grid>

            {/* Contract Number */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Number"
                placeholder="e.g., LOAN-2024-001"
                value={watchedData.contractNumber}
                onChange={(e) =>
                  setValue("contractNumber", e.target.value, {
                    shouldValidate: true,
                  })
                }
                error={!!errors.contractNumber}
                helperText={
                  errors.contractNumber?.message ||
                  "Unique identifier for this contract (auto-generated based on type)"
                }
                required
              />
            </Grid>

            {/* Contract Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={watchedData.type}
                  onChange={(e) =>
                    setValue("type", e.target.value as ContractType, {
                      shouldValidate: true,
                    })
                  }
                  label="Contract Type"
                >
                  <MenuItem value={ContractType.LOAN}>Loan</MenuItem>
                  <MenuItem value={ContractType.LEASING}>Leasing</MenuItem>
                </Select>
                <FormHelperText>
                  {errors.type?.message || "Select the type of contract"}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={
                  watchedData.startDate ? dayjs(watchedData.startDate) : dayjs()
                }
                onChange={(newDate) => {
                  const dateString = newDate
                    ? newDate.format("YYYY-MM-DD")
                    : dayjs().format("YYYY-MM-DD");
                  setValue("startDate", dateString, { shouldValidate: true });
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText:
                      errors.startDate?.message ||
                      "Select the contract start date",
                    required: true,
                  },
                }}
                minDate={dayjs()}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                value={
                  watchedData.endDate
                    ? dayjs(watchedData.endDate).format("MMM DD, YYYY")
                    : "Select loan term first"
                }
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Calculate />
                    </InputAdornment>
                  ),
                }}
                helperText="Auto-calculated based on start date and loan term"
                sx={{
                  "& .MuiInputBase-input": {
                    color: "primary.main",
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>

            {/* Total Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Loan Amount"
                type="number"
                value={watchedData.totalAmount || ""}
                onChange={(e) =>
                  setValue("totalAmount", parseFloat(e.target.value) || 0, {
                    shouldValidate: true,
                  })
                }
                error={!!errors.totalAmount}
                helperText={
                  errors.totalAmount?.message ||
                  "Principal amount to be financed"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            {/* Interest Rate */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Annual Interest Rate"
                type="number"
                value={
                  watchedData.loanDetails?.interestRate
                    ? (watchedData.loanDetails.interestRate * 100).toFixed(2)
                    : ""
                }
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) / 100;
                  setValue("loanDetails.interestRate", rate || 0, {
                    shouldValidate: true,
                  });
                }}
                error={!!errors.loanDetails?.interestRate}
                helperText={
                  errors.loanDetails?.interestRate?.message ||
                  "Annual interest rate (e.g., 12.5 for 12.5%)"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            {/* Loan Term */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loan Term"
                type="number"
                value={watchedData.loanDetails?.loanTermMonths || ""}
                onChange={(e) =>
                  setValue(
                    "loanDetails.loanTermMonths",
                    parseInt(e.target.value) || 0,
                    { shouldValidate: true }
                  )
                }
                error={!!errors.loanDetails?.loanTermMonths}
                helperText={
                  errors.loanDetails?.loanTermMonths?.message ||
                  "Loan duration in months"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">months</InputAdornment>
                  ),
                }}
                required
              />
            </Grid>

            {/* Calculated Monthly Payment */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Payment"
                type="number"
                value={
                  watchedData.loanDetails?.monthlyPayment?.toFixed(2) || "0.00"
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Calculate />
                    </InputAdornment>
                  ),
                }}
                helperText="Auto-calculated based on amount, rate, and term"
                sx={{
                  "& .MuiInputBase-input": {
                    color: "primary.main",
                    fontWeight: 600,
                  },
                }}
              />
            </Grid>

            {/* Processing Fee */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Processing Fee"
                type="number"
                value={watchedData.loanDetails?.processingFee || ""}
                onChange={(e) =>
                  setValue(
                    "loanDetails.processingFee",
                    parseFloat(e.target.value) || 0,
                    { shouldValidate: true }
                  )
                }
                error={!!errors.loanDetails?.processingFee}
                helperText={
                  errors.loanDetails?.processingFee?.message ||
                  "One-time processing fee (optional)"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Early Repayment Penalty */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Early Repayment Penalty"
                type="number"
                value={
                  watchedData.loanDetails?.earlyRepaymentPenalty
                    ? (
                        watchedData.loanDetails.earlyRepaymentPenalty * 100
                      ).toFixed(2)
                    : ""
                }
                onChange={(e) => {
                  const penalty = parseFloat(e.target.value) / 100;
                  setValue("loanDetails.earlyRepaymentPenalty", penalty || 0, {
                    shouldValidate: true,
                  });
                }}
                error={!!errors.loanDetails?.earlyRepaymentPenalty}
                helperText={
                  errors.loanDetails?.earlyRepaymentPenalty?.message ||
                  "Penalty rate for early repayment (optional)"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Calculation Summary */}
            {watchedData.totalAmount > 0 &&
              watchedData.loanDetails?.monthlyPayment && (
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      bgcolor: "background.paper",
                      mt: 2,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        color="primary.main"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Calculate sx={{ mr: 1 }} />
                        Loan Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Principal
                          </Typography>
                          <Typography variant="h6" color="text.primary">
                            ${watchedData.totalAmount?.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Payment
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            ${watchedData.loanDetails.monthlyPayment.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Total Interest
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            $
                            {(
                              watchedData.loanDetails.monthlyPayment *
                                (watchedData.loanDetails.loanTermMonths || 0) -
                              watchedData.totalAmount
                            ).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">
                            Total Repayment
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            $
                            {(
                              watchedData.loanDetails.monthlyPayment *
                              (watchedData.loanDetails.loanTermMonths || 0)
                            ).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
          </Grid>
        );

      case 2: // Vehicles
        return (
          <VehiclePicker
            selectedVehicleIds={watchedData.selectedVehicles}
            onVehicleSelect={(vehicleIds) => {
              setValue("selectedVehicles", vehicleIds, {
                shouldValidate: true,
              });
            }}
            onVehicleDataChange={(vehicleData) => {
              setValue("selectedVehicleData", vehicleData, {
                shouldValidate: false, // Optional field
              });
            }}
            error={errors.selectedVehicles?.message}
          />
        );

      case 3: // Collaterals
        return (
          <CollateralForm
            collaterals={watchedData.collaterals || []}
            onCollateralsChange={(collaterals) => {
              setValue("collaterals", collaterals, { shouldValidate: true });
            }}
            error={errors.collaterals?.message}
          />
        );

      case 4: // Endorsers
        return (
          <EndorserPicker
            selectedEndorserIds={watchedData.selectedEndorsers}
            onEndorserSelect={(endorserIds) => {
              setValue("selectedEndorsers", endorserIds, {
                shouldValidate: true,
              });
            }}
            onCreateEndorser={() => {
              // Handle create new endorser
              console.log("Create new endorser");
            }}
            error={errors.selectedEndorsers?.message}
          />
        );

      case 5: // Documents
        return (
          <DocumentUpload
            documents={watchedData.documents || []}
            onDocumentsChange={(documents) => {
              setValue("documents", documents, { shouldValidate: true });
            }}
            error={errors.documents?.message}
            customerId={watchedData.customerId || undefined}
            endorserId={watchedData.selectedEndorsers?.[0]} // Use first endorser if available
            vehicleIds={watchedData.selectedVehicles || []} // Pass selected vehicles
            vehicleData={watchedData.selectedVehicleData || []} // Pass full vehicle data including documents
            sessionKey={sessionKey}
            onSessionKeyChange={handleSessionKeyChange} // Backend will generate session key on first upload
          />
        );

      case 6: // Review
        return (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CheckCircle />
              Review Contract Details
            </Typography>

            <Grid container spacing={3}>
              {/* Contract Information */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Contract Information
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2">
                        <strong>Contract Number:</strong>{" "}
                        {watchedData.contractNumber || "Not set"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {watchedData.type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Customer ID:</strong>{" "}
                        {watchedData.customerId || "Not selected"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Start Date:</strong>{" "}
                        {watchedData.startDate
                          ? dayjs(watchedData.startDate).format("MMM DD, YYYY")
                          : "Not set"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>End Date:</strong>{" "}
                        {watchedData.endDate
                          ? dayjs(watchedData.endDate).format("MMM DD, YYYY")
                          : "Not set"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Amount:</strong> $
                        {watchedData.totalAmount?.toLocaleString() || "0"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Financial Details */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Financial Details
                    </Typography>
                    {watchedData.loanDetails ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Interest Rate:</strong>{" "}
                          {(
                            (watchedData.loanDetails.interestRate || 0) * 100
                          ).toFixed(2)}
                          %
                        </Typography>
                        <Typography variant="body2">
                          <strong>Term:</strong>{" "}
                          {watchedData.loanDetails.loanTermMonths} months
                        </Typography>
                        <Typography variant="body2">
                          <strong>Monthly Payment:</strong> $
                          {watchedData.loanDetails.monthlyPayment?.toFixed(2) ||
                            "0.00"}
                        </Typography>
                        {watchedData.loanDetails.processingFee && (
                          <Typography variant="body2">
                            <strong>Processing Fee:</strong> $
                            {watchedData.loanDetails.processingFee.toFixed(2)}
                          </Typography>
                        )}
                        {watchedData.loanDetails.earlyRepaymentPenalty && (
                          <Typography variant="body2">
                            <strong>Early Repayment Penalty:</strong>{" "}
                            {(
                              watchedData.loanDetails.earlyRepaymentPenalty *
                              100
                            ).toFixed(2)}
                            %
                          </Typography>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          <strong>Total Interest:</strong> $
                          {watchedData.loanDetails.monthlyPayment &&
                          watchedData.loanDetails.loanTermMonths
                            ? (
                                watchedData.loanDetails.monthlyPayment *
                                  watchedData.loanDetails.loanTermMonths -
                                watchedData.totalAmount
                              ).toFixed(2)
                            : "0.00"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="primary.main"
                          sx={{ fontWeight: 600 }}
                        >
                          <strong>Total Repayment:</strong> $
                          {watchedData.loanDetails.monthlyPayment &&
                          watchedData.loanDetails.loanTermMonths
                            ? (
                                watchedData.loanDetails.monthlyPayment *
                                watchedData.loanDetails.loanTermMonths
                              ).toFixed(2)
                            : "0.00"}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No financial details set
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Vehicles */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Vehicles ({watchedData.selectedVehicles.length})
                    </Typography>
                    {watchedData.selectedVehicles.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No vehicles selected
                      </Typography>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {watchedData.selectedVehicles.length} vehicle(s)
                          selected
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vehicle IDs: {watchedData.selectedVehicles.join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Collaterals */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Collaterals ({watchedData.collaterals?.length || 0})
                    </Typography>
                    {!watchedData.collaterals ||
                    watchedData.collaterals.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No collaterals added
                      </Typography>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {watchedData.collaterals.length} collateral(s) added
                        </Typography>
                        {watchedData.collaterals.map(
                          (collateral: any, index: number) => (
                            <Typography
                              key={index}
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {collateral.description ||
                                `${collateral.make} ${collateral.model}`}{" "}
                              - ${collateral.value?.toLocaleString()}
                            </Typography>
                          )
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Endorsers */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Endorsers ({watchedData.selectedEndorsers.length})
                    </Typography>
                    {watchedData.selectedEndorsers.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No endorsers selected
                      </Typography>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {watchedData.selectedEndorsers.length} endorser(s)
                          selected
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Endorser IDs:{" "}
                          {watchedData.selectedEndorsers.join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Documents ({watchedData.documents?.length || 0})
                    </Typography>
                    {!watchedData.documents ||
                    watchedData.documents.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded
                      </Typography>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {watchedData.documents.length} document(s) uploaded
                        </Typography>
                        {watchedData.documents.map(
                          (doc: any, index: number) => (
                            <Typography
                              key={index}
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {doc.name} - {doc.category} ({doc.status})
                            </Typography>
                          )
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Validation Summary */}
              <Grid item xs={12}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: isValid ? "success.main" : "warning.main",
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {isValid
                        ? "✅ Contract Ready for Creation"
                        : "⚠️ Please Review Required Fields"}
                    </Typography>
                    <Typography variant="body2">
                      {isValid
                        ? "All required information has been provided. The contract is ready to be created."
                        : "Some required fields are missing or invalid. Please review the previous steps."}
                    </Typography>
                    {!isValid && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Missing Requirements:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                          {!watchedData.customerId && (
                            <li>Customer selection required</li>
                          )}
                          {!watchedData.contractNumber && (
                            <li>Contract number required</li>
                          )}
                          {!watchedData.startDate && (
                            <li>Start date required</li>
                          )}
                          {!watchedData.totalAmount && (
                            <li>Total amount required</li>
                          )}
                          {!watchedData.loanDetails?.interestRate && (
                            <li>Interest rate required</li>
                          )}
                          {!watchedData.loanDetails?.loanTermMonths && (
                            <li>Loan term required</li>
                          )}
                          {(!watchedData.documents ||
                            watchedData.documents.length === 0) && (
                            <li>
                              Required documents must be uploaded (ID Card,
                              Insurance, TPL, CASCO, Driving Permit, Customer
                              Registration, Endorser ID, Contract Agreement)
                            </li>
                          )}
                        </ul>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: // Customer Selection
        return !!watchedData.customerId;
      case 1: // Contract Details
        return !!(
          watchedData.contractNumber &&
          watchedData.totalAmount > 0 &&
          watchedData.startDate &&
          watchedData.endDate &&
          watchedData.loanDetails?.interestRate &&
          watchedData.loanDetails?.loanTermMonths
        );
      case 2: // Vehicles
        return true; // Vehicles are optional but recommended
      case 3: // Collaterals
        return true; // Collaterals are optional
      case 4: // Endorsers
        return true; // Endorsers are optional
      case 5: // Documents
        // Customer selection is no longer required for document uploads
        // Check if all required documents are uploaded
        const requiredCategories = [
          "id_card",
          "insurance",
          "tpl",
          "casco",
          "driving_permit",
          "customer_registration",
          "endorser_id",
          "contract_agreement",
        ];
        const uploadedCategories = (watchedData.documents || []).map(
          (doc) => doc.category
        );
        const hasAllRequired = requiredCategories.every((category) =>
          uploadedCategories.includes(category)
        );
        return hasAllRequired;
      default:
        return true;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? "Edit Contract" : "Create New Contract"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((step, index) => (
              <Step
                key={step.id}
                onClick={() => handleStepClick(index)}
                sx={{ cursor: "pointer" }}
              >
                <StepLabel>
                  <Typography variant="body2">{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400, mb: 3 }}>{renderStepContent()}</Box>

          {/* Error Display */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              variant="outlined"
            >
              Back
            </Button>

            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {STEPS.length}
            </Typography>

            {activeStep === STEPS.length - 1 ? (
              <Button
                startIcon={
                  loading ? <CircularProgress size={20} /> : <CheckCircle />
                }
                onClick={handleSubmit(onFormSubmit)}
                disabled={!isValid || loading || !canProceed()}
                variant="contained"
                color="primary"
              >
                {loading ? "Creating..." : "Create Contract"}
              </Button>
            ) : (
              <Button
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={!canProceed() || loading}
                variant="contained"
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </FormProvider>
    </LocalizationProvider>
  );
};
