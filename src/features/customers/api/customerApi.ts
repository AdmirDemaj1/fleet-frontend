import { api } from '../../../shared/utils/api';
import { API_ENDPOINTS } from '../../../shared/utils/constants';
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
    if (filters?.hasVehicles !== undefined) params.append('hasVehicles', filters.hasVehicles.toString());
    if (filters?.hasContracts !== undefined) params.append('hasContracts', filters.hasContracts.toString());
    if (filters?.hasCollaterals !== undefined) params.append('hasCollaterals', filters.hasCollaterals.toString());
    
    console.log('API Request URL:', `${API_ENDPOINTS.CUSTOMERS}?${params.toString()}`);
    console.log('Filters being sent:', filters);
    
    try {
      const response = await api.get<Customer[]>(`${API_ENDPOINTS.CUSTOMERS}?${params.toString()}`);
      
      console.log('API Response:', response);
      console.log('Response Headers:', response.headers);
      
      // The API returns an array directly, not an object with a data property
      const processedCustomers = response.data.map(customer => ({
        ...customer,
        // Convert string dates to Date objects if needed
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }));
      
      // Try multiple ways to get the total count
      let total = 0;
      
      // Method 1: Check x-total-count header (common standard)
      if (response.headers['x-total-count']) {
        total = parseInt(response.headers['x-total-count'], 10);
      }
      // Method 2: Check total-count header
      else if (response.headers['total-count']) {
        total = parseInt(response.headers['total-count'], 10);
      }
      // Method 3: Check if response has pagination info
      else if (response.headers['content-range']) {
        // Parse Content-Range header like "items 0-9/100"
        const match = response.headers['content-range'].match(/\/(\d+)$/);
        if (match) {
          total = parseInt(match[1], 10);
        }
      }
      // Method 4: If we have limit/offset and got a full page, we need to get the total count
      else if (filters?.limit && filters?.offset !== undefined) {
        // Make a separate request to get the total count without limit/offset
        try {
          const countParams = new URLSearchParams();
          if (filters?.type) countParams.append('type', filters.type);
          if (filters?.search) countParams.append('search', filters.search);
          if (filters?.hasVehicles !== undefined) countParams.append('hasVehicles', filters.hasVehicles.toString());
          if (filters?.hasContracts !== undefined) countParams.append('hasContracts', filters.hasContracts.toString());
          if (filters?.hasCollaterals !== undefined) countParams.append('hasCollaterals', filters.hasCollaterals.toString());
          
          const countResponse = await api.get<Customer[]>(`${API_ENDPOINTS.CUSTOMERS}?${countParams.toString()}`);
          total = countResponse.data.length;
          console.log('Got total count from separate request:', total);
        } catch (countError) {
          console.warn('Failed to get count, using fallback estimation:', countError);
          // Fallback estimation
          if (processedCustomers.length === filters.limit) {
            total = (filters.offset || 0) + processedCustomers.length + 1;
          } else {
            total = (filters.offset || 0) + processedCustomers.length;
          }
        }
      }
      // Method 5: Fallback to array length (no pagination)
      else {
        total = processedCustomers.length;
      }
      
      console.log('Calculated total:', total);
      console.log('Processed customers count:', processedCustomers.length);
      
      return {
        data: processedCustomers,
        total: total
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<CustomerDetailed> => {
    const response = await api.get<CustomerDetailed>(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    console.log("API create called with data:", data);
    try {
      const response = await api.post<Customer>(API_ENDPOINTS.CUSTOMERS, data);
      console.log("API create response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API create error:", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.put<Customer>(`${API_ENDPOINTS.CUSTOMERS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`);
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
  },

  getInvoices: async (
    id: string,
    options?: { 
      status?: string; 
      type?: string;
      dateRange?: string;
      amountRange?: string;
      limit?: number; 
      offset?: number 
    }
  ): Promise<any[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.dateRange) params.append('dateRange', options.dateRange);
    if (options?.amountRange) params.append('amountRange', options.amountRange);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const response = await api.get<any[]>(`/customers/${id}/payments?${params.toString()}`);
    return response.data;
  }
};