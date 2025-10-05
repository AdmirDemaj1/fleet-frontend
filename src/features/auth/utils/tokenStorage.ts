import { TokenData } from '../types/auth.types';

class TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'fleet_access_token';
  private readonly REFRESH_TOKEN_KEY = 'fleet_refresh_token';
  private readonly TOKEN_EXPIRES_AT_KEY = 'fleet_token_expires_at';
  private readonly USER_KEY = 'fleet_user';

  /**
   * Store authentication tokens and expiration time
   */
  setTokens(tokenData: TokenData): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, tokenData.expiresAt.toString());
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get stored authentication tokens
   */
  getTokens(): TokenData | null {
    try {
      const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const expiresAtStr = localStorage.getItem(this.TOKEN_EXPIRES_AT_KEY);

      console.log('🔍 TokenStorage.getTokens():', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasExpiresAt: !!expiresAtStr,
        accessTokenKey: this.ACCESS_TOKEN_KEY,
        refreshTokenKey: this.REFRESH_TOKEN_KEY
      });

      if (!accessToken || !refreshToken || !expiresAtStr) {
        console.log('❌ Missing token data:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          expiresAtStr: !!expiresAtStr
        });
        return null;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      
      console.log('✅ Found token data:', {
        expiresAt: new Date(expiresAt).toLocaleString(),
        isExpired: Date.now() >= expiresAt
      });
      
      return {
        accessToken,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Get only the access token
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Get only the refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Check if the access token is expired
   */
  isAccessTokenExpired(): boolean {
    const tokenData = this.getTokens();
    if (!tokenData) return true;

    // Add 30 seconds buffer to avoid edge cases
    const bufferTime = 30 * 1000; // 30 seconds
    return Date.now() >= (tokenData.expiresAt - bufferTime);
  }

  /**
   * Check if we have valid tokens (access token exists and not expired)
   */
  hasValidTokens(): boolean {
    const tokenData = this.getTokens();
    return !!tokenData && !this.isAccessTokenExpired();
  }

  /**
   * Store user data
   */
  setUser(user: any): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data
   */
  getUser(): any | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      console.log('🔍 TokenStorage.getUser():', {
        hasUserData: !!userStr,
        userKey: this.USER_KEY
      });
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('✅ Found user data:', {
          id: user?.id,
          username: user?.username,
          email: user?.email
        });
        return user;
      }
      
      console.log('❌ No user data found');
      return null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Update only the access token (used during token refresh)
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    try {
      const expiresAt = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
    } catch (error) {
      console.error('Failed to update access token:', error);
    }
  }

  /**
   * Update both tokens (used during token refresh with rotation)
   */
  updateTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    try {
      const expiresAt = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
    } catch (error) {
      console.error('Failed to update tokens:', error);
    }
  }

  /**
   * Clear all stored authentication data
   */
  clearAuth(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Clear only tokens but keep user data (useful for logout without clearing user info)
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
