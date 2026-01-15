import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { getApiUrl } from './env';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: getApiUrl(),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.instance.interceptors.request.use(
      (config) => {
        const accessToken = tokenStorage.getAccessToken();
        if (accessToken && !this.isAuthEndpoint(config.url)) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.debug('🔐 API Request with token:', {
            url: config.url,
            method: config.method,
            hasToken: !!accessToken,
            tokenExpired: tokenStorage.isAccessTokenExpired()
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Check if error is 401 and we have refresh token
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          !this.isAuthEndpoint(originalRequest.url) &&
          tokenStorage.getRefreshToken()
        ) {
          console.log('🔄 Token expired, attempting refresh...', {
            url: originalRequest.url,
            hasRefreshToken: !!tokenStorage.getRefreshToken()
          });
          
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            console.log('✅ Token refreshed successfully');
            
            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            return this.instance(originalRequest);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Don't logout on session expiration - just reject the request
            // The user can continue working and retry the action
            return Promise.reject(refreshError);
          }
        }

        // For other 401 errors, don't logout - just reject the request
        // This allows the user to continue working even if session expires
        if (error.response?.status === 401) {
          console.warn('⚠️ 401 Unauthorized - Request rejected but user remains logged in');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return url.includes('/auth/') || url.includes('/signin') || url.includes('/signup') || url.includes('/refresh');
  }

  private async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = (async () => {
      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await this.instance.post('/auth/refresh-token', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        // Update stored tokens
        tokenStorage.updateTokens(accessToken, newRefreshToken, expiresIn);
        
        // Trigger a custom event to notify other parts of the app about token refresh
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { accessToken, refreshToken: newRefreshToken, expiresIn }
        }));
        
        return accessToken;
      } catch (error) {
        // Don't clear tokens on refresh failure - let user stay logged in
        // They can retry the action or continue working
        console.warn('⚠️ Token refresh failed, but keeping user logged in');
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleAuthFailure(): void {
    // Clear auth data
    tokenStorage.clearAuth();
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      // Use a small timeout to prevent immediate redirect during initialization
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
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

  patch<T>(url: string, data?: any, config?: any) {
    return this.instance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.instance.delete<T>(url, config);
  }

  // Method to manually trigger token refresh (useful for testing)
  async forceRefreshToken(): Promise<void> {
    await this.refreshAccessToken();
  }

  // Method to check if tokens need refresh
  shouldRefreshToken(): boolean {
    return tokenStorage.isAccessTokenExpired() && !!tokenStorage.getRefreshToken();
  }
}

export const api = new ApiClient();