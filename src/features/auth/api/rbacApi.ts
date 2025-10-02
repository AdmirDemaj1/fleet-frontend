import { api } from "../../../shared/utils/api";
import { UserInfo, ApprovalWorkflowResult } from "../types/auth.types";

class RbacApi {
  private readonly RBAC_ENDPOINTS = {
    USER_INFO: "customers/_test/user-info",
    TEST_RBAC: "customers/_test/rbac",
  };

  /**
   * Get current user info for RBAC testing
   */
  async getUserInfo(): Promise<UserInfo> {
    const response = await api.get<UserInfo>(this.RBAC_ENDPOINTS.USER_INFO);
    return response.data;
  }

  /**
   * Test RBAC system with approval workflow
   */
  async testRbac(
    approvalRequestId?: string
  ): Promise<ApprovalWorkflowResult<any>> {
    const queryString = new URLSearchParams();
    if (approvalRequestId) {
      queryString.append('approvalRequestId', approvalRequestId);
    }
    const url =
      this.RBAC_ENDPOINTS.TEST_RBAC + (queryString.toString() ? `?${queryString.toString()}` : "");

    const response = await api.post<ApprovalWorkflowResult<any>>(url);
    return response.data;
  }
}

export const rbacApi = new RbacApi();
