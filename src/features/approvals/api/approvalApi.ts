import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/utils/rtkBaseQuery';
import {
  ApprovalRequest,
  ApprovalQueryParams,
  PaginatedApprovalResponseDto,
  ApprovalDecisionDto,
  ApprovalActionResponse,
  ApprovalComment,
  CreateCommentDto,
  ResolveCommentDto,
  UpdateRequestDataDto,
} from '../types/approval.types';

export const approvalApi = createApi({
  reducerPath: 'approvalApi',
  baseQuery: baseQueryWithReauth,
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

    processApprovalRequest: builder.mutation<ApprovalActionResponse, { id: string; decision: ApprovalDecisionDto }>({
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

    cancelRequest: builder.mutation<ApprovalActionResponse, string>({
      query: (id) => ({
        url: `/approvals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ApprovalRequest', id },
        'ApprovalRequest'
      ],
    }),

    // ============= COMMENT ENDPOINTS =============

    // Get comments for an approval request
    getComments: builder.query<ApprovalComment[], string>({
      query: (approvalRequestId) => `/approvals/${approvalRequestId}/comments`,
      providesTags: (_result, _error, id) => [{ type: 'ApprovalRequest', id }],
    }),

    // Add a comment to an approval request (Admin only)
    addComment: builder.mutation<ApprovalComment, { approvalRequestId: string; data: CreateCommentDto }>({
      query: ({ approvalRequestId, data }) => ({
        url: `/approvals/${approvalRequestId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { approvalRequestId }) => [
        { type: 'ApprovalRequest', id: approvalRequestId },
        'ApprovalRequest'
      ],
    }),

    // Resolve a comment (Requestor only)
    resolveComment: builder.mutation<ApprovalComment, { commentId: string; data: ResolveCommentDto }>({
      query: ({ commentId, data }) => ({
        url: `/approvals/comments/${commentId}/resolve`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ApprovalRequest'],
    }),

    // Update request data (Requestor only)
    updateRequestData: builder.mutation<ApprovalRequest, { approvalRequestId: string; data: UpdateRequestDataDto }>({
      query: ({ approvalRequestId, data }) => ({
        url: `/approvals/${approvalRequestId}/request-data`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { approvalRequestId }) => [
        { type: 'ApprovalRequest', id: approvalRequestId },
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
  // Comment hooks
  useGetCommentsQuery,
  useAddCommentMutation,
  useResolveCommentMutation,
  useUpdateRequestDataMutation,
} = approvalApi;
