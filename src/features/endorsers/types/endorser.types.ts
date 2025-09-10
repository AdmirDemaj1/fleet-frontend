export interface Endorser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EndorserRelationship {
  id?: string;
  customerId: string;
  endorserId: string;
  endorsementDate: string;
  expirationDate: string;
  maximumGuaranteeAmount: number;
  relationshipType: string;
  terms: {
    guaranteeScope: string;
    notificationRequired: boolean;
    maxSingleTransaction: number;
    renewalRequired: boolean;
    specialConditions?: string;
  };
  notes?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  endorser?: Endorser;
  customer?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateEndorserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UpdateEndorserDto extends Partial<CreateEndorserDto> {}

export interface CreateEndorserRelationshipDto {
  customerId: string;
  endorserId: string;
  endorsementDate: string;
  expirationDate: string;
  maximumGuaranteeAmount: number;
  relationshipType: string;
  terms: {
    guaranteeScope: string;
    notificationRequired: boolean;
    maxSingleTransaction: number;
    renewalRequired: boolean;
    specialConditions?: string;
  };
  notes?: string;
  active?: boolean;
}

export interface UpdateEndorserRelationshipDto {
  endorsementDate?: string;
  expirationDate?: string;
  maximumGuaranteeAmount?: number;
  relationshipType?: string;
  terms?: {
    guaranteeScope?: string;
    notificationRequired?: boolean;
    maxSingleTransaction?: number;
    renewalRequired?: boolean;
    specialConditions?: string;
  };
  notes?: string;
  active?: boolean;
}

export interface EndorserFilters {
  search?: string;
  relationshipToCustomer?: string;
  customerId?: string;
  isActive?: boolean;
}

export interface EndorserQueryParams extends EndorserFilters {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EndorsersResponse {
  endorsers: Endorser[];
  total: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EndorserRelationshipsResponse {
  relationships: EndorserRelationship[];
  total: number;
  meta: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const RELATIONSHIP_TYPES = [
  'Business Partner',
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Colleague',
  'Other'
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
