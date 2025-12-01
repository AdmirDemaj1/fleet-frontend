import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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
  PaymentStatus,
} from "../types/invoice.types";

import { getApiUrl } from "../../../shared/utils/env";
import { tokenStorage } from "../../auth/utils/tokenStorage";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      // Add authorization header if needed
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Payment", "CustomerCredit"],
  endpoints: (builder) => ({
    getPayments: builder.query<
      { payments: Payment[]; total: number; meta: any },
      PaymentQueryParams
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        // Set default limit if not provided
        const queryParams = {
          limit: 10,
          ...params,
        };

        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        console.log(
          "Payment API request URL:",
          `/payments?${searchParams.toString()}`
        );
        return `/payments?${searchParams.toString()}`;
      },
      providesTags: ["Payment"],
      transformResponse: (response: any) => {
        console.log("Payments API response:", response);

        // Handle paginated response structure with data and meta
        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          const paymentsArray = response.data;
          const meta = response.meta || {};
          const total = meta.total || paymentsArray.length;

          console.log("Transformed payments:", paymentsArray);
          console.log("Meta information:", meta);
          console.log("Total count:", total);

          return {
            payments: paymentsArray,
            total,
            meta,
          };
        }

        // Fallback for other response structures
        let paymentsArray: Payment[];
        let total: number;

        if (Array.isArray(response)) {
          paymentsArray = response;
          total = response.length;
        } else if (
          response &&
          typeof response === "object" &&
          "payments" in response &&
          Array.isArray(response.payments)
        ) {
          paymentsArray = response.payments;
          total = response.meta?.total || paymentsArray.length;
        } else {
          console.warn("Unexpected payments response structure:", response);
          paymentsArray = [];
          total = 0;
        }

        console.log("Transformed payments (fallback):", paymentsArray);
        console.log("Total count (fallback):", total);

        return {
          payments: paymentsArray,
          total,
          meta: response?.meta || {},
        };
      },
    }),

    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Payment", id }],
    }),

    getPaymentsByContract: builder.query<
      {
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
      },
      {
        contractId: string;
        status?: PaymentStatus;
        limit?: number;
        page?: number;
        offset?: number;
      }
    >({
      query: ({ contractId, status, limit, page, offset }) => {
        const searchParams = new URLSearchParams();

        if (status) searchParams.append("status", status);
        if (limit) searchParams.append("limit", String(limit));
        if (page) searchParams.append("page", String(page));
        if (offset) searchParams.append("offset", String(offset));

        const queryString = searchParams.toString();
        console.log(
          "Contract payments query:",
          `/payments/contract/${contractId}?${queryString}`
        );
        return `/payments/contract/${contractId}?${queryString}`;
      },
      providesTags: (_result, _error, { contractId, page, limit }) => [
        {
          type: "Payment",
          id: `contract-${contractId}-page-${page || 1}-limit-${limit || 10}`,
        },
      ],
      transformResponse: (response: any) => {
        console.log("Contract payments API response:", response);

        // Handle paginated response structure with data and meta
        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          console.log("Using paginated response structure");
          return {
            data: response.data,
            meta: response.meta || {
              total: response.data.length,
              page: 1,
              limit: response.data.length,
              offset: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          };
        }

        // Handle different response structures (fallback)
        let paymentsArray: Payment[];
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (
          response &&
          typeof response === "object" &&
          "payments" in response &&
          Array.isArray(response.payments)
        ) {
          paymentsArray = response.payments;
        } else {
          console.warn("Unexpected payments response structure:", response);
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
            hasPreviousPage: false,
          },
        };
      },
    }),

    getPaymentsByCustomer: builder.query<
      Payment[],
      {
        customerId: string;
        status?: PaymentStatus;
        limit?: number;
        offset?: number;
      }
    >({
      query: ({ customerId, status, limit, offset }) => {
        const searchParams = new URLSearchParams();

        if (status) searchParams.append("status", status);
        if (limit) searchParams.append("limit", String(limit));
        if (offset) searchParams.append("offset", String(offset));

        return `/customer/${customerId}?${searchParams.toString()}`;
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: "Payment", id: `customer-${customerId}` },
      ],
      transformResponse: (response: any) => {
        // Handle different response structures
        let paymentsArray: Payment[];
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          paymentsArray = response.data;
        } else if (
          response &&
          typeof response === "object" &&
          "payments" in response &&
          Array.isArray(response.payments)
        ) {
          paymentsArray = response.payments;
        } else {
          console.warn("Unexpected payments response structure:", response);
          paymentsArray = [];
        }

        return paymentsArray;
      },
    }),

    createPayment: builder.mutation<
      {
        requiresApproval?: boolean;
        approvalRequestId?: string;
        message?: string;
        data?: Payment;
      },
      CreatePaymentDto
    >({
      query: (paymentData) => ({
        url: "/payments",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Payment"],
      transformResponse: (response: any) => {
        // Handle both approval request response and direct payment response
        if (response.requiresApproval) {
          return {
            requiresApproval: true,
            approvalRequestId: response.approvalRequestId,
            message:
              response.message ||
              "Action requires approval. Request has been submitted.",
          };
        }
        return { data: response };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since new payments affect contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log("✅ Contract cache invalidated after payment creation");
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    updatePayment: builder.mutation<
      Payment,
      { id: string; data: UpdatePaymentDto }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Payment", id },
        "Payment",
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since payment changes affect contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log("✅ Contract cache invalidated after payment update");
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    deletePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Payment", id },
        "Payment",
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since deleting payments affects contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log("✅ Contract cache invalidated after payment deletion");
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    registerPayment: builder.mutation<
      Payment,
      { contractId: string; data: RegisterPaymentDto }
    >({
      query: ({ contractId, data }) => ({
        url: `/payments/register/${contractId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since new payments affect contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log(
            "✅ Contract cache invalidated after payment registration"
          );
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    markPaymentAsPaid: builder.mutation<
      {
        requiresApproval?: boolean;
        approvalRequestId?: string;
        message?: string;
        data?: Payment;
      },
      { id: string; data: MarkPaymentPaidDto }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}/mark-paid`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => {
        // Handle both approval request response and direct payment response
        if (response.requiresApproval) {
          return {
            requiresApproval: true,
            approvalRequestId: response.approvalRequestId,
            message:
              response.message ||
              "Action requires approval. Request has been submitted.",
          };
        }
        return { data: response };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Payment", id },
        "Payment",
        "CustomerCredit",
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since payment status changes affect contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log("✅ Contract cache invalidated after payment update");
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    markPaymentAsPaidWithCredit: builder.mutation<
      {
        requiresApproval?: boolean;
        approvalRequestId?: string;
        message?: string;
        data?: PaymentWithCreditResponse;
      },
      {
        id: string;
        data: MarkPaymentPaidWithCreditDto;
      }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}/mark-paid-with-credit`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("Mark payment with credit respoxfnse:", response);
        // Handle both approval request response and direct payment response
        if (response.requiresApproval) {
          return {
            requiresApproval: true,
            approvalRequestId: response.approvalRequestId,
            message:
              response.message ||
              "Action requires approval. Request has been submitted.",
          };
        }
        return { data: response };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Payment", id },
        "Payment",
        "CustomerCredit",
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Import contractApi and invalidate contract cache
          const { contractApi } = await import(
            "../../contracts/api/contractApi"
          );

          // Invalidate all contract queries since payment status changes affect contract financial data
          dispatch(contractApi.util.invalidateTags(["Contract"]));

          console.log(
            "✅ Contract cache invalidated after payment with credit update"
          );
        } catch (error) {
          console.error("❌ Failed to invalidate contract cache:", error);
        }
      },
    }),

    getCustomerCreditBalance: builder.query<CustomerCreditBalance, string>({
      query: (customerId) => `/payments/customer/${customerId}/credit-balance`,
      providesTags: (_result, _error, customerId) => [
        { type: "CustomerCredit", id: customerId },
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
