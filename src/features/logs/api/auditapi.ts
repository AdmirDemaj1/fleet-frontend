// src/features/logs/api/auditapi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../../../shared/utils/env';
import { AuditLogResponseDto, FindAuditLogsDto, CustomerLogFilters } from '../types/audit.types';
import { API_ENDPOINTS } from '../../../shared/utils/constants';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      { data: AuditLogResponseDto[]; total: number },
      FindAuditLogsDto
    >({
      query: (params) => ({
        url: API_ENDPOINTS.AUDIT,
        params: {
          search: params.search,
          limit: params.limit,
          offset: params.offset,
          entityId: params.entityId,
          entityType: params.entityType,
          userId: params.userId,
          eventTypes: params.eventTypes ? params.eventTypes.join(',') : undefined,
          sortOrder: params.sortOrder,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
      transformResponse: (response: AuditLogResponseDto[], meta) => {
        return {
          data: response,
          total: parseInt(meta?.response?.headers.get('X-Total-Count') || '0', 10),
        };
      },
    }),
    
    getCustomerLogs: builder.query<
      { data: AuditLogResponseDto[]; total: number },
      CustomerLogFilters
    >({
      query: (params) => ({
        url: `/audit/entity/customer/${params.customerId}`,
        params: {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
          sortOrder: params.sortOrder,
          eventTypes: params.eventTypes ? params.eventTypes.join(',') : undefined,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
      transformResponse: (response: AuditLogResponseDto[], meta) => {
        return {
          data: response,
          total: parseInt(meta?.response?.headers.get('X-Total-Count') || '0', 10),
        };
      },
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetCustomerLogsQuery } = auditApi;