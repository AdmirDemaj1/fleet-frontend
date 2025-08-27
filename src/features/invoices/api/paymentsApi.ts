import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Payment,
  PaymentWithCreditResponse,
  PaymentQueryParams,
  CreatePaymentDto,
  UpdatePaymentDto,
  MarkPaymentPaidDto,
  MarkPaymentPaidWithCreditDto,
  RegisterPaymentDto,
  CustomerCreditBalance,
  PaymentStatus
} from '../types/invoice.types';

import { getApiUrl } from '../../../shared/utils/env';

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Payment', 'CustomerCredit'],
  endpoints: (builder) => ({
    getPayments: builder.query<{ payments: Payment[]; total: number; meta: any }, PaymentQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Set default limit if not provided
        const queryParams = {
          limit: 10,
          ...params
        };
        
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });

        console.log('Payment API request URL:', `/payments?${searchParams.toString()}`);
        return `/payments?${searchParams.toString()}`;
      },
      providesTags: ['Payment'],
      transformResponse: (response: any) => {
        console.log('Payments API response:', response);
        
        // Handle paginated response structure with data and meta
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          const paymentsArray = response.data;
          const meta = response.meta || {};
          const total = meta.total || paymentsArray.length;
          
          console.log('Transformed payments:', paymentsArray);
          console.log('Meta information:', meta);
          console.log('Total count:', total);
          
          return { 
            payments: paymentsArray, 
            total,
            meta
          };
        }
        
        // Fallback for other response structures
        let paymentsArray: Payment[];
        let total: number;
        
        if (Array.isArray(response)) {
          paymentsArray = response;
          total = response.length;
        } else if (response && typeof response === 'object' && 'payments' in response && Array.isArray(response.payments)) {
          paymentsArray = response.payments;
          total = response.meta?.total || paymentsArray.length;
        } else {
          console.warn('Unexpected payments response structure:', response);
          paymentsArray = [];
          total = 0;
        }
        
        console.log('Transformed payments (fallback):', paymentsArray);
        console.log('Total count (fallback):', total);
        
        return { 
          payments: paymentsArray, 
          total,
          meta: response?.meta || {}
        };
      },
    }),

    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }],
    }),

    getPaymentsByContract: builder.query<{
      data: Payment[];
      meta: {
        total: number;
        page: number;
        limit: number;
        offset: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }, { 
      contractId: string; 
      status?: PaymentStatus; 
      limit?: number; 
      page?: number;
      offset?: number; 
    }>({
      query: ({ contractId, status, limit, page, offset }) => {
        const searchParams = new URLSearchParams();
        
        if (status) searchParams.append('status', status);
        if (limit) searchParams.append('limit', String(limit));
        if (page) searchParams.append('page', String(page));
        if (offset) searchParams.append('offset', String(offset));

        const queryString = searchParams.toString();
        console.log('Contract payments query:', `/payments/contract/${contractId}?${queryString}`);
        return `/payments/contract/${contractId}?${queryString}`;
      },
      providesTags: (_result, _error, { contractId, page, limit }) => [
        { type: 'Payment', id: `contract-${contractId}-page-${page || 1}-limit-${limit || 10}` }
      ],
      transformResponse: (response: any) => {
        console.log('Contract payments API response:', response);
        
        // Handle paginated response structure with data and meta
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          console.log('Using paginated response structure');
          return {
            data: response.data,
            meta: response.meta || {
              total: response.data.length,
              page: 1,
              limit: response.data.length,
              offset: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false
            }
          };
        }
        
        // Handle different response structures (fallback)
        let paymentsArray: Payment[];
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (response && typeof response === 'object' && 'payments' in response && Array.isArray(response.payments)) {
          paymentsArray = response.payments;
        } else {
          console.warn('Unexpected payments response structure:', response);
          paymentsArray = [];
        }
        
        return {
          data: paymentsArray,
          meta: {
            total: paymentsArray.length,
            page: 1,
            limit: paymentsArray.length,
            offset: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      },
    }),

    getPaymentsByCustomer: builder.query<Payment[], { 
      customerId: string; 
      status?: PaymentStatus; 
      limit?: number; 
      offset?: number; 
    }>({
      query: ({ customerId, status, limit, offset }) => {
        const searchParams = new URLSearchParams();
        
        if (status) searchParams.append('status', status);
        if (limit) searchParams.append('limit', String(limit));
        if (offset) searchParams.append('offset', String(offset));

        return `/customer/${customerId}?${searchParams.toString()}`;
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: 'Payment', id: `customer-${customerId}` }
      ],
      transformResponse: (response: any) => {
        // Handle different response structures
        let paymentsArray: Payment[];
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          paymentsArray = response.data;
        } else if (response && typeof response === 'object' && 'payments' in response && Array.isArray(response.payments)) {
          paymentsArray = response.payments;
        } else {
          console.warn('Unexpected payments response structure:', response);
          paymentsArray = [];
        }
        
        return paymentsArray;
      },
    }),

    createPayment: builder.mutation<Payment, CreatePaymentDto>({
      query: (paymentData) => ({
        url: '/payments',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),

    updatePayment: builder.mutation<Payment, { id: string; data: UpdatePaymentDto }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payment', id },
        'Payment'
      ],
    }),

    deletePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Payment', id },
        'Payment'
      ],
    }),

    registerPayment: builder.mutation<Payment, { contractId: string; data: RegisterPaymentDto }>({
      query: ({ contractId, data }) => ({
        url: `/payments/register/${contractId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),

    markPaymentAsPaid: builder.mutation<Payment, { id: string; data: MarkPaymentPaidDto }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}/mark-paid`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payment', id },
        'Payment',
        'CustomerCredit'
      ],
    }),

    markPaymentAsPaidWithCredit: builder.mutation<PaymentWithCreditResponse, { 
      id: string; 
      data: MarkPaymentPaidWithCreditDto 
    }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}/mark-paid-with-credit`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payment', id },
        'Payment',
        'CustomerCredit'
      ],
    }),

    getCustomerCreditBalance: builder.query<CustomerCreditBalance, string>({
      query: (customerId) => `/payments/customer/${customerId}/credit-balance`,
      providesTags: (_result, _error, customerId) => [
        { type: 'CustomerCredit', id: customerId }
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByContractQuery,
  useGetPaymentsByCustomerQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useRegisterPaymentMutation,
  useMarkPaymentAsPaidMutation,
  useMarkPaymentAsPaidWithCreditMutation,
  useGetCustomerCreditBalanceQuery,
} = paymentsApi;
