export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  companyId: string;
  isAdministrator: boolean;
  roleId: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiresAt: number | null;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface CompanyRegistrationCredentials {
  companyName: string;
  administratorEmail: string;
  administratorPassword: string;
  confirmPassword: string; // frontend-only
  administratorFirstName: string;
  administratorLastName: string;
}

export interface AcceptInviteCredentials {
  token: string;
  email: string;
  password: string;
  confirmPassword: string; // frontend-only
  username: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CompanyRegistrationResponse extends AuthResponse {
  company: {
    id: string;
    name: string;
    slug: string;
    subscriptionPlan: string;
    status: string;
    trialEndsAt: string | null;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SignInRequest {
  usernameOrEmail: string;
  password: string;
}

export interface CompanyRegistrationRequest {
  companyName: string;
  administratorEmail: string;
  administratorPassword: string;
  administratorFirstName: string;
  administratorLastName: string;
}

export interface AcceptInviteRequest {
  token: string;
  email: string;
  password: string;
  username: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ApprovalWorkflowResult<T = any> {
  requiresApproval: boolean;
  approvalRequestId?: string;
  data?: T;
}

export interface UserPermissions {
  canCreateCustomer: boolean;
  canUpdateCustomer: boolean;
  canDeleteCustomer: boolean;
  canViewCustomer: boolean;
  canApproveActions: boolean;
}

export interface UserApprovalNeeds {
  createCustomer: boolean;
  updateCustomer: boolean;
  deleteCustomer: boolean;
}

export interface UserInfo {
  userId: string;
  username: string;
  email: string;
  isAdministrator: boolean;
  canApprove: boolean;
  permissions: UserPermissions;
  needsApprovalFor: UserApprovalNeeds;
}
