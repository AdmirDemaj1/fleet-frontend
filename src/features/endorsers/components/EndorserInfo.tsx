import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Skeleton,
  Alert,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Person,
  Edit,
  Save,
  Cancel,
  AttachMoney,
  Business,
  Phone,
  Email,
  LocationOn,
  Badge,
  CalendarToday,
  Notes,
} from "@mui/icons-material";
import { useEndorser } from "../hooks/useEndorser";
import { EndorserRelationshipsCard } from "./EndorserDetails";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCustomersForEndorserQuery } from "../api/endorserApi";

interface EndorserInfoProps {
  endorserId: string;
}

const EndorserInfo: React.FC<EndorserInfoProps> = ({ endorserId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { endorser, contracts, summary, loading, error, updateEndorser } =
    useEndorser(endorserId);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{ guaranteedAmount: number }>({
    guaranteedAmount: 0,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: relationships = [],
    error: relationshipsError,
    refetch: refetchRelationships,
  } = useGetCustomersForEndorserQuery(id!, {
    skip: !id,
  });

  const handleEdit = () => {
    if (endorser) {
      setEditData({ guaranteedAmount: endorser.guaranteedAmount || 0 });
      setIsEditing(true);
      setUpdateError(null);
      setSuccessMessage(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);

      await updateEndorser({
        guaranteedAmount: editData.guaranteedAmount,
      });

      setIsEditing(false);
      setSuccessMessage("Guaranteed amount updated successfully!");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      // Extract detailed error information
      let errorMessage = "Failed to update guaranteed amount";

      if (err.message) {
        errorMessage = err.message;
      }

      setUpdateError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddRelationship = () => {
    // This is now handled by the AddRelationshipModal in the EndorserRelationshipsCard
    // The onAdd prop just enables the button, the modal handles the actual functionality
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

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  // Enhanced error message parser for better UX
  const parseErrorMessage = (error: string) => {
    // Check if it's a guarantee capacity validation error
    if (
      error.includes("remaining guarantee capacity") &&
      error.includes("Current guaranteed amount:")
    ) {
      const currentAmountMatch = error.match(
        /Current guaranteed amount: (\d+)/
      );
      const remainingCapacityMatch = error.match(
        /current remaining capacity: (\d+)/
      );
      const minimumAmountMatch = error.match(/must be at least (\d+)/);

      return {
        isValidationError: true,
        currentAmount: currentAmountMatch
          ? parseInt(currentAmountMatch[1])
          : null,
        remainingCapacity: remainingCapacityMatch
          ? parseInt(remainingCapacityMatch[1])
          : null,
        minimumRequired: minimumAmountMatch
          ? parseInt(minimumAmountMatch[1])
          : null,
        fullMessage: error,
      };
    }

    return {
      isValidationError: false,
      fullMessage: error,
    };
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
          </Box>
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Box>

        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="80%" height={24} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (error || !endorser) {
    return (
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Endorser not found"}
        </Alert>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Paper>
    );
  }

  const displayName = `${endorser.firstName} ${endorser.lastName}`;
  const initials = `${endorser.firstName.charAt(0)}${endorser.lastName.charAt(
    0
  )}`.toUpperCase();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.02
        )}, ${alpha(theme.palette.background.paper, 1)})`,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "secondary.main",
              fontSize: "1.5rem",
              fontWeight: 700,
              mr: 3,
              boxShadow: 4,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                icon={<Person />}
                label="Endorser"
                color="secondary"
                variant="outlined"
                size="small"
              />
              <Chip
                label={endorser.active ? "Active" : "Inactive"}
                color={endorser.active ? "success" : "error"}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Member since {formatDate(endorser.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{ borderRadius: 2 }}
            >
              Edit Guarantee
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={updateLoading}
                sx={{ borderRadius: 2 }}
              >
                Save
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Success
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              {successMessage}
            </Typography>
          </Box>
        </Alert>
      )}

      {updateError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Unable to Update Guaranteed Amount
            </Typography>

            {(() => {
              const parsedError = parseErrorMessage(updateError);

              if (parsedError.isValidationError) {
                return (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      The requested amount would result in insufficient
                      capacity. Here's the breakdown:
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        p: 2,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <Grid container spacing={2}>
                        {parsedError.currentAmount && (
                          <Grid item xs={12} sm={4}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Current Amount
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(parsedError.currentAmount)}
                            </Typography>
                          </Grid>
                        )}

                        {parsedError.remainingCapacity !== null && (
                          <Grid item xs={12} sm={4}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Available Capacity
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(parsedError.remainingCapacity)}
                            </Typography>
                          </Grid>
                        )}

                        {parsedError.minimumRequired && (
                          <Grid item xs={12} sm={4}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Minimum Required
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="success.main"
                            >
                              {formatCurrency(parsedError.minimumRequired)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          color: "text.secondary",
                          flex: 1,
                        }}
                      >
                        {parsedError.minimumRequired &&
                          `Please enter an amount of at least ${formatCurrency(
                            parsedError.minimumRequired
                          )} to proceed.`}
                      </Typography>

                      {parsedError.minimumRequired && isEditing && (
                        <Button
                          size="small"
                          variant="text"
                          color="success"
                          onClick={() => {
                            setEditData({
                              guaranteedAmount: parsedError.minimumRequired!,
                            });
                            setUpdateError(null);
                          }}
                          sx={{
                            fontSize: "0.75rem",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          Use Minimum (
                          {formatCurrency(parsedError.minimumRequired)})
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              } else {
                return (
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.6, wordBreak: "break-word" }}
                  >
                    {parsedError.fullMessage}
                  </Typography>
                );
              }
            })()}
          </Box>
        </Alert>
      )}

      {/* Financial Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <AttachMoney color="primary" />
          Financial Information
        </Typography>

        <Paper
          elevation={1}
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Guaranteed Amount
              </Typography>
              {isEditing ? (
                <TextField
                  type="number"
                  value={editData.guaranteedAmount}
                  onChange={(e) => {
                    setEditData({ guaranteedAmount: Number(e.target.value) });
                    // Clear errors when user starts typing
                    if (updateError) {
                      setUpdateError(null);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  size="small"
                  fullWidth
                  error={Boolean(updateError && isEditing)}
                  helperText={
                    updateError && isEditing
                      ? "Please check the validation requirements above"
                      : ""
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
              ) : (
                <Typography variant="h5" fontWeight={600} color="primary.main">
                  {formatCurrency(endorser.guaranteedAmount)}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Remaining Capacity
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatCurrency(endorser.remainingGuaranteeCapacity)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Utilization
              </Typography>
              <Typography variant="h5" fontWeight={600} color="success.main">
                {endorser.guaranteedAmount && endorser.guaranteedAmount > 0
                  ? (
                      ((endorser.guaranteedAmount -
                        (endorser.remainingGuaranteeCapacity || 0)) /
                        endorser.guaranteedAmount) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Personal Information */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Person color="primary" />
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Badge sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                ID Number
              </Typography>
            </Box>
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ fontFamily: "monospace" }}
            >
              {endorser.idNumber}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Date of Birth
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(endorser.dateOfBirth)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Business sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Relationship
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {endorser.relationshipToCustomer || "Not specified"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Contact Information */}
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Phone color="primary" />
          Contact Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Primary Phone
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {endorser.phone}
            </Typography>
            {endorser.secondaryPhone && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Secondary: {endorser.secondaryPhone}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Email sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Email Address
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {endorser.email}
            </Typography>
            {endorser.secondaryEmail && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Secondary: {endorser.secondaryEmail}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {endorser.address}
            </Typography>
          </Grid>

          {(endorser.notes || endorser.additionalNotes) && (
            <Grid item xs={12}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Notes sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
              </Box>
              <Typography variant="body1">
                {endorser.notes || endorser.additionalNotes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Contract Summary Section */}
      {summary && (
        <>
          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <AttachMoney color="primary" />
              Guarantee Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {summary.totalContracts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Contracts
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {formatCurrency(summary.totalGuaranteeAmount)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Guaranteed
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    {summary.activeContracts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {summary.draftContracts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Draft
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </>
      )}

      {/* Contracts Table Section */}
      {contracts.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography
              variant="h6"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Business color="primary" />
              Guaranteed Contracts
            </Typography>

            <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Contract
                        </Typography>
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Customer
                        </Typography>
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Status
                        </Typography>
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Total Amount
                        </Typography>
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Guarantee Amount
                        </Typography>
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          End Date
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract, index) => (
                      <tr
                        key={contract.contractId}
                        style={{
                          borderBottom:
                            index < contracts.length - 1
                              ? `1px solid ${theme.palette.divider}`
                              : "none",
                        }}
                      >
                        <td style={{ padding: "12px" }}>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            color="primary.main"
                          >
                            {contract.contractNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.contractType.toUpperCase()}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Typography variant="body2" fontWeight={500}>
                            {contract.customer.legalName ||
                              `${contract.customer.firstName} ${contract.customer.lastName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.customer.type.charAt(0).toUpperCase() +
                              contract.customer.type.slice(1)}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Chip
                            label={
                              contract.contractStatus.charAt(0).toUpperCase() +
                              contract.contractStatus.slice(1)
                            }
                            size="small"
                            color={
                              contract.contractStatus === "active"
                                ? "success"
                                : contract.contractStatus === "draft"
                                ? "warning"
                                : contract.contractStatus === "completed"
                                ? "info"
                                : "default"
                            }
                            variant="outlined"
                          />
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <Typography variant="body2" fontWeight={500}>
                            {formatCurrency(contract.totalAmount)}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.main"
                          >
                            {formatCurrency(contract.guaranteeAmount)}
                          </Typography>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <Typography variant="body2">
                            {formatDate(contract.endDate)}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>
          </Box>
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <Grid item xs={12} lg={4}>
        <EndorserRelationshipsCard
          endorserId={id!}
          relationships={relationships}
          onAdd={handleAddRelationship}
          onEdit={handleEditRelationship}
          onDelete={handleDeleteRelationship}
          onViewCustomer={handleViewCustomer}
          onRefresh={refetchRelationships}
        />
      </Grid>
    </Paper>
  );
};

export default EndorserInfo;
