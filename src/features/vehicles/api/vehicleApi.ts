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
    if (vehicleData.currentMileage !== undefined && vehicleData.currentMileage !== null) {
      const strValue = String(vehicleData.currentMileage);
      if (strValue !== '' && strValue !== 'null' && strValue !== 'undefined') {
        const value = parseInt(strValue, 10);
        if (!isNaN(value) && isFinite(value) && value >= 0) {
          formData.append('currentMileage', value.toString());
        }
      }
    }
    if (vehicleData.fuelType) formData.append('fuelType', vehicleData.fuelType);
    if (vehicleData.legalOwner) formData.append('legalOwner', vehicleData.legalOwner);
    if (vehicleData.isLiquidAsset !== undefined) formData.append('isLiquidAsset', String(vehicleData.isLiquidAsset));
    if (vehicleData.purchaseDate) formData.append('purchaseDate', vehicleData.purchaseDate);
    
    // Handle numeric fields - ensure they're valid numbers and convert properly
    // Only send if they're valid numbers (not empty strings, not NaN, not Infinity)
    if (vehicleData.currentValuation !== undefined && vehicleData.currentValuation !== null) {
      const strValue = String(vehicleData.currentValuation);
      if (strValue !== '' && strValue !== 'null' && strValue !== 'undefined') {
        const value = parseFloat(strValue);
        if (!isNaN(value) && isFinite(value) && value >= 0) {
          formData.append('currentValuation', value.toString());
        }
      }
    }
    if (vehicleData.marketValue !== undefined && vehicleData.marketValue !== null) {
      const strValue = String(vehicleData.marketValue);
      if (strValue !== '' && strValue !== 'null' && strValue !== 'undefined') {
        const value = parseFloat(strValue);
        if (!isNaN(value) && isFinite(value) && value >= 0) {
          formData.append('marketValue', value.toString());
        }
      }
    }
    if (vehicleData.depreciatedValue !== undefined && vehicleData.depreciatedValue !== null) {
      const strValue = String(vehicleData.depreciatedValue);
      if (strValue !== '' && strValue !== 'null' && strValue !== 'undefined') {
        const value = parseFloat(strValue);
        if (!isNaN(value) && isFinite(value) && value >= 0) {
          formData.append('depreciatedValue', value.toString());
        }
      }
    }

    console.log('🚗 Creating vehicle with documents:');
    console.log('📁 Files:', data.files?.length || 0);
    console.log('📋 Documents metadata:', data.documents?.length || 0);
    console.log('💰 Valuation fields:', {
      currentValuation: vehicleData.currentValuation,
      marketValue: vehicleData.marketValue,
      depreciatedValue: vehicleData.depreciatedValue,
      types: {
        currentValuation: typeof vehicleData.currentValuation,
        marketValue: typeof vehicleData.marketValue,
        depreciatedValue: typeof vehicleData.depreciatedValue,
      }
    });

    const response = await api.post<any>('/vehicles/with-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // Update a vehicle
  updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    // Remove read-only fields that should not be sent in update request
    const {
      id: _id,
      vin: _vin,
      contractId: _contractId,
      lastValuationDate: _lastValuationDate,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      createdBy: _createdBy,
      updatedBy: _updatedBy,
      ...cleanedData
    } = vehicleData as any;

    // Only include licensePlate if it has a valid value
    if (cleanedData.licensePlate !== undefined && (!cleanedData.licensePlate || cleanedData.licensePlate.trim() === '')) {
      delete cleanedData.licensePlate;
    }
    
    const response = await api.put<Vehicle>(`/vehicles/${id}`, cleanedData);
    return response.data;
  },

  // Update vehicle with documents atomically (for optimistic document replacements)
  updateVehicleWithDocuments: async (data: {
    vehicleId: string;
    vehicleData: Partial<Vehicle>;
    files?: File[];
    documents?: { 
      type: string; 
      title: string; 
      description?: string; 
      expiryDate: string;
      parentDocumentId?: string;
      version?: number;
    }[];
    documentReplacements?: { oldDocumentId: string; newDocumentId: string }[];
  }): Promise<Vehicle> => {
    const formData = new FormData();
    const { vehicleId, vehicleData: vData, files, documents, documentReplacements } = data;

    // Remove read-only fields from vehicle data
    const {
      id: _id,
      vin: _vin,
      contractId: _contractId,
      lastValuationDate: _lastValuationDate,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      createdBy: _createdBy,
      updatedBy: _updatedBy,
      ...cleanedVehicleData
    } = vData as any;

    // Append vehicle data fields
    Object.keys(cleanedVehicleData).forEach((key) => {
      const value = (cleanedVehicleData as any)[key];
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append document files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // Append document metadata
    if (documents && documents.length > 0) {
      formData.append('documents', JSON.stringify(documents));
    }

    // Append document replacements for atomic updates
    if (documentReplacements && documentReplacements.length > 0) {
      formData.append('documentReplacements', JSON.stringify(documentReplacements));
    }

    console.log('🔄 Updating vehicle with atomic document replacements:');
    console.log('📁 Files:', files?.length || 0);
    console.log('📋 Documents:', documents?.length || 0);
    console.log('🔄 Replacements:', documentReplacements?.length || 0);

    const response = await api.put<Vehicle>(`/vehicles/${vehicleId}/with-documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  // Delete a vehicle with approval-aware response (used for rollback flows)
  delete: async (
    id: string
  ): Promise<{
    requiresApproval?: boolean;
    approvalRequestId?: string;
    message?: string;
  }> => {
    try {
      const response = await api.delete(`/vehicles/${id}`, {
        responseType: "json",
        headers: { Accept: "application/json" },
      });

      if (response.data && typeof response.data === "object") {
        return response.data;
      }

      return { message: "Vehicle deleted successfully" };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
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
  },

  // Upload vehicle document
  uploadVehicleDocument: async (
    vehicleId: string,
    file: File,
    documentType: string,
    expiryDate: string,
    title?: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", documentType);
    formData.append("title", title || file.name);
    formData.append("expiryDate", expiryDate);
    formData.append("vehicleId", vehicleId);

    console.log("📄 Uploading vehicle document:", {
      vehicleId,
      documentType,
      fileName: file.name,
      expiryDate,
    });

    // Log FormData contents for debugging
    console.log("📄 FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }

    const response = await api.post(`/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Vehicle document uploaded successfully:", response.data);
    return response.data;
  },
};