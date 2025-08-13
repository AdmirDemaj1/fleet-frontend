// src/features/logs/api/auditapi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../../../shared/utils/env';
import { AuditLogResponseDto, FindAuditLogsDto, CustomerLogFilters } from '../types/audit.types';
import { API_ENDPOINTS } from '../../../shared/utils/constants';

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'https://fleet-credit-system-oxtz.vercel.app/',
    // baseUrl: 'http://localhost:3000/',
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
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
      transformResponse: (response: any, meta) => {
        // Handle different response structures
        let logsArray: AuditLogResponseDto[];
        let total: number;
        
        if (Array.isArray(response)) {
          logsArray = response;
          total = parseInt(meta?.response?.headers.get('X-Total-Count') || '0', 10);
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          logsArray = response.data;
          total = response.meta?.total || logsArray.length;
        } else if (response && typeof response === 'object' && 'logs' in response && Array.isArray(response.logs)) {
          logsArray = response.logs;
          total = response.meta?.total || logsArray.length;
        } else {
          console.warn('Unexpected audit logs response structure:', response);
          logsArray = [];
          total = 0;
        }
        
        return {
          data: logsArray,
          total: total,
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
          eventTypes: params.eventTypes ? params.eventTypes.join(',') : undefined,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
      transformResponse: (response: any, meta) => {
        // Handle different response structures
        let logsArray: AuditLogResponseDto[];
        let total: number;
        
        if (Array.isArray(response)) {
          logsArray = response;
          total = parseInt(meta?.response?.headers.get('X-Total-Count') || '0', 10);
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          logsArray = response.data;
          total = response.meta?.total || logsArray.length;
        } else if (response && typeof response === 'object' && 'logs' in response && Array.isArray(response.logs)) {
          logsArray = response.logs;
          total = response.meta?.total || logsArray.length;
        } else {
          console.warn('Unexpected customer logs response structure:', response);
          logsArray = [];
          total = 0;
        }
        
        return {
          data: logsArray,
          total: total,
        };
      },
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetCustomerLogsQuery } = auditApi;