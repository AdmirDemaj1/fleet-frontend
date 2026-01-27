import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { api } from './api';
import { AxiosRequestConfig } from 'axios';

/**
 * Custom RTK Query base query that uses the Axios client from api.ts
 * This ensures token refresh logic is consistent across the app
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    // Convert RTK Query args to Axios request config
    const axiosConfig: AxiosRequestConfig = typeof args === 'string' 
      ? { url: args, method: 'GET' }
      : {
          url: args.url,
          method: args.method || 'GET',
          data: args.body,
          params: args.params,
          headers: args.headers as any,
        };

    // Use the main Axios client which has refresh interceptors
    const response = await api.axiosInstance.request(axiosConfig);

    return { data: response.data };
  } catch (axiosError: any) {
    const error: FetchBaseQueryError = {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || { message: axiosError.message },
    };
    return { error };
  }
};
