import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment, PaymentFilters } from '../types/invoice.types';

interface PaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  error: string | null;
  filters: PaymentFilters & {
    limit: number;
    offset: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  totalCount: number;
}

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  filters: {
    limit: 10,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  totalCount: 0
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<{ payments: Payment[]; total: number }>) => {
      state.payments = action.payload.payments;
      state.totalCount = action.payload.total;
      state.error = null;
    },
    setSelectedPayment: (state, action: PayloadAction<Payment>) => {
      state.selectedPayment = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<PaymentsState['filters']>>) => {
      const newFilters = { ...state.filters, ...action.payload };
      
      // Only update if filters actually changed
      const hasChanged = Object.keys(newFilters).some(key => {
        const filterKey = key as keyof PaymentsState['filters'];
        return state.filters[filterKey] !== newFilters[filterKey];
      });
      
      if (hasChanged) {
        state.filters = newFilters;
      }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
      state.totalCount += 1;
    },
  }
});

export const {
  setPayments,
  setSelectedPayment,
  setLoading,
  setError,
  setFilters,
  resetFilters,
  clearSelectedPayment,
  addPayment
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
