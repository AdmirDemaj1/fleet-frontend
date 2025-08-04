export enum CustomerType {
    INDIVIDUAL = 'individual',
    BUSINESS = 'business',
    ENDORSER = 'endorser'
  }

  export interface CustomerAccountMenuProps {
    customerId?: string; // Optional since we get it from URL params
  }
  
  export interface BaseCustomer {
    id?: string;
    type: CustomerType;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
    createdAt?: Date | string; // Accept string from API
    updatedAt?: Date | string; // Accept string from API
  }
  
  
  export interface IndividualCustomer extends BaseCustomer {
    type: CustomerType.INDIVIDUAL;
    firstName?: string; // Optional in list response
    lastName?: string; // Optional in list response
    idNumber?: string; // Optional in list response
    dateOfBirth?: string; // Optional in list response
  }
  export interface BusinessCustomer extends BaseCustomer {
    type: CustomerType.BUSINESS;
    legalName?: string; // Optional in list response
    nuisNipt?: string; // Optional in list response
    administratorName?: string; // Optional in list response
    administratorId?: string; // Optional in list response
    administratorPosition?: string; // Optional in list response
    mainShareholders?: string; // Optional in list response
  }

  export interface EndorserCustomer extends BaseCustomer {
    type: CustomerType.ENDORSER;
    firstName?: string; // Optional in list response
    lastName?: string; // Optional in list response
    idNumber?: string; // Optional in list response
    dateOfBirth?: string; // Optional in list response
    guaranteedAmount?: number;
    relationshipToCustomer?: string;
    financialInformation?: Record<string, any>;
    active?: boolean;
    notes?: string;
  }
  
  export type Customer = IndividualCustomer | BusinessCustomer | EndorserCustomer;
  
  export interface CreateIndividualCustomerDto {
    type: CustomerType.INDIVIDUAL;
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
  }
  
  export interface CreateBusinessCustomerDto {
    type: CustomerType.BUSINESS;
    legalName: string;
    nuisNipt: string;
    administratorName: string;
    administratorId: string;
    administratorPosition: string;
    mainShareholders?: string;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
  }

  export interface CreateEndorserDto {
    type: CustomerType.ENDORSER;
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
    guaranteedAmount?: number;
    relationshipToCustomer?: string;
    financialInformation?: Record<string, any>;
    active?: boolean;
    notes?: string;
  }
  
  export interface CreateCustomerDto {
    individualDetails?: CreateIndividualCustomerDto;
    businessDetails?: CreateBusinessCustomerDto;
    endorserDetails?: CreateEndorserDto;
  }

  export interface UpdateEndorserDto {
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
    phone?: string;
    email?: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
    guaranteedAmount?: number;
    relationshipToCustomer?: string;
    financialInformation?: Record<string, any>;
    active?: boolean;
    notes?: string;
  }

  export interface EndorserResponseDto {
    id: string;
    type: CustomerType.ENDORSER;
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: Date;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
    guaranteedAmount?: number;
    relationshipToCustomer?: string;
    financialInformation?: Record<string, any>;
    active: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UpdateCustomerDto {
    id: string;
    individualDetails?: Partial<CreateIndividualCustomerDto>;
    businessDetails?: Partial<CreateBusinessCustomerDto>;
    endorserDetails?: Partial<CreateEndorserDto>;
  }
  
  export interface ContractSummary {
    id: string;
    contractNumber: string;
    type: string;
    status: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    remainingAmount: number;
  }
  
  export interface CollateralSummary {
    id: string;
    type: string;
    description: string;
    value: number;
    active: boolean;
  }
  

  
  export interface CustomerDetailed {
    customer: Customer;
    contracts: ContractSummary[];
    collateral: CollateralSummary[];
    
  }
  
  export interface CustomerFilters {
    type?: CustomerType;
    search?: string;
    limit?: number;
    offset?: number;
    hasVehicles?: boolean;
    hasContracts?: boolean;
    hasCollaterals?: boolean;
  }