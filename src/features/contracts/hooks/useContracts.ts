import { useState, useCallback } from "react";
import { useGetContractsQuery } from "../api/contractApi";
import { ContractType, ContractStatus } from "../types/contract.types";

interface UseContractsOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  initialType?: ContractType;
  initialStatus?: ContractStatus;
  initialSearch?: string;
}

export const useContracts = (options: UseContractsOptions = {}) => {
  const {
    initialPage = 0,
    initialRowsPerPage = 10,
    initialType,
    initialStatus,
    initialSearch = "",
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [type, setType] = useState<ContractType | undefined>(initialType);
  const [status, setStatus] = useState<ContractStatus | undefined>(
    initialStatus
  );
  const [search, setSearch] = useState(initialSearch);

  // Calculate offset for API
  const offset = page * rowsPerPage;

  // Fetch contracts data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetContractsQuery({
    type,
    status,
    limit: rowsPerPage,
    offset,
    search: search.trim() || undefined,
  });

  // Extract contracts and pagination info from response
  const contracts = data?.contracts || [];
  const totalCount = data?.total || 0;
  const meta = data?.meta;

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  // Handle type filter change
  const handleTypeChange = useCallback((newType: ContractType | undefined) => {
    setType(newType);
    setPage(0); // Reset to first page when changing filters
  }, []);

  // Handle status filter change
  const handleStatusChange = useCallback(
    (newStatus: ContractStatus | undefined) => {
      setStatus(newStatus);
      setPage(0); // Reset to first page when changing filters
    },
    []
  );

  // Handle search change
  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(0); // Reset to first page when changing search
  }, []);

  // Handle delete contract
  const handleDeleteContract = useCallback(
    (contractId: string) => {
      // TODO: Implement delete functionality
      console.log("Delete contract:", contractId);
      // After successful delete, refetch the data
      refetch();
    },
    [refetch]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setType(undefined);
    setStatus(undefined);
    setSearch("");
    setPage(0);
  }, []);

  return {
    // Data
    contracts,
    isLoading,
    error,

    // Pagination
    page,
    rowsPerPage,
    totalCount, // Now using the totalCount from API response

    // Filters
    type,
    status,
    search,

    // Handlers
    handlePageChange,
    handleRowsPerPageChange,
    handleTypeChange,
    handleStatusChange,
    handleSearchChange,
    handleDeleteContract,
    resetFilters,

    // Utils
    refetch,
  };
};
