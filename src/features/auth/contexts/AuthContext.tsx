import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  initializeAuth
} from '../slices/authSlice';
import { LoginCredentials, SignupCredentials, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
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

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch(loginStart());
      
      // Simulate API call - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login - replace with actual API response
      if (credentials.email === 'admin@fleet.com' && credentials.password === 'password') {
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        dispatch(loginSuccess({ user: mockUser, token: mockToken }));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    try {
      dispatch(signupStart());
      
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Simulate API call - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful signup - replace with actual API response
      const mockUser: User = {
        id: '2',
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: 'user' as any,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      dispatch(signupSuccess({ user: mockUser, token: mockToken }));
    } catch (error) {
      dispatch(signupFailure(error instanceof Error ? error.message : 'Signup failed'));
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
