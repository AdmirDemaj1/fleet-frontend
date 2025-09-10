import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  useTheme,
  alpha,
} from "@mui/material";
import { Add, Person } from "@mui/icons-material";
import { EndorserList, EndorserFilters } from "../components";
import { useEndorsers } from "../hooks/useEndorsers";
import { useDeleteEndorserMutation } from "../api/endorserApi";

export const EndorsersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Use the endorsers hook
  const {
    endorsers,
    totalCount,
    isLoading,
    error,
    page,
    rowsPerPage,
    filters,
    refetch,
    handlePageChange,
    handleRowsPerPageChange,
    handleFiltersChange,
  } = useEndorsers();

  // Delete mutation
  const [deleteEndorser] = useDeleteEndorserMutation();

  // Reset page when filters change
  useEffect(() => {
    // This is handled internally by the hook
  }, []);

  const handleDeleteEndorser = async (endorserId: string) => {
    try {
      await deleteEndorser(endorserId).unwrap();
      setNotification({
        open: true,
        message: "Endorser deleted successfully",
        severity: "success",
      });
      refetch(); // Refresh the list
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to delete endorser",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleCreateEndorser = () => {
    navigate("/endorsers/create");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: "50%",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Person
              sx={{
                fontSize: 28,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                lineHeight: 1.2,
              }}
            >
              Endorsers
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              Manage endorsers and their relationships with customers
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateEndorser}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: theme.shadows[2],
            "&:hover": {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          Add Endorser
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => {
            // Handle error dismissal if needed
          }}
        >
          {typeof error === 'object' && 'message' in error 
            ? error.message 
            : "An error occurred while loading endorsers"}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <EndorserFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
        />
      </Box>

      {/* Results Summary */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {isLoading
            ? "Loading endorsers..."
            : `Showing ${endorsers.length} of ${totalCount} endorsers`}
        </Typography>
      </Box>

      {/* Endorsers List */}
      <EndorserList
        endorsers={endorsers}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDeleteEndorser}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
