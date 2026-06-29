import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Assignment as ApprovalIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { ApprovalFilters, ApprovalRequestTable } from "../components";
import { useApprovalRequests } from "../hooks/useApprovalRequests";

export const ApprovalRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const {
    requests,
    total,
    filters,
    pagination,
    isLoading,
    error,
    isCanceling,
    isProcessing,
    executingRequestId,
    handleFiltersChange,
    handlePageChange,
    handleLimitChange,
    handleApprove,
    handleReject,
    handleCancel,
    handleExecute,
    refetch,
    isAdmin,
  } = useApprovalRequests(user ? { id: user.id, isAdministrator: user.isAdministrator } : undefined);


  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert
          severity="error"
          action={<button onClick={() => refetch()}>Retry</button>}
        >
          Failed to load approval requests. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/dashboard")}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary" variant="body2">
          Approval Requests
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <ApprovalIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Approval Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAdmin
              ? "Manage all approval requests across the system"
              : "View and manage your approval requests"}
          </Typography>
        </Box>

        {/* Stats Summary */}
        {!isLoading && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              textAlign: "center",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Requests
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Role-based Info Alert */}
      {!isLoading && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<ApprovalIcon />}>
          {isAdmin
            ? "You have admin access and can view/manage all approval requests. You can approve, reject, and execute requests. Use filters to find specific requests."
            : "You can view your own approval requests, cancel pending ones, and execute approved requests. Admins will review and approve/reject your requests."}
        </Alert>
      )}

      {/* Filters */}
      <ApprovalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showUserFilter={isAdmin}
        loading={isLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Requests Table */}
      {!isLoading && (
        <ApprovalRequestTable
          requests={requests}
          loading={isLoading || isProcessing || isCanceling || !!executingRequestId}
          currentUser={user ? { id: user.id, isAdministrator: user.isAdministrator } : undefined}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={handleCancel}
          onExecute={handleExecute}
          executingRequestId={executingRequestId}
          total={total}
          page={pagination.page}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onRefresh={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <ApprovalIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No approval requests found
          </Typography>
          <Typography color="text.secondary">
            {Object.values(filters).some((v) => v && v !== "")
              ? "Try adjusting your filters to see more requests."
              : isAdmin
              ? "There are currently no approval requests in the system."
              : "You have no approval requests at this time."}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};
