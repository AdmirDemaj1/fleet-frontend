import { api } from "../../../shared/utils/api";
import {
  AuthResponse,
  CompanyRegistrationRequest,
  CompanyRegistrationResponse,
  AcceptInviteRequest,
  RefreshResponse,
  SignInRequest,
  RefreshTokenRequest,
  LogoutResponse,
} from "../types/auth.types";

class AuthApi {
  private readonly AUTH_ENDPOINTS = {
    REGISTER: "/auth/register",
    ACCEPT_INVITE: "/auth/accept-invite",
    SIGNIN: "/auth/signin",
    REFRESH: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    VALIDATE: "/auth/validate",
  };

  async register(data: CompanyRegistrationRequest): Promise<CompanyRegistrationResponse> {
    const response = await api.post<CompanyRegistrationResponse>(this.AUTH_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  async acceptInvite(data: AcceptInviteRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(this.AUTH_ENDPOINTS.ACCEPT_INVITE, data);
    return response.data;
  }

  async signIn(signInData: SignInRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(this.AUTH_ENDPOINTS.SIGNIN, signInData);
    return response.data;
  }

  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshResponse> {
    const response = await api.post<RefreshResponse>(this.AUTH_ENDPOINTS.REFRESH, refreshTokenData);
    return response.data;
  }

  async logout(userId: string): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>(this.AUTH_ENDPOINTS.LOGOUT, { userId });
    return response.data;
  }

  async validateUser(userId: string): Promise<{ valid: boolean; user: any; message: string }> {
    const response = await api.get<{ valid: boolean; user: any; message: string }>(`${this.AUTH_ENDPOINTS.VALIDATE}/${userId}`);
    return response.data;
  }
}

export const authApi = new AuthApi();
