// User interface matching backend sanitized user response
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiresAt: number | null;
}

// Login credentials interface matching backend SignInDto
export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

// Signup credentials interface matching backend SignUpDto
export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string; // Frontend-only validation
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  secretKey: string; // Secret key for signup validation
}

// Auth response interface matching backend AuthResponseDto
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Refresh response interface matching backend RefreshResponseDto
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Error interface for API errors
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

// Token storage interface
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// API request/response types
export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  secretKey: string;
}

export interface SignInRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
