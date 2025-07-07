import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuditLogResponseDto, FindAuditLogsDto } from '../types/audit.types';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Adjust base URL as needed
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogResponseDto[], FindAuditLogsDto>({
      query: (params) => ({
        url: '/audit',
        params,
      }),
    }),
    getEntityHistory: builder.query<AuditLogResponseDto[], { type: string; id: string }>({
      query: ({ type, id }) => `/audit/entity/${type}/${id}`,
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetEntityHistoryQuery,
} = auditApi;