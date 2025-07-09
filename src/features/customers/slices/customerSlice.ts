import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerDetailed, CustomerFilters } from '../types/customer.types';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: CustomerDetailed | null;
  loading: boolean;
  error: string | null;
  filters: CustomerFilters;
  totalCount: number;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  filters: {
    limit: 10,
    offset: 0
  },
  totalCount: 0
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<{ customers: Customer[]; total: number }>) => {
      state.customers = action.payload.customers;
      state.totalCount = action.payload.total;
      state.error = null;
    },
    setSelectedCustomer: (state, action: PayloadAction<CustomerDetailed>) => {
      state.selectedCustomer = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    }
  }
});

export const {
  setCustomers,
  setSelectedCustomer,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  clearSelectedCustomer
} = customerSlice.actions;

export default customerSlice.reducer;