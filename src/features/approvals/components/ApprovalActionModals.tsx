import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { ApprovalRequest } from '../types/approval.types';
import dayjs from 'dayjs';

interface ApprovalActionModalsProps {
  // Approve Modal
  approveModal: { open: boolean; request: ApprovalRequest | null };
  onApproveConfirm: (data: { reason?: string }) => void;
  onApproveCancel: () => void;
  
  // Reject Modal
  rejectModal: { open: boolean; request: ApprovalRequest | null };
  onRejectConfirm: (data: { reason: string }) => void;
  onRejectCancel: () => void;
  
  // Cancel Modal
  cancelModal: { open: boolean; request: ApprovalRequest | null };
  onCancelConfirm: () => void;
  onCancelCancel: () => void;
  
  // Execute Modal
  executeModal: { open: boolean; request: ApprovalRequest | null };
  onExecuteConfirm: () => void;
  onExecuteCancel: () => void;
  
  // View Modal
  viewModal: { open: boolean; request: ApprovalRequest | null };
  onViewClose: () => void;
}

export const ApprovalActionModals: React.FC<ApprovalActionModalsProps> = ({
  approveModal,
  onApproveConfirm,
  onApproveCancel,
  rejectModal,
  onRejectConfirm,
  onRejectCancel,
  cancelModal,
  onCancelConfirm,
  onCancelCancel,
  executeModal,
  onExecuteConfirm,
  onExecuteCancel,
  viewModal,
  onViewClose,
}) => {
  const [approveReason, setApproveReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    onApproveConfirm({ reason: approveReason });
    setApproveReason('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onRejectConfirm({ reason: rejectReason });
    setRejectReason('');
  };

  const handleCancel = () => {
    onCancelConfirm();
  };

  const handleExecute = () => {
    onExecuteConfirm();
  };

  const renderRequestDetails = (request: ApprovalRequest | null) => {
    if (!request) return null;

    console.log('🔍 Request data:', request);

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Request Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Resource:</Typography>
            <Typography variant="body2">{request.resourceType} ({request.resourceId})</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Action:</Typography>
            <Typography variant="body2">{request.action}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Requested by:</Typography>
            <Typography variant="body2">
              {request.requestor 
                ? `${request.requestor.firstName} ${request.requestor.lastName} (${request.requestor.username})`
                : request.requestorName || request.requestorId
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Created:</Typography>
            <Typography variant="body2">
              {dayjs(request.createdAt).format('MMM DD, YYYY HH:mm')}
            </Typography>
          </Box>
          {request.approver && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Approved by:</Typography>
              <Typography variant="body2">
                {`${request.approver.firstName} ${request.approver.lastName} (${request.approver.username})`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {request.approver.email}
              </Typography>
              {request.approvedAt && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Approved: {dayjs(request.approvedAt).format('MMM DD, YYYY HH:mm')}
                </Typography>
              )}
            </Box>
          )}
          {request.reason && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Reason:</Typography>
              <Typography variant="body2">{request.reason}</Typography>
            </Box>
          )}
          {request.requestData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Request Data:</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'grey.300',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(request.requestData, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
          {request.originalData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Original Data:</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'orange.50', 
                borderRadius: 1, 
                border: '1px solid',
                borderColor: 'orange.300',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(request.originalData, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {/* Approve Modal */}
      <Dialog 
        open={approveModal.open} 
        onClose={onApproveCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          {renderRequestDetails(approveModal.request)}
          <Divider sx={{ my: 2 }} />
          <Alert severity="success" sx={{ mb: 2 }}>
            You are about to approve this request. This action cannot be undone.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Approval Reason (Optional)"
            value={approveReason}
            onChange={(e) => setApproveReason(e.target.value)}
            placeholder="Add a reason for approval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onApproveCancel}>Cancel</Button>
          <Button 
            onClick={handleApprove}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Modal */}
      <Dialog 
        open={rejectModal.open} 
        onClose={onRejectCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          {renderRequestDetails(rejectModal.request)}
          <Divider sx={{ my: 2 }} />
          <Alert severity="error" sx={{ mb: 2 }}>
            You are about to reject this request. Please provide a reason.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please explain why this request is being rejected..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onRejectCancel}>Cancel</Button>
          <Button 
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={cancelModal.open} onClose={onCancelCancel}>
        <DialogTitle>Cancel Request</DialogTitle>
        <DialogContent>
          {renderRequestDetails(cancelModal.request)}
          <Divider sx={{ my: 2 }} />
          <Alert severity="warning">
            {cancelModal.request?.status === 'cannot_be_executed' ? (
              <>This request cannot be executed and will be deleted. This action cannot be undone.</>
            ) : (
              <>Are you sure you want to cancel this request? This action cannot be undone.</>
            )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelCancel}>
            {cancelModal.request?.status === 'cannot_be_executed' ? 'No, Keep Request' : 'No, Keep Request'}
          </Button>
          <Button 
            onClick={handleCancel}
            variant="contained"
            color="error"
          >
            {cancelModal.request?.status === 'cannot_be_executed' ? 'Yes, Delete Request' : 'Yes, Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execute Modal */}
      <Dialog 
        open={executeModal.open} 
        onClose={onExecuteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Execute Approved Request</DialogTitle>
        <DialogContent>
          {renderRequestDetails(executeModal.request)}
          <Divider sx={{ my: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to execute this approved request. This will perform the actual action and cannot be undone.
          </Alert>
          {executeModal.request && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Action to be performed:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {executeModal.request.action.replace(/_/g, ' ').toLowerCase()} on {executeModal.request.resourceType}
              </Typography>
              {executeModal.request.entityId && (
                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                  Entity ID: {executeModal.request.entityId}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onExecuteCancel}>Cancel</Button>
          <Button 
            onClick={handleExecute}
            variant="contained"
            color="primary"
          >
            Execute Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog 
        open={viewModal.open} 
        onClose={onViewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Request Details</DialogTitle>
        
        <DialogContent>
          {viewModal.request && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Request ID:</Typography>
                    <Typography variant="body2">{viewModal.request.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    <Chip size="small" label={viewModal.request.status} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Resource Type:</Typography>
                    <Typography variant="body2">{viewModal.request.resourceType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Resource ID:</Typography>
                    <Typography variant="body2">{viewModal.request.resourceId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Action:</Typography>
                    <Typography variant="body2">{viewModal.request.action}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Requestor Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Requestor Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                    <Typography variant="body2">
                      {viewModal.request.requestor 
                        ? `${viewModal.request.requestor.firstName} ${viewModal.request.requestor.lastName}`
                        : viewModal.request.requestorName || 'N/A'
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Username:</Typography>
                    <Typography variant="body2">
                      {viewModal.request.requestor?.username || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body2">
                      {viewModal.request.requestor?.email || viewModal.request.requestorEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Timestamps */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Created:</Typography>
                    <Typography variant="body2">
                      {dayjs(viewModal.request.createdAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                    <Typography variant="body2">
                      {dayjs(viewModal.request.updatedAt).format('MMM DD, YYYY HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Request Details */}
              {viewModal.request.reason && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Request Reason
                    </Typography>
                    <Typography variant="body2">
                      {viewModal.request.reason}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Request Data */}
              {viewModal.request.requestData && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Requested Changes
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      borderRadius: 1, 
                      border: '1px solid',
                      borderColor: 'grey.300',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '12px', 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(viewModal.request.requestData, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                </>
              )}

              {/* Original Data */}
              {viewModal.request.originalData && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Original Data (Before Changes)
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'orange.50', 
                      borderRadius: 1, 
                      border: '1px solid',
                      borderColor: 'orange.300',
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '12px', 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(viewModal.request.originalData, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                </>
              )}

              {/* Approval/Rejection/Execution Details */}
              {(viewModal.request.approver || viewModal.request.approvedAt || viewModal.request.rejectedBy || viewModal.request.executedBy) && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Decision & Execution Details
                    </Typography>
                    {(viewModal.request.approver || viewModal.request.approvedAt) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Approved by:</Typography>
                        <Typography variant="body2">
                          {viewModal.request.approver 
                            ? `${viewModal.request.approver.firstName} ${viewModal.request.approver.lastName} (${viewModal.request.approver.username})`
                            : viewModal.request.approvedByName || viewModal.request.approvedBy || 'Unknown'
                          }
                        </Typography>
                        {viewModal.request.approver?.email && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {viewModal.request.approver.email}
                          </Typography>
                        )}
                        {viewModal.request.approvedAt && (
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(viewModal.request.approvedAt).format('MMM DD, YYYY HH:mm')}
                          </Typography>
                        )}
                      </Box>
                    )}
                    {viewModal.request.rejectedBy && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Rejected by:</Typography>
                        <Typography variant="body2">
                          {viewModal.request.rejectedByName || viewModal.request.rejectedBy}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(viewModal.request.rejectedAt).format('MMM DD, YYYY HH:mm')}
                        </Typography>
                        {viewModal.request.rejectionReason && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">Reason:</Typography>
                            <Typography variant="body2">
                              {viewModal.request.rejectionReason}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    {viewModal.request.executedBy && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Executed by:</Typography>
                        <Typography variant="body2">
                          {viewModal.request.executedByName || viewModal.request.executedBy}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(viewModal.request.executedAt).format('MMM DD, YYYY HH:mm')}
                        </Typography>
                      </Box>
                    )}
                    {viewModal.request.status === 'cannot_be_executed' && viewModal.request.cannotExecuteReason && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>Cannot Be Executed:</Typography>
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {viewModal.request.cannotExecuteReason}
                        </Alert>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onViewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
