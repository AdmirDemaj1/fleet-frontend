export enum CustomerType {
    INDIVIDUAL = 'individual',
    BUSINESS = 'business'
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
  
  export type Customer = IndividualCustomer | BusinessCustomer;
  
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
  
  export interface CreateCustomerDto {
    individualDetails?: CreateIndividualCustomerDto;
    businessDetails?: CreateBusinessCustomerDto;
  }
  
  export interface UpdateCustomerDto {
    id: string;
    individualDetails?: Partial<CreateIndividualCustomerDto>;
    businessDetails?: Partial<CreateBusinessCustomerDto>;
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
  
  export interface CustomerLog {
    id: string;
    type: string;
    description: string;
    createdAt: Date;
    performedBy?: string;
    metadata?: Record<string, any>;
  }
  
  export interface CustomerDetailed {
    customer: Customer;
    contracts: ContractSummary[];
    collateral: CollateralSummary[];
    logs: CustomerLog[];
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