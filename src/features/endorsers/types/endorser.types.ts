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
  id: string;
  customerId: string;
  endorserId: string;
  relationshipToCustomer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  relationshipToCustomer: string;
}

export interface UpdateEndorserRelationshipDto {
  relationshipToCustomer?: string;
  isActive?: boolean;
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
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Business Partner',
  'Colleague',
  'Other'
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
