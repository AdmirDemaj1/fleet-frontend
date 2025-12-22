import { api } from "../../../shared/utils/api";
import { API_ENDPOINTS } from "../../../shared/utils/constants";
import {
  Customer,
  CustomerDetailed,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
  ContractSummary,
  CollateralSummary,
  PaginatedResponse,
  Administrator,
} from "../types/customer.types";
import { CustomerLog } from "../types/customerLogs.types";

export const customerApi = {
  getAll: async (
    filters?: CustomerFilters
  ): Promise<{ data: Customer[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());
    if (filters?.hasVehicles !== undefined)
      params.append("hasVehicles", filters.hasVehicles.toString());
    if (filters?.hasContracts !== undefined)
      params.append("hasContracts", filters.hasContracts.toString());
    if (filters?.hasCollaterals !== undefined)
      params.append("hasCollaterals", filters.hasCollaterals.toString());

    console.log(
      "API Request URL:",
      `${API_ENDPOINTS.CUSTOMERS}?${params.toString()}`
    );
    console.log("Filters being sent:", filters);

    try {
      const response = await api.get<PaginatedResponse<Customer>>(
        `${API_ENDPOINTS.CUSTOMERS}?${params.toString()}`
      );

      console.log("API Response:", response);

      // The API returns a paginated response with data and meta fields
      const responseData = response.data;
      
      // Handle the response structure
      let customersArray: Customer[];
      let total: number;

      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'meta' in responseData) {
        // Expected paginated response structure
        customersArray = responseData.data || [];
        total = responseData.meta?.total || 0;
        console.log("Using paginated response structure - Total from meta:", total);
      } else if (Array.isArray(responseData)) {
        // Fallback: API returns array directly (backward compatibility)
        customersArray = responseData;
        total = customersArray.length;
        console.log("Using array response structure - Total from array length:", total);
      } else {
        // Unexpected structure
        console.warn("Unexpected response structure:", responseData);
        customersArray = [];
        total = 0;
      }

      const processedCustomers = customersArray.map((customer) => ({
        ...customer,
        // Keep dates as strings since they come from API as strings
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }));

      console.log("Processed customers count:", processedCustomers.length);
      console.log("Total count from API:", total);

      return {
        data: processedCustomers,
        total: total,
      };
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<CustomerDetailed> => {
    const response = await api.get<CustomerDetailed>(
      `${API_ENDPOINTS.CUSTOMERS}/${id}`
    );
    return response.data;
  },

  create: async (data: CreateCustomerDto | any): Promise<Customer> => {
    console.log("API create called with data:", data);
    try {
      // Check if this is an administrator by checking for administrator-specific fields
      // (since type property is not sent for administrators)
      const isAdministrator = !!(
        data.companyName && 
        data.administratorName && 
        data.administratorId && 
        data.administratorPosition &&
        !data.individualDetails &&
        !data.businessDetails
      );
      const endpoint = isAdministrator ? API_ENDPOINTS.ADMINISTRATORS : API_ENDPOINTS.CUSTOMERS;
      
      console.log(`Using endpoint: ${endpoint} (isAdministrator: ${isAdministrator})`);
      
      const response = await api.post<any>(endpoint, data);
      console.log("API create response:", response.data);
      
      // Handle wrapped response - API returns { data: Customer, message: string, ... }
      // Extract the actual customer from the response
      const customer = response.data?.data || response.data;
      console.log("Extracted customer:", customer);
      
      return customer;
    } catch (error) {
      console.error("API create error:", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.put<Customer>(
      `${API_ENDPOINTS.CUSTOMERS}/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<{ requiresApproval?: boolean; approvalRequestId?: string; message?: string }> => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS}/${id}`, {
        responseType: 'json',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Delete response:', response);
      
      // If the response is JSON, return it
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      // If we got here without an error, assume success without approval
      return { message: 'Customer deleted successfully' };
    } catch (error: any) {
      // If the error response contains approval data, return it
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  getContracts: async (
    id: string,
    options?: { active?: boolean; limit?: number; offset?: number }
  ): Promise<ContractSummary[]> => {
    const params = new URLSearchParams();
    if (options?.active !== undefined)
      params.append("active", options.active.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    const response = await api.get<ContractSummary[]>(
      `/customers/${id}/contracts?${params.toString()}`
    );
    return response.data;
  },


  getCollateral: async (
    id: string,
    options?: { active?: boolean; limit?: number; offset?: number }
  ): Promise<CollateralSummary[]> => {
    const params = new URLSearchParams();
    if (options?.active !== undefined)
      params.append("active", options.active.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    
    console.log(`📋 Fetching collateral for customer ${id}`);
    
    const response = await api.get<PaginatedResponse<CollateralSummary> | CollateralSummary[]>(
      `/customers/${id}/collateral?${params.toString()}`
    );

    console.log(`📋 Collateral API response:`, response.data);

    // Handle both paginated and array response formats
    let collateralArray: CollateralSummary[];
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      // Paginated response structure
      collateralArray = response.data.data || [];
      console.log(`📋 Using paginated response - ${collateralArray.length} collaterals found`);
    } else if (Array.isArray(response.data)) {
      // Direct array response (backward compatibility)
      collateralArray = response.data;
      console.log(`📋 Using array response - ${collateralArray.length} collaterals found`);
    } else {
      // Unexpected structure
      console.warn('📋 Unexpected collateral response structure:', response.data);
      collateralArray = [];
    }

    return collateralArray;
  },

  getLogs: async (
    id: string,
    options?: { type?: string; limit?: number; offset?: number }
  ): Promise<CustomerLog[]> => {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    
    console.log(`📋 Fetching logs for customer ${id}`);
    
    const response = await api.get<PaginatedResponse<CustomerLog> | CustomerLog[]>(
      `/audit/customer/${id}?${params.toString()}`
    );

    console.log(`📋 Logs API response:`, response.data);

    // Handle both paginated and array response formats
    let logsArray: CustomerLog[];
    
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      // Paginated response structure
      logsArray = response.data.data || [];
      console.log(`📋 Using paginated response - ${logsArray.length} logs found`);
    } else if (Array.isArray(response.data)) {
      // Direct array response (backward compatibility)
      logsArray = response.data;
      console.log(`📋 Using array response - ${logsArray.length} logs found`);
    } else {
      // Unexpected structure
      console.warn('📋 Unexpected logs response structure:', response.data);
      logsArray = [];
    }

    return logsArray;
  },

  getInvoices: async (
    id: string,
    options?: {
      status?: string;
      type?: string;
      dateRange?: string;
      amountRange?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> => {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.type) params.append("type", options.type);
    if (options?.dateRange) params.append("dateRange", options.dateRange);
    if (options?.amountRange) params.append("amountRange", options.amountRange);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/customers/${id}/payments?${queryString}`
      : `/customers/${id}/payments`;
    const response = await api.get<any[]>(url);
    return response.data;
  },

  getAdministrators: async (): Promise<Administrator[]> => {
    const response = await api.get<Administrator[]>('/administrators');
    return response.data;
  },

  // Upload administrator document
  uploadAdministratorDocument: async (
    administratorId: string,
    file: File,
    documentType: string,
    expiryDate: string,
    title?: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);
    formData.append('title', title || file.name);
    formData.append('expiryDate', expiryDate);
    formData.append('administratorId', administratorId);
    
    console.log('📄 Uploading administrator document:', {
      administratorId,
      documentType,
      fileName: file.name,
      expiryDate,
    });
    
    // Log FormData contents for debugging
    console.log('📄 FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }
    
    const response = await api.post(`/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Document uploaded successfully:', response.data);
    return response.data;
  },
};
