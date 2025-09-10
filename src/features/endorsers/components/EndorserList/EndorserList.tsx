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
import { Person } from "@mui/icons-material";
import { Endorser } from "../../types/endorser.types";
import { EndorserListItem } from "./EndorserListItem";

interface EndorserListProps {
  endorsers: Endorser[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: string) => void;
}

type Order = "asc" | "desc";
type OrderBy = "firstName" | "lastName" | "email" | "createdAt";

export const EndorserList: React.FC<EndorserListProps> = ({
  endorsers,
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
  if (loading && endorsers.length === 0) {
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
              width={120}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", mb: 1.5 }}>
            {["25%", "20%", "20%", "15%", "10%", "10%"].map((width, i) => (
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
              {["25%", "20%", "20%", "15%", "10%", "10%"].map((width, i) => (
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
                  active={orderBy === "firstName"}
                  direction={orderBy === "firstName" ? order : "asc"}
                  onClick={() => handleRequestSort("firstName")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "email"}
                  direction={orderBy === "email" ? order : "asc"}
                  onClick={() => handleRequestSort("email")}
                >
                  Contact Info
                </TableSortLabel>
              </TableCell>
              <TableCell>ID Number</TableCell>
              <TableCell>Relationships</TableCell>
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
            {endorsers.map((endorser) => (
              <EndorserListItem
                key={endorser.id}
                endorser={endorser}
                onDelete={onDelete}
              />
            ))}
            {endorsers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
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
                      <Person
                        sx={{
                          fontSize: 48,
                          color: theme.palette.primary.main,
                          opacity: 0.7,
                        }}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      No endorsers found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                      sx={{ maxWidth: 500, mb: 3 }}
                    >
                      No endorsers match your current filter criteria or there
                      are no endorsers in the system yet.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate("/endorsers/create")}
                    >
                      Create New Endorser
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
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          const newRowsPerPage = parseInt(e.target.value, 10);
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
