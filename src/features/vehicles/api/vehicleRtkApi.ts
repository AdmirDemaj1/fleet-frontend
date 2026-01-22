import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../../shared/utils/env";
import { tokenStorage } from "../../auth/utils/tokenStorage";
import {
  Vehicle,
  VehicleQueryParams,
  VehicleStatistics,
  PaginatedVehicleResponse,
} from "../types/vehicleType";

export const vehicleRtkApi = createApi({
  reducerPath: "vehicleRtkApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Vehicle", "VehicleStatistics"],
  endpoints: (builder) => ({
    // Get vehicles with filtering and pagination
    getVehicles: builder.query<
      { vehicles: Vehicle[]; total: number },
      VehicleQueryParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params.status) searchParams.append("status", params.status);
        if (params.legalOwner) searchParams.append("legalOwner", params.legalOwner);
        if (params.make) searchParams.append("make", params.make);
        if (params.model) searchParams.append("model", params.model);
        if (params.year) searchParams.append("year", params.year.toString());
        if (params.isLiquidAsset !== undefined)
          searchParams.append("isLiquidAsset", params.isLiquidAsset.toString());
        if (params.search) searchParams.append("search", params.search);
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.offset !== undefined)
          searchParams.append("offset", params.offset.toString());

        return `/vehicles?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.vehicles.map(({ id }) => ({
                type: "Vehicle" as const,
                id,
              })),
              { type: "Vehicle", id: "LIST" },
            ]
          : [{ type: "Vehicle", id: "LIST" }],
      transformResponse: (response: any) => {
        let vehicles: Vehicle[];
        let total: number;

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          "meta" in response
        ) {
          vehicles = response.data || [];
          total = response.meta?.total || 0;
        } else if (
          response &&
          typeof response === "object" &&
          "vehicles" in response
        ) {
          vehicles = response.vehicles || [];
          total = response.total || vehicles.length;
        } else if (Array.isArray(response)) {
          vehicles = response;
          total = vehicles.length;
        } else {
          vehicles = [];
          total = 0;
        }

        return { vehicles, total };
      },
    }),

    // Get a single vehicle by ID
    getVehicleById: builder.query<Vehicle, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Vehicle", id }],
    }),

    // Get vehicles by customer ID
    getVehiclesByCustomerId: builder.query<
      PaginatedVehicleResponse,
      { customerId: string; limit?: number; offset?: number }
    >({
      query: ({ customerId, limit, offset }) => {
        const searchParams = new URLSearchParams();
        if (limit) searchParams.append("limit", limit.toString());
        if (offset) searchParams.append("offset", offset.toString());

        return `/vehicles/customer/${customerId}${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (_result, _error, { customerId }) => [
        { type: "Vehicle", id: `customer-${customerId}` },
      ],
    }),

    // Get vehicles by client ID
    getVehiclesByClientId: builder.query<Vehicle[], string>({
      query: (clientId) => `/vehicles/client/${clientId}`,
      providesTags: (_result, _error, clientId) => [
        { type: "Vehicle", id: `client-${clientId}` },
      ],
    }),

    // Get vehicle statistics
    getVehicleStatistics: builder.query<VehicleStatistics, void>({
      query: () => "/vehicles/reports/statistics",
      providesTags: ["VehicleStatistics"],
    }),

    // Create a new vehicle
    createVehicle: builder.mutation<Vehicle, Partial<Vehicle>>({
      query: (vehicleData) => {
        const cleanedData = { ...vehicleData };
        if (
          !cleanedData.licensePlate ||
          cleanedData.licensePlate.trim() === ""
        ) {
          delete cleanedData.licensePlate;
        }
        return {
          url: "/vehicles",
          method: "POST",
          body: cleanedData,
        };
      },
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }, "VehicleStatistics"],
    }),

    // Update a vehicle
    updateVehicle: builder.mutation<
      Vehicle,
      { id: string; data: Partial<Vehicle> }
    >({
      query: ({ id, data }) => {
        const {
          id: _id,
          vin: _vin,
          contractId: _contractId,
          lastValuationDate: _lastValuationDate,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          createdBy: _createdBy,
          updatedBy: _updatedBy,
          ...cleanedData
        } = data as any;

        if (
          cleanedData.licensePlate !== undefined &&
          (!cleanedData.licensePlate || cleanedData.licensePlate.trim() === "")
        ) {
          delete cleanedData.licensePlate;
        }

        return {
          url: `/vehicles/${id}`,
          method: "PUT",
          body: cleanedData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Vehicle", id },
        { type: "Vehicle", id: "LIST" },
        "VehicleStatistics",
      ],
    }),

    // Delete a vehicle
    deleteVehicle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Vehicle", id },
        { type: "Vehicle", id: "LIST" },
        "VehicleStatistics",
      ],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useGetVehiclesByCustomerIdQuery,
  useGetVehiclesByClientIdQuery,
  useGetVehicleStatisticsQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleRtkApi;
