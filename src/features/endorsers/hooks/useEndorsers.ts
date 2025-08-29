import { useState, useCallback } from "react";
import { useGetEndorsersQuery } from "../api/endorserApi";
import { EndorserFilters } from "../types/endorser.types";

interface UseEndorsersOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  initialFilters?: EndorserFilters;
}

export const useEndorsers = (options: UseEndorsersOptions = {}) => {
  const {
    initialPage = 0,
    initialRowsPerPage = 10,
    initialFilters = {},
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [filters, setFilters] = useState<EndorserFilters>(initialFilters);

  // Calculate offset for API
  const offset = page * rowsPerPage;

  // Fetch endorsers data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetEndorsersQuery({
    ...filters,
    limit: rowsPerPage,
    offset,
  });

  // Extract endorsers and pagination info from response
  const endorsers = data?.endorsers || [];
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

  // Handle filters change
  const handleFiltersChange = useCallback((newFilters: EndorserFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when changing filters
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPage(0); // Reset to first page when changing search
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  // Handle delete endorser
  const handleDeleteEndorser = useCallback(
    (endorserId: string) => {
      // TODO: Implement delete functionality
      console.log("Delete endorser:", endorserId);
      // After successful delete, refetch the data
      refetch();
    },
    [refetch]
  );

  // Check if filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return {
    // Data
    endorsers,
    isLoading,
    error,
    totalCount,
    meta,

    // Pagination
    page,
    rowsPerPage,

    // Filters
    filters,
    hasActiveFilters,

    // Handlers
    handlePageChange,
    handleRowsPerPageChange,
    handleFiltersChange,
    handleSearchChange,
    clearFilters,
    handleDeleteEndorser,

    // Utils
    refetch,
  };
};
