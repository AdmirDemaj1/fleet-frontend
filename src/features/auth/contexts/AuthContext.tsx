import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
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
  initializeAuth,
  syncAuthState
} from '../slices/authSlice';
import { LoginCredentials, CompanyRegistrationCredentials, AcceptInviteCredentials, User } from '../types/auth.types';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import '../utils/authDebug'; // Load debug utilities

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: CompanyRegistrationCredentials) => Promise<void>;
  acceptInvite: (credentials: AcceptInviteCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Handle cross-tab authentication synchronization
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === 'fleet_access_token' || event.key === 'fleet_refresh_token' || event.key === 'fleet_user') {
      console.log('🔄 Storage change detected in another tab:', event.key);

      // Get current token and user data
      const tokenData = tokenStorage.getTokens();
      const userData = tokenStorage.getUser();

      // Sync the auth state
      dispatch(syncAuthState({
        isAuthenticated: !!(tokenData && userData && !tokenStorage.isAccessTokenExpired()),
        user: userData,
        tokenData: tokenData
      }));
    }
  }, [dispatch]);

  // Handle token refresh events from API interceptor
  const handleTokenRefresh = useCallback((event: CustomEvent) => {
    console.log('🔄 Token refreshed by API interceptor');
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = event.detail;

    // Update Redux state with new tokens
    dispatch(refreshTokenSuccess({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn
    }));
  }, [dispatch]);

  // Handle auth invalidation events from API interceptor (e.g., refresh failed / unauthorized)
  const handleAuthInvalidated = useCallback((event: CustomEvent) => {
    console.warn('🔒 Auth invalidated by API interceptor:', event.detail);
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    // Initialize auth state on app start
    console.log('🚀 AuthProvider initializing...');
    console.log('🔍 Current auth state before init:', { isAuthenticated, user: !!user, isLoading });
    dispatch(initializeAuth());

    // Add storage event listener for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    // Add token refresh event listener
    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener);

    // Add auth invalidated event listener
    window.addEventListener('authInvalidated', handleAuthInvalidated as EventListener);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('authInvalidated', handleAuthInvalidated as EventListener);
    };
  }, [dispatch, handleStorageChange, handleTokenRefresh, handleAuthInvalidated]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch(loginStart());

      const authResponse = await authApi.signIn({
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password
      });

      dispatch(loginSuccess(authResponse));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const register = async (credentials: CompanyRegistrationCredentials): Promise<void> => {
    try {
      dispatch(signupStart());
      if (credentials.administratorPassword !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const authResponse = await authApi.register({
        companyName: credentials.companyName,
        administratorEmail: credentials.administratorEmail,
        administratorPassword: credentials.administratorPassword,
        administratorFirstName: credentials.administratorFirstName,
        administratorLastName: credentials.administratorLastName,
      });
      dispatch(signupSuccess(authResponse));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(signupFailure(errorMessage));
      throw error;
    }
  };

  const acceptInvite = async (credentials: AcceptInviteCredentials): Promise<void> => {
    try {
      dispatch(loginStart());
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const authResponse = await authApi.acceptInvite({
        token: credentials.token,
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
      });
      dispatch(loginSuccess(authResponse));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to accept invite';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      dispatch(refreshTokenStart());

      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await authApi.refreshToken({ refreshToken });

      dispatch(refreshTokenSuccess(refreshResponse));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';
      dispatch(refreshTokenFailure(errorMessage));
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint if user is authenticated
      if (user?.id) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      // Even if backend logout fails, clear local state
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local auth state
      dispatch(logout());
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    acceptInvite,
    logout: handleLogout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
