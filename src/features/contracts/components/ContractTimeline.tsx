import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Timeline,
  CalendarToday,
  EventNote,
  Schedule,
  History,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ContractResponse } from "../types/contract.types";
import { useGetCurrentPaymentsByContractQuery } from "../../invoices/api/paymentsApi";
import { PaymentType } from "../../invoices/types/invoice.types";
import dayjs from "dayjs";

interface ContractTimelineProps {
  contract: ContractResponse;
}

export const ContractTimeline: React.FC<ContractTimelineProps> = ({
  contract,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch payment data for this contract - filter for scheduled payments only
  // Using getCurrentPaymentsByContract which supports type filter on the /current endpoint
  // RTK Query handles caching automatically - no need for refetchOnMountOrArgChange
  const { data: allPayments = [] } = useGetCurrentPaymentsByContractQuery({
    contractId: contract.id,
    type: PaymentType.SCHEDULED, // Only get scheduled payments
  });

  // Filter to only include scheduled payments with a paymentNumber
  // This is a strict filter to ensure we only show scheduled payments with payment numbers
  const payments = React.useMemo(() => {
    const filtered = allPayments.filter(
      (payment: any) => {
        // Must be scheduled type (case-insensitive check)
        const isScheduled = payment.type?.toLowerCase() === 'scheduled';
        // Must have a valid paymentNumber (not null, not undefined, and is a number)
        const hasPaymentNumber = 
          payment.paymentNumber !== null && 
          payment.paymentNumber !== undefined &&
          typeof payment.paymentNumber === 'number';
        
        return isScheduled && hasPaymentNumber;
      }
    );
    
    // Debug logging
    console.log('ContractTimeline - All payments from API:', allPayments.length);
    console.log('ContractTimeline - Filtered scheduled payments with paymentNumber:', filtered.length);
    if (allPayments.length > 0) {
      console.log('ContractTimeline - Payment types:', [...new Set(allPayments.map((p: any) => p.type))]);
      console.log('ContractTimeline - Payments with paymentNumber:', allPayments.filter((p: any) => p.paymentNumber !== null && p.paymentNumber !== undefined).length);
    }
    
    return filtered;
  }, [allPayments]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  // Create a map of payment statuses by month
  const getPaymentStatusByMonth = () => {
    const startDate = dayjs(contract.startDate);
    const endDate = dayjs(contract.endDate);
    const totalMonths = endDate.diff(startDate, "month") + 1; // Include the end month
    const monthlyStatuses = [];
    const currentDate = dayjs();
    
    // Sort payments by paymentNumber for accurate matching
    const sortedPayments = [...payments]
      .filter((p: any) => p.paymentNumber !== null && p.paymentNumber !== undefined)
      .sort((a, b) => {
        // First sort by paymentNumber
        if (a.paymentNumber !== b.paymentNumber) {
          return (a.paymentNumber || 0) - (b.paymentNumber || 0);
        }
        // If paymentNumber is the same, sort by due date
        return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
      });

    for (let i = 0; i < totalMonths; i++) {
      const monthDate = startDate.add(i, "month");

      // Match payment by paymentNumber (paymentNumber 1 = first month, etc.)
      // If multiple payments have the same paymentNumber (due to recalculations),
      // prefer the one that matches the month date
      const paymentsWithNumber = sortedPayments.filter((payment: any) => 
        payment.paymentNumber === i + 1
      );
      
      let monthPayment = paymentsWithNumber.find((payment: any) => {
        const paymentDue = dayjs(payment.dueDate);
        return (
          paymentDue.year() === monthDate.year() &&
          paymentDue.month() === monthDate.month()
        );
      });
      
      // If no date match, use the first payment with this paymentNumber
      if (!monthPayment && paymentsWithNumber.length > 0) {
        monthPayment = paymentsWithNumber[0];
      }
      
      // Fallback: If no match by paymentNumber, try date-based matching
      if (!monthPayment) {
        monthPayment = sortedPayments.find((payment: any) => {
          const paymentDue = dayjs(payment.dueDate);
          return (
            paymentDue.year() === monthDate.year() &&
            paymentDue.month() === monthDate.month()
          );
        });
      }
      


      let status = "pending"; // Default for months without payments

      if (monthPayment) {
        // Use the actual payment status
        status = monthPayment.status;

        // Override with overdue if payment is past due and not paid
        if (
          status !== "paid" &&
          dayjs(monthPayment.dueDate).isBefore(currentDate, "day")
        ) {
          status = "overdue";
        }
        
      } else {
        // For months without payments, determine status based on timing
        if (monthDate.isAfter(currentDate, "month")) {
          status = "scheduled"; // Future months without payments
        } else if (monthDate.isSame(currentDate, "month")) {
          status = "pending"; // Current month without payment
        } else {
          // Past months without payments - likely missed
          status = "pending";
        }
        
      }

      monthlyStatuses.push({
        month: monthDate,
        payment: monthPayment,
        status: status,
      });
    }

    return monthlyStatuses;
  };

  const monthlyStatuses = getPaymentStatusByMonth();

  // Calculate actual payment status counts from real payments
  const actualPaymentCounts = {
    paid: payments.filter((p) => p.status === "paid").length,
    pending: payments.filter((p) => p.status === "pending").length,
    overdue: payments.filter((p) => {
      const currentDate = dayjs();
      return (
        p.status !== "paid" && dayjs(p.dueDate).isBefore(currentDate, "day")
      );
    }).length,
    total: payments.length,
  };

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
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: "info.main",
            mr: 2,
            width: 48,
            height: 48,
          }}
        >
          <Timeline />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Contract Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Key dates and milestones
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <CalendarToday
                sx={{ fontSize: 14, mr: 1, color: "success.main" }}
              />
              Start Date
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.startDate)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <EventNote sx={{ fontSize: 14, mr: 1, color: "warning.main" }} />
              End Date
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.endDate)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Schedule sx={{ fontSize: 14, mr: 1, color: "info.main" }} />
              Created
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.createdAt)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <History sx={{ fontSize: 14, mr: 1, color: "secondary.main" }} />
              Last Updated
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDate(contract.updatedAt)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Payment Timeline
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "info.main" }}
          >
            {actualPaymentCounts.total} payments total
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {actualPaymentCounts.paid} paid
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {actualPaymentCounts.pending} pending
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {actualPaymentCounts.overdue} overdue
          </Typography>
          {/* {actualPaymentCounts.scheduled > 0 && (
            <Typography variant="body2" color="text.secondary">
              • {actualPaymentCounts.scheduled} scheduled
            </Typography>
          )} */}
        </Box>

        {/* Payment Status Progress Bar */}
        <Box sx={{ flex: 1, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              height: 12,
              borderRadius: 6,
              overflow: "hidden",
              bgcolor: alpha(theme.palette.grey[500], 0.1),
            }}
          >
            {monthlyStatuses.map((monthStatus, index) => {
              let segmentColor;
              let statusLabel = monthStatus.status;

              switch (monthStatus.status) {
                case "paid":
                  segmentColor = theme.palette.success.main; // Paid - green
                  break;
                case "overdue":
                  segmentColor = theme.palette.error.main; // Overdue - red
                  break;
                case "pending":
                  segmentColor = theme.palette.warning.main; // Pending - orange
                  break;
                case "scheduled":
                  segmentColor = alpha(theme.palette.info.main, 0.4); // Scheduled - light blue
                  break;
                default:
                  segmentColor = alpha(theme.palette.grey[500], 0.3); // Default - grey
                  break;
              }

              // Format currency helper
              const formatCurrency = (
                amount: string | number | undefined
              ): string => {
                if (!amount) return "N/A";
                const numAmount =
                  typeof amount === "string" ? parseFloat(amount) : amount;
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(numAmount);
              };

              // Handle click to navigate to payment/invoice
              const handleSegmentClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (monthStatus.payment?.id) {
                  // Navigate to the specific payment/invoice page
                  navigate(`/payments/${monthStatus.payment.id}`);
                } else {
                  // If no payment exists, navigate to payments page filtered by this contract
                  navigate(
                    `/payments?contractId=${
                      contract.id
                    }&month=${monthStatus.month.format("YYYY-MM")}`
                  );
                }
              };

              // Create detailed tooltip content
              const tooltipContent = (
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {monthStatus.month.format("MMMM YYYY")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Status:{" "}
                    <strong style={{ textTransform: "capitalize" }}>
                      {statusLabel}
                    </strong>
                  </Typography>
                  {monthStatus.payment && (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Amount:{" "}
                        <strong>
                          {formatCurrency(monthStatus.payment.amount)}
                        </strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Due:{" "}
                        <strong>
                          {dayjs(monthStatus.payment.dueDate).format(
                            "MMM DD, YYYY"
                          )}
                        </strong>
                      </Typography>
                      {monthStatus.payment.paymentDate && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Paid:{" "}
                          <strong>
                            {dayjs(monthStatus.payment.paymentDate).format(
                              "MMM DD, YYYY"
                            )}
                          </strong>
                        </Typography>
                      )}
                      {monthStatus.payment.notes && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Notes: <strong>{monthStatus.payment.notes}</strong>
                        </Typography>
                      )}
                    </>
                  )}
                  {!monthStatus.payment && (
                    <Typography variant="body2" color="text.secondary">
                      No payment data available
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      display: "block",
                      fontStyle: "italic",
                      color: "primary.main",
                    }}
                  >
                    Click to view{" "}
                    {monthStatus.payment ? "payment details" : "payments page"}
                  </Typography>
                </Box>
              );

              return (
                <Tooltip
                  key={index}
                  title={tooltipContent}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "background.paper",
                        color: "text.primary",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.2
                        )}`,
                        borderRadius: 2,
                        boxShadow: theme.shadows[8],
                        maxWidth: 300,
                        "& .MuiTooltip-arrow": {
                          color: "background.paper",
                          "&::before": {
                            border: `1px solid ${alpha(
                              theme.palette.divider,
                              0.2
                            )}`,
                          },
                        },
                      },
                    },
                  }}
                >
                  <Box
                    onClick={handleSegmentClick}
                    sx={{
                      flex: 1,
                      height: "100%",
                      bgcolor: segmentColor,
                      borderRight:
                        index < monthlyStatuses.length - 1
                          ? `1px solid ${theme.palette.background.paper}`
                          : "none",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                        transform: "scaleY(1.3)",
                        zIndex: 1,
                        position: "relative",
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>

          {/* Legend */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: theme.palette.success.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Paid
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: theme.palette.warning.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: theme.palette.error.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Overdue
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: alpha(theme.palette.info.main, 0.4),
                  borderRadius: 1,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Scheduled
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
