import {
  ContractType,
  CollateralType,
  VehicleSummary,
  ContractFormData,
} from "../types/contract.types";
import dayjs from "dayjs";

/**
 * Transforms vehicle data from API format to VehicleSummary format
 */
export const transformVehicles = (vehicles: any[] = []): VehicleSummary[] => {
  return vehicles.map((vehicle) => {
    const nameParts = vehicle.name?.split(" ") || [];
    const make = nameParts[0] || "";
    const model = nameParts.slice(1).join(" ") || "";

    return {
      id: vehicle.id,
      make,
      model,
      year: vehicle.year || 0,
      licensePlate: vehicle.licensePlate || "",
      vinNumber: vehicle.vin || "",
      status: vehicle.status || "",
    } as VehicleSummary;
  });
};

/**
 * Extracts endorser collaterals from collaterals array
 */
export const extractEndorserCollaterals = (
  collaterals: any[] = [],
  customerId: string
): { endorserIds: string[]; endorserCollaterals: any[] } => {
  const endorserIds: string[] = [];
  const endorserCollaterals = collaterals
    .filter((collateral) => collateral.type === "personal_guarantee")
    .map((collateral) => {
      const match = collateral.description?.match(/endorser\s+([a-f0-9-]+)/i);
      const endorserId = match?.[1] || customerId;

      if (endorserId && !endorserIds.includes(endorserId)) {
        endorserIds.push(endorserId);
      }

      return {
        type: CollateralType.ENDORSER as CollateralType.ENDORSER,
        description: collateral.description || "",
        value: collateral.value,
        endorserId,
        guaranteedAmount: collateral.value,
        guaranteeType: "personal_guarantee",
        customerId,
        active: collateral.active ?? true,
      };
    });

  return { endorserIds, endorserCollaterals };
};

/**
 * Extracts vehicle collaterals from collaterals array
 */
export const extractVehicleCollaterals = (
  collaterals: any[] = [],
  vehicles: any[] = [],
  customerId: string
): any[] => {
  return collaterals
    .filter((collateral) => collateral.type === "vehicle")
    .map((collateral) => {
      const vehicle =
        vehicles.find(
          (v) => v.name && collateral.description?.includes(v.name)
        ) || vehicles[0];

      const nameParts = vehicle?.name?.split(" ") || [];
      const make = nameParts[0] || "";
      const model = nameParts.slice(1).join(" ") || "";

      return {
        type: CollateralType.VEHICLE as CollateralType.VEHICLE,
        description: collateral.description || "",
        value: collateral.value,
        active: collateral.active,
        customerId,
        make,
        model,
        year: vehicle?.year || 0,
        licensePlate: vehicle?.licensePlate || "",
        vinNumber: vehicle?.vin || "",
        color: "",
      };
    });
};

/**
 * Builds contract form data from contract API response
 */
export const buildContractFormData = (
  contract: any,
  customerData: any,
  transformedDocuments: any[]
): Partial<ContractFormData> => {
  const selectedVehicleData = transformVehicles(contract.vehicles);
  const vehicleIds = contract.vehicles?.map((v: any) => v.id) || [];

  const { endorserIds, endorserCollaterals } = extractEndorserCollaterals(
    contract.collaterals,
    contract.customerId
  );

  const vehicleCollaterals = extractVehicleCollaterals(
    contract.collaterals,
    contract.vehicles || [],
    contract.customerId
  );

  const guaranteeForContract = endorserCollaterals.reduce(
    (sum, e) => sum + (e.guaranteedAmount || 0),
    0
  );

  // Build transformed data
  const transformedData: Partial<ContractFormData> = {
    type: contract.type,
    contractNumber: contract.contractNumber,
    customerId: contract.customerId,
    startDate: contract.startDate,
    endDate: contract.endDate,
    totalAmount: parseFloat(contract.totalAmount) || 0,
    minimumTotalAnnualInterestPercent:
      contract.minimumTotalAnnualInterestPercent !== undefined &&
      contract.minimumTotalAnnualInterestPercent !== null
        ? Number(contract.minimumTotalAnnualInterestPercent) || 0
        : contract.loanDetails?.minimumTotalAnnualInterestPercent !==
            undefined &&
          contract.loanDetails?.minimumTotalAnnualInterestPercent !== null
        ? Number(contract.loanDetails.minimumTotalAnnualInterestPercent) || 0
        : undefined,
    selectedVehicles: vehicleIds,
    selectedVehicleData,
    selectedCustomerData: customerData || null,
    selectedEndorsers: endorserIds,
    collaterals: vehicleCollaterals,
    endorserCollaterals,
    guaranteeForContract,
    documents: transformedDocuments,
    terms: {},
  };

  // Add contract type-specific details
  if (contract.type === ContractType.LOAN) {
    const startDate = dayjs(contract.startDate);
    const endDate = dayjs(contract.endDate);
    const loanTermMonths = endDate.diff(startDate, "month");

    transformedData.loanDetails = {
      contractNumber: contract.contractNumber,
      startDate: contract.startDate,
      endDate: contract.endDate,
      interestRate: 0,
      loanTermMonths: loanTermMonths || 36,
      monthlyPayment: 0,
      minimumTotalAnnualInterestPercent:
        transformedData.minimumTotalAnnualInterestPercent,
      processingFeePercentage: 0.02,
      earlyRepaymentPenalty: 0.03,
      paymentScheduleType: "monthly_fixed",
    };
  } else if (contract.type === ContractType.LEASING) {
    const startDate = dayjs(contract.startDate);
    const endDate = dayjs(contract.endDate);
    const leaseTermMonths = endDate.diff(startDate, "month");

    transformedData.leasingDetails = {
      residualValue: 0,
      leaseTermMonths: leaseTermMonths || 36,
      monthlyPayment: 0,
      advancePayment: 0,
      withPurchaseOption: false,
      purchaseOptionPrice: 0,
    };
  }

  return transformedData;
};
