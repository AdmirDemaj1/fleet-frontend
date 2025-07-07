import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuditLogResponseDto, FindAuditLogsDto } from '../types/audit.types';

interface AuditState {
  logs: AuditLogResponseDto[];
  filters: FindAuditLogsDto;
}

const initialState: AuditState = {
  logs: [],
  filters: {},
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setAuditLogs: (state, action: PayloadAction<AuditLogResponseDto[]>) => {
      state.logs = action.payload;
    },
    setFilters: (state, action: PayloadAction<FindAuditLogsDto>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setAuditLogs, setFilters, clearFilters } = auditSlice.actions;
export default auditSlice.reducer;