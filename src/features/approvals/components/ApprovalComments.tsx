import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Comment as CommentIcon,
  CheckCircle,
  Send,
  Edit,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ApprovalComment, ApprovalRequest, ApprovalStatus } from '../types/approval.types';
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useResolveCommentMutation,
  useUpdateRequestDataMutation,
} from '../api/approvalApi';
import { useNotification } from '../../../shared/hooks/useNotification';

dayjs.extend(relativeTime);

interface ApprovalCommentsProps {
  request: ApprovalRequest;
  currentUser?: { id: string; isAdministrator: boolean };
  onRefresh?: () => void;
}

export const ApprovalComments: React.FC<ApprovalCommentsProps> = ({
  request,
  currentUser,
  onRefresh,
}) => {
  const { showNotification } = useNotification();
  
  // Fetch comments from the dedicated endpoint
  const { 
    data: fetchedComments, 
    isLoading: isLoadingComments, 
    isFetching: isFetchingComments,
    refetch: refetchComments 
  } = useGetCommentsQuery(request.id, {
    // Skip if no request id
    skip: !request.id,
  });
  
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [resolveComment, { isLoading: isResolvingComment }] = useResolveCommentMutation();
  const [updateRequestData, { isLoading: isUpdatingRequest }] = useUpdateRequestDataMutation();

  // State
  const [newCommentText, setNewCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState(true);
  const [resolutionModal, setResolutionModal] = useState<{
    open: boolean;
    comment: ApprovalComment | null;
  }>({ open: false, comment: null });
  const [resolutionNote, setResolutionNote] = useState('');
  const [editRequestModal, setEditRequestModal] = useState(false);
  const [editedRequestData, setEditedRequestData] = useState('');
  const [updateReason, setUpdateReason] = useState('');

  // Use fetched comments from API, fallback to request.comments if available
  const comments = fetchedComments || request.comments || [];
  const unresolvedCount = comments.filter(c => !c.isResolved).length;
  const isAdmin = currentUser?.isAdministrator ?? false;
  
  // Check requestorId from both top-level field and nested requestor object
  const requestorId = request.requestorId || request.requestor?.id;
  const isRequestor = currentUser?.id === requestorId;
  const isPending = request.status === ApprovalStatus.PENDING;
  
  // Allow low-tier users (requestors) to resolve comments on their own requests
  const canResolveComments = isRequestor && isPending;

  // Debug logging
  console.log('ApprovalComments Debug:', {
    currentUserId: currentUser?.id,
    currentUserIsAdministrator: currentUser?.isAdministrator,
    requestorId,
    'request.requestorId': request.requestorId,
    'request.requestor?.id': request.requestor?.id,
    isRequestor,
    isAdmin,
    isPending,
    canResolveComments,
    commentsCount: comments.length,
    unresolvedCount,
  });

  // Refresh comments
  const handleRefreshComments = () => {
    refetchComments();
  };

  // Add a new comment (admin only)
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      await addComment({
        approvalRequestId: request.id,
        data: { content: newCommentText.trim() },
      }).unwrap();
      
      setNewCommentText('');
      showNotification('Comment added successfully', 'success');
      refetchComments();
      onRefresh?.();
    } catch (error: any) {
      showNotification(
        error?.data?.message || 'Failed to add comment',
        'error'
      );
    }
  };

  // Resolve a comment (requestor only)
  const handleResolveComment = async () => {
    if (!resolutionModal.comment) return;

    try {
      await resolveComment({
        commentId: resolutionModal.comment.id,
        data: { resolutionNote: resolutionNote.trim() || undefined },
      }).unwrap();

      setResolutionModal({ open: false, comment: null });
      setResolutionNote('');
      showNotification('Comment marked as resolved', 'success');
      refetchComments();
      onRefresh?.();
    } catch (error: any) {
      showNotification(
        error?.data?.message || 'Failed to resolve comment',
        'error'
      );
    }
  };

  // Update request data (requestor only)
  const handleUpdateRequestData = async () => {
    try {
      const parsedData = JSON.parse(editedRequestData);
      
      await updateRequestData({
        approvalRequestId: request.id,
        data: {
          requestData: parsedData,
          updateReason: updateReason.trim() || undefined,
        },
      }).unwrap();

      setEditRequestModal(false);
      setEditedRequestData('');
      setUpdateReason('');
      showNotification('Request data updated successfully', 'success');
      refetchComments();
      onRefresh?.();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        showNotification('Invalid JSON format', 'error');
      } else {
        showNotification(
          error?.data?.message || 'Failed to update request data',
          'error'
        );
      }
    }
  };

  const openEditRequestModal = () => {
    setEditedRequestData(JSON.stringify(request.requestData || {}, null, 2));
    setUpdateReason('');
    setEditRequestModal(true);
  };

  const openResolutionModal = (comment: ApprovalComment) => {
    setResolutionModal({ open: true, comment });
    setResolutionNote('');
  };

  // Show loading skeleton during initial load
  if (isLoadingComments) {
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CommentIcon color="primary" />
          <Typography variant="h6">Comments & Feedback</Typography>
        </Box>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 1 }} />
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (comments.length === 0 && !isAdmin) {
    return null; // Don't show anything if there are no comments and user is not admin
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon color="primary" />
          <Typography variant="h6">Comments & Feedback</Typography>
          {unresolvedCount > 0 && (
            <Chip
              size="small"
              color="error"
              label={`${unresolvedCount} unresolved`}
            />
          )}
          {isFetchingComments && (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleRefreshComments}
            disabled={isFetchingComments}
            title="Refresh comments"
          >
            <Refresh />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setExpandedComments(!expandedComments)}
          >
            {expandedComments ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expandedComments}>
        {/* Admin: Add Comment Form */}
        {isAdmin && isPending && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Add Feedback
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add feedback or request changes..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={isAddingComment}
              size="small"
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={isAddingComment ? <CircularProgress size={16} /> : <Send />}
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || isAddingComment}
              >
                Add Comment
              </Button>
            </Box>
          </Paper>
        )}

        {/* Requestor: Edit Request Button - Show when user is the requestor and has unresolved comments */}
        {canResolveComments && unresolvedCount > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={openEditRequestModal}
              >
                Edit Request
              </Button>
            }
          >
            You have {unresolvedCount} unresolved comment(s). Please address the feedback and mark comments as resolved.
          </Alert>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No comments yet
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comments.map((comment) => (
              <Paper
                key={comment.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: comment.isResolved ? 'success.main' : 'warning.main',
                  borderRadius: 2,
                  bgcolor: comment.isResolved ? 'success.50' : 'warning.50',
                }}
              >
                {/* Comment Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                    {comment.author.firstName?.charAt(0) || 'A'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {comment.author.firstName} {comment.author.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(comment.createdAt).fromNow()}
                    </Typography>
                  </Box>
                  {comment.isResolved ? (
                    <Chip
                      size="small"
                      icon={<CheckCircle />}
                      label="Resolved"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Pending"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Comment Content */}
                <Typography variant="body2" sx={{ mb: 1, pl: 4.5 }}>
                  {comment.content}
                </Typography>

                {/* Resolution Info */}
                {comment.isResolved && comment.resolvedBy && (
                  <Box
                    sx={{
                      pl: 4.5,
                      mt: 1,
                      pt: 1,
                      borderTop: '1px dashed',
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      ✓ Resolved by {comment.resolvedBy.firstName} {comment.resolvedBy.lastName}
                      {' · '}
                      {dayjs(comment.resolvedAt).fromNow()}
                    </Typography>
                    {comment.resolutionNote && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        "{comment.resolutionNote}"
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Requestor Actions - Allow requestor to resolve comments on their own requests */}
                {canResolveComments && !comment.isResolved && (
                  <Box sx={{ pl: 4.5, mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => openResolutionModal(comment)}
                      disabled={isResolvingComment}
                    >
                      Mark as Resolved
                    </Button>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Collapse>

      {/* Resolution Modal */}
      <Dialog
        open={resolutionModal.open}
        onClose={() => setResolutionModal({ open: false, comment: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Comment as Resolved</DialogTitle>
        <DialogContent>
          {resolutionModal.comment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Comment:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  {resolutionModal.comment.content}
                </Typography>
              </Paper>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Resolution Note (Optional)"
            placeholder="Explain what changes you made to address this feedback..."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResolutionModal({ open: false, comment: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleResolveComment}
            disabled={isResolvingComment}
            startIcon={isResolvingComment ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Request Data Modal */}
      <Dialog
        open={editRequestModal}
        onClose={() => setEditRequestModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Request Data</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Update the request data to address the admin's feedback. Make sure to use valid JSON format.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={12}
            label="Request Data (JSON)"
            value={editedRequestData}
            onChange={(e) => setEditedRequestData(e.target.value)}
            sx={{
              mb: 2,
              fontFamily: 'monospace',
              '& textarea': { fontFamily: 'monospace', fontSize: '0.85rem' },
            }}
          />
          <TextField
            fullWidth
            label="Update Reason (Optional)"
            placeholder="Describe what changes you made..."
            value={updateReason}
            onChange={(e) => setUpdateReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRequestModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateRequestData}
            disabled={isUpdatingRequest}
            startIcon={isUpdatingRequest ? <CircularProgress size={16} /> : <Edit />}
          >
            Update Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalComments;

