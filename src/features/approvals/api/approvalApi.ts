import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../../../shared/utils/env';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import {
  ApprovalRequest,
  ApprovalQueryParams,
  PaginatedApprovalResponseDto,
  ApprovalDecisionDto,
} from '../types/approval.types';

export const approvalApi = createApi({
  reducerPath: 'approvalApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ApprovalRequest'],
  endpoints: (builder) => ({
    getApprovalRequests: builder.query<PaginatedApprovalResponseDto, ApprovalQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Set default values
        const queryParams = {
          page: 1,
          limit: 20,
          ...params
        };
        
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });

        console.log('Approval API request URL:', `/approvals/pending?${searchParams.toString()}`);
        return `/approvals/pending?${searchParams.toString()}`;
      },
      providesTags: ['ApprovalRequest'],
      transformResponse: (response: any) => {
        console.log('Approvals API response:', response);
        return response;
      },
    }),

    getApprovalRequestById: builder.query<ApprovalRequest, string>({
      query: (id) => `/approvals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ApprovalRequest', id }],
    }),

    processApprovalRequest: builder.mutation<ApprovalRequest, { id: string; decision: ApprovalDecisionDto }>({
      query: ({ id, decision }) => ({
        url: `/approvals/${id}/decision`,
        method: 'PUT',
        body: decision,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ApprovalRequest', id },
        'ApprovalRequest'
      ],
    }),

    cancelRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/approvals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ApprovalRequest', id },
        'ApprovalRequest'
      ],
    }),
  }),
});

export const {
  useGetApprovalRequestsQuery,
  useGetApprovalRequestByIdQuery,
  useProcessApprovalRequestMutation,
  useCancelRequestMutation,
} = approvalApi;
