import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle, VehicleFilters } from '../types/vehicleType';

// Define the state for vehicles
interface VehicleState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  selectedVehicle: Vehicle | null;
  filters: VehicleFilters;
  totalCount: number;
}

// Define the initial state
const initialState: VehicleState = {
  vehicles: [],
  loading: false,
  error: null,
  selectedVehicle: null,
  filters: {
    limit: 10,
    offset: 0
  },
  totalCount: 0
};

// Create the vehicle slice
const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    // Reducer to set the vehicles
    setVehicles: (state, action: PayloadAction<{ vehicles: Vehicle[]; total: number }>) => {
      state.vehicles = action.payload.vehicles;
      state.totalCount = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle>) => {
      state.selectedVehicle = action.payload;
      state.error = null;
    },
    // Reducer to set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Reducer to set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<VehicleFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    }
  }
});

// Export the actions
export const {
  setVehicles,
  setLoading,
  setError,
  setSelectedVehicle,
  setFilters,
  resetFilters,
  clearSelectedVehicle
} = vehicleSlice.actions;

// Export the reducer
export default vehicleSlice.reducer;