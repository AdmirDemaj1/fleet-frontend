import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthResponse, RefreshResponse } from '../types/auth.types';
import { tokenStorage } from '../utils/tokenStorage';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading = true to prevent premature redirects
  error: null,
  tokenExpiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      const { user, accessToken, refreshToken, expiresIn } = action.payload;
      const expiresAt = Date.now() + (expiresIn * 1000);
      
      state.isLoading = false;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiresAt = expiresAt;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store tokens and user data
      tokenStorage.setTokens({ accessToken, refreshToken, expiresAt });
      tokenStorage.setUser(user);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      
      // Clear stored data
      tokenStorage.clearAuth();
    },
    
    // Signup actions
    signupStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signupSuccess: (state, action: PayloadAction<AuthResponse>) => {
      const { user, accessToken, refreshToken, expiresIn } = action.payload;
      const expiresAt = Date.now() + (expiresIn * 1000);
      
      state.isLoading = false;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiresAt = expiresAt;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store tokens and user data
      tokenStorage.setTokens({ accessToken, refreshToken, expiresAt });
      tokenStorage.setUser(user);
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      
      // Clear stored data
      tokenStorage.clearAuth();
    },
    
    // Token refresh actions
    refreshTokenStart: (state) => {
        console.log("🚀 ~ refreshTokenStart:")
      state.isLoading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action: PayloadAction<RefreshResponse>) => {
      const { accessToken, refreshToken, expiresIn } = action.payload;
      const expiresAt = Date.now() + (expiresIn * 1000);
      console.log("🚀 ~ refreshTokenSuccess: ~ accessToken:", accessToken)
      console.log("🚀 ~ refreshTokenSuccess: ~ refreshToken:", refreshToken)
      console.log("🚀 ~ refreshTokenSuccess: ~ expiresIn:", expiresIn)
      console.log("🚀 ~ refreshTokenSuccess: ~ expiresAt:", expiresAt)
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiresAt = expiresAt;
      state.isLoading = false;
      state.error = null;
      
      // Update stored tokens
      tokenStorage.updateTokens(accessToken, refreshToken, expiresIn);
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      
      // Clear stored data when refresh fails
      tokenStorage.clearAuth();
    },
    
    // Logout and utility actions
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      
      // Clear stored data
      tokenStorage.clearAuth();
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    
    // Initialize auth from stored tokens
    initializeAuth: (state) => {
      console.log('🔄 Initializing auth state...');
      const tokenData = tokenStorage.getTokens();
      const user = tokenStorage.getUser();
      
      console.log('📊 Token data:', {
        hasTokenData: !!tokenData,
        hasUser: !!user,
        isExpired: tokenData ? tokenStorage.isAccessTokenExpired() : 'no-token'
      });
      
      if (tokenData && user) {
        if (!tokenStorage.isAccessTokenExpired()) {
          // Valid tokens, restore auth state
          console.log('✅ Valid tokens found, restoring auth state');
          state.user = user;
          state.accessToken = tokenData.accessToken;
          state.refreshToken = tokenData.refreshToken;
          state.tokenExpiresAt = tokenData.expiresAt;
          state.isAuthenticated = true;
        } else if (tokenData.refreshToken) {
          // Access token expired but we have refresh token - don't clear yet
          // Let the API interceptor handle the refresh
          console.log('⏰ Access token expired, but refresh token available');
          state.user = user;
          state.accessToken = tokenData.accessToken; // Keep for refresh attempt
          state.refreshToken = tokenData.refreshToken;
          state.tokenExpiresAt = tokenData.expiresAt;
          state.isAuthenticated = true; // Stay authenticated for refresh attempt
        } else {
          // No refresh token, clear everything
          console.log('❌ No refresh token, clearing auth state');
          tokenStorage.clearAuth();
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.tokenExpiresAt = null;
          state.isAuthenticated = false;
        }
      } else {
        // No tokens or user data
        console.log('❌ No token data or user found, clearing auth state');
        tokenStorage.clearAuth();
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
        state.isAuthenticated = false;
      }
      
      // Always set loading to false after initialization
      state.isLoading = false;
      state.error = null;
      console.log('✅ Auth initialization complete. Final state:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        isLoading: state.isLoading
      });
    },
    
    // Sync auth state across tabs
    syncAuthState: (state, action: PayloadAction<{ isAuthenticated: boolean; user: any; tokenData: any }>) => {
      const { isAuthenticated, user, tokenData } = action.payload;
      console.log('🔄 Syncing auth state across tabs:', { isAuthenticated, hasUser: !!user });
      
      if (isAuthenticated && user && tokenData) {
        state.user = user;
        state.accessToken = tokenData.accessToken;
        state.refreshToken = tokenData.refreshToken;
        state.tokenExpiresAt = tokenData.expiresAt;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiresAt = null;
        state.isAuthenticated = false;
      }
      
      // Make sure loading is false when syncing state
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
  clearError,
  setAuthenticated,
  initializeAuth,
  syncAuthState,
} = authSlice.actions;

export default authSlice.reducer;
