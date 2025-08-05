// Contract Types - Based on backend DTOs

export enum ContractType {
  LOAN = 'loan',
  LEASING = 'leasing'
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CollateralType {
  VEHICLE = 'vehicle',
  ENDORSER = 'endorser'
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
  processingFee?: number;
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
    processingFee?: number;
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
    type: 'vehicle';
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
    description: string;
    value: number;
    endorserId: string;
    guaranteedAmount: number;
    guaranteeType: string;
    requiresNotarization?: boolean;
    guaranteeExpirationDate?: string;
    legalDocumentReference?: string;
  }[];
  
  // Contract terms
  terms?: Record<string, any>;
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
    processingFee?: number;
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
  selectedEndorsers: string[];
  collaterals: VehicleCollateral[];
  endorserCollaterals: EndorserCollateral[];
  terms?: Record<string, any>;
}

// Response types
export interface ContractResponse {
  id: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  customerId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSummary {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
}

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vinNumber: string;
  status: string;
}

export interface EndorserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  relationshipToCustomer?: string;
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
  preSelectedCustomerId?: string;
  disabled?: boolean;
  error?: string;
  onCreateCustomer?: () => void;
}

export interface VehiclePickerProps {
  selectedVehicleIds: string[];
  onVehicleSelect: (vehicleIds: string[]) => void;
  customerId?: string;
  error?: string;
}

export interface EndorserPickerProps {
  selectedEndorserIds: string[];
  onEndorserSelect: (endorserIds: string[]) => void;
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
}
