export interface CompanyUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  isAdministrator: boolean;
  roleId: string;
  createdAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  expiresAt: string;
  createdAt: string;
}

export interface CompanyRole {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
  companyId: string | null;
}

export interface InviteUserRequest {
  email: string;
  roleId: string;
  firstName: string;
  lastName: string;
}
