import { ApprovalRequest } from '../types/approval.types';
import { api } from '../../../shared/utils/api';

// Interface for execution result
export interface ExecutionResult {
  method: string;
  endpoint: string;
  data?: Record<string, any> | null;
}

// Frontend utility function to map approval requests to API endpoints
export const getEndpointFromApprovalRequest = (approvalRequest: ApprovalRequest): ExecutionResult => {
  const { action, entityId, requestData } = approvalRequest;
  
  switch (action) {
    // Customer endpoints
    case 'create_customer':
      return {
        method: 'POST',
        endpoint: '/customers',
        data: requestData
      };
    
    case 'update_customer':
      return {
        method: 'PUT',
        endpoint: `/customers/${entityId}`,
        data: requestData
      };
    
    case 'delete_customer':
      return {
        method: 'DELETE',
        endpoint: `/customers/${entityId}`,
        data: null
      };
    
    // Contract endpoints
    case 'create_contract':
      return {
        method: 'POST',
        endpoint: '/contracts/with-dependencies',
        data: requestData
      };
    
    case 'update_contract':
      return {
        method: 'PUT',
        endpoint: `/contracts/${entityId}`,
        data: requestData
      };
    
    case 'delete_contract':
      return {
        method: 'DELETE',
        endpoint: `/contracts/${entityId}`,
        data: null
      };
    
    // Vehicle endpoints
    case 'create_vehicle':
      return {
        method: 'POST',
        endpoint: '/vehicles/with-documents',
        data: requestData
      };
    
    case 'update_vehicle':
      return {
        method: 'PUT',
        endpoint: `/vehicles/${entityId}`,
        data: requestData
      };
    
    case 'delete_vehicle':
      return {
        method: 'DELETE',
        endpoint: `/vehicles/${entityId}`,
        data: null
      };
    
    // Payment endpoints
    case 'create_payment':
      return {
        method: 'POST',
        endpoint: '/payments',
        data: requestData
      };
    
    case 'update_payment':
      // Get the payment ID from requestData
      const paymentId = requestData?.id;
      if (!paymentId) {
        throw new Error('Payment ID is required in requestData');
      }

      // Remove id from request data since it's in the URL
      const { id: _, ...requestDataWithoutId } = requestData;

      // Special handling for mark as paid actions
      if (requestData.updateFuturePayments !== undefined || requestData.applyCreditBalance !== undefined) {
        console.log('Handling mark as paid with credit:', {
          paymentId,
          requestData: requestDataWithoutId
        });
        return {
          method: 'PATCH',
          endpoint: `/payments/${paymentId}/mark-paid-with-credit`,
          data: requestDataWithoutId
        };
      } else {
        console.log('Handling mark as paid:', {
          paymentId,
          requestData: requestDataWithoutId
        });
        return {
          method: 'PATCH',
          endpoint: `/payments/${paymentId}/mark-paid`,
          data: requestDataWithoutId
        };
      };
    
    case 'delete_payment':
      return {
        method: 'DELETE',
        endpoint: `/payments/${entityId}`,
        data: null
      };
    
    case 'mark_payment_as_paid':
      console.log('Mark payment as paid request data:', {
        requestData,
        entityId,
        resourceId: approvalRequest.resourceId
      });
      return {
        method: 'PATCH',
        endpoint: `/payments/${approvalRequest.resourceId}/mark-paid`,
        data: requestData
      };
    
    case 'mark_payment_as_paid_with_credit':
      console.log('Mark payment as paid with credit request data:', {
        requestData,
        entityId,
        resourceId: approvalRequest.resourceId
      });
      return {
        method: 'PATCH',
        endpoint: `/payments/${approvalRequest.resourceId}/mark-paid-with-credit`,
        data: requestData
      };
    
    // Document endpoints
    case 'update_document':
      return {
        method: 'PUT',
        endpoint: `/documents/${entityId}`,
        data: requestData
      };
    
    case 'delete_document':
      return {
        method: 'DELETE',
        endpoint: `/documents/${entityId}`,
        data: null
      };
    
    default:
      throw new Error(`Unknown approval action: ${action}`);
  }
};

// Execute an approved request
export const executeApprovalRequest = async (approvalRequest: ApprovalRequest): Promise<any> => {
  console.log("Full approval request:", approvalRequest);
  console.log("Executing approval request:", {
    id: approvalRequest.id,
    action: approvalRequest.action,
    entityId: approvalRequest.entityId,
    resourceId: approvalRequest.resourceId,
    requestData: approvalRequest.requestData
  });
  const { method, endpoint, data } = getEndpointFromApprovalRequest(approvalRequest);
  
  // Add approvalRequestId as query parameter to the endpoint
  const urlWithApprovalId = `${endpoint}${endpoint.includes('?') ? '&' : '?'}approvalRequestId=${approvalRequest.id}`;
  
  // Log the final URL for debugging
  console.log('Executing approval request with URL:', urlWithApprovalId);
  
  try {
    let response;
    
    switch (method.toUpperCase()) {
      case 'POST':
        response = await api.post(urlWithApprovalId, data);
        break;
      case 'PUT':
        response = await api.put(urlWithApprovalId, data);
        break;
      case 'PATCH':
        response = await api.patch(urlWithApprovalId, data);
        break;
      case 'DELETE':
        response = await api.delete(urlWithApprovalId);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    // Check for response message
    const responseData = response.data as { message?: string; requiresApproval?: boolean; error?: boolean };
    if (responseData?.message && responseData.error) {
      // Only throw if it's marked as an error
      throw new Error(responseData.message);
    } else {
      // Otherwise, it's a success message
      console.log('Execution response:', responseData);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Failed to execute approval request:', error);
    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || error.message || 'Failed to execute request';
    throw new Error(errorMessage);
  }
};
