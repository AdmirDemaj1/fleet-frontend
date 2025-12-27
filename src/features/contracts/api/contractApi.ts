import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../../shared/utils/env";
import { tokenStorage } from "../../auth/utils/tokenStorage";
import {
  CreateContractDto,
  ContractResponse,
  CustomerSummary,
  VehicleSummary,
  EndorserSummary,
  ContractType,
  ContractStatus,
  CreateContractWithDocumentsDto,
} from "../types/contract.types";

export const contractApi = createApi({
  reducerPath: "contractApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      // Add authorization header if needed
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Contract", "Customer", "Vehicle", "Endorser"],
  endpoints: (builder) => ({
    // Contract endpoints - Legacy (without documents)
    createContract: builder.mutation<any, CreateContractDto>({
      query: (contractData) => {
        console.log(
          "🚀 Creating contract with data:",
          JSON.stringify(contractData, null, 2)
        );
        return {
          url: "/contracts/with-dependencies",
          method: "POST",
          body: contractData,
        };
      },
      invalidatesTags: ["Contract", "Vehicle"],
      transformErrorResponse: (response: any) => {
        console.error("❌ Contract creation failed:", response);
        return response;
      },
    }),

    // NEW: Create contract with documents using multipart/form-data
    createContractWithDependencies: builder.mutation<
      any,
      CreateContractWithDocumentsDto
    >({
      query: (data) => {
        // Check if we have files to upload - if so, use FormData, otherwise use JSON
        const hasFiles = data.files && data.files.length > 0;

        // if (hasFiles) {
        //   // Use FormData for file uploads
        //   const formData = new FormData();

        //   // Add files
        //   data.files!.forEach((file) => {
        //     formData.append('files', file);
        //   });

        //   // Add document metadata as JSON string
        //   if (data.documents && data.documents.length > 0) {
        //     formData.append('documentsMetadata', JSON.stringify(data.documents));
        //   }

        //   // Add contract fields
        //   formData.append('type', data.type);
        //   formData.append('contractNumber', data.contractNumber);
        //   formData.append('customerId', data.customerId);
        //   formData.append('startDate', data.startDate);
        //   formData.append('endDate', data.endDate);
        //   formData.append('totalAmount', String(Number(data.totalAmount) || 0));
        //   formData.append('interestRate', String(Number(data.interestRate) || 0));

        //   // Add vehicleIds as JSON array
        //   formData.append('vehicleIds', JSON.stringify(data.vehicleIds || []));

        //   // Add collaterals
        //   formData.append('collaterals', JSON.stringify(data.collaterals || []));

        //   // Add endorserCollaterals
        //   formData.append('endorserCollaterals', JSON.stringify(data.endorserCollaterals || []));

        //   if (data.loanDetails) {
        //     formData.append('loanDetails', JSON.stringify(data.loanDetails));
        //   }

        //   if (data.leasingDetails) {
        //     formData.append('leasingDetails', JSON.stringify(data.leasingDetails));
        //   }

        //   formData.append('terms', JSON.stringify(data.terms || {}));

        //   if (data.guaranteeForContract !== undefined) {
        //     formData.append('guaranteeForContract', String(data.guaranteeForContract));
        //   }

        //   console.log('🚀 Creating contract with files (FormData):');
        //   console.log('📁 Files:', data.files?.length || 0);
        //   for (const [key, value] of formData.entries()) {
        //     if (key !== 'files') {
        //       console.log(`  ${key}:`, value);
        //     }
        //   }

        //   return {
        //     url: '/contracts/with-dependencies',
        //     method: 'POST',
        //     body: formData,
        //   };
        // } else {
        // Use JSON for requests without files
        const jsonData = {
          type: data.type,
          contractNumber: data.contractNumber,
          customerId: data.customerId,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: Number(data.totalAmount) || 0,
          interestRate: Number(data.interestRate) || 0,
          vehicleIds: data.vehicleIds || [],
          collaterals: data.collaterals || [],
          endorserCollaterals: data.endorserCollaterals || [],
          terms: data.terms || {},
          ...(data.loanDetails && { loanDetails: data.loanDetails }),
          ...(data.leasingDetails && { leasingDetails: data.leasingDetails }),
          ...(data.guaranteeForContract !== undefined && {
            guaranteeForContract: data.guaranteeForContract,
          }),
        };

        // console.log('🚀 Creating contract (JSON):', JSON.stringify(jsonData, null, 2));

        return {
          url: "/contracts/with-dependencies",
          method: "POST",
          body: jsonData,
        };
      },
      invalidatesTags: ["Contract", "Vehicle"],
      transformErrorResponse: (response: any) => {
        console.error(
          "❌ Contract creation with dependencies failed:",
          response
        );
        return response;
      },
    }),

    getContract: builder.query<ContractResponse, string>({
      query: (id) => `/contracts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Contract", id }],
    }),

    getContracts: builder.query<
      { contracts: ContractResponse[]; totalCount: number },
      {
        type?: ContractType;
        status?: ContractStatus;
        limit?: number;
        offset?: number;
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/contracts",
        params: params,
      }),
      providesTags: ["Contract"],
      transformResponse: (response: any) => {
        // Handle the backend response structure: { data: [...], meta: { total, ... } }
        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          return {
            contracts: response.data,
            totalCount: response.meta?.total || response.data.length,
          };
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          return {
            contracts: response,
            totalCount: response.length,
          };
        } else {
          console.warn("Unexpected contracts response structure:", response);
          return {
            contracts: [],
            totalCount: 0,
          };
        }
      },
    }),

    // Customer endpoints (for picker)
    getCustomers: builder.query<
      CustomerSummary[],
      {
        search?: string;
        limit?: number;
        offset?: number;
        type?: "individual" | "business" | "endorser";
        hasVehicles?: boolean;
        hasContracts?: boolean;
        hasCollaterals?: boolean;
      }
    >({
      query: (params) => ({
        url: "/customers",
        params: params,
      }),
      providesTags: ["Customer"],
      transformResponse: (response: any) => {
        // Handle different response structures
        let customersArray: any[];
        if (Array.isArray(response)) {
          customersArray = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          customersArray = response.data;
        } else if (
          response &&
          typeof response === "object" &&
          "customers" in response &&
          Array.isArray(response.customers)
        ) {
          customersArray = response.customers;
        } else {
          console.warn("Unexpected customers response structure:", response);
          customersArray = [];
        }

        // Transform the response to match CustomerSummary interface
        return customersArray.map((customer) => ({
          id: customer.id,
          name:
            customer.type === "individual"
              ? `${customer.firstName} ${customer.lastName}`.trim()
              : customer.legalName || customer.administratorName,
          type: customer.type,
          email: customer.email,
          phone: customer.phone,
        }));
      },
    }),

    getCustomer: builder.query<CustomerSummary, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Customer", id }],
      transformResponse: (customer: any) => ({
        id: customer.id,
        name:
          customer.type === "individual"
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : customer.legalName || customer.administratorName,
        type: customer.type,
        email: customer.email,
        phone: customer.phone,
      }),
    }),

    // Vehicle endpoints (for picker)
    getAvailableVehicles: builder.query<
      VehicleSummary[],
      {
        search?: string;
        status?: string;
        make?: string;
        model?: string;
        year?: number;
        includeDocuments?: boolean;
      }
    >({
      query: (params) => {
        console.log("🚀 Vehicle API Call - Request params:", params);
        const requestConfig = {
          url: "/vehicles",
          params: params,
        };
        console.log("🚀 Vehicle API Call - Full config:", requestConfig);
        return requestConfig;
      },
      providesTags: ["Vehicle"],
      transformResponse: (response: any) => {
        console.log("🔄 Vehicle API Response - Raw response:", response);

        // Handle different response structures
        let vehiclesArray: any[];
        if (Array.isArray(response)) {
          vehiclesArray = response;
          console.log("✅ Using direct array response");
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          vehiclesArray = response.data;
          console.log("✅ Using response.data array");
        } else if (
          response &&
          typeof response === "object" &&
          "vehicles" in response &&
          Array.isArray(response.vehicles)
        ) {
          vehiclesArray = response.vehicles;
          console.log("✅ Using response.vehicles array");
        } else {
          console.warn("❌ Unexpected vehicles response structure:", response);
          vehiclesArray = [];
        }

        console.log("📊 Processed vehicles array:", vehiclesArray);
        console.log("📊 Vehicle count:", vehiclesArray.length);

        return vehiclesArray.map((vehicle: any) => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vinNumber: vehicle.vin, // Note: backend uses 'vin', frontend expects 'vinNumber'
          status: vehicle.status,
          // Additional properties from new API response
          color: vehicle.color,
          fuelType: vehicle.fuelType,
          mileage: vehicle.currentMileage || vehicle.mileage,
          legalOwner: vehicle.legalOwner,
          currentClientId: vehicle.currentClientId,
          contractId: vehicle.contractId,
          conditionStatus: vehicle.conditionStatus,
          isLiquidAsset: vehicle.isLiquidAsset,
          depreciatedValue: vehicle.depreciatedValue,
          marketValue: vehicle.marketValue,
          currentValuation: vehicle.currentValuation,
          lastValuationDate: vehicle.lastValuationDate,
          primaryInsuranceCompany: vehicle.primaryInsuranceCompany,
          tplExpiryDate: vehicle.tplExpiryDate,
          kaskoExpiryDate: vehicle.kaskoExpiryDate,
          passengerInsuranceExpiry: vehicle.passengerInsuranceExpiry,
          currentMileage: vehicle.currentMileage,
          nextMaintenanceDate: vehicle.nextMaintenanceDate,
          lastServiceDate: vehicle.lastServiceDate,
          purchaseDate: vehicle.purchaseDate,
          registrationExpiry: vehicle.registrationExpiry,
          creditStatus: vehicle.creditStatus,
          notes: vehicle.notes,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
          // Include documents if provided
          documents: vehicle.documents,
        }));
      },
    }),

    getVehicle: builder.query<VehicleSummary, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Vehicle", id }],
      transformResponse: (vehicle: any) => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        vinNumber: vehicle.vinNumber,
        status: vehicle.status,
      }),
    }),

    // Endorser endpoints (for picker)
    getEndorsers: builder.query<
      EndorserSummary[],
      {
        customerId?: string;
        search?: string;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/endorsers",
        params: params,
      }),
      providesTags: ["Endorser"],
      transformResponse: (response: any) => {
        // Handle different response structures
        let endorsersArray: any[];
        if (Array.isArray(response)) {
          endorsersArray = response;
        } else if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          endorsersArray = response.data;
        } else if (
          response &&
          typeof response === "object" &&
          "endorsers" in response &&
          Array.isArray(response.endorsers)
        ) {
          endorsersArray = response.endorsers;
        } else {
          console.warn("Unexpected endorsers response structure:", response);
          endorsersArray = [];
        }

        return endorsersArray.map((endorser) => ({
          id: endorser.id,
          firstName: endorser.firstName,
          lastName: endorser.lastName,
          email: endorser.email,
          phone: endorser.phone,
          idNumber: endorser.idNumber,
          relationshipToCustomer: endorser.relationshipToCustomer,
          guaranteedAmount: endorser.guaranteedAmount,
          remainingGuaranteeCapacity: endorser.remainingGuaranteeCapacity,
        }));
      },
    }),

    getEndorser: builder.query<EndorserSummary, string>({
      query: (id) => `/endorsers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Endorser", id }],
      transformResponse: (endorser: any) => ({
        id: endorser.id,
        firstName: endorser.firstName,
        lastName: endorser.lastName,
        email: endorser.email,
        phone: endorser.phone,
        idNumber: endorser.idNumber,
        relationshipToCustomer: endorser.relationshipToCustomer,
      }),
    }),

    // Calculate loan details
    calculateLoanPayment: builder.query<
      { monthlyPayment: number; totalInterest: number },
      {
        principal: number;
        interestRate: number;
        termMonths: number;
      }
    >({
      query: (params) => ({
        url: "/calculate-payment",
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

  useCalculateLoanPaymentQuery,
} = contractApi;
