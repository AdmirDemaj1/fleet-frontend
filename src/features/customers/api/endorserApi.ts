import { api } from '../../../shared/utils/api';
import { CreateEndorserDto, EndorserResponseDto, UpdateEndorserDto } from '../types/customer.types';

const ENDORSER_BASE_URL = '/endorsers';

export const endorserApi = {
  // Endorser CRUD operations
  createEndorser: async (data: CreateEndorserDto): Promise<EndorserResponseDto> => {
    const response = await api.post<EndorserResponseDto>(ENDORSER_BASE_URL, data);
    return response.data;
  },

  getAllEndorsers: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
    active?: boolean;
  }): Promise<EndorserResponseDto[]> => {
    const params = new URLSearchParams();
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.active !== undefined) params.append('active', options.active.toString());

    const queryString = params.toString();
    const url = queryString ? `${ENDORSER_BASE_URL}?${queryString}` : ENDORSER_BASE_URL;

    const response = await api.get<EndorserResponseDto[]>(url);
    return response.data;
  },

  getEndorserById: async (id: string): Promise<EndorserResponseDto> => {
    const response = await api.get<EndorserResponseDto>(`${ENDORSER_BASE_URL}/${id}`);
    return response.data;
  },

  updateEndorser: async (id: string, data: UpdateEndorserDto): Promise<EndorserResponseDto> => {
    const response = await api.put<EndorserResponseDto>(`${ENDORSER_BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteEndorser: async (id: string): Promise<void> => {
    await api.delete<void>(`${ENDORSER_BASE_URL}/${id}`);
  },

  // Customer-Endorser relationship operations
  createCustomerEndorserRelationship: async (data: any): Promise<any> => {
    const response = await api.post<any>(`${ENDORSER_BASE_URL}/relationships`, data);
    return response.data;
  },

  getCustomerEndorsers: async (customerId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`${ENDORSER_BASE_URL}/relationships/customer/${customerId}`);
    return response.data;
  },

  getEndorserCustomers: async (endorserId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`${ENDORSER_BASE_URL}/relationships/endorser/${endorserId}`);
    return response.data;
  },

  updateCustomerEndorserRelationship: async (relationshipId: string, data: any): Promise<any> => {
    const response = await api.put<any>(`${ENDORSER_BASE_URL}/relationships/${relationshipId}`, data);
    return response.data;
  },

  deactivateCustomerEndorserRelationship: async (relationshipId: string): Promise<void> => {
    await api.delete<void>(`${ENDORSER_BASE_URL}/relationships/${relationshipId}`);
  }
};
