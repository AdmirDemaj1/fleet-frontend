import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/utils/rtkBaseQuery";
import {
  Customer,
  CustomerFilters,
  Administrator,
  ContractSummary,
} from "../types/customer.types";

export const customerRtkApi = createApi({
  reducerPath: "customerRtkApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customer", "Administrator", "CustomerContracts", "CustomerVehicles", "CustomerPayments"],
  endpoints: (builder) => ({
    // Get customers with filtering and pagination
    getCustomers: builder.query<
      { customers: Customer[]; total: number },
      CustomerFilters
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.type) searchParams.append("type", params.type);
        if (params.search) searchParams.append("search", params.search);
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.offset !== undefined)
          searchParams.append("offset", params.offset.toString());
        if (params.hasVehicles !== undefined)
          searchParams.append("hasVehicles", params.hasVehicles.toString());
        if (params.hasContracts !== undefined)
          searchParams.append("hasContracts", params.hasContracts.toString());
        if (params.hasCollaterals !== undefined)
          searchParams.append("hasCollaterals", params.hasCollaterals.toString());

        return `/customers?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.customers.map(({ id }) => ({
                type: "Customer" as const,
                id,
              })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
      transformResponse: (response: any) => {
        let customers: Customer[];
        let total: number;

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          "meta" in response
        ) {
          customers = response.data || [];
          total = response.meta?.total || 0;
        } else if (Array.isArray(response)) {
          customers = response;
          total = customers.length;
        } else {
          customers = [];
          total = 0;
        }

        return { customers, total };
      },
    }),

    // Get a single customer by ID
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Customer", id }],
    }),

    // Get all administrators
    getAdministrators: builder.query<Administrator[], void>({
      query: () => "/administrators",
      providesTags: ["Administrator"],
    }),

    // Get administrator by ID
    getAdministratorById: builder.query<Administrator, string>({
      query: (id) => `/administrators/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Administrator", id }],
    }),

    // Get contracts for a customer
    getCustomerContracts: builder.query<
      { data: ContractSummary[]; meta: { total: number; page: number; limit: number } },
      { customerId: string; limit?: number; offset?: number; status?: string; type?: string }
    >({
      query: ({ customerId, limit, offset, status, type }) => {
        const searchParams = new URLSearchParams();
        if (limit) searchParams.append("limit", limit.toString());
        if (offset !== undefined) searchParams.append("offset", offset.toString());
        if (status) searchParams.append("status", status);
        if (type) searchParams.append("type", type);

        return `/customers/${customerId}/contracts${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: "CustomerContracts", id: customerId },
      ],
      transformResponse: (response: any) => {
        if (response && typeof response === "object" && "data" in response) {
          return {
            data: response.data || [],
            meta: response.meta || { total: 0, page: 1, limit: 10 },
          };
        }
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, page: 1, limit: response.length },
          };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 10 } };
      },
    }),

    // Get payments/invoices for a customer
    getCustomerPayments: builder.query<
      any[],
      { customerId: string; limit?: number; offset?: number; status?: string }
    >({
      query: ({ customerId, limit, offset, status }) => {
        const searchParams = new URLSearchParams();
        if (limit) searchParams.append("limit", limit.toString());
        if (offset !== undefined) searchParams.append("offset", offset.toString());
        if (status) searchParams.append("status", status);

        return `/customers/${customerId}/payments${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: "CustomerPayments", id: customerId },
      ],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<
      { requiresApproval?: boolean; approvalRequestId?: string; message?: string },
      string
    >({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetAdministratorsQuery,
  useGetAdministratorByIdQuery,
  useGetCustomerContractsQuery,
  useGetCustomerPaymentsQuery,
  useDeleteCustomerMutation,
} = customerRtkApi;
