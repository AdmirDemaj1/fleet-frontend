import { api } from '../../../shared/utils/api';
import {
  EuriborRate,
  CreateEuriborRateDto,
  EuriborRateFilters,
  PaginatedEuriborResponse,
  EuriborTenor
} from '../types/euribor.types';

export const euriborApi = {
  // Get all Euribor rates with filters and pagination
  getAll: async (filters?: EuriborRateFilters): Promise<PaginatedEuriborResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.tenor) params.append('tenor', filters.tenor);
    if (filters?.rateSource) params.append('rateSource', filters.rateSource);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    console.log('📊 Fetching Euribor rates with filters:', filters);
    
    const response = await api.get<PaginatedEuriborResponse | EuriborRate[]>(
      `/euribor-rates?${params.toString()}`
    );

    console.log('📊 Euribor rates API response:', response.data);

    // Handle both paginated and array response formats
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'meta' in response.data) {
      // Paginated response structure
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Direct array response (backward compatibility)
      return {
        data: response.data,
        meta: {
          total: response.data.length,
          page: 1,
          limit: response.data.length,
          offset: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    } else {
      // Unexpected structure
      console.warn('📊 Unexpected Euribor rates response structure:', response.data);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          offset: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }
  },

  // Get a single Euribor rate by ID
  getById: async (id: string): Promise<EuriborRate> => {
    console.log('📊 Fetching Euribor rate by ID:', id);
    const response = await api.get<EuriborRate>(`/euribor-rates/${id}`);
    return response.data;
  },

  // Create a new Euribor rate
  create: async (data: CreateEuriborRateDto): Promise<EuriborRate> => {
    console.log('📊 Creating Euribor rate:', data);
    
    // Get user ID for header (required by the endpoint)
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("userId", userId);
    }

    try {
      const response = await api.post<EuriborRate>('/euribor-rates', data, {
        headers: {
          'x-user-id': userId
        }
      });
      
      console.log('📊 Created Euribor rate:', response.data);
      return response.data;
    } catch (error) {
      console.error('📊 Error creating Euribor rate:', error);
      throw error;
    }
  },

  // Update an existing Euribor rate
  update: async (id: string, data: Partial<CreateEuriborRateDto>): Promise<EuriborRate> => {
    console.log('📊 Updating Euribor rate:', id, data);
    
    // Get user ID for header
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("userId", userId);
    }

    try {
      const response = await api.put<EuriborRate>(`/euribor-rates/${id}`, data, {
        headers: {
          'x-user-id': userId
        }
      });
      
      console.log('📊 Updated Euribor rate:', response.data);
      return response.data;
    } catch (error) {
      console.error('📊 Error updating Euribor rate:', error);
      throw error;
    }
  },

  // Delete a Euribor rate
  delete: async (id: string): Promise<void> => {
    console.log('📊 Deleting Euribor rate:', id);
    
    // Get user ID for header
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("userId", userId);
    }

    try {
      await api.delete(`/euribor-rates/${id}`, {
        headers: {
          'x-user-id': userId
        }
      });
      
      console.log('📊 Deleted Euribor rate:', id);
    } catch (error) {
      console.error('📊 Error deleting Euribor rate:', error);
      throw error;
    }
  },

  // Get latest rate for a specific tenor (backend endpoint: /current/:tenor)
  getLatestRate: async (tenor: string): Promise<EuriborRate | null> => {
    console.log('📊 Fetching latest rate for tenor:', tenor);
    
    try {
      const response = await api.get<EuriborRate>(`/euribor-rates/current/${tenor}`);
      return response.data;
    } catch (error) {
      console.warn('📊 No latest rate found for tenor:', tenor, error);
      return null;
    }
  },

  // Get current rates for all tenors
  getCurrentRates: async (): Promise<Record<string, EuriborRate>> => {
    console.log('📊 Fetching current rates for all tenors');
    
    try {
      const response = await api.get<Record<string, EuriborRate>>('/euribor-rates/current');
      return response.data;
    } catch (error) {
      console.error('📊 Error fetching current rates:', error);
      throw error;
    }
  },

  // Get historical rates for a specific tenor
  getHistoricalRates: async (tenor: EuriborTenor, days: number = 30): Promise<EuriborRate[]> => {
    console.log('📊 Fetching historical rates for tenor:', tenor, 'days:', days);
    
    try {
      const response = await api.get<EuriborRate[]>(`/euribor-rates/historical/${tenor}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('📊 Error fetching historical rates:', error);
      throw error;
    }
  },

  // Get rate for specific date and tenor
  getRateForDate: async (date: string, tenor: EuriborTenor): Promise<EuriborRate | null> => {
    console.log('📊 Fetching rate for date:', date, 'tenor:', tenor);
    
    try {
      const response = await api.get<EuriborRate>(`/euribor-rates/rate-for-date/${date}/${tenor}`);
      return response.data;
    } catch (error) {
      console.warn('📊 No rate found for date and tenor:', date, tenor, error);
      return null;
    }
  },

  // Bulk create Euribor rates
  bulkCreate: async (rates: CreateEuriborRateDto[]): Promise<EuriborRate[]> => {
    console.log('📊 Bulk creating Euribor rates:', rates.length, 'rates');
    
    // Get user ID for header (required by the endpoint)
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("userId", userId);
    }

    try {
      const response = await api.post<EuriborRate[]>('/euribor-rates/bulk', { rates }, {
        headers: {
          'x-user-id': userId
        }
      });
      
      console.log('📊 Bulk created Euribor rates:', response.data.length, 'rates');
      return response.data;
    } catch (error) {
      console.error('📊 Error bulk creating Euribor rates:', error);
      throw error;
    }
  },

  // Calculate effective interest rate
  calculateEffectiveRate: async (baseRate: number, margin: number): Promise<{
    baseRate: number;
    margin: number;
    effectiveRate: number;
    effectiveRatePercentage: number;
  }> => {
    console.log('📊 Calculating effective rate. Base:', baseRate, 'Margin:', margin);
    
    try {
      const response = await api.post<{
        baseRate: number;
        margin: number;
        effectiveRate: number;
        effectiveRatePercentage: number;
      }>('/euribor-rates/calculate-effective-rate', {
        baseRate,
        margin
      });
      
      console.log('📊 Effective rate calculated:', response.data);
      return response.data;
    } catch (error) {
      console.error('📊 Error calculating effective rate:', error);
      throw error;
    }
  }
};
