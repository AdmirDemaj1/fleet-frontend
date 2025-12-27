import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
} from "@mui/material";
import {
  Refresh,
  TrendingUp,
  TrendingFlat,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import dayjs from "dayjs";

import { euriborApi } from "../api/euriborApi";
import { EuriborRate, EuriborTenor } from "../types/euribor.types";
import {
  getTenorDisplayName,
  getTenorColor,
  formatRateAsPercentage,
  getRateSourceDisplayName,
  getRateStatus,
  getRateStatusColor,
  isRateFromToday,
} from "../utils/euriborUtils";

interface CurrentRatesWidgetProps {
  showHeader?: boolean;
  compact?: boolean;
  onRateClick?: (rate: EuriborRate) => void;
}

export const CurrentRatesWidget: React.FC<CurrentRatesWidgetProps> = ({
  showHeader = true,
  compact = false,
  onRateClick,
}) => {
  const theme = useTheme();

  const [rates, setRates] = useState<Record<string, EuriborRate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch current rates
  const fetchCurrentRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentRates = await euriborApi.getCurrentRates();
      setRates(currentRates);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch current rates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load current rates"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCurrentRates();
  }, []);

  // Get rate status icon based on date
  const getRateStatusIcon = (rateDate: string) => {
    const status = getRateStatus(rateDate);
    const iconProps = { fontSize: 16 } as const;

    switch (status) {
      case "current":
        return <CheckCircle sx={{ ...iconProps, color: "success.main" }} />;
      case "recent":
        return <Warning sx={{ ...iconProps, color: "warning.main" }} />;
      case "outdated":
        return <ErrorIcon sx={{ ...iconProps, color: "error.main" }} />;
      default:
        return <TrendingFlat sx={{ ...iconProps, color: "text.secondary" }} />;
    }
  };

  // Get status message for tooltip
  const getStatusMessage = (rateDate: string) => {
    const status = getRateStatus(rateDate);
    const dateFormatted = dayjs(rateDate).format("MMM DD, YYYY");

    switch (status) {
      case "current":
        return `✅ Current rate (${dateFormatted})`;
      case "recent":
        return `⚠️ Rate from ${dateFormatted} - Consider updating`;
      case "outdated":
        return `❌ Outdated rate from ${dateFormatted} - Needs update`;
      default:
        return `Rate from ${dateFormatted}`;
    }
  };

  // Check if today's 12M rate is missing
  const is12MRateMissing = (): boolean => {
    const tenor = EuriborTenor.TWELVE_MONTHS;
    const tenorKey = tenor as string;
    const rateData = rates[tenorKey] || rates[tenor];
    return !rateData || !isRateFromToday(rateData.rateDate);
  };

  // Render rate card
  const renderRateCard = (tenor: EuriborTenor, rate: EuriborRate | null) => {
    const tenorKey = tenor as string;
    const rateData = rate || rates[tenorKey] || rates[tenor];
    const hasError = rateData ? !isRateFromToday(rateData.rateDate) : true;
    const statusColor = rateData
      ? getRateStatusColor(rateData.rateDate)
      : "error";

    return (
      <Grid item xs={12} sm={compact ? 12 : 6} md={compact ? 6 : 4} key={tenor}>
        <Card
          elevation={0}
          sx={{
            border: "2px solid",
            borderColor: rateData
              ? hasError
                ? statusColor === 'error' ? theme.palette.error.main :
                  statusColor === 'warning' ? theme.palette.warning.main :
                  statusColor === 'success' ? theme.palette.success.main : 
                  alpha(theme.palette.divider, 0.5)
                : alpha(theme.palette.divider, 0.5)
              : theme.palette.error.main,
            borderRadius: 2,
            cursor: onRateClick && rateData ? "pointer" : "default",
            transition: "all 0.2s ease",
            backgroundColor: hasError
              ? alpha(
                  statusColor === 'error' ? theme.palette.error.main :
                  statusColor === 'warning' ? theme.palette.warning.main :
                  statusColor === 'success' ? theme.palette.success.main : 
                  theme.palette.info.main,
                  0.02
                )
              : "background.paper",
            "&:hover":
              onRateClick && rateData
                ? {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2],
                    transform: "translateY(-2px)",
                  }
                : {},
          }}
          onClick={() => onRateClick && rateData && onRateClick(rateData)}
        >
          <CardContent sx={{ p: compact ? 2 : 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Chip
                label={getTenorDisplayName(tenor)}
                size="small"
                color={getTenorColor(tenor) as any}
                variant="outlined"
                sx={{ fontSize: compact ? "0.65rem" : "0.75rem" }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {rateData ? (
                  <Tooltip title={getStatusMessage(rateData.rateDate)} arrow>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getRateStatusIcon(rateData.rateDate)}
                    </Box>
                  </Tooltip>
                ) : (
                  <Tooltip title="❌ No rate available - needs to be set" arrow>
                    <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                  </Tooltip>
                )}
              </Box>
            </Box>

            {loading ? (
              <Box>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={compact ? 24 : 32}
                />
                <Skeleton variant="text" width="80%" height={16} />
              </Box>
            ) : rateData ? (
              <Box>
                <Typography
                  variant={compact ? "h6" : "h5"}
                  sx={{ fontWeight: 700, color: "primary.main", mb: 0.5 }}
                >
                  {formatRateAsPercentage(rateData.rateValue)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  As of {dayjs(rateData.rateDate).format("MMM DD, YYYY")}
                </Typography>
                {!compact && rateData.rateSource && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Source: {getRateSourceDisplayName(rateData.rateSource)}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No rate available
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rate not set for this tenor
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Card elevation={1}>
      {showHeader && (
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6">Current 12-Month Euribor Rate</Typography>
              {!loading && is12MRateMissing() && (
                <Tooltip
                  title="Rate needs updating for today"
                  arrow
                >
                  <Warning sx={{ color: "error.main" }} />
                </Tooltip>
              )}
            </Box>
          }
          subheader={
            lastUpdated
              ? `Last updated: ${dayjs(lastUpdated).format(
                  "MMM DD, YYYY HH:mm"
                )}`
              : undefined
          }
          action={
            <Tooltip title="Refresh rates">
              <IconButton
                onClick={fetchCurrentRates}
                disabled={loading}
                size="small"
              >
                {loading ? <CircularProgress size={20} /> : <Refresh />}
              </IconButton>
            </Tooltip>
          }
        />
      )}

      <CardContent sx={{ pt: showHeader ? 0 : 3 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {!loading && is12MRateMissing() && (
              <Alert
                severity="warning"
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => window.open("/euribor-rates", "_blank")}
                  >
                    Update Rate
                  </Button>
                }
              >
                <Typography variant="body2">
                  <strong>
                    12-month rate missing for today
                  </strong>{" "}
                  - The rate is outdated or not set for{" "}
                  {dayjs().format("MMM DD, YYYY")}
                </Typography>
              </Alert>
            )}
            <Grid container spacing={compact ? 1.5 : 2}>
              {renderRateCard(EuriborTenor.TWELVE_MONTHS, null)}
            </Grid>
          </>
        )}

      </CardContent>
    </Card>
  );
};
