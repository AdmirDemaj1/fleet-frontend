// Contract Types - Based on backend DTOs

import { ContractDocumentResponseDto } from "../api/contractDocumentApi";

export enum ContractType {
  LOAN = "loan",
  LEASING = "leasing",
}

export enum ContractStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum CollateralType {
  VEHICLE = "vehicle",
  ENDORSER = "endorser",
}

// Base Contract interface
export interface BaseContract {
  type: ContractType;
  contractNumber: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  terms?: Record<string, any>;
}

// Loan Contract specific interface
export interface LoanContract extends BaseContract {
  type: ContractType.LOAN;
  interestRate: number;
  loanTermMonths: number;
  monthlyPayment: number;
  processingFeePercentage?: number;
  earlyRepaymentPenalty?: number;
  paymentScheduleType?: string;
}

// Leasing Contract specific interface
export interface LeasingContract extends BaseContract {
  type: ContractType.LEASING;
  residualValue: number;
  leaseTermMonths: number;
  monthlyPayment: number;
  advancePayment: number;
  withPurchaseOption?: boolean;
  purchaseOptionPrice?: number;
}

// Collateral interfaces
export interface BaseCollateral {
  type: CollateralType;
  description: string;
  value: number;
  contractId?: string;
  customerId: string;
  active: boolean;
}

export interface VehicleCollateral extends BaseCollateral {
  type: CollateralType.VEHICLE;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vinNumber: string;
  color: string;
  engineNumber?: string;
  registrationCertificate?: string;
  insurancePolicy?: string;
}

export interface EndorserCollateral extends BaseCollateral {
  type: CollateralType.ENDORSER;
  endorserId: string;
  guaranteedAmount: number;
  guaranteeExpirationDate?: string;
  guaranteeTerms?: Record<string, any>;
  guaranteeType?: string;
  requiresNotarization?: boolean;
  legalDocumentReference?: string;
  endorserFinancialSnapshot?: Record<string, any>;
  specialConditions?: string;
}

// Create Contract DTO - Matches backend expectations exactly
export interface CreateContractDto {
  type: ContractType;
  contractNumber: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  interestRate: number;
  euriborRateId: string; // ID from euribor_rates table which was selected for the contract
  margin?: number; // Optional - will be calculated if not provided (as decimal, e.g., 0.04 for 4%)
  euriborTenor?: string; // Optional - will come from EURIBOR rate if euriborRateId is provided (e.g., "12m")

  // Contract type-specific details
  loanDetails?: {
    type: ContractType;
    contractNumber: string;
    customerId: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    interestRate: number;
    loanTermMonths: number;
    monthlyPayment: number;
    totalInterest: number;
    processingFeePercentage?: number;
    earlyRepaymentPenalty?: number;
    paymentScheduleType?: string;
  };

  leasingDetails?: {
    type: ContractType;
    contractNumber: string;
    customerId: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    residualValue: number;
    leaseTermMonths: number;
    monthlyPayment: number;
    advancePayment: number;
    withPurchaseOption?: boolean;
    purchaseOptionPrice?: number;
  };

  // Vehicle assignments
  vehicleIds?: string[];

  // Collaterals
  collaterals?: {
    type: "vehicle";
    description: string;
    value: number;
    active: boolean;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vinNumber: string;
    color: string;
    engineNumber?: string;
    registrationCertificate?: string;
    insurancePolicy?: string;
  }[];

  // Endorser guarantees
  endorserCollaterals?: {
    type: "vehicle" | "property" | "personal_guarantee" | "other";
    description: string;
    value: number;
    endorserId: string;
    guaranteedAmount: number;
    guaranteeType: string;
    requiresNotarization?: boolean;
    guaranteeExpirationDate?: string;
    legalDocumentReference?: string;
  }[];

  // Custom guarantee amount for contract
  guaranteeForContract?: number;

  // Contract terms
  terms?: Record<string, any>;
}

// Document metadata for upload
export interface DocumentMetadata {
  type: string;
  title: string;
  description?: string;
  expiryDate: string; // Required - YYYY-MM-DD format
}

