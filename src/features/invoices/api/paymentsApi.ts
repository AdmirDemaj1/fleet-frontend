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

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'https://fleet-credit-system-oxtz.vercel.app',
    // baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Payment', 'CustomerCredit'],
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], PaymentQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });

        return `/payments?${searchParams.toString()}`;
      },
      providesTags: ['Payment'],
    }),

    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }],
    }),

    getPaymentsByContract: builder.query<Payment[], { 
      contractId: string; 
      status?: PaymentStatus; 
      limit?: number; 
      offset?: number; 
    }>({
      query: ({ contractId, status, limit, offset }) => {
        const searchParams = new URLSearchParams();
        
        if (status) searchParams.append('status', status);
        if (limit) searchParams.append('limit', String(limit));
        if (offset) searchParams.append('offset', String(offset));

        return `/payments/contract/${contractId}?${searchParams.toString()}`;
      },
      providesTags: (_result, _error, { contractId }) => [
        { type: 'Payment', id: `contract-${contractId}` }
      ],
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
