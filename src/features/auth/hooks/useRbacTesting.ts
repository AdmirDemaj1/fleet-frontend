import { useState, useCallback } from 'react';
import { rbacApi } from '../api/rbacApi';
import { UserInfo, ApprovalWorkflowResult } from '../types/auth.types';
import { ApprovalHandler } from '../utils/approvalUtils';

export interface RbacTestingState {
  userInfo: UserInfo | null;
  isLoadingUserInfo: boolean;
  isTestingRbac: boolean;
  lastTestResult: ApprovalWorkflowResult<any> | null;
  error: string | null;
}

export const useRbacTesting = () => {
  const [state, setState] = useState<RbacTestingState>({
    userInfo: null,
    isLoadingUserInfo: false,
    isTestingRbac: false,
    lastTestResult: null,
    error: null,
  });

  /**
   * Fetch current user info for RBAC testing
   */
  const fetchUserInfo = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingUserInfo: true, error: null }));
    
    try {
      const userInfo = await rbacApi.getUserInfo();
      setState(prev => ({
        ...prev,
        userInfo,
        isLoadingUserInfo: false,
        error: null
      }));
      
      console.log('👤 User Info:', userInfo);
      return userInfo;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user info';
      setState(prev => ({
        ...prev,
        isLoadingUserInfo: false,
        error: errorMessage
      }));
      
      console.error('❌ Failed to fetch user info:', error);
      throw error;
    }
  }, []);

  /**
   * Test RBAC system with approval workflow
   */
  const testRbac = useCallback(async (approvalRequestId?: string) => {
    setState(prev => ({ ...prev, isTestingRbac: true, error: null }));
    
    try {
      const result = await rbacApi.testRbac(approvalRequestId);
      setState(prev => ({
        ...prev,
        lastTestResult: result,
        isTestingRbac: false,
        error: null
      }));
      
      console.log('🧪 RBAC Test Result:', result);
      
      // Handle the approval workflow result with notifications
      ApprovalHandler.handleRbacTest(result);
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'RBAC test failed';
      setState(prev => ({
        ...prev,
        isTestingRbac: false,
        error: errorMessage
      }));
      
      console.error('❌ RBAC test failed:', error);
      ApprovalHandler.showError(`RBAC test failed: ${errorMessage}`);
      throw error;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setState({
      userInfo: null,
      isLoadingUserInfo: false,
      isTestingRbac: false,
      lastTestResult: null,
      error: null,
    });
  }, []);

  /**
   * Get user role display info
   */
  const getUserRoleInfo = useCallback(() => {
    if (!state.userInfo) return null;
    
    return {
      role: state.userInfo.role,
      isAdmin: state.userInfo.isAdmin,
      isLowTier: state.userInfo.isLowTier,
      canApprove: state.userInfo.canApprove,
      displayName: state.userInfo.isAdmin ? 'Admin User' : 'Low Tier User',
      description: state.userInfo.isAdmin 
        ? 'Full access and approval rights' 
        : 'Requires approval for most actions'
    };
  }, [state.userInfo]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: keyof UserInfo['permissions']) => {
    return state.userInfo?.permissions[permission] || false;
  }, [state.userInfo]);

  /**
   * Check if user needs approval for specific action
   */
  const needsApprovalFor = useCallback((action: keyof UserInfo['needsApprovalFor']) => {
    return state.userInfo?.needsApprovalFor[action] || false;
  }, [state.userInfo]);

  return {
    // State
    ...state,
    
    // Actions
    fetchUserInfo,
    testRbac,
    clearError,
    reset,
    
    // Computed values
    getUserRoleInfo,
    hasPermission,
    needsApprovalFor,
    
    // Convenience booleans
    isLoading: state.isLoadingUserInfo || state.isTestingRbac,
    hasUserInfo: !!state.userInfo,
    hasError: !!state.error,
  };
};
