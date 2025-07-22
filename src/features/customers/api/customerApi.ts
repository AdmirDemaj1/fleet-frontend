import { api } from '../../../shared/utils/api';
import {
  Customer,
  CustomerDetailed,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
  ContractSummary,
  CollateralSummary,
  CustomerLog
} from '../types/customer.types';

export const customerApi = {
  getAll: async (filters?: CustomerFilters): Promise<{ data: Customer[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const response = await api.get<Customer[]>(`/customers?${params.toString()}`);
    
    // The API returns an array directly, not an object with a data property
    const processedCustomers = response.data.map(customer => ({
      ...customer,
      // Convert string dates to Date objects if needed
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));
    
    // Get total from headers if available, otherwise use array length
    const total = parseInt(response.headers['x-total-count'] || '0', 10) || processedCustomers.length;
    
    return {
      data: processedCustomers,
      total: total
    };
  },

  getById: async (id: string): Promise<CustomerDetailed> => {
    const response = await api.get<CustomerDetailed>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    console.log("API create called with data:", data);
    try {
      const response = await api.post<Customer>('/customers', data);
      console.log("API create response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API create error:", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  getContracts: async (
    id: string,
    options?: { active?: boolean; limit?: number; offset?: number }
  ): Promise<ContractSummary[]> => {
    const params = new URLSearchParams();
    if (options?.active !== undefined) params.append('active', options.active.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get<ContractSummary[]>(`/customers/${id}/contracts?${params.toString()}`);
    return response.data;
  },

  getCollateral: async (
    id: string,
    options?: { active?: boolean; limit?: number; offset?: number }
  ): Promise<CollateralSummary[]> => {
    const params = new URLSearchParams();
    if (options?.active !== undefined) params.append('active', options.active.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get<CollateralSummary[]>(`/customers/${id}/collateral?${params.toString()}`);
    return response.data;
  },

  getLogs: async (
    id: string,
    options?: { type?: string; limit?: number; offset?: number }
  ): Promise<CustomerLog[]> => {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const response = await api.get<CustomerLog[]>(`/customers/${id}/logs?${params.toString()}`);
    return response.data;
  }
};