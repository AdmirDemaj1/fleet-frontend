import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  MoreVert,
  BusinessCenter,
  TrendingUp,
  FileDownload,
  Receipt,
  History,
  AccountBox,
  Dashboard,
  Delete,
  Edit,
} from "@mui/icons-material";
import {
  ContractResponse,
  ContractType,
  ContractStatus,
} from "../../types/contract.types";
import dayjs from "dayjs";

interface ContractListItemProps {
  contract: ContractResponse;
  onDelete: (id: string) => void;
}

export const ContractListItem: React.FC<ContractListItemProps> = ({
  contract,
  onDelete,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("MMM D, YYYY");
  };

  // Format currency
  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  // Get status color
  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return "success";
      case ContractStatus.DRAFT:
        return "warning";
      case ContractStatus.COMPLETED:
        return "info";
      case ContractStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  // Get type color
  const getTypeColor = (type: ContractType) => {
    switch (type) {
      case ContractType.LOAN:
        return "primary";
      case ContractType.LEASING:
        return "secondary";
      default:
        return "default";
    }
  };

  const isLoan = contract.type === ContractType.LOAN;
  const isActive = contract.status === ContractStatus.ACTIVE;

  return (
    <>
      <TableRow
        hover
        sx={{
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        <TableCell sx={{ py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
            onClick={() => navigate(`/contracts/${contract.id}`)}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(
                  isLoan
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main,
                  0.1
                ),
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1.5,
              }}
            >
              {isLoan ? (
                <BusinessCenter
                  fontSize="small"
                  sx={{ color: theme.palette.primary.main }}
                />
              ) : (
                <TrendingUp
                  fontSize="small"
                  sx={{ color: theme.palette.secondary.main }}
                />
              )}
            </Box>
            <Box>
              <Typography
                variant="body1"
                fontWeight={500}
                sx={{
                  transition: "color 0.2s ease",
                  borderBottom: "1px dotted transparent",
                  "&:hover": {
                    borderBottomColor: theme.palette.primary.main,
                  },
                }}
              >
                {contract.contractNumber}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Chip
            label={isLoan ? "Loan" : "Leasing"}
            size="small"
            color={getTypeColor(contract.type)}
            variant="outlined"
            sx={{
              fontWeight: 500,
              px: 0.5,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </TableCell>

        <TableCell>
          <Chip
            label={
              contract.status.charAt(0).toUpperCase() + contract.status.slice(1)
            }
            size="small"
            color={getStatusColor(contract.status)}
            variant={isActive ? "filled" : "outlined"}
            sx={{
              fontWeight: 500,
              px: 0.5,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight={500}>
            {formatCurrency(contract.totalAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Remaining: {formatCurrency(contract.remainingAmount)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(contract.createdAt)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-haspopup="true"
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            borderRadius: 1,
            overflow: "hidden",
          },
        }}
      >
        {/* Overview group */}
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}`);
            handleMenuClose();
          }}
          dense
        >
          <AccountBox fontSize="small" sx={{ mr: 1.5 }} />
          Contract Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}/summary`);
            handleMenuClose();
          }}
          dense
        >
          <Dashboard fontSize="small" sx={{ mr: 1.5 }} />
          Dashboard
        </MenuItem>

        <Divider />

        {/* Edit group */}
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}/edit`);
            handleMenuClose();
          }}
          dense
        >
          <Edit fontSize="small" sx={{ mr: 1.5 }} />
          Edit Contract
        </MenuItem>

        <Divider />

        {/* Finance group */}
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}/payments`);
            handleMenuClose();
          }}
          dense
        >
          <Receipt fontSize="small" sx={{ mr: 1.5 }} />
          Payments
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}/export`);
            handleMenuClose();
          }}
          dense
        >
          <FileDownload fontSize="small" sx={{ mr: 1.5 }} />
          Export Data
        </MenuItem>

        <Divider />

        {/* History group */}
        <MenuItem
          onClick={() => {
            navigate(`/contracts/${contract.id}/logs`);
            handleMenuClose();
          }}
          dense
        >
          <History fontSize="small" sx={{ mr: 1.5 }} />
          Activity Logs
        </MenuItem>

        <Divider />

        {/* Danger zone */}
        <MenuItem
          onClick={() => {
            onDelete(contract.id);
            handleMenuClose();
          }}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1.5 }} />
          Delete Contract
        </MenuItem>
      </Menu>
    </>
  );
};
