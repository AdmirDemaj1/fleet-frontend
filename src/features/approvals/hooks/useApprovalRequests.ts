import { useMemo, useState, useCallback } from 'react';
import { 
  useGetApprovalRequestsQuery,
  useProcessApprovalRequestMutation,
  useCancelRequestMutation,
} from '../api/approvalApi';
import { ApprovalRequestFilters, ApprovalQueryParams, ApprovalDecisionDto, ApprovalRequest } from '../types/approval.types';
import { executeApprovalRequest } from '../utils/approvalExecutor';
import { useNotification } from '../../../shared/hooks/useNotification';

export const useApprovalRequests = (currentUser?: { id: string; role: string }) => {
  const { showNotification } = useNotification();
  
  // State for filters and pagination
  const [filters, setFilters] = useState<ApprovalRequestFilters>({
    status: '',
    requestorId: '',
    resourceType: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Build query params
  const queryParams = useMemo<ApprovalQueryParams>(() => ({
    ...filters,
    ...pagination,
  }), [filters, pagination]);

  // Fetch approval requests
  const {
    data: approvalData,
    isLoading,
    error,
    refetch,
  } = useGetApprovalRequestsQuery(queryParams);

  // Mutations
  const [processRequest, { isLoading: isProcessing }] = useProcessApprovalRequestMutation();
  const [cancelRequest, { isLoading: isCanceling }] = useCancelRequestMutation();
  
  // Execution state
  const [executingRequestId, setExecutingRequestId] = useState<string | null>(null);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: ApprovalRequestFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Action handlers
  const handleApprove = useCallback(async (requestId: string, data: { reason?: string }) => {
    try {
      const decision: ApprovalDecisionDto = {
        approved: true,
        reason: data.reason,
      };
      await processRequest({ id: requestId, decision }).unwrap();
      showNotification('Request approved successfully', 'success');
      refetch();
    } catch (error: any) {
      showNotification(
        error?.data?.message || 'Failed to approve request', 
        'error'
      );
    }
  }, [processRequest, showNotification, refetch]);

  const handleReject = useCallback(async (requestId: string, data: { reason: string }) => {
    try {
      const decision: ApprovalDecisionDto = {
        approved: false,
        reason: data.reason,
      };
      await processRequest({ id: requestId, decision }).unwrap();
      showNotification('Request rejected successfully', 'success');
      refetch();
    } catch (error: any) {
      showNotification(
        error?.data?.message || 'Failed to reject request', 
        'error'
      );
    }
  }, [processRequest, showNotification, refetch]);

  const handleCancel = useCallback(async (requestId: string) => {
    try {
      await cancelRequest(requestId).unwrap();
      showNotification('Request cancelled successfully', 'success');
      refetch();
    } catch (error: any) {
      showNotification(
        error?.data?.message || 'Failed to cancel request', 
        'error'
      );
    }
  }, [cancelRequest, showNotification, refetch]);

  const handleExecute = useCallback(async (request: ApprovalRequest) => {
    if (!request || !request.id) {
      showNotification('Invalid request', 'error');
      return;
    }

    setExecutingRequestId(request.id);
    
    try {
      const result = await executeApprovalRequest(request);
      
      // Get action description for user-friendly message
      const actionDescription = request.action.replace(/_/g, ' ').toLowerCase();
      const resourceType = request.resourceType?.toLowerCase() || 'resource';
      
      showNotification(
        `Successfully executed ${actionDescription} for ${resourceType}`,
        'success'
      );
      
      // Log the result for debugging
      console.log('Execution result:', result);
      
      // Refresh the approval requests list
      refetch();
    } catch (error: any) {
      console.error('Execution failed:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to execute request';
      showNotification(errorMessage, 'error');
    } finally {
      setExecutingRequestId(null);
    }
  }, [showNotification, refetch]);

  // Determine if user can see admin features
  const isAdmin = useMemo(() => currentUser?.role === 'admin', [currentUser?.role]);

  return {
    // Data
    requests: approvalData?.requests || [],
    total: approvalData?.total || 0,
    hasMore: approvalData?.hasMore || false,
    
    // State
    filters,
    pagination,
    isLoading,
    error,
    
    // Loading states for actions
    isProcessing,
    isCanceling,
    executingRequestId,
    
    // Handlers
    handleFiltersChange,
    handlePageChange,
    handleLimitChange,
    handleApprove,
    handleReject,
    handleCancel,
    handleExecute,
    refetch,
    
    // User permissions
    isAdmin,
  };
};
