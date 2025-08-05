import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../../../shared/utils/env';
import { 
  CreateContractDto, 
  ContractResponse, 
  CustomerSummary, 
  VehicleSummary, 
  EndorserSummary,
  ContractType,
  ContractStatus 
} from '../types/contract.types';

export const contractApi = createApi({
  reducerPath: 'contractApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'https://fleet-credit-system-oxtz.vercel.app/',
    // baseUrl: 'http://localhost:3000/',
    prepareHeaders: (headers) => {
      // Add authorization header if needed
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Contract', 'Customer', 'Vehicle', 'Endorser'],
  endpoints: (builder) => ({
    // Contract endpoints
    createContract: builder.mutation<any, CreateContractDto>({
      query: (contractData) => {
        console.log('🚀 Creating contract with data:', JSON.stringify(contractData, null, 2));
        return {
          url: '/contracts/with-dependencies',
          method: 'POST',
          body: contractData,
        };
      },
      invalidatesTags: ['Contract', 'Vehicle'],
      transformErrorResponse: (response: any) => {
        console.error('❌ Contract creation failed:', response);
        return response;
      },
    }),

    createContractWithDependencies: builder.mutation<any, CreateContractDto>({
      query: (contractData) => {
        console.log('🚀 Creating contract with dependencies:', JSON.stringify(contractData, null, 2));
        return {
          url: '/contracts/with-dependencies',
          method: 'POST',
          body: contractData,
        };
      },
      invalidatesTags: ['Contract', 'Vehicle'],
      transformErrorResponse: (response: any) => {
        console.error('❌ Contract creation with dependencies failed:', response);
        return response;
      },
    }),

    getContract: builder.query<ContractResponse, string>({
      query: (id) => `/contracts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Contract', id }],
    }),

    getContracts: builder.query<ContractResponse[], {
      type?: ContractType;
      status?: ContractStatus;
      limit?: number;
      offset?: number;
      search?: string;
    }>({
      query: (params) => ({
        url: '/contracts',
        params: params,
      }),
      providesTags: ['Contract'],
    }),

    // Customer endpoints (for picker)
    getCustomers: builder.query<CustomerSummary[], {
      search?: string;
      limit?: number;
      offset?: number;
      type?: 'individual' | 'business' | 'endorser';
      hasVehicles?: boolean;
      hasContracts?: boolean;
      hasCollaterals?: boolean;
    }>({
      query: (params) => ({
        url: '/customers',
        params: params,
      }),
      providesTags: ['Customer'],
      transformResponse: (response: any[]) => {
        // Transform the response to match CustomerSummary interface
        return response.map(customer => ({
          id: customer.id,
          name: customer.type === 'individual' 
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : customer.legalName || customer.administratorName,
          type: customer.type,
          email: customer.email,
          phone: customer.phone
        }));
      },
    }),

    getCustomer: builder.query<CustomerSummary, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
      transformResponse: (customer: any) => ({
        id: customer.id,
        name: customer.type === 'individual' 
          ? `${customer.firstName} ${customer.lastName}`.trim()
          : customer.legalName || customer.administratorName,
        type: customer.type,
        email: customer.email,
        phone: customer.phone
      }),
    }),

    // Vehicle endpoints (for picker)
    getAvailableVehicles: builder.query<VehicleSummary[], {
      search?: string;
      limit?: number;
      status?: string;
      make?: string;
      model?: string;
      year?: number;
    }>({
      query: (params) => ({
        url: '/vehicles',
        params: params, // Remove the forced status filter
      }),
      providesTags: ['Vehicle'],
      transformResponse: (response: any) => {
        // Handle both array response and paginated response
        const vehicles = Array.isArray(response) ? response : response.vehicles || [];
        return vehicles.map((vehicle: any) => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vinNumber: vehicle.vin, // Note: backend uses 'vin', frontend expects 'vinNumber'
          status: vehicle.status
        }));
      },
    }),

    getVehicle: builder.query<VehicleSummary, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Vehicle', id }],
      transformResponse: (vehicle: any) => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        vinNumber: vehicle.vinNumber,
        status: vehicle.status
      }),
    }),

    // Endorser endpoints (for picker)
    getEndorsers: builder.query<EndorserSummary[], {
      customerId?: string;
      search?: string;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/endorsers',
        params: params,
      }),
      providesTags: ['Endorser'],
      transformResponse: (response: any[]) => {
        return response.map(endorser => ({
          id: endorser.id,
          firstName: endorser.firstName,
          lastName: endorser.lastName,
          email: endorser.email,
          phone: endorser.phone,
          idNumber: endorser.idNumber,
          relationshipToCustomer: endorser.relationshipToCustomer
        }));
      },
    }),

    getEndorser: builder.query<EndorserSummary, string>({
      query: (id) => `/endorsers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Endorser', id }],
      transformResponse: (endorser: any) => ({
        id: endorser.id,
        firstName: endorser.firstName,
        lastName: endorser.lastName,
        email: endorser.email,
        phone: endorser.phone,
        idNumber: endorser.idNumber,
        relationshipToCustomer: endorser.relationshipToCustomer
      }),
    }),

    // Generate contract number
    generateContractNumber: builder.query<{ contractNumber: string }, ContractType>({
      query: (type) => ({
        url: `/generate-number?type=${type}`,
      }),
    }),

    // Calculate loan details
    calculateLoanPayment: builder.query<{ monthlyPayment: number; totalInterest: number }, {
      principal: number;
      interestRate: number;
      termMonths: number;
    }>({
      query: (params) => ({
        url: '/calculate-payment',
        params: params,
      }),
    }),
  }),
});

export const {
  useCreateContractMutation,
  useCreateContractWithDependenciesMutation,
  useGetContractQuery,
  useGetContractsQuery,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetAvailableVehiclesQuery,
  useGetVehicleQuery,
  useGetEndorsersQuery,
  useGetEndorserQuery,
  useGenerateContractNumberQuery,
  useCalculateLoanPaymentQuery,
} = contractApi;
