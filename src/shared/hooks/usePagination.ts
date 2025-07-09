import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialRowsPerPage?: number;
  totalCount?: number;
}

export const usePagination = ({
  initialPage = 0,
  initialRowsPerPage = 10,
  totalCount = 0
}: UsePaginationProps = {}) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const offset = page * rowsPerPage;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return {
    page,
    rowsPerPage,
    offset,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    setPage,
    setRowsPerPage
  };
};