import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Button,
  Stack,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Link,
} from "@mui/material";
import {
  Person,
  DirectionsCar,
  Security,
  Analytics,
  TrendingUp,
  FileDownload,
  Visibility,
  Close,
  Paid,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ContractResponse, ContractStatus, ContractType } from "../types/contract.types";
import { UpdateEuriborRateDialog } from "./UpdateEuriborRateDialog";
import {
  useExportAmortizationScheduleMutation,
  useGetAmortizationScheduleQuery,
} from "../api/contractApi";
import { useNotification } from "../../../shared/hooks/useNotification";
import dayjs from "dayjs";
import { EarlyPayoffDialog } from "./EarlyPayoffDialog";

interface ContractQuickActionsProps {
  contractId: string;
  customerId: string;
  contract?: ContractResponse;
}

export const ContractQuickActions = React.memo<ContractQuickActionsProps>(({
  contractId,
  customerId,
  contract,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [euriborDialogOpen, setEuriborDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [payoffDialogOpen, setPayoffDialogOpen] = useState(false);
  const [exportAmortizationSchedule, { isLoading: isExporting }] =
    useExportAmortizationScheduleMutation();

  // Query for amortization schedule (only when preview dialog is open)
  const {
    data: amortizationData,
    isLoading: isPreviewing,
    error: previewError,
  } = useGetAmortizationScheduleQuery(
    { contractId, grouped: false },
    { skip: !previewDialogOpen }
  );

  // Extract current Euribor rate and margin from contract
  // These might be in loanDetails or leasingDetails, or at the contract level
  const contractData = contract as any;
  const currentEuriborRate =
    contractData?.loanDetails?.euriborRate ||
    contractData?.leasingDetails?.euriborRate ||
    contractData?.euriborRate;
  const currentMargin =
    contractData?.loanDetails?.margin ||
    contractData?.leasingDetails?.margin ||
    contractData?.margin;

  const handleExportAmortizationSchedule = async () => {
    try {
      const blob = await exportAmortizationSchedule({
        contractId,
        // versionId is optional - omit it to get the latest/active version
      }).unwrap();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Try to get filename from Content-Disposition header, or use default
      // Note: RTK Query might not expose headers directly, so we'll use a default name
      const contractNumber = contract?.contractNumber || contractId;
      const date = new Date().toISOString().split("T")[0];
      a.download = `Amortization_Plan_${contractNumber}_${date}.xlsx`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess("Amortization schedule exported successfully");
    } catch (error: any) {
      console.error("Error exporting amortization schedule:", error);
      showError(
        error?.data?.message ||
          error?.message ||
          "Failed to export amortization schedule. Please try again."
      );
    }
  };

  const handlePreviewAmortizationSchedule = () => {
    setPreviewDialogOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  // Debug: Log contract vehicles
  useEffect(() => {
    if (contract) {
      console.log("Contract vehicles:", contract.vehicles);
      console.log("Full contract:", contract);
    }
  }, [contract]);

  const isLoan = contract?.type === ContractType.LOAN;
  const isActiveContract = contract?.status === ContractStatus.ACTIVE;
  const isCompletedContract = contract?.status === ContractStatus.COMPLETED;

  const canPayoff = Boolean(contract) && isLoan && isActiveContract;
  const canUpdateEuribor = Boolean(contract) && !isCompletedContract;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Quick Actions
      </Typography>

      <Stack spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Person />}
          onClick={() => navigate(`/customers/${customerId}`)}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          View Customer Profile
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Security />}
          onClick={() => navigate(`/contracts/${contractId}/collaterals`)}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "warning.main",
              bgcolor: alpha(theme.palette.warning.main, 0.05),
            },
          }}
        >
          Collateral Information
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Analytics />}
          onClick={() => navigate(`/contracts/${contractId}/analytics`)}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "secondary.main",
              bgcolor: alpha(theme.palette.secondary.main, 0.05),
            },
          }}
        >
          Performance Analytics
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<TrendingUp />}
          onClick={() => {
            if (!canUpdateEuribor) return;
            setEuriborDialogOpen(true);
          }}
          disabled={!canUpdateEuribor}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "info.main",
              bgcolor: alpha(theme.palette.info.main, 0.05),
            },
          }}
        >
          Update Euribor Rate
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={
            isPreviewing ? <CircularProgress size={16} /> : <Visibility />
          }
          onClick={handlePreviewAmortizationSchedule}
          disabled={isPreviewing || isExporting}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "info.main",
              bgcolor: alpha(theme.palette.info.main, 0.05),
            },
          }}
        >
          {isPreviewing ? "Loading..." : "Preview Amortization Schedule"}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={
            isExporting ? <CircularProgress size={16} /> : <FileDownload />
          }
          onClick={handleExportAmortizationSchedule}
          disabled={isExporting || isPreviewing}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "success.main",
              bgcolor: alpha(theme.palette.success.main, 0.05),
            },
          }}
        >
          {isExporting ? "Exporting..." : "Export Latest Amortization Schedule"}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Paid />}
          onClick={() => setPayoffDialogOpen(true)}
          disabled={!canPayoff}
          sx={{
            justifyContent: "flex-start",
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: "error.main",
              bgcolor: alpha(theme.palette.error.main, 0.05),
            },
          }}
        >
          PayOff
        </Button>
      </Stack>

      {/* Contract Vehicles Section */}
      {contract && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Contract Vehicles
          </Typography>
          {contract.vehicles && Array.isArray(contract.vehicles) && contract.vehicles.length > 0 ? (
            <Stack spacing={1.5}>
              {contract.vehicles.map((vehicle) => (
              <Box
                key={vehicle.id}
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <DirectionsCar
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: 20,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vehicles/${vehicle.id}`);
                      }}
                      sx={{
                        fontWeight: 600,
                        textDecoration: "none",
                        color: theme.palette.text.primary,
                        "&:hover": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {vehicle.name}
                    </Link>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 0.5 }}
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {vehicle.licensePlate}
                      </Typography>
                      {vehicle.year && (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            •
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {vehicle.year}
                          </Typography>
                        </>
                      )}
                      {vehicle.status && (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            •
                          </Typography>
                          <Chip
                            label={vehicle.status}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 500,
                            }}
                          />
                        </>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No vehicles assigned to this contract.
            </Typography>
          )}
        </>
      )}

      <UpdateEuriborRateDialog
        open={euriborDialogOpen}
        onClose={() => setEuriborDialogOpen(false)}
        contractId={contractId}
        currentEuriborRate={currentEuriborRate}
        currentMargin={currentMargin}
      />

      <EarlyPayoffDialog
        open={payoffDialogOpen}
        onClose={() => setPayoffDialogOpen(false)}
        contractId={contractId}
        contract={contract}
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreview}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Amortization Schedule Preview
            </Typography>
            {amortizationData?.data && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Version {amortizationData.data.versionNumber}
                {amortizationData.data.monthlyPaymentAmount &&
                  ` • Monthly Payment: ${formatCurrency(
                    amortizationData.data.monthlyPaymentAmount
                  )}`}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleClosePreview}
            size="small"
            sx={{
              color: "text.secondary",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {isPreviewing ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              Failed to load amortization schedule. Please try again.
            </Alert>
          ) : amortizationData?.data?.schedule ? (
            <TableContainer sx={{ maxHeight: "70vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment #</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Beginning Balance</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Payment</TableCell>
                    <TableCell align="right">Ending Balance</TableCell>
                    <TableCell align="right">Paid Amount</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {amortizationData.data.schedule.map((entry) => (
                    <TableRow key={entry.paymentNumber} hover>
                      <TableCell>{entry.paymentNumber}</TableCell>
                      <TableCell>{formatDate(entry.month)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(entry.beginningBalance)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(entry.monthlyInterestAmount)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(entry.principalRepayment)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(entry.monthlyMortgagePayment)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(entry.endingBalance)}
                      </TableCell>
                      <TableCell align="right">
                        {entry.paidAmount !== undefined && entry.paidAmount !== null
                          ? formatCurrency(entry.paidAmount)
                          : "-"}
                      </TableCell>
                      <TableCell>{formatDate(entry.paymentDate)}</TableCell>
                      <TableCell>
                        {entry.poStatus ? (
                          <Chip
                            label={entry.poStatus}
                            size="small"
                            color={
                              entry.poStatus === "PO" ? "success" : "default"
                            }
                          />
                        ) : (
                          (() => {
                            const due = Number(entry.monthlyMortgagePayment) || 0;
                            const paid = Number(entry.paidAmount) || 0;
                            if (paid > 0 && paid < due) {
                              return (
                                <Chip
                                  label="Partially Paid"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              );
                            }
                            if (paid >= due && due > 0) {
                              return (
                                <Chip
                                  label="Paid"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              );
                            }
                            return (
                              <Chip
                                label="Pending"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            );
                          })()
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ m: 2 }}>
              No amortization schedule data available.
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
});

ContractQuickActions.displayName = 'ContractQuickActions';
