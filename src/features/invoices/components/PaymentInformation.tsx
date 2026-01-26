import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  useTheme,
  alpha,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Link as MuiLink,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  AttachMoney,
  Schedule,
  ReceiptLong,
  TrendingUp,
  History,
  ExpandMore,
  ExpandLess,
  TrendingDown,
  Info,
  Calculate,
  OpenInNew,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Payment, PaymentStatus } from "../types/invoice.types";

interface PaymentInformationProps {
  payment: Payment;
}

export const PaymentInformation = React.memo<PaymentInformationProps>(({
  payment,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showRecalculationHistory, setShowRecalculationHistory] =
    useState(false);

  const handleToggleRecalculationHistory = useCallback(() => {
    setShowRecalculationHistory(prev => !prev);
  }, []);

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const toNumber = (v: unknown): number => {
    const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : 0;
    return Number.isFinite(n) ? n : 0;
  };

  const totalAmount = toNumber(payment.amount);
  const paidAmount = toNumber((payment as any).paidAmount);
  const remainingDue = Math.max(0, totalAmount - paidAmount);
  const paidInterestAmount = toNumber((payment as any).paidInterestAmount);
  const paidPrincipalAmount = toNumber((payment as any).paidPrincipalAmount);
  const isPartiallyPaid =
    payment.status === PaymentStatus.PARTIALLY_PAID ||
    payment.status === PaymentStatus.PARTIAL ||
    paidAmount > 0;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMMM dd, yyyy");
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMMM dd, yyyy • hh:mm a");
  };

  const getPaymentMethodInfo = (method: string | null) => {
    if (!method) return null;

    switch (method.toLowerCase()) {
      case "credit_card":
        return {
          label: "Credit Card",
          icon: CreditCard,
          color: theme.palette.primary.main,
        };
      case "bank_transfer":
        return {
          label: "Bank Transfer",
          icon: AccountBalance,
          color: theme.palette.info.main,
        };
      case "cash":
        return {
          label: "Cash",
          icon: AttachMoney,
          color: theme.palette.success.main,
        };
      default:
        return {
          label: method.replace("_", " "),
          icon: CreditCard,
          color: theme.palette.text.secondary,
        };
    }
  };

  const paymentMethodInfo = getPaymentMethodInfo(payment.paymentMethod || null);

  console.log("payment notesss", payment.notes);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <ReceiptLong
          sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }}
        />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Payment Information
        </Typography>
      </Box>

      {/* Amount Section */}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
        >
          Payment Amount
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 1 }}
        >
          {formatCurrency(payment.amount)}
        </Typography>
        {isPartiallyPaid && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Paid: {formatCurrency(paidAmount)} • Remaining: {formatCurrency(remainingDue)}
            </Typography>
            {(paidPrincipalAmount > 0 || paidInterestAmount > 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Paid Principal: {formatCurrency(paidPrincipalAmount)} • Paid Interest: {formatCurrency(paidInterestAmount)}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {String(payment.type).replace("_", " ").charAt(0).toUpperCase() +
            String(payment.type).replace("_", " ").slice(1)}{" "}
          Payment
        </Typography>

        {/* Principal and Interest breakdown */}
        {(payment.principalAmount || payment.interestAmount) && (
          <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
            {payment.principalAmount && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Principal Amount
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  {formatCurrency(payment.principalAmount)}
                </Typography>
              </Box>
            )}
            {payment.interestAmount && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Interest Amount
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: theme.palette.warning.main }}
                >
                  {formatCurrency(payment.interestAmount)}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Payment Details Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Due Date
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Schedule
                sx={{ color: theme.palette.warning.main, mr: 1, fontSize: 20 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatDate(payment.dueDate)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Payment Date
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: payment.paymentDate ? "success.main" : "text.secondary",
              }}
            >
              {payment.paymentDate
                ? formatDate(payment.paymentDate)
                : "Not paid yet"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Payment Type
            </Typography>
            <Chip
              label={
                String(payment.type).replace("_", " ").charAt(0).toUpperCase() +
                String(payment.type).replace("_", " ").slice(1)
              }
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Payment Method
            </Typography>
            {paymentMethodInfo ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <paymentMethodInfo.icon
                  sx={{ color: paymentMethodInfo.color, mr: 1, fontSize: 20 }}
                />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {paymentMethodInfo.label}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Not specified
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Additional Information */}
      {(payment.transactionReference || payment.notes) && (
        <>
          <Divider sx={{ my: 3 }} />

          {payment.transactionReference && (
            <Box sx={{ mb: payment.notes ? 3 : 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
              >
                Transaction Reference
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontFamily: "monospace", fontSize: "0.95rem" }}
                >
                  {payment.transactionReference}
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* Recalculation History */}
      {payment.recalculationHistory &&
        payment.recalculationHistory.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                  },
                }}
                onClick={handleToggleRecalculationHistory}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Calculate
                    sx={{ color: theme.palette.warning.main, fontSize: 24 }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Recalculation History
                  </Typography>
                  <Chip
                    label={payment.recalculationHistory.length}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.2),
                      color: theme.palette.warning.dark,
                      fontWeight: 700,
                      height: 24,
                    }}
                  />
                </Box>
                <IconButton size="small">
                  {showRecalculationHistory ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={showRecalculationHistory}>
                <Box sx={{ mt: 2 }}>
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          }}
                        >
                          <TableCell
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <History sx={{ fontSize: 16 }} />
                              Date
                            </Box>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            Caused By
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            <Tooltip title="Amount before recalculation">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                }}
                              >
                                Starting
                                <Info
                                  sx={{ fontSize: 14, color: "text.secondary" }}
                                />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            <Tooltip title="Amount after recalculation">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                }}
                              >
                                Calculated
                                <Info
                                  sx={{ fontSize: 14, color: "text.secondary" }}
                                />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            Change
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            Overpayment
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 700, fontSize: "0.75rem", py: 2 }}
                          >
                            Details
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payment.recalculationHistory.map((entry, index) => {
                          const amountChange =
                            entry.calculatedAmount - entry.startingAmount;
                          const isReduction = amountChange < 0;

                          return (
                            <React.Fragment key={index}>
                              <TableRow
                                sx={{
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.02
                                    ),
                                  },
                                  transition: "background-color 0.2s ease",
                                }}
                              >
                                <TableCell sx={{ py: 2 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                                  >
                                    {formatDateTime(entry.recalculatedAt)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <MuiLink
                                    component="button"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/payments/${entry.causedByPaymentId}`
                                      );
                                    }}
                                    sx={{
                                      textDecoration: "none",
                                      "&:hover": {
                                        textDecoration: "none",
                                      },
                                    }}
                                  >
                                    <Chip
                                      label={
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                          }}
                                        >
                                          Payment #{entry.causedByPaymentNumber}
                                          <OpenInNew sx={{ fontSize: 12 }} />
                                        </Box>
                                      }
                                      size="small"
                                      clickable
                                      sx={{
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.1
                                        ),
                                        color: theme.palette.info.main,
                                        fontWeight: 600,
                                        fontSize: "0.7rem",
                                        height: 24,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          bgcolor: alpha(
                                            theme.palette.info.main,
                                            0.2
                                          ),
                                          transform: "translateY(-1px)",
                                          boxShadow: `0 2px 8px ${alpha(
                                            theme.palette.info.main,
                                            0.3
                                          )}`,
                                        },
                                      }}
                                    />
                                  </MuiLink>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {formatCurrency(entry.startingAmount)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.85rem",
                                      color: isReduction
                                        ? theme.palette.success.main
                                        : theme.palette.primary.main,
                                    }}
                                  >
                                    {formatCurrency(entry.calculatedAmount)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-end",
                                      gap: 0.5,
                                    }}
                                  >
                                    {isReduction ? (
                                      <TrendingDown
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.success.main,
                                        }}
                                      />
                                    ) : (
                                      <TrendingUp
                                        sx={{
                                          fontSize: 16,
                                          color: theme.palette.error.main,
                                        }}
                                      />
                                    )}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "0.85rem",
                                        color: isReduction
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                      }}
                                    >
                                      {isReduction ? "" : "+"}
                                      {formatCurrency(Math.abs(amountChange))}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.85rem",
                                      color: theme.palette.warning.main,
                                    }}
                                  >
                                    {formatCurrency(entry.overpaymentAmount)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip
                                    title={
                                      <Box sx={{ p: 1.5 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 700,
                                            display: "block",
                                            mb: 2,
                                            fontSize: "0.875rem",
                                            color: "#fff",
                                          }}
                                        >
                                          Principal & Interest Breakdown
                                        </Typography>
                                         <Box
                                           sx={{
                                             display: "grid",
                                             gridTemplateColumns: "auto 1fr",
                                             gap: 1.5,
                                             rowGap: 1.5,
                                           }}
                                         >
                                           <Typography
                                             variant="body2"
                                             sx={{
                                               color: "rgba(255, 255, 255, 0.8)",
                                               fontSize: "0.8125rem",
                                               fontWeight: 600,
                                             }}
                                           >
                                             Principal:
                                           </Typography>
                                           <Typography
                                             variant="body2"
                                             sx={{
                                               fontWeight: 600,
                                               color: "#fff",
                                               fontSize: "0.8125rem",
                                             }}
                                           >
                                             {formatCurrency(
                                               entry.startingPrincipalAmount
                                             )}{" "}
                                             →{" "}
                                             {formatCurrency(
                                               entry.calculatedPrincipalAmount
                                             )}
                                           </Typography>
                                           <Typography
                                             variant="body2"
                                             sx={{
                                               color: "rgba(255, 255, 255, 0.8)",
                                               fontSize: "0.8125rem",
                                               fontWeight: 600,
                                             }}
                                           >
                                             Interest:
                                           </Typography>
                                           <Typography
                                             variant="body2"
                                             sx={{
                                               fontWeight: 600,
                                               color: "#fff",
                                               fontSize: "0.8125rem",
                                             }}
                                           >
                                             {formatCurrency(
                                               entry.startingInterestAmount
                                             )}{" "}
                                             →{" "}
                                             {formatCurrency(
                                               entry.calculatedInterestAmount
                                             )}
                                           </Typography>
                                         </Box>
                                      </Box>
                                    }
                                    placement="left"
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          bgcolor: "rgba(33, 33, 33, 0.95)",
                                          "& .MuiTooltip-arrow": {
                                            color: "rgba(33, 33, 33, 0.95)",
                                          },
                                          boxShadow:
                                            "0 8px 32px rgba(0, 0, 0, 0.3)",
                                          borderRadius: 2,
                                          maxWidth: 400,
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(
                                          theme.palette.info.main,
                                          0.1
                                        ),
                                        "&:hover": {
                                          bgcolor: alpha(
                                            theme.palette.info.main,
                                            0.2
                                          ),
                                        },
                                      }}
                                    >
                                      <Info
                                        sx={{
                                          fontSize: 18,
                                          color: theme.palette.info.main,
                                        }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Summary Section */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.info.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.secondary",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Recalculation Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Total Recalculations
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {payment.recalculationHistory.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Original Amount
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(
                            payment.recalculationHistory[0].startingAmount
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          Current Amount
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {formatCurrency(
                            payment.recalculationHistory[
                              payment.recalculationHistory.length - 1
                            ].calculatedAmount
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </>
        )}

      {/* Creation Date */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Created
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(payment.createdAt)}
        </Typography>
      </Box>
    </Paper>
  );
});

PaymentInformation.displayName = 'PaymentInformation';
