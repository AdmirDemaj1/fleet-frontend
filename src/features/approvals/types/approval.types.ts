// Approval Request Types

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  EXECUTED = 'executed',
  CANNOT_BE_EXECUTED = 'cannot_be_executed'
}

export interface ApprovalRequest {
  id: string;
  requestorId: string;
  requestorName?: string;
  requestorEmail?: string;
  resourceType: string;
  resourceId: string;
  entityId?: string; // ID of the entity being acted upon
  action: string;
  reason?: string;
  requestData?: Record<string, any>;
  originalData?: Record<string, any>; // Original data at top level
  status: ApprovalStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  // Detailed user objects
  requestor?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  approver?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  // Execution tracking
  executedBy?: string;
  executedByName?: string;
  executedAt?: string;
  isExecuted?: boolean;
  cannotExecuteReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequestFilters {
  status?: ApprovalStatus | '';
  requestorId?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApprovalQueryParams extends ApprovalRequestFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedApprovalResponseDto {
  requests: ApprovalRequest[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// Action DTOs - Updated to match backend ApprovalDecisionDto
export interface ApprovalDecisionDto {
  approved: boolean;
  reason?: string;
}

// Response type for approval actions
export interface ApprovalActionResponse {
  message: string;
  error: boolean;
  requiresApproval?: boolean;
  approvalRequestId?: string;
}

// Filter options
export const APPROVAL_STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: ApprovalStatus.PENDING },
  { label: 'Approved', value: ApprovalStatus.APPROVED },
  { label: 'Rejected', value: ApprovalStatus.REJECTED },
  { label: 'Expired', value: ApprovalStatus.EXPIRED },
  { label: 'Executed', value: ApprovalStatus.EXECUTED },
  { label: 'Cannot Be Executed', value: ApprovalStatus.CANNOT_BE_EXECUTED },
];

export const RESOURCE_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Customer', value: 'customer' },
  { label: 'Contract', value: 'contract' },
  { label: 'Payment', value: 'payment' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'Endorser', value: 'endorser' },
];