// NEW: Create contract with documents DTO - uses multipart/form-data
export interface CreateContractWithDocumentsDto
  extends Omit<CreateContractDto, "sessionKey"> {
  // Files to upload
  files?: File[];
  // Document metadata (must match order of files)
  documents?: DocumentMetadata[];
}

// Form data interface for the contract creation form
export interface ContractFormData {
  // Basic contract information
  type: ContractType;
  contractNumber: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;

  // Loan specific fields
  loanDetails?: {
    contractNumber: string;
    startDate: string;
    endDate: string;
    interestRate: number;
    loanTermMonths: number;
    monthlyPayment: number;
    totalInterest?: number;
    processingFeePercentage?: number;
    earlyRepaymentPenalty?: number;
    paymentScheduleType?: string;
  };

  // Leasing specific fields
  leasingDetails?: {
    residualValue: number;
    leaseTermMonths: number;
    monthlyPayment: number;
    advancePayment: number;
    withPurchaseOption?: boolean;
    purchaseOptionPrice?: number;
  };

  // Additional components
  selectedVehicles: string[];
  selectedVehicleData?: VehicleSummary[]; // Full vehicle data including documents
  selectedCustomerData?: CustomerSummary | null; // Full customer data including documents
  selectedEndorsers: string[];
  guaranteeForContract?: number; // Amount the endorser guarantees for the contract
  vehicleAsCollateral?: boolean; // Track if selected vehicle should be used as collateral
  collaterals: VehicleCollateral[];
  endorserCollaterals: EndorserCollateral[];
  documents: any[]; // Will be ContractDocument[] when imported
  euriborRateId?: string; // Selected Euribor rate ID
  terms?: Record<string, any>;
}

// Update Euribor Rate DTO
export interface UpdateEuriborRateDto {
  euriborRateId: string; // ID of the selected Euribor rate
  margin?: number;
}

// Amortization Schedule Types
export interface AmortizationScheduleEntry {
  paymentNumber: number;
  month: string;
  beginningBalance: number;
  monthlyInterestAmount: number;
  principalRepayment: number;
  monthlyMortgagePayment: number;
  endingBalance: number;
  paidAmount?: number;
  paymentDate?: string;
  difference?: number;
  poStatus?: string;
  monthlyNetIncome?: number;
}

export interface AmortizationScheduleSection {
  sectionNumber: number;
  monthlyPaymentAmount: number;
  startDate: string;
  endDate: string;
  changeReason: string;
  changeMetadata?: any;
  versionNumber: number;
  entries: AmortizationScheduleEntry[];
}

export interface AmortizationScheduleResponse {
  success: boolean;
  data: {
    versionId: string;
    versionNumber: number;
    reason?: string;
    effectiveStartDate?: string;
    interestRate?: number;
    monthlyPaymentAmount?: number;
    remainingLoanAmount?: number;
    remainingTermMonths?: number;
    schedule: AmortizationScheduleEntry[];
    sections?: AmortizationScheduleSection[];
    metadata?: any;
    schedulerInfo?: any;
  };
}

// Update Contract DTO - Matches backend UpdateContractDto structure
export interface UpdateContractDto {
  id?: string; // Optional contract ID

  // Basic contract fields that can be updated
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;

  // Loan-specific details (required for loan contracts)
  loanDetails?: {
    id: string; // Required UUID for the loan details record
    interestRate: number; // Required interest rate
  };

  // Leasing-specific details (required for leasing contracts)
  leasingDetails?: {
    id: string; // Required UUID for the leasing details record
    interestRate: number; // Required interest rate
  };

  // Optional financial tracking fields
  interestAmount?: number;
  principalAmount?: number;
  remainingInterestAmount?: number;
  remainingPrincipalAmount?: number;
}

// Response types
export interface ContractResponse {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  remainingAmount: string;
  interestAmount?: string;
  principalAmount?: string;
  remainingInterestAmount?: string;
  remainingPrincipalAmount?: string;
  createdAt: string;
  updatedAt: string;
  documents?: ContractDocumentResponseDto[];

