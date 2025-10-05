import { tokenStorage } from './tokenStorage';

/**
 * Debug utility for authentication troubleshooting
 * Available in browser console as: window.authDebug
 */
export const authDebug = {
  /**
   * Get current authentication status
   */
  getAuthStatus() {
    const tokenData = tokenStorage.getTokens();
    const user = tokenStorage.getUser();
    const isExpired = tokenStorage.isAccessTokenExpired();
    
    console.group('🔐 Authentication Status');
    console.log('✅ Has token data:', !!tokenData);
    console.log('👤 Has user data:', !!user);
    console.log('⏰ Token expired:', isExpired);
    console.log('🔑 Access token:', tokenData?.accessToken ? '✅ Present' : '❌ Missing');
    console.log('🔄 Refresh token:', tokenData?.refreshToken ? '✅ Present' : '❌ Missing');
    
    if (tokenData) {
      const expiryTime = new Date(tokenData.expiresAt);
      const now = new Date();
      const timeUntilExpiry = tokenData.expiresAt - Date.now();
      
      console.log('📅 Token expires at:', expiryTime.toLocaleString());
      console.log('🕐 Current time:', now.toLocaleString());
      console.log('⏳ Time until expiry:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');
    }
    
    if (user) {
      console.log('👤 User:', {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
    console.groupEnd();
    
    return {
      hasTokens: !!tokenData,
      hasUser: !!user,
      isExpired,
      tokenData,
      user
    };
  },

  /**
   * Clear all authentication data
   */
  clearAuth() {
    console.log('🗑️ Clearing all authentication data...');
    tokenStorage.clearAuth();
    console.log('✅ Authentication data cleared');
    
    // Trigger storage event to sync across tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'fleet_access_token',
      newValue: null,
      oldValue: 'cleared'
    }));
  },

  /**
   * Simulate token expiry (for testing)
   */
  expireToken() {
    console.log('⏰ Simulating token expiry...');
    const tokenData = tokenStorage.getTokens();
    if (tokenData) {
      tokenStorage.updateTokens(
        tokenData.accessToken,
        tokenData.refreshToken,
        -1 // Expired 1 second ago
      );
      console.log('✅ Token marked as expired');
    } else {
      console.log('❌ No token data found');
    }
  },

  /**
   * View all localStorage keys related to auth
   */
  viewStorage() {
    console.group('📦 Authentication Storage');
    const keys = ['fleet_access_token', 'fleet_refresh_token', 'fleet_token_expires_at', 'fleet_user'];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? '✅ Present' : '❌ Missing');
      if (value && key === 'fleet_user') {
        try {
          console.log('   →', JSON.parse(value));
        } catch (e) {
          console.log('   → (invalid JSON)');
        }
      }
    });
    console.groupEnd();
  },

  /**
   * Test token refresh capability
   */
  async testRefresh() {
    console.log('🔄 Testing token refresh...');
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      return;
    }

    try {
      // Import the API client
      const { api } = await import('../../../shared/utils/api');
      
      console.log('🔄 Triggering refresh...');
      await api.forceRefreshToken();
      console.log('✅ Token refresh successful');
      
      this.getAuthStatus();
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
    }
  }
};

// Make available globally for debugging
declare global {
  interface Window {
    authDebug: typeof authDebug;
  }
}

// Only expose in development
if (process.env.NODE_ENV === 'development') {
  window.authDebug = authDebug;
  console.log('🔧 Auth debug tools available: window.authDebug');
}
