import { useState, useCallback, useMemo } from "react";
import { useGetPaymentsQuery } from "../api/paymentsApi";
import {
  PaymentFilters,
  PaymentQueryParams,
} from "../types/invoice.types";

interface UsePaymentsOptions {
  initialFilters?: PaymentFilters;
  initialPage?: number;
  initialRowsPerPage?: number;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
}

export const usePayments = (options: UsePaymentsOptions = {}) => {
  const {
    initialFilters = {},
    initialPage = 0,
    initialRowsPerPage = 10,
    initialSortBy = "createdAt",
    initialSortOrder = "desc",
  } = options;

  // State
  const [filters, setFilters] = useState<PaymentFilters>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  // Build query parameters
  const queryParams = useMemo(
    (): PaymentQueryParams => ({
      ...filters,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      sortBy,
      sortOrder,
    }),
    [filters, page, rowsPerPage, sortBy, sortOrder]
  );

  // API Query
  const {
    data: paymentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPaymentsQuery(queryParams);

  // Extract payments from response
  const payments = paymentsResponse?.payments || [];

  // Handlers
  const handleFiltersChange = useCallback((newFilters: PaymentFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when page size changes
  }, []);

  const handleSortChange = useCallback(
    (field: string, order: "asc" | "desc") => {
      setSortBy(field);
      setSortOrder(order);
      setPage(0); // Reset to first page when sort changes
    },
    []
  );

  // Use total from meta if available, otherwise fallback to API response or estimation
  const totalCount = useMemo(() => {
    // First try meta.total from the new response structure
    if (paymentsResponse?.meta?.total !== undefined) {
      return paymentsResponse.meta.total;
    }
    
    // Fallback to the total from the response
    if (paymentsResponse?.total !== undefined) {
      return paymentsResponse.total;
    }
    
    // Final fallback: estimate if API doesn't return total
    if (payments.length < rowsPerPage) {
      return page * rowsPerPage + payments.length;
    }
    return (page + 1) * rowsPerPage + 1; // Assume there's at least one more page
  }, [paymentsResponse?.meta?.total, paymentsResponse?.total, payments.length, page, rowsPerPage]);

  // Check if we have active filters
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
  }, [filters]);

  return {
    // Data
    payments,
    isLoading,
    isError,
    error,
    totalCount,

    // State
    filters,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    hasActiveFilters,

    // Handlers
    handleFiltersChange,
    handleClearFilters,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    refetch,

    // Utilities
    queryParams,
  };
};
