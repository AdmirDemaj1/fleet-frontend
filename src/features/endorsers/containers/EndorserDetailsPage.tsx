import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Alert,
  Snackbar,
  Skeleton,
  Grid,
  Breadcrumbs,
  Link,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  NavigateNext,
} from "@mui/icons-material";
import { EndorserDetailsCard, EndorserRelationshipsCard } from "../components/EndorserDetails";
import { 
  useGetEndorserQuery, 
  useDeleteEndorserMutation
} from "../api/endorserApi";

export const EndorserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  // Fetch endorser data
  const {
    data: endorser,
    isLoading: endorserLoading,
    error: endorserError,
  } = useGetEndorserQuery(id!, {
    skip: !id,
  });

  // Fetch endorser relationships - TODO: Implement proper endorser relationship filtering
  // const {
  //   data: relationshipsData,
  //   isLoading: relationshipsLoading,
  //   error: relationshipsError,
  // } = useGetEndorserRelationshipsQuery({
  //   limit: 100,
  // }, {
  //   skip: !id,
  // });

  // For now, use empty relationships until API is properly implemented
  const relationshipsData = { relationships: [] };
  const relationshipsError = null;

  // Delete mutation
  const [deleteEndorser] = useDeleteEndorserMutation();

  const handleBack = () => {
    navigate("/endorsers");
  };

  const handleEdit = () => {
    navigate(`/endorsers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !endorser) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${endorser.firstName} ${endorser.lastName}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteEndorser(id).unwrap();
        setNotification({
          open: true,
          message: "Endorser deleted successfully",
          severity: "success",
        });
        // Navigate back to endorsers list after successful deletion
        setTimeout(() => navigate("/endorsers"), 1500);
      } catch (error) {
        setNotification({
          open: true,
          message: "Failed to delete endorser",
          severity: "error",
        });
      }
    }
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleAddRelationship = () => {
    // TODO: Implement add relationship functionality
    setNotification({
      open: true,
      message: "Add relationship functionality coming soon",
      severity: "info",
    });
  };

  const handleEditRelationship = () => {
    // TODO: Implement edit relationship functionality
    setNotification({
      open: true,
      message: "Edit relationship functionality coming soon",
      severity: "info",
    });
  };

  const handleDeleteRelationship = () => {
    // TODO: Implement delete relationship functionality
    setNotification({
      open: true,
      message: "Delete relationship functionality coming soon",
      severity: "info",
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Loading state
  if (endorserLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (endorserError || !endorser) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back to Endorsers
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {endorserError && typeof endorserError === 'object' && 'message' in endorserError
            ? endorserError.message
            : "Failed to load endorser details. The endorser may not exist or there was a network error."}
        </Alert>
      </Container>
    );
  }

  const relationships = relationshipsData?.relationships || [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 2 }}
        aria-label="breadcrumb"
      >
        <Link
          component="button"
          variant="body2"
          onClick={handleBack}
          sx={{
            color: theme.palette.text.secondary,
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Endorsers
        </Link>
        <Typography variant="body2" color="textPrimary">
          {endorser.firstName} {endorser.lastName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ArrowBack />
          </IconButton>
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
              {endorser.firstName} {endorser.lastName}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              Endorser Details and Relationships
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Main Details */}
        <Grid item xs={12} lg={8}>
          <EndorserDetailsCard endorser={endorser} />
        </Grid>

        {/* Relationships */}
        <Grid item xs={12} lg={4}>
          <EndorserRelationshipsCard
            relationships={relationships}
            onAdd={handleAddRelationship}
            onEdit={handleEditRelationship}
            onDelete={handleDeleteRelationship}
            onViewCustomer={handleViewCustomer}
          />
        </Grid>
      </Grid>

      {/* Error Alert for Relationships */}
      {relationshipsError && (
        <Alert
          severity="warning"
          sx={{ mt: 3, borderRadius: 2 }}
        >
          Unable to load relationships. Please refresh the page to try again.
        </Alert>
      )}

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
