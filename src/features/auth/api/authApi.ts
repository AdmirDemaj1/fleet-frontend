import { api } from "../../../shared/utils/api";
import {
  AuthResponse,
  RefreshResponse,
  SignInRequest,
  SignUpRequest,
  RefreshTokenRequest,
  LogoutResponse,
} from "../types/auth.types";

class AuthApi {
  private readonly AUTH_ENDPOINTS = {
    SIGNUP: "/auth/signup",
    SIGNIN: "/auth/signin",
    REFRESH: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    VALIDATE: "/auth/validate",
  };

  /**
   * Sign up a new user
   */
  async signUp(signUpData: SignUpRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      this.AUTH_ENDPOINTS.SIGNUP,
      signUpData
    );
    return response.data;
  }

  /**
   * Sign in an existing user
   */
  async signIn(signInData: SignInRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      this.AUTH_ENDPOINTS.SIGNIN,
      signInData
    );
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshTokenData: RefreshTokenRequest
  ): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>(
      this.AUTH_ENDPOINTS.REFRESH,
      refreshTokenData
    );
    return response.data;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>(
      this.AUTH_ENDPOINTS.LOGOUT,
      { userId }
    );
    return response.data;
  }

  /**
   * Validate user token and get user data
   */
  async validateUser(userId: string): Promise<{ user: any }> {
    const response = await api.get(`${this.AUTH_ENDPOINTS.VALIDATE}/${userId}`);
    return response.data;
  }
}

export const authApi = new AuthApi();