  // Additional nested objects from backend
  vehicles?: {
    id: string;
    licensePlate: string;
    name: string;
    year: number;
    vin: string;
    status: string;
  }[];

  collaterals?: {
    id: string;
    type: string;
    description: string;
    value: number;
    active: boolean;
  }[];

  endorsers?: {
    id: string;
    name: string;
    relationshipToCustomer: string;
    guaranteedAmount: number;
    guaranteeType: string;
    active: boolean;
  }[];
}

export interface CustomerDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: "completed" | "pending" | "rejected";
  downloadCount?: number;
  createdAt?: string;
  expiryDate?: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  documents?: CustomerDocument[];
}

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string; // Optional - can be added later when used in contract
  vinNumber: string;
  status: string;
  // Additional vehicle properties
  color?: string;
  fuelType?: string;
  mileage?: number;
  legalOwner?: string;
  currentClientId?: string;
  contractId?: string;
  conditionStatus?: string;
  isLiquidAsset?: boolean;
  depreciatedValue?: number;
  marketValue?: number;
  currentValuation?: number;
  lastValuationDate?: string | null;
  primaryInsuranceCompany?: string | null;
  tplExpiryDate?: string | null;
  kaskoExpiryDate?: string | null;
  passengerInsuranceExpiry?: string | null;
  currentMileage?: number | null;
  nextMaintenanceDate?: string | null;
  lastServiceDate?: string | null;
  purchaseDate?: string;
  registrationExpiry?: string | null;
  creditStatus?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Documents array when includeDocuments=true
  documents?: VehicleDocument[];
}

export interface VehicleDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  filePath: string;
  status: string;
  createdAt: string;
  downloadUrl: string;
  previewUrl: string; // New field for preview URL
}

export interface EndorserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  relationshipToCustomer?: string;
  guaranteedAmount?: number; // Maximum amount this endorser can guarantee
  remainingGuaranteeCapacity?: number;
}

// Form step configuration
export interface ContractFormStep {
  id: string;
  label: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: ContractFormData) => boolean;
}

// Picker component props
export interface CustomerPickerProps {
  selectedCustomerId?: string;
  onCustomerSelect: (customer: CustomerSummary | null) => void;
  onCustomerDataChange?: (customer: CustomerSummary | null) => void; // Callback for full customer data including documents
  preSelectedCustomerId?: string;
  disabled?: boolean;
  error?: string;
  onCreateCustomer?: () => void;
}

export interface VehiclePickerProps {
  selectedVehicleIds: string[];
  onVehicleSelect: (vehicleIds: string[]) => void;
  onVehicleDataChange?: (vehicles: VehicleSummary[]) => void; // New callback for full vehicle data
  selectedVehicleData?: VehicleSummary[]; // Pre-selected vehicle data (for edit mode)
  isEditMode?: boolean; // Whether this is edit mode (vehicle may not be in available list)
  vehicleAsCollateral?: boolean; // Track if vehicle should be used as collateral
  onVehicleAsCollateralChange?: (isCollateral: boolean) => void; // Callback for collateral checkbox
  customerId?: string;
  error?: string;
}

export interface EndorserPickerProps {
  selectedEndorserIds: string[];
  onEndorserSelect: (endorserIds: string[]) => void;
  guaranteeForContract?: number;
  onGuaranteeForContractChange?: (amount: number) => void;
  totalContractAmount?: number;
  customerId?: string;
  onCreateEndorser?: () => void;
  error?: string;
}

// Contract form props
export interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: CreateContractDto) => Promise<void>;
  loading: boolean;
  preSelectedCustomerId?: string;
  isEdit?: boolean;
  contractId?: string; // For edit mode - contract ID for document uploads
  onPendingDocumentIdsChange?: (ids: string[]) => void; // Callback to track pending document IDs
  onCancel?: () => void; // Callback for cancel action (cleanup pending documents)
}
