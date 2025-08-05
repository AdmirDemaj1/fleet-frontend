import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Skeleton,
  Button,
  TableSortLabel,
  alpha,
  useTheme,
  Divider,
  Paper,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { ContractResponse } from "../../types/contract.types";
import { ContractListItem } from "./ContractListItem";

interface ContractListProps {
  contracts: ContractResponse[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: string) => void;
}

type Order = "asc" | "desc";
type OrderBy =
  | "contractNumber"
  | "type"
  | "status"
  | "totalAmount"
  | "createdAt";

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Add sorting state
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("createdAt");

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create loading skeletons
  if (loading && contracts.length === 0) {
    return (
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton
              variant="rectangular"
              width={100}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", mb: 1.5 }}>
            {["20%", "15%", "15%", "20%", "15%", "15%"].map((width, i) => (
              <Skeleton
                key={i}
                variant="text"
                width={width}
                height={24}
                sx={{ mr: 2 }}
              />
            ))}
          </Box>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                borderBottom:
                  index < 4 ? `1px solid ${theme.palette.divider}` : "none",
              }}
            >
              {["20%", "15%", "15%", "20%", "15%", "15%"].map((width, i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  width={width}
                  height={24}
                  sx={{ mr: 2 }}
                />
              ))}
            </Box>
          ))}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Skeleton
              variant="rectangular"
              width={300}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "contractNumber"}
                  direction={orderBy === "contractNumber" ? order : "asc"}
                  onClick={() => handleRequestSort("contractNumber")}
                >
                  Contract Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "type"}
                  direction={orderBy === "type" ? order : "asc"}
                  onClick={() => handleRequestSort("type")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "totalAmount"}
                  direction={orderBy === "totalAmount" ? order : "asc"}
                  onClick={() => handleRequestSort("totalAmount")}
                >
                  Total Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "createdAt"}
                  direction={orderBy === "createdAt" ? order : "asc"}
                  onClick={() => handleRequestSort("createdAt")}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <ContractListItem
                key={contract.id}
                contract={contract}
                onDelete={onDelete}
              />
            ))}
            {contracts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: "50%",
                        p: 2,
                        mb: 2,
                      }}
                    >
                      <Description
                        sx={{
                          fontSize: 48,
                          color: theme.palette.primary.main,
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      No contracts found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                      sx={{ maxWidth: 500, mb: 3 }}
                    >
                      No contracts match your current filter criteria or there
                      are no contracts in the system yet.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate("/contracts/create")}
                    >
                      Create New Contract
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount || 0}
        page={Math.min(
          page,
          Math.max(0, Math.ceil((totalCount || 0) / rowsPerPage) - 1)
        )}
        onPageChange={(_, newPage) => {
          console.log(
            "Page change requested:",
            newPage,
            "Current total:",
            totalCount
          );
          onPageChange(newPage);
        }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = parseInt(e.target.value, 10);
          console.log("Rows per page change:", newRowsPerPage);
          onRowsPerPageChange(newRowsPerPage);
        }}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => {
          const safeCount = count === -1 ? totalCount : count;
          if (loading) {
            return "Loading...";
          }
          return `${from}–${to} of ${
            safeCount !== -1 ? safeCount : `more than ${to}`
          }`;
        }}
        disabled={loading}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          "& .MuiTablePagination-select": {
            pr: 1,
          },
          "& .MuiTablePagination-displayedRows": {
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
          },
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        }}
      />
    </Paper>
  );
};
