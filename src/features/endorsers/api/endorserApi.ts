import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../../../shared/utils/env';
import {
  Endorser,
  EndorserRelationship,
  CreateEndorserDto,
  UpdateEndorserDto,
  CreateEndorserRelationshipDto,
  UpdateEndorserRelationshipDto,
  EndorserQueryParams,
  EndorsersResponse,
  EndorserRelationshipsResponse,
} from '../types/endorser.types';

export const endorserApi = createApi({
  reducerPath: 'endorserApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Endorser', 'EndorserRelationship'],
  endpoints: (builder) => ({
    // Endorser CRUD operations
    getEndorsers: builder.query<EndorsersResponse, EndorserQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        const queryParams = {
          limit: 10,
          ...params
        };
        
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });

        return `/endorsers?${searchParams.toString()}`;
      },
      providesTags: ['Endorser'],
      transformResponse: (response: any) => {
        console.log('Endorsers API response:', response);
        
        // Handle paginated response structure with data and meta
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          const endorsersArray = response.data;
          const meta = response.meta || {};
          const total = meta.total || endorsersArray.length;
          
          return { 
            endorsers: endorsersArray, 
            total,
            meta: {
              total: meta.total || total,
              page: meta.page || 1,
              limit: meta.limit || endorsersArray.length,
              offset: meta.offset || 0,
              totalPages: meta.totalPages || Math.ceil(total / (meta.limit || endorsersArray.length)),
              hasNextPage: meta.hasNextPage || false,
              hasPreviousPage: meta.hasPreviousPage || false,
            }
          };
        }
        
        // Fallback for other response structures
        let endorsersArray: Endorser[];
        if (Array.isArray(response)) {
          endorsersArray = response;
        } else if (response && typeof response === 'object' && 'endorsers' in response && Array.isArray(response.endorsers)) {
          endorsersArray = response.endorsers;
        } else {
          console.warn('Unexpected endorsers response structure:', response);
          endorsersArray = [];
        }
        
        const total = endorsersArray.length;
        
        return { 
          endorsers: endorsersArray, 
          total,
          meta: {
            total,
            page: 1,
            limit: total,
            offset: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        };
      },
    }),

    getEndorser: builder.query<Endorser, string>({
      query: (id) => `/endorsers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Endorser', id }],
    }),

    createEndorser: builder.mutation<Endorser, CreateEndorserDto>({
      query: (endorserData) => ({
        url: '/endorsers',
        method: 'POST',
        body: endorserData,
      }),
      invalidatesTags: ['Endorser'],
    }),

    updateEndorser: builder.mutation<Endorser, { id: string; data: UpdateEndorserDto }>({
      query: ({ id, data }) => ({
        url: `/endorsers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Endorser', id },
        'Endorser'
      ],
    }),

    deleteEndorser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/endorsers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Endorser', id },
        'Endorser'
      ],
    }),

    // Endorser Relationship operations
    getEndorserRelationships: builder.query<EndorserRelationshipsResponse, EndorserQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        const queryParams = {
          limit: 10,
          ...params
        };
        
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });

        return `/endorsers/relationships?${searchParams.toString()}`;
      },
      providesTags: ['EndorserRelationship'],
      transformResponse: (response: any) => {
        console.log('Endorser relationships API response:', response);
        
        // Handle paginated response structure with data and meta
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          const relationshipsArray = response.data;
          const meta = response.meta || {};
          const total = meta.total || relationshipsArray.length;
          
          return { 
            relationships: relationshipsArray, 
            total,
            meta: {
              total: meta.total || total,
              page: meta.page || 1,
              limit: meta.limit || relationshipsArray.length,
              offset: meta.offset || 0,
              totalPages: meta.totalPages || Math.ceil(total / (meta.limit || relationshipsArray.length)),
              hasNextPage: meta.hasNextPage || false,
              hasPreviousPage: meta.hasPreviousPage || false,
            }
          };
        }
        
        // Fallback for other response structures
        let relationshipsArray: EndorserRelationship[];
        if (Array.isArray(response)) {
          relationshipsArray = response;
        } else if (response && typeof response === 'object' && 'relationships' in response && Array.isArray(response.relationships)) {
          relationshipsArray = response.relationships;
        } else {
          console.warn('Unexpected endorser relationships response structure:', response);
          relationshipsArray = [];
        }
        
        const total = relationshipsArray.length;
        
        return { 
          relationships: relationshipsArray, 
          total,
          meta: {
            total,
            page: 1,
            limit: total,
            offset: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        };
      },
    }),

    getEndorsersForCustomer: builder.query<EndorserRelationship[], string>({
      query: (customerId) => `/endorsers/relationships/customer/${customerId}`,
      providesTags: (_result, _error, customerId) => [
        { type: 'EndorserRelationship', id: `customer-${customerId}` }
      ],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        } else if (response && typeof response === 'object' && 'relationships' in response && Array.isArray(response.relationships)) {
          return response.relationships;
        } else {
          console.warn('Unexpected endorsers for customer response structure:', response);
          return [];
        }
      },
    }),

    getCustomersForEndorser: builder.query<EndorserRelationship[], string>({
      query: (endorserId) => `/endorsers/relationships/endorser/${endorserId}`,
      providesTags: (_result, _error, endorserId) => [
        { type: 'EndorserRelationship', id: `endorser-${endorserId}` }
      ],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        } else if (response && typeof response === 'object' && 'relationships' in response && Array.isArray(response.relationships)) {
          return response.relationships;
        } else {
          console.warn('Unexpected customers for endorser response structure:', response);
          return [];
        }
      },
    }),

    createEndorserRelationship: builder.mutation<EndorserRelationship, CreateEndorserRelationshipDto>({
      query: (relationshipData) => ({
        url: '/endorsers/relationships',
        method: 'POST',
        body: relationshipData,
      }),
      invalidatesTags: ['EndorserRelationship'],
    }),

    updateEndorserRelationship: builder.mutation<EndorserRelationship, { id: string; data: UpdateEndorserRelationshipDto }>({
      query: ({ id, data }) => ({
        url: `/endorsers/relationships/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'EndorserRelationship', id },
        'EndorserRelationship'
      ],
    }),

    deleteEndorserRelationship: builder.mutation<void, string>({
      query: (id) => ({
        url: `/endorsers/relationships/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'EndorserRelationship', id },
        'EndorserRelationship'
      ],
    }),
  }),
});

export const {
  useGetEndorsersQuery,
  useGetEndorserQuery,
  useCreateEndorserMutation,
  useUpdateEndorserMutation,
  useDeleteEndorserMutation,
  useGetEndorserRelationshipsQuery,
  useGetEndorsersForCustomerQuery,
  useGetCustomersForEndorserQuery,
  useCreateEndorserRelationshipMutation,
  useUpdateEndorserRelationshipMutation,
  useDeleteEndorserRelationshipMutation,
} = endorserApi;
