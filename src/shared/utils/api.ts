import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { getApiUrl } from './env';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';

class ApiClient {
  private instance: AxiosInstance;
  private refreshInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: getApiUrl(),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Separate Axios instance used ONLY for refreshing tokens.
    // This avoids request/response interceptor recursion when we refresh pre-request.
    this.refreshInstance = axios.create({
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
      async (config) => {
        // Never attach auth headers (or pre-refresh) for auth endpoints
        if (this.isAuthEndpoint(config.url)) return config;

        const accessToken = tokenStorage.getAccessToken();

        // Don't proactively refresh - let the backend tell us if token is expired
        // This avoids unnecessary refresh calls and potential logout loops
        
        if (accessToken) {
          config.headers = config.headers ?? {};
          // Axios headers typing varies between versions; cast to avoid TS friction.
          (config.headers as any).Authorization = `Bearer ${accessToken}`;
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
            // If refresh failed, the app cannot recover on its own; clear auth and redirect.
            this.handleAuthFailure('refresh_failed');
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401) {
          // No refresh token (or auth endpoint) -> force logout instead of leaving a broken "logged in" state.
          console.warn('⚠️ 401 Unauthorized - forcing logout');
          this.handleAuthFailure('unauthorized');
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

        // Use refreshInstance to avoid interceptor recursion.
        // Some backends expose `/auth/refresh` while others use `/auth/refresh-token`.
        // We try `/auth/refresh-token` first and fall back to `/auth/refresh` on 404.
        let response;
        try {
          response = await this.refreshInstance.post('/auth/refresh-token', { refreshToken });
        } catch (e: any) {
          const status = e?.response?.status;
          if (status === 404) {
            response = await this.refreshInstance.post('/auth/refresh', { refreshToken });
          } else {
            throw e;
          }
        }

        const data: any = response.data ?? {};
        const accessToken: string | undefined = data.accessToken ?? data.access_token;
        const maybeNewRefreshToken: string | undefined = data.refreshToken ?? data.refresh_token;
        const expiresInRaw: unknown = data.expiresIn ?? data.expires_in;
        const expiresAtRaw: unknown = data.expiresAt ?? data.expires_at;

        if (!accessToken) {
          throw new Error('Refresh response missing accessToken');
        }

        // Support non-rotating refresh tokens by falling back to the existing one.
        const newRefreshToken: string = maybeNewRefreshToken || refreshToken;

        let expiresIn: number | null = null;
        if (typeof expiresInRaw === 'number' && Number.isFinite(expiresInRaw)) {
          expiresIn = expiresInRaw;
        } else if (typeof expiresAtRaw === 'number' && Number.isFinite(expiresAtRaw)) {
          expiresIn = Math.max(0, Math.floor((expiresAtRaw - Date.now()) / 1000));
        } else if (typeof expiresAtRaw === 'string') {
          const parsed = Date.parse(expiresAtRaw);
          if (!Number.isNaN(parsed)) {
            expiresIn = Math.max(0, Math.floor((parsed - Date.now()) / 1000));
          }
        }

        // If backend doesn't provide expiry, pick a conservative short TTL to avoid "forever-valid" UI state.
        if (expiresIn === null) {
          console.warn('⚠️ Refresh response missing expiry (expiresIn/expiresAt). Defaulting to 5 minutes.');
          expiresIn = 5 * 60;
        }
        
        // Update stored tokens
        // If backend doesn't rotate refresh tokens, this is still safe (we reuse the existing refresh token).
        tokenStorage.updateTokens(accessToken, newRefreshToken, expiresIn);
        
        // Trigger a custom event to notify other parts of the app about token refresh
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { accessToken, refreshToken: newRefreshToken, expiresIn }
        }));
        
        return accessToken;
      } catch (error) {
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleAuthFailure(reason: 'refresh_failed' | 'unauthorized' = 'unauthorized'): void {
    // Clear auth data
    tokenStorage.clearAuth();

    // Notify the app (Redux/AuthContext) to update UI state immediately.
    window.dispatchEvent(new CustomEvent('authInvalidated', { detail: { reason } }));
    
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

  // Expose the Axios instance for RTK Query integration
  get axiosInstance() {
    return this.instance;
  }
}

export const api = new ApiClient();