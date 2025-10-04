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
      return {
        method: 'PUT',
        endpoint: `/payments/${entityId}`,
        data: requestData
      };
    
    case 'delete_payment':
      return {
        method: 'DELETE',
        endpoint: `/payments/${entityId}`,
        data: null
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
  console.log("approvalRequest", approvalRequest);
  const { method, endpoint, data } = getEndpointFromApprovalRequest(approvalRequest);
  
  // Add approvalRequestId as query parameter to the endpoint
  const urlWithApprovalId = `${endpoint}${endpoint.includes('?') ? '&' : '?'}approvalRequestId=${approvalRequest.id}`;
  
  try {
    let response;
    
    switch (method.toUpperCase()) {
      case 'POST':
        response = await api.post(urlWithApprovalId, data);
        break;
      case 'PUT':
        response = await api.put(urlWithApprovalId, data);
        break;
      case 'DELETE':
        response = await api.delete(urlWithApprovalId);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to execute approval request:', error);
    throw error;
  }
};
