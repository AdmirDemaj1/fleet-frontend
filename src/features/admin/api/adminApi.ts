import { api } from '../../../shared/utils/api';
import {
  CompanyUser,
  PendingInvite,
  CompanyRole,
  InviteUserRequest,
} from '../types/admin.types';

export const adminApi = {
  getUsers(): Promise<CompanyUser[]> {
    return api.get<CompanyUser[]>('/companies/users').then((res) => res.data);
  },

  getInvites(): Promise<PendingInvite[]> {
    return api
      .get<PendingInvite[]>('/companies/users/invites')
      .then((res) => res.data);
  },

  inviteUser(data: InviteUserRequest): Promise<{ message: string }> {
    return api
      .post<{ message: string }>('/companies/users/invite', data)
      .then((res) => res.data);
  },

  updateUserRole(id: string, roleId: string): Promise<CompanyUser> {
    return api
      .patch<CompanyUser>(`/companies/users/${id}/role`, { roleId })
      .then((res) => res.data);
  },

  updateUserStatus(id: string, status: string): Promise<CompanyUser> {
    return api
      .patch<CompanyUser>(`/companies/users/${id}/status`, { status })
      .then((res) => res.data);
  },

  removeUser(id: string): Promise<{ message: string }> {
    return api
      .delete<{ message: string }>(`/companies/users/${id}`)
      .then((res) => res.data);
  },

  cancelInvite(id: string): Promise<{ message: string }> {
    return api
      .delete<{ message: string }>(`/companies/users/invites/${id}`)
      .then((res) => res.data);
  },

  getRoles(): Promise<CompanyRole[]> {
    return api.get<CompanyRole[]>('/companies/roles').then((res) => res.data);
  },
};
