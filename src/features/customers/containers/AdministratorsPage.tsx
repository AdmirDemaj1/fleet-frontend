import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { CustomerList } from "../components/CustomerList";
import { CustomerListFilters } from "../components/CustomerList/CustomerListFilters";
import { useCustomers } from "../hooks/useCustomers";
import { useDeleteCustomer } from "../hooks/useDeleteCustomer";
import { setFilters } from "../slices/customerSlice";
import { CustomerType } from "../types/customer.types";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useDebounce } from "../../../shared/hooks/useDebounce";

export const AdministratorsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers: administrators, loading, totalCount } = useCustomers();
  const { deleteCustomer } = useDeleteCustomer();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasVehicles, setHasVehicles] = useState<boolean | undefined>(
    undefined
  );
  const [hasContracts, setHasContracts] = useState<boolean | undefined>(
    undefined
  );
  const [hasCollaterals, setHasCollaterals] = useState<boolean | undefined>(
    undefined
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [administratorToDelete, setAdministratorToDelete] = useState<
    string | null
  >(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Always filter by ADMINISTRATOR type
  React.useEffect(() => {
    // Reset page when filters change (except for page/rowsPerPage changes)
    const filtersChanged =
      debouncedSearchTerm !== "" ||
      hasVehicles !== undefined ||
      hasContracts !== undefined ||
      hasCollaterals !== undefined;

    const targetPage = filtersChanged && page > 0 ? 0 : page;

    if (filtersChanged && page > 0) {
      setPage(0);
    }

    const timeoutId = setTimeout(() => {
      dispatch(
        setFilters({
          search: debouncedSearchTerm,
          type: CustomerType.ADMINISTRATOR, // Always filter by administrator type
          limit: rowsPerPage,
          offset: targetPage * rowsPerPage,
          hasVehicles,
          hasContracts,
          hasCollaterals,
        })
      );
    }, 50); // Small delay to batch updates

    return () => clearTimeout(timeoutId);
  }, [
    debouncedSearchTerm,
    hasVehicles,
    hasContracts,
    hasCollaterals,
    page,
    rowsPerPage,
    dispatch,
  ]);

  const handleDelete = (id: string) => {
    setAdministratorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (administratorToDelete) {
      await deleteCustomer(administratorToDelete, CustomerType.ADMINISTRATOR);
      setDeleteDialogOpen(false);
      setAdministratorToDelete(null);

      // If we deleted the last item on the current page and we're not on the first page,
      // go back to the previous page
      if (administrators.length === 1 && page > 0) {
        setPage(page - 1);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setHasVehicles(undefined);
    setHasContracts(undefined);
    setHasCollaterals(undefined);
    setPage(0);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Administrators</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/customers/new")}
        >
          Add Administrator
        </Button>
      </Box>

      <CustomerListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={CustomerType.ADMINISTRATOR}
        onTypeChange={() => {}} // No-op since we don't allow changing type
        hasVehicles={hasVehicles}
        onHasVehiclesChange={setHasVehicles}
        hasContracts={hasContracts}
        onHasContractsChange={setHasContracts}
        hasCollaterals={hasCollaterals}
        onHasCollateralsChange={setHasCollaterals}
        onClearFilters={handleClearFilters}
        hideTypeFilter // Add this prop to hide the type filter
      />

      <CustomerList
        customers={administrators}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Administrator"
        message="Are you sure you want to delete this administrator? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};
