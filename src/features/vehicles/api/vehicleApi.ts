import { api } from '../../../shared/utils/api';
import { Vehicle, VehicleQueryParams, VehicleStatus, VehicleStatistics, PaginatedVehicleResponse } from '../types/vehicleType';

export const vehicleApi = {
  // Get all vehicles with filtering
  getVehicles: async (params: VehicleQueryParams): Promise<{ vehicles: Vehicle[], total: number }> => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.legalOwner) queryParams.append('legalOwner', params.legalOwner);
    if (params.make) queryParams.append('make', params.make);
    if (params.model) queryParams.append('model', params.model);
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.isLiquidAsset !== undefined) queryParams.append('isLiquidAsset', params.isLiquidAsset.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());

    console.log('Vehicle API Request URL:', `/vehicles?${queryParams.toString()}`);
    console.log('Vehicle Filters being sent:', params);

    try {
      const response = await api.get<PaginatedVehicleResponse>(`/vehicles?${queryParams.toString()}`);
      
      console.log('Vehicle API Response:', response);

      // Handle the response structure
      const responseData = response.data;
      let vehicles: Vehicle[];
      let total: number;

      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'meta' in responseData) {
        // Expected paginated response structure
        vehicles = responseData.data || [];
        total = responseData.meta?.total || 0;
        console.log('Using paginated response structure - Total from meta:', total);
      } else if (responseData && typeof responseData === 'object' && 'vehicles' in responseData) {
        // Legacy response structure { vehicles: [...], total: number }
        vehicles = (responseData as any).vehicles || [];
        total = (responseData as any).total || vehicles.length;
        console.log('Using legacy response structure - Total:', total);
      } else if (Array.isArray(responseData)) {
        // Fallback: API returns array directly
        vehicles = responseData;
        total = vehicles.length;
        console.log('Using array response structure - Total from array length:', total);
      } else {
        // Unexpected structure
        console.warn('Unexpected response structure:', responseData);
        vehicles = [];
        total = 0;
      }

      console.log('Processed vehicles count:', vehicles.length);
      console.log('Total count from API:', total);

      return { vehicles, total };
    } catch (error) {
      console.error('Vehicle API request failed:', error);
      throw error;
    }
  },

  // Get a single vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  // Get a vehicle by license plate
  getVehicleByLicensePlate: async (licensePlate: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/plate/${licensePlate}`);
    return response.data;
  },

  // Get a vehicle by VIN
  getVehicleByVin: async (vin: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/vin/${vin}`);
    return response.data;
  },

  // Get vehicles by client ID
  getVehiclesByClientId: async (clientId: string): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>(`/vehicles/client/${clientId}`);
    return response.data;
  },

  // Get vehicles by customer ID with pagination support
  getVehiclesByCustomerId: async (customerId: string, params?: { limit?: number; offset?: number }): Promise<PaginatedVehicleResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await api.get<PaginatedVehicleResponse>(
      `/vehicles/customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Create a new vehicle
  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    // Remove licensePlate if it's empty/null to allow creating vehicles without it
    const cleanedData = { ...vehicleData };
    if (!cleanedData.licensePlate || cleanedData.licensePlate.trim() === '') {
      delete cleanedData.licensePlate;
    }
    const response = await api.post<Vehicle>('/vehicles', cleanedData);
    return response.data;
  },

  // Create a new vehicle with documents (using multipart/form-data)
  createVehicleWithDocuments: async (data: {
    vehicleData: Partial<Vehicle>;
    files?: File[];
    documents?: { type: string; title: string; description?: string; expiryDate: string }[];
  }): Promise<any> => {
    const formData = new FormData();

    // Add files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // Add document metadata as JSON string
    if (data.documents && data.documents.length > 0) {
      formData.append('documents', JSON.stringify(data.documents));
    }

    // Add vehicle fields
    const vehicleData = data.vehicleData;
    if (vehicleData.licensePlate) formData.append('licensePlate', vehicleData.licensePlate);
    if (vehicleData.vin) formData.append('vin', vehicleData.vin);
    if (vehicleData.make) formData.append('make', vehicleData.make);
    if (vehicleData.model) formData.append('model', vehicleData.model);
    if (vehicleData.year) formData.append('year', String(vehicleData.year));
    if (vehicleData.color) formData.append('color', vehicleData.color);
    if (vehicleData.status) formData.append('status', vehicleData.status);
    if (vehicleData.fuelType) formData.append('fuelType', vehicleData.fuelType);
    if (vehicleData.legalOwner) formData.append('legalOwner', vehicleData.legalOwner);
    if (vehicleData.isLiquidAsset !== undefined) formData.append('isLiquidAsset', String(vehicleData.isLiquidAsset));
    if (vehicleData.purchaseDate) formData.append('purchaseDate', vehicleData.purchaseDate);
    if (vehicleData.currentValuation !== undefined) formData.append('currentValuation', String(vehicleData.currentValuation));
    if (vehicleData.marketValue !== undefined) formData.append('marketValue', String(vehicleData.marketValue));
    if (vehicleData.depreciatedValue !== undefined) formData.append('depreciatedValue', String(vehicleData.depreciatedValue));

    console.log('🚗 Creating vehicle with documents:');
    console.log('📁 Files:', data.files?.length || 0);
    console.log('📋 Documents metadata:', data.documents?.length || 0);

    const response = await api.post<any>('/vehicles/with-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // Update a vehicle
  updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    // Only include licensePlate if it has a valid value
    const cleanedData = { ...vehicleData };
    if (cleanedData.licensePlate !== undefined && (!cleanedData.licensePlate || cleanedData.licensePlate.trim() === '')) {
      delete cleanedData.licensePlate;
    }
    const response = await api.put<Vehicle>(`/vehicles/${id}`, cleanedData);
    return response.data;
  },

  // Delete a vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  // Update vehicle status
  updateVehicleStatus: async (id: string, status: VehicleStatus): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}/status`, { status });
    return response.data;
  },

  // Update vehicle valuation
  updateVehicleValuation: async (
    id: string, 
    valuation: number, 
    valuationType: 'currentValuation' | 'marketValue' | 'depreciatedValue' = 'currentValuation'
  ): Promise<Vehicle> => {
    const response = await api.post<Vehicle>(`/vehicles/${id}/valuation`, { 
      valuation, 
      valuationType 
    });
    return response.data;
  },

  // Assign customer to vehicle
  assignCustomer: async (vehicleId: string, customerId: string): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${vehicleId}/assign-customer`, {
      customerId
    });
    return response.data;
  },

  // Unassign customer from vehicle
  unassignCustomer: async (vehicleId: string): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${vehicleId}/unassign-customer`);
    return response.data;
  },

  // Get available vehicles
  getAvailableVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles/status/available');
    return response.data;
  },

  // Get leased vehicles
  getLeasedVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles/status/leased');
    return response.data;
  },

  // Get liquid assets vehicles
  getLiquidAssets: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles/liquid-assets');
    return response.data;
  },

  // Get vehicles needing maintenance
  getVehiclesNeedingMaintenance: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles/maintenance/needed');
    return response.data;
  },

  // Get vehicles with expiring insurance
  getVehiclesWithExpiringInsurance: async (daysThreshold?: number): Promise<Vehicle[]> => {
    const params = daysThreshold ? { daysThreshold } : {};
    const response = await api.get<Vehicle[]>('/vehicles/insurance/expiring', { params });
    return response.data;
  },

  // Get vehicles with expiring registration
  getVehiclesWithExpiringRegistration: async (daysThreshold?: number): Promise<Vehicle[]> => {
    const params = daysThreshold ? { daysThreshold } : {};
    const response = await api.get<Vehicle[]>('/vehicles/registration/expiring', { params });
    return response.data;
  },

  // Get vehicle statistics
  getVehicleStatistics: async (): Promise<VehicleStatistics> => {
    const response = await api.get<VehicleStatistics>('/vehicles/reports/statistics');
    return response.data;
  }
};