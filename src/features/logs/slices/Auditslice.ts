// src/features/logs/slices/auditSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuditLogResponseDto, FindAuditLogsDto } from '../types/audit.types';

interface AuditState {
  logs: AuditLogResponseDto[];
  selectedLog: AuditLogResponseDto | null;
  filters: FindAuditLogsDto;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: AuditState = {
  logs: [],
  selectedLog: null,
  filters: {
    limit: 10,
    offset: 0,
    sortOrder: 'desc'
  },
  loading: false,
  error: null,
  totalCount: 0
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setAuditLogs: (state, action: PayloadAction<{ logs: AuditLogResponseDto[]; total: number }>) => {
      state.logs = action.payload.logs;
      state.totalCount = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    setSelectedLog: (state, action: PayloadAction<AuditLogResponseDto>) => {
      state.selectedLog = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FindAuditLogsDto>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
  },
});

export const { 
  setAuditLogs, 
  setSelectedLog, 
  setFilters, 
  clearFilters, 
  setLoading, 
  setError,
  clearSelectedLog
} = auditSlice.actions;

export default auditSlice.reducer;