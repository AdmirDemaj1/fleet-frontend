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
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Calculate,
  AttachMoney,
  TrendingUp,
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
  onValidate,
  loading,
  isValidating = false,
  preSelectedCustomerId,
  isEdit = false,
  contractId,
  onPendingDocumentIdsChange,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string>("");

  // Euribor rate state - Store as percentages (e.g., 3 for 3%, not 0.03)
  // User-editable minimum allowed total annual interest rate (Euribor + Margin), in percentage points.
  // Example: 0.01 means 0.01% annual.
  const [minTotalAnnualInterestPercent, setMinTotalAnnualInterestPercent] =
    useState<number>(1);

  useEffect(() => {
    const valueFromInitialData =
      initialData?.minimumTotalAnnualInterestPercent ??
      initialData?.loanDetails?.minimumTotalAnnualInterestPercent;

    if (valueFromInitialData !== undefined) {
      setMinTotalAnnualInterestPercent(
        Number(valueFromInitialData) || 0
      );
    }
  }, [
    initialData?.loanDetails?.minimumTotalAnnualInterestPercent,
    initialData?.minimumTotalAnnualInterestPercent,
  ]);

  const [euriborRate, setEuriborRate] = useState<number>(0);
  const [marginRate, setMarginRate] = useState<number>(1);
  const [euriborRateId, setEuriborRateId] = useState<string | null>(null);
  const [euriborTenor, setEuriborTenor] = useState<string | null>(null);
  const [loadingEuribor, setLoadingEuribor] = useState<boolean>(false);
  const [euriborError, setEuriborError] = useState<string | null>(null);
  const [euriborDate, setEuriborDate] = useState<string | null>(null);
  const [availableEuriborRates, setAvailableEuriborRates] = useState<any[]>([]);
  const [loadingEuriborRates, setLoadingEuriborRates] =
    useState<boolean>(false);

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
      euriborRateId: undefined,
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
    getValues,
    formState: { errors, isValid },
    handleSubmit,
  } = methods;

  const watchedData = watch();
  const totalInterestPercent = Number(euriborRate) + Number(marginRate);
  const isInterestBelowMinimum =
    totalInterestPercent < minTotalAnnualInterestPercent;

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

  // Fetch available 12M Euribor rates for selection
  useEffect(() => {
    const fetchAvailableEuriborRates = async () => {
      setLoadingEuriborRates(true);
      try {
        const response = await euriborApi.getAll({
          tenor: EuriborTenor.TWELVE_MONTHS,
          isActive: true,
          limit: 100, // Get enough rates to choose from
        });
        const rates = response.data || [];
        setAvailableEuriborRates(rates);
        console.log("📊 Available Euribor rates:", rates.length);
      } catch (error) {
        console.error("❌ Error fetching available Euribor rates:", error);
      } finally {
        setLoadingEuriborRates(false);
      }
    };

    fetchAvailableEuriborRates();
  }, []);

  // Fetch and auto-select 12M Euribor rate based on contract date
  useEffect(() => {
    const fetchEuriborRate = async () => {
      // Don't auto-fetch if user has already manually selected a rate
      // Check if there's a valid rate ID that was manually set
      if (euriborRateId) {
        console.log(
          "⏭️ Skipping auto-fetch - rate already selected:",
          euriborRateId
        );
        return;
      }

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
          // Store the Euribor rate ID and tenor
          if (rateData.id) {
            setEuriborRateId(rateData.id);
            setValue("euriborRateId", rateData.id); // Also update form state

            // Add the auto-fetched rate to available rates if it's not already there
            setAvailableEuriborRates((prev) => {
              const exists = prev.some((r) => r.id === rateData.id);
              if (!exists && rateData.id) {
                return [...prev, rateData];
              }
              return prev;
            });
          }
          if (rateData.tenor) {
            setEuriborTenor(rateData.tenor);
          }
          console.log(
            "✅ Euribor rate fetched:",
            percentageRate,
            "% (from",
            rateData.rateValue,
            ") for date:",
            rateData.rateDate,
            "ID:",
            rateData.id,
            "Tenor:",
            rateData.tenor
          );
        } else {
          setEuriborError(
            "No 12M Euribor rate available. Please select one from the dropdown."
          );
          console.warn("⚠️ No 12M Euribor rate available");
        }
      } catch (error) {
        console.error("❌ Error fetching Euribor rate:", error);
        setEuriborError(
          "Failed to load Euribor rate. Please select one manually."
        );
      } finally {
        setLoadingEuribor(false);
      }
    };

    fetchEuriborRate();
  }, [watchedData.startDate, euriborRateId]);

  // Handle manual Euribor rate selection
  const handleEuriborRateChange = (selectedRateId: string) => {
    console.log("🔄 handleEuriborRateChange called with:", selectedRateId);
    console.log("🔄 Available rates:", availableEuriborRates.length);
    console.log(
      "🔄 Available rate IDs:",
      availableEuriborRates.map((r) => r.id)
    );

    if (!selectedRateId || selectedRateId === "" || selectedRateId === "null") {
      console.warn("⚠️ Empty or invalid rate ID selected");
      setEuriborRateId(null);
      setValue("euriborRateId", undefined);
      setEuriborError("Please select a valid Euribor rate");
      return;
    }

    const selectedRate = availableEuriborRates.find(
      (rate) => rate.id === selectedRateId
    );
    console.log("🔄 Found rate:", selectedRate);

    if (!selectedRate) {
      console.error("❌ Rate not found for ID:", selectedRateId);
      setEuriborError("Selected rate not found. Please try selecting again.");
      return;
    }

    // Use the selectedRateId directly (from the parameter) instead of selectedRate.id
    // to ensure we always use the ID that was actually selected
    const rateId = selectedRateId;
    const percentageRate = selectedRate.rateValue * 100;

    console.log("🔄 Setting Euribor rate ID:", rateId);
    console.log("🔄 Rate details:", {
      id: rateId,
      rateValue: selectedRate.rateValue,
      percentageRate,
      date: selectedRate.rateDate,
      tenor: selectedRate.tenor,
    });

    // Update all state synchronously - both React state and form state
    setEuriborRate(percentageRate);
    setEuriborDate(selectedRate.rateDate);
    setEuriborRateId(rateId); // Use the parameter directly
    setValue("euriborRateId", rateId); // Also update form state
    setEuriborTenor(selectedRate.tenor || EuriborTenor.TWELVE_MONTHS);
    setEuriborError(null);

    console.log(
      "✅ Euribor rate selected and state updated:",
      percentageRate,
      "% (from",
      selectedRate.rateValue,
      ") for date:",
      selectedRate.rateDate,
      "ID:",
      rateId
    );
  };

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

        // Get the latest form values to ensure we have the most up-to-date data
        const currentFormValues = getValues();
        console.log("📋 Form submission - data parameter:", data);
        console.log(
          "📋 Form submission - currentFormValues (getValues):",
          currentFormValues
        );
        console.log("🚗 data.selectedVehicles:", data.selectedVehicles);
        console.log(
          "🚗 currentFormValues.selectedVehicles:",
          currentFormValues.selectedVehicles
        );

        // Use current form values if data parameter seems stale
        // Always prefer currentFormValues to ensure we have the latest state
        const formDataToUse = {
          ...data,
          selectedVehicles:
            currentFormValues.selectedVehicles || data.selectedVehicles || [],
          selectedVehicleData:
            currentFormValues.selectedVehicleData ||
            data.selectedVehicleData ||
            [],
        };

        console.log(
          "✅ Using formDataToUse.selectedVehicles:",
          formDataToUse.selectedVehicles
        );
        console.log(
          "✅ formDataToUse.selectedVehicleData length:",
          formDataToUse.selectedVehicleData?.length
        );

        // Debug logging
        console.log("🚀 Contract Submission Debug:");
        console.log("  📋 Form Data:", formDataToUse);
        console.log(
          "  📄 Documents Count:",
          formDataToUse.documents?.length || 0
        );
        console.log(
          "  📤 Has Documents:",
          formDataToUse.documents && formDataToUse.documents.length > 0
        );
        console.log(
          "  💰 Guarantee Amount:",
          formDataToUse.guaranteeForContract || 0
        );
        console.log(
          "  👤 Selected Endorsers:",
          formDataToUse.selectedEndorsers?.length || 0
        );

        // Build collaterals array from vehicle selection if marked as collateral
        console.log(
          "🔍 Building collaterals - vehicleAsCollateral:",
          formDataToUse.vehicleAsCollateral
        );
        console.log(
          "🔍 Selected vehicle data:",
          formDataToUse.selectedVehicleData
        );

        const collaterals =
          formDataToUse.vehicleAsCollateral &&
          formDataToUse.selectedVehicleData &&
          formDataToUse.selectedVehicleData.length > 0
            ? (formDataToUse.selectedVehicleData || []).map((vehicle) => {
                console.log("🚗 Vehicle for collateral:", {
                  id: vehicle.id,
                  licensePlate: vehicle.licensePlate,
                  make: vehicle.make,
                  model: vehicle.model,
                });

                // Ensure license plate is not empty - this is required for collaterals
                if (!vehicle.licensePlate) {
                  console.error(
                    "❌ Vehicle missing license plate for collateral:",
                    vehicle.id
                  );
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

        if (formDataToUse.documents && formDataToUse.documents.length > 0) {
          formDataToUse.documents.forEach((doc: any) => {
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

        // Check if start date is in the past and validate amortization file
        const isStartDateInPast =
          formDataToUse.startDate &&
          dayjs(formDataToUse.startDate).isBefore(dayjs(), "day");
        const hasAmortizationFile = !!formDataToUse.amortizationPlanFile;

        // Validate that amortization file is provided when start date is in the past
        if (isStartDateInPast && !hasAmortizationFile) {
          setSubmitError(
            "Amortization plan Excel file is required when the contract start date is in the past. Please upload the file in the Contract Details step."
          );
          return;
        }

        console.log("  📁 Files to upload:", files.length);
        console.log("  📋 Document metadata:", documentMetadata);
        if (isStartDateInPast) {
          console.log("  📊 Has amortization file:", hasAmortizationFile);
          console.log("  📅 Start date in past:", isStartDateInPast);
        }

        // Build base contract data
        const baseContractData: any = {
          type: formDataToUse.type,
          contractNumber: formDataToUse.contractNumber,
          customerId: formDataToUse.customerId,
          startDate: formDataToUse.startDate,
          endDate: formDataToUse.endDate,
          totalAmount: formDataToUse.totalAmount,
          interestRate: formDataToUse.loanDetails?.interestRate || 0,
          vehicleIds: formDataToUse.selectedVehicles || [],
          collaterals,
          endorserCollaterals:
            formDataToUse.selectedEndorsers?.map((endorserId) => {
              const guaranteeAmount =
                formDataToUse.guaranteeForContract || formDataToUse.totalAmount;
              return {
                type: "personal_guarantee" as const,
                description: `Personal guarantee by endorser ${endorserId}`,
                value: guaranteeAmount,
                endorserId: endorserId,
                guaranteedAmount: guaranteeAmount,
                guaranteeType: "personal_guarantee",
                requiresNotarization: false,
                guaranteeForContract: formDataToUse.guaranteeForContract,
                guaranteeExpirationDate: formDataToUse.endDate,
                legalDocumentReference: `GUARANTEE-${formDataToUse.contractNumber}-${endorserId}`,
              };
            }) || [],
          terms: formDataToUse.terms || {},
        };

        // Add Euribor-related fields
        // euriborRateId is required - check both state and form data
        const finalEuriborRateId = formDataToUse.euriborRateId || euriborRateId;

        console.log("🔍 Validating Euribor rate ID before submission");
        console.log("🔍 Current euriborRateId state:", euriborRateId);
        console.log("🔍 Form data euriborRateId:", formDataToUse.euriborRateId);
        console.log("🔍 Final euriborRateId to use:", finalEuriborRateId);
        console.log("🔍 Available rates count:", availableEuriborRates.length);

        // Check if euriborRateId is valid
        const isValidRateId =
          finalEuriborRateId &&
          finalEuriborRateId !== "" &&
          finalEuriborRateId !== null &&
          finalEuriborRateId !== undefined &&
          typeof finalEuriborRateId === "string";

        if (!isValidRateId) {
          console.error("❌ Euribor rate ID is missing or invalid!");
          console.error("❌ State value:", euriborRateId);
          console.error("❌ Form value:", formDataToUse.euriborRateId);
          setSubmitError(
            "Please select a Euribor rate from the dropdown above. The selected rate ID is missing."
          );
          return;
        }

        // Verify the rate exists in available rates (but don't fail if it was auto-selected)
        // The rate might have been auto-fetched and not in the dropdown list
        const rateExists = availableEuriborRates.some(
          (rate) => rate.id === finalEuriborRateId
        );
        if (!rateExists && availableEuriborRates.length > 0) {
          // Only warn if we have rates loaded but the selected one isn't there
          // This could happen if the rate was auto-selected from a different endpoint
          console.warn(
            "⚠️ Selected rate ID not found in available rates list, but proceeding anyway"
          );
          console.warn("⚠️ Rate ID:", finalEuriborRateId);
          console.warn(
            "⚠️ This might be an auto-selected rate that's not in the dropdown list"
          );
          // Don't fail - the rate ID is valid, it just might not be in the filtered list
        }

        console.log("✅ Euribor rate ID validated:", finalEuriborRateId);
        baseContractData.euriborRateId = finalEuriborRateId;

        // Add margin as decimal (convert from percentage to decimal) - optional
        if (marginRate && marginRate > 0) {
          baseContractData.margin = marginRate / 100; // Convert from percentage (e.g., 4) to decimal (0.04)
          console.log(
            "✅ Margin added:",
            baseContractData.margin,
            "(from",
            marginRate,
            "%)"
          );
        } else {
          console.log("ℹ️ Margin not provided or is 0");
        }

        // Add Euribor tenor if available - optional
        if (euriborTenor) {
          baseContractData.euriborTenor = euriborTenor;
          console.log("✅ Euribor tenor added:", euriborTenor);
        } else {
          console.log("ℹ️ Euribor tenor not provided");
        }

        console.log(
          "📋 baseContractData with Euribor fields:",
          JSON.stringify(baseContractData, null, 2)
        );

        // Build the submit data with files and document metadata
        const submitData: any = {
          ...baseContractData,
          minimumTotalAnnualInterestPercent: minTotalAnnualInterestPercent,
          // Add files and document metadata for the new multipart/form-data approach
          files: files.length > 0 ? files : undefined,
          documents: documentMetadata.length > 0 ? documentMetadata : undefined,
          // Add amortization plan file if start date is in the past (will be uploaded separately first)
          ...(isStartDateInPast &&
            hasAmortizationFile &&
            formDataToUse.amortizationPlanFile && {
              amortizationPlanFile: formDataToUse.amortizationPlanFile,
            }),
        };

        console.log(
          "📋 submitData after spread (before loanDetails):",
          JSON.stringify(submitData, null, 2)
        );

        console.log("  📤 Submitting contract with", files.length, "documents");

        // Add loan details if it's a loan contract
        if (
          formDataToUse.type === ContractType.LOAN &&
          formDataToUse.loanDetails
        ) {
          // Calculate total interest
          const totalInterest =
            formDataToUse.loanDetails.monthlyPayment *
              formDataToUse.loanDetails.loanTermMonths -
            formDataToUse.totalAmount;

          submitData.loanDetails = {
            type: formDataToUse.type,
            contractNumber: formDataToUse.contractNumber,
            customerId: formDataToUse.customerId,
            startDate: formDataToUse.startDate,
            endDate: formDataToUse.endDate,
            totalAmount: formDataToUse.totalAmount,
            interestRate: formDataToUse.loanDetails.interestRate,
            loanTermMonths: formDataToUse.loanDetails.loanTermMonths,
            monthlyPayment: formDataToUse.loanDetails.monthlyPayment,
            totalInterest: Math.round(totalInterest * 100) / 100, // Round to 2 decimal places
            minimumTotalAnnualInterestPercent: minTotalAnnualInterestPercent,
            processingFeePercentage:
              formDataToUse.loanDetails.processingFeePercentage,
            earlyRepaymentPenalty:
              formDataToUse.loanDetails.earlyRepaymentPenalty,
            paymentScheduleType:
              formDataToUse.loanDetails.paymentScheduleType || "monthly_fixed",
          };
        }

        // Add leasing details if it's a leasing contract
        if (
          formDataToUse.type === ContractType.LEASING &&
          formDataToUse.leasingDetails
        ) {
          submitData.leasingDetails = {
            type: formDataToUse.type,
            contractNumber: formDataToUse.contractNumber,
            customerId: formDataToUse.customerId,
            startDate: formDataToUse.startDate,
            endDate: formDataToUse.endDate,
            totalAmount: formDataToUse.totalAmount,
            residualValue: formDataToUse.leasingDetails.residualValue,
            leaseTermMonths: formDataToUse.leasingDetails.leaseTermMonths,
            monthlyPayment: formDataToUse.leasingDetails.monthlyPayment,
            advancePayment: formDataToUse.leasingDetails.advancePayment,
            withPurchaseOption: formDataToUse.leasingDetails.withPurchaseOption,
            purchaseOptionPrice:
              formDataToUse.leasingDetails.purchaseOptionPrice,
          };
        }

        console.log(
          "📤 Submitting contract data:",
          JSON.stringify(submitData, null, 2)
        );
        console.log("🚀 Final contract submission data:", submitData);
        console.log("🔍 Euribor fields check in submitData:");
        console.log("  - euriborRateId:", submitData.euriborRateId);
        console.log("  - margin:", submitData.margin);
        console.log("  - euriborTenor:", submitData.euriborTenor);
        console.log("  - interestRate:", submitData.interestRate);

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
    [euriborRateId, euriborTenor, getValues, marginRate, minTotalAnnualInterestPercent, onSubmit]
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
              <FormControl fullWidth error={!!errors.type} disabled={isEdit}>
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
                disabled={isEdit}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText:
                      errors.startDate?.message ||
                      "Select the contract start date",
                    required: true,
                    InputProps: {
                      readOnly: isEdit,
                    },
                  },
                }}
                // Allow past dates for contracts created retroactively
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

            {/* Amortization Plan File Upload (only when start date is in the past) */}
            {watchedData.startDate &&
              dayjs(watchedData.startDate).isBefore(dayjs(), "day") && (
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "info.main",
                      bgcolor: "info.main" + "10",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      color="info.main"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Amortization Plan File (Required for past start dates)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Upload an Excel file (.xlsx) containing the amortization
                      schedule with columns: Month, Beginning Balance, Monthly
                      Interest Amount, Principal Repayment, Monthly Mortgage
                      Payment, Ending Balance
                    </Typography>
                    <input
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      style={{ display: "none" }}
                      id="amortization-plan-file-upload"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file type
                          const validTypes = [
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "application/vnd.ms-excel",
                          ];
                          const validExtensions = [".xlsx", ".xls"];
                          const fileExtension =
                            "." + file.name.split(".").pop()?.toLowerCase();

                          if (
                            validTypes.includes(file.type) ||
                            validExtensions.includes(fileExtension)
                          ) {
                            setValue("amortizationPlanFile", file, {
                              shouldValidate: true,
                            });
                          } else {
                            alert(
                              "Please upload a valid Excel file (.xlsx or .xls)"
                            );
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <label htmlFor="amortization-plan-file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<AttachMoney />}
                        sx={{ mr: 2 }}
                      >
                        {watchedData.amortizationPlanFile
                          ? "Change File"
                          : "Upload Excel File"}
                      </Button>
                    </label>
                    {watchedData.amortizationPlanFile && (
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 1 }}
                      >
                        ✓ {watchedData.amortizationPlanFile.name}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              )}

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
                disabled={isEdit}
                error={!!errors.totalAmount}
                helperText={
                  errors.totalAmount?.message ||
                  "Principal amount to be financed"
                }
                InputProps={{
                  readOnly: isEdit,
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
              <Typography variant="body2" color="text.secondary">
                Minimum total annual interest:{" "}
                <strong>{minTotalAnnualInterestPercent.toFixed(2)}%</strong>
              </Typography>
              {isInterestBelowMinimum && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Total interest ({totalInterestPercent.toFixed(2)}%) is below the
                  minimum ({minTotalAnnualInterestPercent.toFixed(2)}%).
                  Increase the margin or select a higher Euribor rate.
                </Alert>
              )}
            </Grid>

            {/* Minimum Total Interest (Editable on Create) */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Total Annual Interest"
                type="number"
                value={minTotalAnnualInterestPercent}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setMinTotalAnnualInterestPercent(
                    Number.isFinite(value) ? Math.max(0, value) : 0
                  );
                }}
                disabled={isEdit}
                InputProps={{
                  readOnly: isEdit,
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                helperText={
                  isEdit
                    ? "Minimum interest cannot be changed in edit mode"
                    : "Set the minimum allowed total interest (Euribor + Margin)"
                }
              />
            </Grid>

            {/* Euribor Rate (Selectable) */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!euriborError} required>
                <InputLabel id="euribor-rate-label">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <TrendingUp fontSize="small" />
                    12M Euribor Rate
                  </Box>
                </InputLabel>
                <Select
                  labelId="euribor-rate-label"
                  value={watchedData.euriborRateId || euriborRateId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    console.log(
                      "📋 Select onChange - selected ID:",
                      selectedId
                    );
                    handleEuriborRateChange(selectedId);
                  }}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <TrendingUp fontSize="small" />
                      12M Euribor Rate
                    </Box>
                  }
                  disabled={loadingEuriborRates || loadingEuribor}
                  renderValue={(value) => {
                    if (loadingEuribor || loadingEuriborRates) {
                      return "Loading...";
                    }
                    if (!value || value === "") {
                      return "Select Euribor Rate";
                    }
                    const selectedRate = availableEuriborRates.find(
                      (r) => r.id === value
                    );
                    if (selectedRate) {
                      return `${(selectedRate.rateValue * 100).toFixed(
                        4
                      )}% (${dayjs(selectedRate.rateDate).format(
                        "MMM DD, YYYY"
                      )})`;
                    }
                    return `${euriborRate.toFixed(2)}%`;
                  }}
                >
                  {loadingEuriborRates ? (
                    <MenuItem disabled value="">
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading rates...
                    </MenuItem>
                  ) : availableEuriborRates.length === 0 ? (
                    <MenuItem disabled value="">
                      No Euribor rates available
                    </MenuItem>
                  ) : (
                    availableEuriborRates.map((rate) => (
                      <MenuItem key={rate.id} value={rate.id}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {(rate.rateValue * 100).toFixed(4)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(rate.rateDate).format("MMM DD, YYYY")}
                            {rate.rateSource && ` • ${rate.rateSource}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>
                  {euriborError ||
                    (euriborDate
                      ? `Selected rate from ${dayjs(euriborDate).format(
                          "MMM DD, YYYY"
                        )}`
                      : "Select a 12-month Euribor rate")}
                </FormHelperText>
              </FormControl>
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
                disabled={isEdit}
                error={isInterestBelowMinimum}
                InputProps={{
                  readOnly: isEdit,
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
                  step: 0.5,
                }}
                helperText={
                  isInterestBelowMinimum
                    ? `Total interest must be >= ${minTotalAnnualInterestPercent.toFixed(
                        2
                      )}%`
                    : "Additional margin on top of Euribor (e.g., 5.00 for 5%)"
                }
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
                disabled={isEdit}
                InputProps={{
                  readOnly: isEdit,
                  endAdornment: (
                    <InputAdornment position="end">months</InputAdornment>
                  ),
                }}
                error={!!errors.loanDetails?.loanTermMonths}
                helperText={
                  errors.loanDetails?.loanTermMonths?.message ||
                  "Loan duration in months"
                }
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
                disabled={isEdit}
                InputProps={{
                  readOnly: isEdit,
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                }}
                error={!!errors.loanDetails?.processingFeePercentage}
                helperText={
                  errors.loanDetails?.processingFeePercentage?.message ||
                  "Enter percentage value (e.g., 2 for 2%)"
                }
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
                disabled={isEdit}
                InputProps={{
                  readOnly: isEdit,
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.01,
                }}
                error={!!errors.loanDetails?.earlyRepaymentPenalty}
                helperText={
                  errors.loanDetails?.earlyRepaymentPenalty?.message ||
                  "Enter percentage value (e.g., 3 for 3%) - Optional"
                }
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
            selectedVehicleData={watchedData.selectedVehicleData}
            isEditMode={isEdit}
            onVehicleSelect={(vehicleIds) => {
              console.log(
                "📝 ContractForm: Setting selectedVehicles to:",
                vehicleIds
              );
              setValue("selectedVehicles", vehicleIds, {
                shouldValidate: true,
              });
              // Trigger form state update to ensure it's reflected
              trigger("selectedVehicles");
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
                contractId={contractId} // Pass contract ID for edit mode
                onPendingDocumentIdsChange={onPendingDocumentIdsChange} // Track pending document IDs
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
          watchedData.loanDetails?.loanTermMonths &&
          !isInterestBelowMinimum
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                variant="outlined"
              >
                Back
              </Button>
              {isEdit && onCancel && (
                <Button
                  onClick={onCancel}
                  disabled={loading}
                  variant="outlined"
                  color="error"
                >
                  Cancel
                </Button>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {STEPS.length}
            </Typography>

            {activeStep === STEPS.length - 1 ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Validate button - only show for migration scenarios (past date + amortization file) */}
                {!isEdit &&
                  onValidate &&
                  watchedData.startDate &&
                  dayjs(watchedData.startDate).isBefore(dayjs(), "day") &&
                  watchedData.amortizationPlanFile && (
                    <Button
                      startIcon={
                        isValidating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      onClick={handleSubmit(async (data) => {
                        try {
                          const formDataToUse = {
                            ...data,
                            selectedVehicles:
                              getValues("selectedVehicles") ||
                              data.selectedVehicles ||
                              [],
                            selectedVehicleData:
                              getValues("selectedVehicleData") ||
                              data.selectedVehicleData ||
                              [],
                          };

                          // Build contract data exactly like onFormSubmit does
                          const vehicleIds = formDataToUse.selectedVehicles || [];
                          const collaterals = (formDataToUse.selectedVehicleData || []).map((vehicle: any) => ({
                            type: "vehicle" as const,
                            description: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
                            value: vehicle.purchasePrice || 0,
                            active: true,
                            make: vehicle.make || "",
                            model: vehicle.model || "",
                            year: vehicle.year || new Date().getFullYear(),
                            licensePlate: vehicle.licensePlate || "",
                            vinNumber: vehicle.vinNumber || "",
                            color: vehicle.color || "",
                            engineNumber: vehicle.engineNumber,
                            registrationCertificate: vehicle.registrationCertificate,
                            insurancePolicy: vehicle.insurancePolicy,
                          }));

                          const baseContractData: any = {
                            type: formDataToUse.type,
                            contractNumber: formDataToUse.contractNumber,
                            customerId: formDataToUse.customerId,
                            startDate: formDataToUse.startDate,
                            endDate: formDataToUse.endDate,
                            totalAmount: formDataToUse.totalAmount,
                            interestRate: formDataToUse.loanDetails?.interestRate || 0,
                            vehicleIds,
                            collaterals,
                            endorserCollaterals:
                              formDataToUse.selectedEndorsers?.map((endorserId: string) => {
                                const guaranteeAmount =
                                  formDataToUse.guaranteeForContract || formDataToUse.totalAmount;
                                return {
                                  type: "personal_guarantee" as const,
                                  description: `Personal guarantee by endorser ${endorserId}`,
                                  value: guaranteeAmount,
                                  endorserId: endorserId,
                                  guaranteedAmount: guaranteeAmount,
                                  guaranteeType: "personal_guarantee",
                                  requiresNotarization: false,
                                  guaranteeForContract: formDataToUse.guaranteeForContract,
                                  guaranteeExpirationDate: formDataToUse.endDate,
                                  legalDocumentReference: `GUARANTEE-${formDataToUse.contractNumber}-${endorserId}`,
                                };
                              }) || [],
                            terms: formDataToUse.terms || {},
                          };

                          // Add Euribor-related fields
                          const finalEuriborRateId = formDataToUse.euriborRateId || euriborRateId;
                          baseContractData.euriborRateId = finalEuriborRateId;

                          // Add margin as decimal (convert from percentage to decimal) - optional
                          if (marginRate && marginRate > 0) {
                            baseContractData.margin = marginRate / 100;
                          }

                          // Add Euribor tenor if available - optional
                          if (euriborTenor) {
                            baseContractData.euriborTenor = euriborTenor;
                          }

                          // Add loan details if it's a loan contract
                          if (
                            formDataToUse.type === ContractType.LOAN &&
                            formDataToUse.loanDetails
                          ) {
                            const totalInterest =
                              formDataToUse.loanDetails.monthlyPayment *
                                formDataToUse.loanDetails.loanTermMonths -
                              formDataToUse.totalAmount;

                            baseContractData.loanDetails = {
                              type: formDataToUse.type,
                              contractNumber: formDataToUse.contractNumber,
                              customerId: formDataToUse.customerId,
                              startDate: formDataToUse.startDate,
                              endDate: formDataToUse.endDate,
                              totalAmount: formDataToUse.totalAmount,
                              interestRate: formDataToUse.loanDetails.interestRate,
                              loanTermMonths: formDataToUse.loanDetails.loanTermMonths,
                              monthlyPayment: formDataToUse.loanDetails.monthlyPayment,
                              totalInterest: Math.round(totalInterest * 100) / 100,
                              minimumTotalAnnualInterestPercent: minTotalAnnualInterestPercent,
                              processingFeePercentage:
                                formDataToUse.loanDetails.processingFeePercentage,
                              earlyRepaymentPenalty:
                                formDataToUse.loanDetails.earlyRepaymentPenalty,
                              paymentScheduleType:
                                formDataToUse.loanDetails.paymentScheduleType,
                            };
                          }

                          // Add leasing details if it's a leasing contract
                          if (
                            formDataToUse.type === ContractType.LEASING &&
                            formDataToUse.leasingDetails
                          ) {
                            baseContractData.leasingDetails = {
                              type: formDataToUse.type,
                              contractNumber: formDataToUse.contractNumber,
                              customerId: formDataToUse.customerId,
                              startDate: formDataToUse.startDate,
                              endDate: formDataToUse.endDate,
                              totalAmount: formDataToUse.totalAmount,
                              residualValue: formDataToUse.leasingDetails.residualValue,
                              leaseTermMonths: formDataToUse.leasingDetails.leaseTermMonths,
                              monthlyPayment: formDataToUse.leasingDetails.monthlyPayment,
                              advancePayment: formDataToUse.leasingDetails.advancePayment,
                              withPurchaseOption:
                                formDataToUse.leasingDetails.withPurchaseOption,
                              purchaseOptionPrice:
                                formDataToUse.leasingDetails.purchaseOptionPrice,
                            };
                          }

                          const contractData: any = {
                            ...baseContractData,
                            ...(formDataToUse.amortizationPlanFile && {
                              amortizationPlanFile: formDataToUse.amortizationPlanFile,
                            }),
                          };

                          await onValidate(contractData);
                        } catch (error) {
                          console.error("Validation error:", error);
                        }
                      })}
                      disabled={
                        !isValid || isValidating || loading || !canProceed()
                      }
                      variant="outlined"
                      color="info"
                    >
                      {isValidating ? "Validating..." : "Validate"}
                    </Button>
                  )}
                <Button
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CheckCircle />
                  }
                  onClick={handleSubmit(onFormSubmit)}
                  disabled={!isValid || loading || !canProceed()}
                  variant="contained"
                  color="primary"
                >
                  {loading
                    ? isEdit
                      ? "Updating..."
                      : "Creating..."
                    : isEdit
                    ? "Update Contract"
                    : "Create Contract"}
                </Button>
              </Box>
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
