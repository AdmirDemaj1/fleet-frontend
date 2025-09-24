import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
} from "@mui/material";
import {
  AccountBalance,
  AttachMoney,
  TrendingUp,
  BarChart,
  TableChart,
  Print,
} from "@mui/icons-material";
import { ContractResponse } from "../types/contract.types";

interface PaymentScheduleItem {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface ContractPaymentScheduleProps {
  contract: ContractResponse;
}

export const ContractPaymentSchedule: React.FC<ContractPaymentScheduleProps> = ({
  contract,
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Print function for the payment schedule table
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Schedule - Contract ${contract.id}</title>
          <style>
            @media print {
              @page { margin: 1in; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1976d2;
              margin-bottom: 10px;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-item {
              text-align: center;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .summary-item .label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-item .value {
              font-size: 16px;
              font-weight: bold;
              color: #1976d2;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: right;
            }
            th {
              background-color: #1976d2;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Schedule</h1>
            <p>Contract ID: ${contract.id}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="label">Monthly Payment</div>
              <div class="value">${formatCurrency(summaryStats?.monthlyPayment || 0)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Principal</div>
              <div class="value">${formatCurrency(summaryStats?.totalPrincipal || 0)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Interest</div>
              <div class="value">${formatCurrency(summaryStats?.totalInterest || 0)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Payments</div>
              <div class="value">${formatCurrency(summaryStats?.totalPayments || 0)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Payment</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${paymentSchedule.map(row => `
                <tr>
                  <td style="text-align: center;">${row.period}</td>
                  <td>${formatCurrency(row.payment)}</td>
                  <td>${formatCurrency(row.interest)}</td>
                  <td>${formatCurrency(row.principal)}</td>
                  <td>${formatCurrency(row.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This document was generated automatically. All amounts are in EUR.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Calculate amortization schedule
  const paymentSchedule = useMemo<PaymentScheduleItem[]>(() => {
    const principal = parseFloat(contract.totalAmount || "0");
    
    // Extract rate and term from different contract types or use defaults
    let annualRate = 0.05; // Default 5% annual rate
    let termMonths = 12; // Default 12 months
    
    // Try to get values from contract or calculate from dates
    if (contract.startDate && contract.endDate) {
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth());
      termMonths = monthsDiff > 0 ? monthsDiff : 12;
    }

    // For calculation purposes, use a standard rate if not available
    const monthlyRate = annualRate / 12;

    if (principal <= 0 || termMonths <= 0) {
      return [];
    }

    // Calculate monthly payment using amortization formula
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const schedule: PaymentScheduleItem[] = [];
    let remainingBalance = principal;

    for (let period = 1; period <= termMonths; period++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      schedule.push({
        period,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance,
      });
    }

    return schedule;
  }, [contract.totalAmount, contract.startDate, contract.endDate]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Custom SVG Chart Component
  const CustomChart: React.FC = () => {
    if (paymentSchedule.length === 0) return null;

    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    const maxAmount = Math.max(...paymentSchedule.map(item => item.payment));
    const width = 750;
    const height = 420;
    const paddingLeft = 80;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 60;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Create points for both lines
    const principalPoints = paymentSchedule.map((item, index) => ({
      x: paddingLeft + (index / (paymentSchedule.length - 1)) * chartWidth,
      y: paddingTop + chartHeight - (item.principal / maxAmount) * chartHeight,
    }));

    const interestPoints = paymentSchedule.map((item, index) => ({
      x: paddingLeft + (index / (paymentSchedule.length - 1)) * chartWidth,
      y: paddingTop + chartHeight - (item.interest / maxAmount) * chartHeight,
    }));

    const createPath = (points: { x: number; y: number }[]) => {
      return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `${path} L ${point.x} ${point.y}`;
      }, "");
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <svg width={width} height={height} style={{ overflow: "visible" }}>
            {/* Background elements - Grid, areas, and lines */}
            <g id="background-elements">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <g key={fraction}>
                  <line
                    x1={paddingLeft}
                    y1={paddingTop + fraction * chartHeight}
                    x2={paddingLeft + chartWidth}
                    y2={paddingTop + fraction * chartHeight}
                    stroke={alpha(theme.palette.divider, 0.15)}
                    strokeWidth={1}
                  />
                </g>
              ))}

              {/* Vertical grid lines */}
              {paymentSchedule.filter((_, i) => i % Math.ceil(paymentSchedule.length / 8) === 0).map((item, index) => (
                <line
                  key={`v-grid-${index}`}
                  x1={paddingLeft + (item.period - 1) / (paymentSchedule.length - 1) * chartWidth}
                  y1={paddingTop}
                  x2={paddingLeft + (item.period - 1) / (paymentSchedule.length - 1) * chartWidth}
                  y2={paddingTop + chartHeight}
                  stroke={alpha(theme.palette.divider, 0.1)}
                  strokeWidth={1}
                />
              ))}

              {/* Principal area */}
              <path
                d={`${createPath(principalPoints)} L ${paddingLeft + chartWidth} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`}
                fill={alpha(theme.palette.primary.main, 0.1)}
                stroke="none"
              />

              {/* Interest area */}
              <path
                d={`${createPath(interestPoints)} L ${paddingLeft + chartWidth} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`}
                fill={alpha(theme.palette.info.main, 0.1)}
                stroke="none"
              />

              {/* Principal line */}
              <path
                d={createPath(principalPoints)}
                fill="none"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* Interest line */}
              <path
                d={createPath(interestPoints)}
                fill="none"
                stroke={theme.palette.info.main}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>

            {/* Axis labels - render early but after background */}
            <g id="axis-labels">
              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                <text
                  key={fraction}
                  x={paddingLeft - 10}
                  y={paddingTop + (1 - fraction) * chartHeight + 5}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="500"
                  fill={theme.palette.text.secondary}
                >
                  €{Math.round(fraction * maxAmount).toLocaleString()}
                </text>
              ))}

              {/* X-axis labels */}
              {paymentSchedule.filter((_, i) => i % Math.ceil(paymentSchedule.length / 8) === 0).map((item) => (
                <text
                  key={item.period}
                  x={paddingLeft + (item.period - 1) / (paymentSchedule.length - 1) * chartWidth}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill={theme.palette.text.secondary}
                >
                  {item.period}
                </text>
              ))}

              {/* Axis lines */}
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={paddingLeft}
                y2={paddingTop + chartHeight}
                stroke={theme.palette.divider}
                strokeWidth={2}
              />
              <line
                x1={paddingLeft}
                y1={paddingTop + chartHeight}
                x2={paddingLeft + chartWidth}
                y2={paddingTop + chartHeight}
                stroke={theme.palette.divider}
                strokeWidth={2}
              />
            </g>

            {/* Interactive elements - render on top of everything else */}
            <g id="interactive-elements" style={{ zIndex: 1000 }}>
              {/* Interactive hover areas */}
              {paymentSchedule.map((_, index) => {
                const principalPoint = principalPoints[index];
                const interestPoint = interestPoints[index];
                
                return (
                  <circle
                    key={`hover-area-${index}`}
                    cx={principalPoint.x}
                    cy={Math.min(principalPoint.y, interestPoint.y) - 10}
                    r={15}
                    fill="transparent"
                    style={{ cursor: "default" }}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Connection lines when hovered */}
              {paymentSchedule.map((_, index) => {
                const principalPoint = principalPoints[index];
                const interestPoint = interestPoints[index];
                const isHovered = hoveredPoint === index;
                
                if (!isHovered) return null;
                
                return (
                  <line
                    key={`connection-${index}`}
                    x1={principalPoint.x}
                    y1={principalPoint.y}
                    x2={interestPoint.x}
                    y2={interestPoint.y}
                    stroke={alpha(theme.palette.text.secondary, 0.3)}
                    strokeWidth={1}
                    strokeDasharray="2,2"
                  />
                );
              })}

              {/* Data points */}
              {paymentSchedule.map((_, index) => {
                const principalPoint = principalPoints[index];
                const interestPoint = interestPoints[index];
                const isHovered = hoveredPoint === index;
                
                return (
                  <g key={`points-${index}`}>
                    {/* Principal point */}
                    <circle
                      cx={principalPoint.x}
                      cy={principalPoint.y}
                      r={isHovered ? 6 : 4}
                      fill={theme.palette.primary.main}
                      stroke="white"
                      strokeWidth={2}
                      style={{ 
                        pointerEvents: "none",
                        filter: isHovered ? "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" : "none",
                        transition: "all 0.2s ease"
                      }}
                    />
                    
                    {/* Interest point */}
                    <circle
                      cx={interestPoint.x}
                      cy={interestPoint.y}
                      r={isHovered ? 6 : 4}
                      fill={theme.palette.info.main}
                      stroke="white"
                      strokeWidth={2}
                      style={{ 
                        pointerEvents: "none",
                        filter: isHovered ? "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" : "none",
                        transition: "all 0.2s ease"
                      }}
                    />
                  </g>
                );
              })}
            </g>

            {/* Tooltips - render in separate group to ensure they're on top */}
            <g id="tooltip-layer" style={{ pointerEvents: "none" }}>
              {paymentSchedule.map((item, index) => {
                const principalPoint = principalPoints[index];
                const interestPoint = interestPoints[index];
                const isHovered = hoveredPoint === index;
                
                if (!isHovered) return null;
                
                return (
                  <g key={`tooltip-${index}`}>
                    {(() => {
                      // Smart tooltip positioning to avoid overlap
                      const tooltipWidth = 160;
                      const tooltipHeight = 65;
                      const minY = Math.min(principalPoint.y, interestPoint.y);
                      
                      // Determine horizontal position
                      let tooltipX = principalPoint.x - tooltipWidth / 2;
                      if (tooltipX < paddingLeft) {
                        tooltipX = paddingLeft + 10;
                      } else if (tooltipX + tooltipWidth > paddingLeft + chartWidth) {
                        tooltipX = paddingLeft + chartWidth - tooltipWidth - 10;
                      }
                      
                      // Determine vertical position
                      let tooltipY = minY - tooltipHeight - 15;
                      if (tooltipY < paddingTop) {
                        tooltipY = Math.max(principalPoint.y, interestPoint.y) + 25;
                      }
                      
                      return (
                        <>
                          {/* Tooltip background */}
                          <rect
                            x={tooltipX}
                            y={tooltipY}
                            width={tooltipWidth}
                            height={tooltipHeight}
                            fill={theme.palette.background.paper}
                            stroke={theme.palette.divider}
                            strokeWidth={1}
                            rx={8}
                            style={{ 
                              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))",
                              opacity: 0.98
                            }}
                          />
                          
                          {/* Period label */}
                          <text
                            x={tooltipX + tooltipWidth / 2}
                            y={tooltipY + 16}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill={theme.palette.text.primary}
                          >
                            Payment {item.period}
                          </text>
                          
                          {/* Principal amount */}
                          <text
                            x={tooltipX + tooltipWidth / 2}
                            y={tooltipY + 30}
                            textAnchor="middle"
                            fontSize="10"
                            fill={theme.palette.primary.main}
                            fontWeight="600"
                          >
                            Principal: €{Math.round(item.principal).toLocaleString()}
                          </text>
                          
                          {/* Interest amount */}
                          <text
                            x={tooltipX + tooltipWidth / 2}
                            y={tooltipY + 42}
                            textAnchor="middle"
                            fontSize="10"
                            fill={theme.palette.info.main}
                            fontWeight="600"
                          >
                            Interest: €{Math.round(item.interest).toLocaleString()}
                          </text>
                          
                          {/* Total payment */}
                          <text
                            x={tooltipX + tooltipWidth / 2}
                            y={tooltipY + 56}
                            textAnchor="middle"
                            fontSize="9"
                            fill={theme.palette.text.secondary}
                            fontWeight="500"
                          >
                            Total: €{Math.round(item.payment).toLocaleString()}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                );
              })}
            </g>
          </svg>


        </Box>

        {/* Interactive Instructions */}
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 500
          }}
        >
          Hover over data points to see payment details
        </Typography>
      </Box>
    );
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (paymentSchedule.length === 0) return null;

    const totalPayments = paymentSchedule.reduce((sum, item) => sum + item.payment, 0);
    const totalInterest = paymentSchedule.reduce((sum, item) => sum + item.interest, 0);
    const totalPrincipal = paymentSchedule.reduce((sum, item) => sum + item.principal, 0);

    return {
      totalPayments,
      totalInterest,
      totalPrincipal,
      monthlyPayment: paymentSchedule[0]?.payment || 0,
    };
  }, [paymentSchedule]);

  if (!summaryStats) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.background.paper,
          textAlign: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Unable to calculate payment schedule. Please ensure contract has valid financial data.
        </Typography>
      </Paper>
    );
  }

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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            <AccountBalance />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Payment Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amortization breakdown and payment details
            </Typography>
          </Box>
        </Box>

        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="chart" aria-label="chart view">
            <BarChart sx={{ fontSize: 18, mr: 1 }} />
            Chart
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <TableChart sx={{ fontSize: 18, mr: 1 }} />
            Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <AttachMoney sx={{ fontSize: 14, mr: 1, color: "primary.main" }} />
              Monthly Payment
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              {formatCurrency(summaryStats.monthlyPayment)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <TrendingUp sx={{ fontSize: 14, mr: 1, color: "success.main" }} />
              Total Principal
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
              {formatCurrency(summaryStats.totalPrincipal)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignments: "center", mb: 1 }}
            >
              <BarChart sx={{ fontSize: 14, mr: 1, color: "info.main" }} />
              Total Interest
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "info.main" }}>
              {formatCurrency(summaryStats.totalInterest)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <AccountBalance sx={{ fontSize: 14, mr: 1, color: "warning.main" }} />
              Total Payments
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.main" }}>
              {formatCurrency(summaryStats.totalPayments)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Chart View */}
      {viewMode === "chart" && (
        <Box
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
            Principal vs Interest Over Time
          </Typography>
          
          {/* Legend */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 3,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Principal
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 3,
                  bgcolor: theme.palette.info.main,
                  borderRadius: 1,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Interest
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            height: 520, 
            width: "100%", 
            maxWidth: "100%",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            overflow: "visible",
            position: "relative"
          }}>
            <Box sx={{ 
              width: "100%", 
              maxWidth: 700,
              display: "flex", 
              justifyContent: "center" 
            }}>
              <CustomChart />
            </Box>
          </Box>
        </Box>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Box
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Payment Schedule Details
              </Typography>
              <IconButton
                onClick={handlePrint}
                color="primary"
                size="small"
                sx={{ 
                  border: 1, 
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <Print />
              </IconButton>
            </Box>
          </Box>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                    }}
                  >
                    Period
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                    }}
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                    }}
                  >
                    Interest
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                    }}
                  >
                    Principal
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      bgcolor: theme.palette.background.paper,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                    }}
                  >
                    Balance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentSchedule.map((row) => (
                  <TableRow
                    key={row.period}
                    sx={{
                      "&:nth-of-type(odd)": {
                        bgcolor: alpha(theme.palette.action.hover, 0.02),
                      },
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "primary.main",
                      }}
                    >
                      {row.period}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(row.payment)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 500,
                        color: "info.main",
                      }}
                    >
                      {formatCurrency(row.interest)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 500,
                        color: "success.main",
                      }}
                    >
                      {formatCurrency(row.principal)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 500,
                        color: row.balance === 0 ? "success.main" : "text.primary",
                      }}
                    >
                      {formatCurrency(row.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
};