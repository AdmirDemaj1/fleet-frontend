import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  TablePagination,
  Avatar,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AccessTime as PendingIcon,
  PlayArrow as ExecuteIcon,
} from "@mui/icons-material";
import type { ApprovalRequest } from "../types/approval.types";
import { ApprovalStatus } from "../types/approval.types";
// import ApprovalActionModals from "./ApprovalActionModals";
import dayjs from "dayjs";
import { ApprovalActionModals } from "./ApprovalActionModals";

interface ApprovalRequestTableProps {
  requests: ApprovalRequest[];
  loading?: boolean;
  currentUser?: { id: string; role: string };
  onApprove?: (requestId: string, data: { reason?: string }) => void;
  onReject?: (requestId: string, data: { reason: string }) => void;
  onCancel?: (requestId: string) => void;
  onExecute?: (request: ApprovalRequest) => void;
  // Pagination props
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  // Loading states
  executingRequestId?: string | null;
}

export const ApprovalRequestTable: React.FC<ApprovalRequestTableProps> = ({
  requests,
  loading = false,
  currentUser,
  onApprove,
  onReject,
  onCancel,
  onExecute,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  executingRequestId,
}) => {
  const [actionModals, setActionModals] = useState({
    approve: { open: false, request: null as ApprovalRequest | null },
    reject: { open: false, request: null as ApprovalRequest | null },
    cancel: { open: false, request: null as ApprovalRequest | null },
    execute: { open: false, request: null as ApprovalRequest | null },
    view: { open: false, request: null as ApprovalRequest | null },
  });

  const getStatusChip = (status: ApprovalStatus) => {
    const configs = {
      [ApprovalStatus.PENDING]: {
        color: "warning" as const,
        icon: <PendingIcon />,
      },
      [ApprovalStatus.APPROVED]: {
        color: "success" as const,
        icon: <CheckIcon />,
      },
      [ApprovalStatus.REJECTED]: {
        color: "error" as const,
        icon: <CloseIcon />,
      },
      [ApprovalStatus.EXPIRED]: {
        color: "default" as const,
        icon: <PendingIcon />,
      },
      [ApprovalStatus.EXECUTED]: {
        color: "primary" as const,
        icon: <CheckIcon />,
      },
      [ApprovalStatus.CANNOT_BE_EXECUTED]: {
        color: "error" as const,
        icon: <CloseIcon />,
      },
    };

    const config = configs[status] || {
      color: "default" as const,
      icon: <PendingIcon />,
    };

    return (
      <Chip
        size="small"
        label={status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
        color={config.color}
        icon={config.icon}
      />
    );
  };

  const canApproveOrReject = (request: ApprovalRequest): boolean => {
    return (
      request.status === ApprovalStatus.PENDING &&
      currentUser?.role === "admin" &&
      request.requestorId !== currentUser?.id
    );
  };

  const canCancel = (request: ApprovalRequest): boolean => {
    return (
      (request.status === ApprovalStatus.PENDING || request.status === ApprovalStatus.CANNOT_BE_EXECUTED) &&
      (request.requestorId === currentUser?.id || currentUser?.role === "admin")
    );
  };

  const canExecute = (request: ApprovalRequest): boolean => {
    return (
      request.status === ApprovalStatus.APPROVED &&
      currentUser !== undefined &&
      !request.isExecuted && // Don't show execute button if already executed
      // Admins, users, and low-tier users can execute approved requests
      (currentUser.role === "admin" || currentUser.role === "user" || currentUser.role === "low_tier")
    );
  };

  const handleAction = (action: string, request: ApprovalRequest) => {
    setActionModals((prev) => ({
      ...prev,
      [action]: { open: true, request },
    }));
  };

  const handleActionConfirm = (action: string, data?: Record<string, any>) => {
    const request = actionModals[action as keyof typeof actionModals].request;
    if (!request) return;

    switch (action) {
      case "approve":
        if (data) {
          onApprove?.(request.id, data);
        }
        break;
      case "reject":
        if (data) {
          onReject?.(request.id, data as { reason: string });
        }
        break;
      case "cancel":
        onCancel?.(request.id);
        break;
      case "execute":
        onExecute?.(request);
        break;
    }

    setActionModals((prev) => ({
      ...prev,
      [action]: { open: false, request: null },
    }));
  };

  const handleActionCancel = (action: string) => {
    setActionModals((prev) => ({
      ...prev,
      [action]: { open: false, request: null },
    }));
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Requestor</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography>Loading approval requests...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        No approval requests found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          {request.requestorName?.charAt(0) || "U"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {request.requestorName || "Unknown User"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.requestorEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {request.resourceType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {request.resourceId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.action}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusChip(request.status)}
                        {request.isExecuted && (
                          <Chip 
                            size="small" 
                            label="Executed" 
                            color="success" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(request.createdAt).format("MMM DD, YYYY")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(request.createdAt).format("HH:mm")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(request.updatedAt).format("MMM DD, YYYY")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(request.updatedAt).format("HH:mm")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleAction("view", request)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        {canApproveOrReject(request) && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleAction("approve", request)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleAction("reject", request)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {canCancel(request) && (
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAction("cancel", request)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canExecute(request) && (
                          <Tooltip title="Execute Request">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAction("execute", request)}
                              disabled={executingRequestId === request.id}
                            >
                              <ExecuteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={limit}
          page={page - 1} // MUI uses 0-based indexing
          onPageChange={(_, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(event) =>
            onLimitChange(parseInt(event.target.value, 10))
          }
        />
      </Paper>

      {/* Action Modals */}
      <ApprovalActionModals
        approveModal={actionModals.approve}
        rejectModal={actionModals.reject}
        cancelModal={actionModals.cancel}
        executeModal={actionModals.execute}
        viewModal={actionModals.view}
        onApproveConfirm={(data: any) => handleActionConfirm("approve", data)}
        onApproveCancel={() => handleActionCancel("approve")}
        onRejectConfirm={(data: any) => handleActionConfirm("reject", data)}
        onRejectCancel={() => handleActionCancel("reject")}
        onCancelConfirm={() => handleActionConfirm("cancel")}
        onCancelCancel={() => handleActionCancel("cancel")}
        onExecuteConfirm={() => handleActionConfirm("execute")}
        onExecuteCancel={() => handleActionCancel("execute")}
        onViewClose={() => handleActionCancel("view")}
      />
    </>
  );
};
