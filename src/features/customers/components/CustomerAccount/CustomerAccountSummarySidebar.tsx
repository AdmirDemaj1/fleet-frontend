import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  alpha,
  Skeleton,
} from "@mui/material";
import Person from "@mui/icons-material/Person";

import { CustomerAccountSidebarProps } from "../../types/customerSidebar.types";
import { STATUS_CONFIG } from "../../constants/sidebarConstants";
import { useCustomerSidebar } from "../../hooks/useCustomerSidebar";
import {
  CustomerAccountHeader,
  CustomerAccountFinancial,
  CustomerAccountAdditionalInfo,
} from "./SidebarComponents";

const CustomerAccountSidebar: React.FC<CustomerAccountSidebarProps> = ({
  customerId,
}) => {
  const { summaryData, financialSummary, loading, error } =
    useCustomerSidebar(customerId);

  // Show loading skeleton while loading OR if we don't have data yet and no error
  if (loading || (!summaryData && !error)) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background: "background.paper",
        }}
      >
        {/* Status bar skeleton */}
        <Skeleton variant="rectangular" width="100%" height={4} />

        {/* Header skeleton */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Skeleton variant="circular" width={56} height={56} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={16} />

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={14} />
          </Box>
        </Box>

        <Divider />

        {/* Financial section skeleton */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </Box>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={8}
              sx={{ borderRadius: 1 }}
            />
          </Box>

          <Skeleton
            variant="rectangular"
            width="100%"
            height={48}
            sx={{ borderRadius: 2 }}
          />
        </Box>

        <Divider />

        {/* Account details skeleton */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>

          {[...Array(4)].map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
              }}
            >
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  // Enhanced error state - show when we have an error or no data after loading is complete
  if (error || (!loading && !summaryData)) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "error.light",
          background: "background.paper",
        }}
      >
        {/* Error indicator bar */}
        <Box sx={{ height: 4, width: "100%", bgcolor: "error.main" }} />

        <Box sx={{ p: 4, textAlign: "center" }}>
          <Avatar
            sx={{
              bgcolor: "error.light",
              color: "error.main",
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
            }}
          >
            <Person sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography
            variant="h6"
            color="error.main"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {error ? "Unable to Load Customer" : "Customer Not Found"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.5 }}
          >
            {error || "The requested customer data could not be retrieved"}
          </Typography>

          <Box
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
              borderRadius: 2,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              Customer ID: {customerId}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Enhanced data processing - only process when data is available
  const { customerData, contracts = [], collateral = [] } = summaryData || {};

  const { totalDue = 0, nextBillDate = "No active contracts" } =
    financialSummary || {};

  const getStatusFromData = () => {
    if (totalDue > 0) return "warning";
    if (contracts.length === 0) return "inactive";
    return "active";
  };

  const currentStatus = getStatusFromData();

  return (
    <Paper
      elevation={0}
      sx={{
        width: "60%",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        background: "background.paper",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: 4,
        },
      }}
    >
      {/* Enhanced status indicator */}
      <Box
        sx={{
          height: 4,
          width: "100%",
          bgcolor: STATUS_CONFIG[currentStatus]?.color || "primary.main",
        }}
      />

      {/* Header Section */}
      <CustomerAccountHeader
        customerData={customerData}
        currentStatus={currentStatus}
      />

      <Divider />

      {/* Financial Section */}
      <CustomerAccountFinancial
        customerData={customerData}
        totalDue={totalDue}
        nextBillDate={nextBillDate}
      />

      <Divider />

      {/* Additional Info Section */}
      <CustomerAccountAdditionalInfo
        customerData={customerData}
        contracts={contracts}
        collateral={collateral}
      />
    </Paper>
  );
};

export default CustomerAccountSidebar;
