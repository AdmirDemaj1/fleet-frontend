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
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Calculate,
  AttachMoney,
  TrendingUp,
  Info,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import {
  ContractFormProps,
  ContractFormData,
  ContractType,
} from "../../../types/contract.types";
import { generateContractNumber } from "../../../utils/contractNumberGenerator";
import { euriborApi } from "../../../../euribor/api/euriborApi";
import { EuriborTenor } from "../../../../euribor/types/euribor.types";

import { CustomerPicker } from "../CustomerPicker/CustomerPicker";
import { VehiclePicker } from "../VehiclePicker/VehiclePicker";
import { EndorserPicker } from "../EndorserPicker/EndorserPicker";
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
    label: "Collaterals",
    description: "Select vehicles as collateral for this contract",
  },
  {
    id: "endorsers",
    label: "Endorsers",
    description: "Add guarantors and endorsers",
  },
  {
    id: "review",
    label: "Review & Submit",
    description: "Review all details and upload documents before submission",
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

  // Euribor rate state - Store as percentages (e.g., 3 for 3%, not 0.03)
  const [euriborRate, setEuriborRate] = useState<number>(0);
  const [marginRate, setMarginRate] = useState<number>(0);
  const [loadingEuribor, setLoadingEuribor] = useState<boolean>(false);
  const [euriborError, setEuriborError] = useState<string | null>(null);
  const [euriborDate, setEuriborDate] = useState<string | null>(null);

  const methods = useForm<ContractFormData>({
    defaultValues: {
      type: ContractType.LOAN,
      contractNumber: "",
      customerId: preSelectedCustomerId || "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      totalAmount: 0,
      loanDetails: {
        interestRate: 0,
        loanTermMonths: 36,
        monthlyPayment: 0,
        processingFeePercentage: 0.02,
        earlyRepaymentPenalty: 0.03,
        paymentScheduleType: "monthly_fixed",
      },
      selectedVehicles: [],
      selectedVehicleData: [], // Initialize vehicle data array
      selectedCustomerData: null, // Initialize customer data with documents
      selectedEndorsers: [],
      guaranteeForContract: 0,
      vehicleAsCollateral: false, // Track if selected vehicle should be used as collateral
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

  // Handle guarantee amount change (defined after setValue is available)
  const handleGuaranteeAmountChange = useCallback(
    (amount: number) => {
      console.log("💰 Guarantee amount change:", amount);
      setValue("guaranteeForContract", amount, { shouldValidate: true });
    },
    [setValue]
  );

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

  // Fetch current 12M Euribor rate
  useEffect(() => {
    const fetchEuriborRate = async () => {
      setLoadingEuribor(true);
      setEuriborError(null);

      try {
        const contractDate =
          watchedData.startDate || dayjs().format("YYYY-MM-DD");
        console.log("📊 Fetching 12M Euribor rate for date:", contractDate);

        // Try to get the rate for the specific date
        let rateData = await euriborApi.getRateForDate(
          contractDate,
          EuriborTenor.TWELVE_MONTHS
        );

        // If no rate for that date, get the latest available rate
        if (!rateData) {
          console.log(
            "📊 No rate for specific date, fetching latest 12M Euribor rate"
          );
          rateData = await euriborApi.getLatestRate(EuriborTenor.TWELVE_MONTHS);
        }

        if (rateData) {
          // Convert from decimal (0.03) to percentage (3)
          const percentageRate = rateData.rateValue * 100;
          setEuriborRate(percentageRate);
          setEuriborDate(rateData.rateDate);
          console.log(
            "✅ Euribor rate fetched:",
            percentageRate,
            "% (from",
            rateData.rateValue,
            ") for date:",
            rateData.rateDate
          );
        } else {
          setEuriborError(
            "No 12M Euribor rate available. Please set one in Euribor Rates Management."
          );
          console.warn("⚠️ No 12M Euribor rate available");
        }
      } catch (error) {
        console.error("❌ Error fetching Euribor rate:", error);
        setEuriborError("Failed to load Euribor rate");
      } finally {
        setLoadingEuribor(false);
      }
    };

    fetchEuriborRate();
  }, [watchedData.startDate]);

  // Update total interest rate when either euribor or margin changes
  useEffect(() => {
    // Add the percentages (e.g., 3 + 2 = 5)
    const totalPercentage = Number(euriborRate) + Number(marginRate);
    // Convert to decimal for the form (e.g., 5 -> 0.05)
    const totalDecimal = totalPercentage / 100;

    setValue("loanDetails.interestRate", totalDecimal, {
      shouldValidate: true,
    });
    console.log(
      "📊 Interest rate:",
      euriborRate,
      "+",
      marginRate,
      "=",
      totalPercentage,
      "% (",
      totalDecimal,
      "decimal)"
    );
  }, [euriborRate, marginRate, setValue]);

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
        console.log("  📄 Documents Count:", data.documents?.length || 0);
        console.log(
          "  📤 Has Documents:",
          data.documents && data.documents.length > 0
        );
        console.log("  💰 Guarantee Amount:", data.guaranteeForContract || 0);
        console.log(
          "  👤 Selected Endorsers:",
          data.selectedEndorsers?.length || 0
        );

        // Build collaterals array from vehicle selection if marked as collateral
        console.log("🔍 Building collaterals - vehicleAsCollateral:", data.vehicleAsCollateral);
        console.log("🔍 Selected vehicle data:", data.selectedVehicleData);
        
        const collaterals =
          data.vehicleAsCollateral &&
          data.selectedVehicleData &&
          data.selectedVehicleData.length > 0
            ? data.selectedVehicleData.map((vehicle) => {
                console.log("🚗 Vehicle for collateral:", {
                  id: vehicle.id,
                  licensePlate: vehicle.licensePlate,
                  make: vehicle.make,
                  model: vehicle.model,
                });
                
                // Ensure license plate is not empty - this is required for collaterals
                if (!vehicle.licensePlate) {
                  console.error("❌ Vehicle missing license plate for collateral:", vehicle.id);
                }
                
                return {
                  type: "vehicle" as const,
                  description: `Vehicle collateral: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                  value: vehicle.marketValue || vehicle.currentValuation || 0,
                  active: true,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  licensePlate: vehicle.licensePlate || "", // Ensure it's at least an empty string
                  vinNumber: vehicle.vinNumber,
                  color: vehicle.color || "",
                  engineNumber: "",
                  registrationCertificate: "",
                  insurancePolicy: "",
                };
              })
            : [];

        // Extract files and document metadata from the documents array
        const files: File[] = [];
        const documentMetadata: {
          type: string;
          title: string;
          description?: string;
          expiryDate: string;
        }[] = [];

        if (data.documents && data.documents.length > 0) {
          data.documents.forEach((doc: any) => {
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
                    .split("T")[0], // Default to 1 year from now
              });
            }
          });
        }

        console.log("  📁 Files to upload:", files.length);
        console.log("  📋 Document metadata:", documentMetadata);

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
          collaterals,
          endorserCollaterals:
            data.selectedEndorsers?.map((endorserId) => {
              const guaranteeAmount =
                data.guaranteeForContract || data.totalAmount;
              return {
                type: "personal_guarantee" as const,
                description: `Personal guarantee by endorser ${endorserId}`,
                value: guaranteeAmount,
                endorserId: endorserId,
                guaranteedAmount: guaranteeAmount,
                guaranteeType: "personal_guarantee",
                requiresNotarization: false,
                guaranteeForContract: data.guaranteeForContract,
                guaranteeExpirationDate: data.endDate,
                legalDocumentReference: `GUARANTEE-${data.contractNumber}-${endorserId}`,
              };
            }) || [],
          terms: data.terms || {},
        };

        // Build the submit data with files and document metadata
        const submitData: any = {
          ...baseContractData,
          // Add files and document metadata for the new multipart/form-data approach
          files: files.length > 0 ? files : undefined,
          documents: documentMetadata.length > 0 ? documentMetadata : undefined,
        };

        console.log("  📤 Submitting contract with", files.length, "documents");

        // Add loan details if it's a loan contract
        if (data.type === ContractType.LOAN && data.loanDetails) {
          // Calculate total interest
          const totalInterest =
            data.loanDetails.monthlyPayment * data.loanDetails.loanTermMonths -
            data.totalAmount;

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
            totalInterest: Math.round(totalInterest * 100) / 100, // Round to 2 decimal places
            processingFeePercentage: data.loanDetails.processingFeePercentage,
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
    [onSubmit]
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
            onCustomerDataChange={(customerData) => {
              setValue("selectedCustomerData", customerData, {
                shouldValidate: false, // Optional field
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

            {/* Interest Rate Section with Euribor + Margin */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  color: "primary.main",
                  mt: 2,
                }}
              >
                <TrendingUp />
                Interest Rate Calculation
              </Typography>
            </Grid>

            {/* Euribor Rate (Read-only) */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="12M Euribor Rate"
                value={loadingEuribor ? "Loading..." : euriborRate.toFixed(2)}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUp color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        %
                        {euriborDate && (
                          <Tooltip
                            title={`Rate from ${dayjs(euriborDate).format(
                              "MMM DD, YYYY"
                            )}`}
                          >
                            <Info fontSize="small" color="action" />
                          </Tooltip>
                        )}
                      </Box>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  euriborError ||
                  (euriborDate
                    ? `Rate from ${dayjs(euriborDate).format("MMM DD, YYYY")}`
                    : "12-month Euribor base rate")
                }
                error={!!euriborError}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "primary.main",
                    fontWeight: 600,
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                }}
              />
            </Grid>

            {/* Margin Rate (Editable) */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Margin Rate"
                type="number"
                value={marginRate}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setMarginRate(value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                }}
                helperText="Additional margin on top of Euribor (e.g., 5.00 for 5%)"
                required
              />
            </Grid>

            {/* Total Interest Rate (Calculated) */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Annual Interest Rate"
                value={(Number(euriborRate) + Number(marginRate)).toFixed(2)}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Calculate color="success" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                helperText="Euribor + Margin (auto-calculated)"
                sx={{
                  "& .MuiInputBase-input": {
                    color: "success.main",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: (theme) => theme.palette.action.hover,
                    border: (theme) =>
                      `2px solid ${theme.palette.success.main}`,
                  },
                }}
              />
            </Grid>

            {/* Visual Calculation Display */}
            <Grid item xs={12}>
              <Card
                elevation={0}
                sx={{
                  bgcolor: (theme) => theme.palette.info.main + "10",
                  border: (theme) => `1px solid ${theme.palette.info.main}`,
                }}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={`Euribor: ${euriborRate.toFixed(2)}%`}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="h6">+</Typography>
                    <Chip
                      label={`Margin: ${marginRate.toFixed(2)}%`}
                      color="default"
                      variant="outlined"
                    />
                    <Typography variant="h6">=</Typography>
                    <Chip
                      label={`Total: ${(
                        Number(euriborRate) + Number(marginRate)
                      ).toFixed(2)}%`}
                      color="success"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </CardContent>
              </Card>
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

            {/* Processing Fee Percentage */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Processing Fee Percentage"
                type="number"
                value={
                  watchedData.loanDetails?.processingFeePercentage
                    ? parseFloat(
                        (
                          watchedData.loanDetails.processingFeePercentage * 100
                        ).toFixed(10)
                      )
                    : ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "" || inputValue === null) {
                    setValue("loanDetails.processingFeePercentage", 0, {
                      shouldValidate: true,
                    });
                  } else {
                    const percentageValue = parseFloat(inputValue);
                    if (!isNaN(percentageValue)) {
                      const decimalValue = percentageValue / 100;
                      setValue(
                        "loanDetails.processingFeePercentage",
                        decimalValue,
                        {
                          shouldValidate: true,
                        }
                      );
                    }
                  }
                }}
                error={!!errors.loanDetails?.processingFeePercentage}
                helperText={
                  errors.loanDetails?.processingFeePercentage?.message ||
                  "Enter percentage value (e.g., 2 for 2%)"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
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
                    ? parseFloat(
                        (
                          watchedData.loanDetails.earlyRepaymentPenalty * 100
                        ).toFixed(10)
                      )
                    : ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === "" || inputValue === null) {
                    setValue("loanDetails.earlyRepaymentPenalty", 0, {
                      shouldValidate: true,
                    });
                  } else {
                    const penalty = parseFloat(inputValue) / 100;
                    if (!isNaN(penalty)) {
                      setValue("loanDetails.earlyRepaymentPenalty", penalty, {
                        shouldValidate: true,
                      });
                    }
                  }
                }}
                error={!!errors.loanDetails?.earlyRepaymentPenalty}
                helperText={
                  errors.loanDetails?.earlyRepaymentPenalty?.message ||
                  "Enter percentage value (e.g., 3 for 3%) - Optional"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
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
            vehicleAsCollateral={watchedData.vehicleAsCollateral || false}
            onVehicleAsCollateralChange={(isCollateral) => {
              setValue("vehicleAsCollateral", isCollateral, {
                shouldValidate: false,
              });
            }}
            error={errors.selectedVehicles?.message}
          />
        );

      case 3: // Endorsers
        return (
          <EndorserPicker
            selectedEndorserIds={watchedData.selectedEndorsers}
            onEndorserSelect={(endorserIds) => {
              setValue("selectedEndorsers", endorserIds, {
                shouldValidate: true,
              });
            }}
            guaranteeForContract={watchedData.guaranteeForContract}
            onGuaranteeForContractChange={handleGuaranteeAmountChange}
            totalContractAmount={watchedData.totalAmount}
            onCreateEndorser={() => {
              // Handle create new endorser
              console.log("Create new endorser");
            }}
            error={errors.selectedEndorsers?.message}
          />
        );

      case 4: // Review & Submit
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
                        {watchedData.loanDetails.processingFeePercentage && (
                          <Typography variant="body2">
                            <strong>Processing Fee:</strong>{" "}
                            {(
                              watchedData.loanDetails.processingFeePercentage *
                              100
                            ).toFixed(2)}
                            %
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

              {/* Vehicle Collateral Status */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: watchedData.vehicleAsCollateral
                      ? "success.main"
                      : "divider",
                    height: "100%",
                    bgcolor: watchedData.vehicleAsCollateral
                      ? "success.50"
                      : "background.paper",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      Vehicle Collateral
                    </Typography>
                    {!watchedData.vehicleAsCollateral ? (
                      <Typography variant="body2" color="text.secondary">
                        Vehicle not marked as collateral
                      </Typography>
                    ) : watchedData.selectedVehicleData &&
                      watchedData.selectedVehicleData.length > 0 ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          ✓ Vehicle marked as collateral
                        </Typography>
                        {watchedData.selectedVehicleData.map((vehicle: any) => (
                          <Box key={vehicle.id}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Value: $
                              {(
                                vehicle.marketValue ||
                                vehicle.currentValuation ||
                                0
                              ).toLocaleString()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="warning.main">
                        Vehicle marked as collateral but no vehicle data
                        available
                      </Typography>
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
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Endorser IDs:{" "}
                          {watchedData.selectedEndorsers.join(", ")}
                        </Typography>
                        {watchedData.guaranteeForContract &&
                          watchedData.guaranteeForContract > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                color="info.main"
                                display="block"
                                sx={{ fontWeight: 600 }}
                              >
                                💰 Guarantee Amount: $
                                {watchedData.guaranteeForContract.toLocaleString()}
                                {watchedData.totalAmount > 0 && (
                                  <>
                                    {" "}
                                    (
                                    {(
                                      (watchedData.guaranteeForContract /
                                        watchedData.totalAmount) *
                                      100
                                    ).toFixed(1)}
                                    % coverage)
                                  </>
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Note: Endorser capacity and validation handled
                                in endorser selection
                              </Typography>
                            </Box>
                          )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents Summary */}
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
                        No documents uploaded yet - upload below
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
            </Grid>

            {/* Document Upload Section */}
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <DocumentUpload
                documents={watchedData.documents || []}
                onDocumentsChange={(documents) => {
                  setValue("documents", documents, { shouldValidate: true });
                }}
                error={errors.documents?.message}
                customerId={watchedData.customerId || undefined}
                customerData={watchedData.selectedCustomerData || undefined} // Pass full customer data including documents
                endorserId={watchedData.selectedEndorsers?.[0]} // Use first endorser if available
                vehicleIds={watchedData.selectedVehicles || []} // Pass selected vehicles
                vehicleData={watchedData.selectedVehicleData || []} // Pass full vehicle data including documents
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Validation Summary - Now at the bottom */}
            <Grid container spacing={3}>
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
                              Driving Permit, Customer Registration, Contract
                              Agreement, Business Registration, Tax Certificate)
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
      case 3: // Endorsers
        // If an endorser is selected and guarantee amount is set, validate it doesn't exceed capacity
        if (
          watchedData.selectedEndorsers.length > 0 &&
          watchedData.guaranteeForContract
        ) {
          // This validation would require endorser data, which we don't have here
          // The validation is handled in the EndorserPicker component UI
          return true;
        }
        return true; // Endorsers are optional
      case 4: // Review & Submit (final step with integrated document upload)
        // This is the final step, validation is handled by isValid flag
        // Document validation happens in the submit button's disabled state
        return true;
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
