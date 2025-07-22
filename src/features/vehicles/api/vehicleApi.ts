import { api } from '../../../shared/utils/api';
import { Vehicle, VehicleQueryParams, VehicleStatus, VehicleStatistics } from '../types/vehicleType';

export const vehicleApi = {
  // Get all vehicles with filtering and pagination
  getVehicles: async (params: VehicleQueryParams): Promise<{ vehicles: Vehicle[], total: number }> => {
    // Convert zero-based page index to one-based for the API
    const apiParams = { ...params };
    if (apiParams.page !== undefined) {
      apiParams.page = apiParams.page + 1; // Convert from 0-based to 1-based
    }
    
    const response = await api.get<{ vehicles: Vehicle[], total: number }>('/vehicles', { params: apiParams });
    return response.data;
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

  // Create a new vehicle
  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/vehicles', vehicleData);
    return response.data;
  },

  // Update a vehicle
  updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, vehicleData);
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