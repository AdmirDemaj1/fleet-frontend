import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiUrl } from './env';

// const BASE_URL = import.meta.env.VITE_API_URL || 'https://fleet-credit-system-hmsc.vercel.app/';
const BASE_URL ='http://localhost:3000/';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for auth
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.instance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.instance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.instance.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.instance.delete<T>(url, config);
  }
}

export const api = new ApiClient();