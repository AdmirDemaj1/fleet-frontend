import { Document } from '../../../shared/types/document.types';

export enum CustomerType {
    INDIVIDUAL = 'individual',
    BUSINESS = 'business',
    ADMINISTRATOR = 'administrator',
  }

export enum BusinessType {
  SHA = 'SHA',
  SHPK = 'SHPK',
  PF = 'PF',
}

  export interface CustomerAccountMenuProps {
    customerId?: string; // Optional since we get it from URL params
  }
  
  export interface BaseCustomer {
    id: string;
    type: CustomerType;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
    createdAt?: Date | string; // Accept string from API
    updatedAt?: Date | string; // Accept string from API
    documents?: Document[]; // Array of documents
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
    businessType?: BusinessType;
    shareholders?: string[]; // Array of shareholder names
    administratorIds?: string[]; // Selected administrator customer IDs
    administrators?: Administrator[]; // Full administrator objects
  }

 
  export interface AdministratorCustomer extends BaseCustomer {
    type: CustomerType.ADMINISTRATOR;
    nuisNipt?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    administratorName?: string;
    administratorId?: string;
    administratorPosition?: string;
  }

  export type Customer = IndividualCustomer | BusinessCustomer | AdministratorCustomer;
  
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
    businessType: BusinessType;
    shareholders?: string[]; // Array of shareholder names
    administratorIds?: string[]; // Selected administrator customer IDs
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string;
    secondaryEmail?: string;
    additionalNotes?: string;
  }


  export interface CreateAdministratorCustomerDto {
    type: CustomerType.ADMINISTRATOR;
    nuisNipt: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    administratorName: string;
    administratorId: string;
    administratorPosition: string;
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
    administratorDetails?: CreateAdministratorCustomerDto;
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



  export interface EndorserContract {
    contractId: string;
    contractNumber: string;
    contractType: string;
    contractStatus: string;
    totalAmount: number;
    remainingAmount: number;
    guaranteeAmount: number;
    startDate: string;
    endDate: string;
    customer: {
      id: string;
      firstName?: string;
      lastName?: string;
      legalName?: string;
      type: string;
      email: string;
      phone: string;
    };
    guaranteeExpirationDate: string;
    guaranteeType: string;
    requiresNotarization: boolean;
    legalDocumentReference: string;
    createdAt: string;
  }

  export interface EndorserContractSummary {
    totalContracts: number;
    totalGuaranteeAmount: number;
    activeContracts: number;
    completedContracts: number;
    draftContracts: number;
    cancelledContracts: number;
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

  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
  }

  export interface Administrator {
    id: string;
    nuisNipt: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    administratorName: string;
    administratorId: string;
    administratorPosition: string;
    address: string;
    phone: string;
    email: string;
    secondaryPhone?: string | null;
    secondaryEmail?: string | null;
    additionalNotes?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }