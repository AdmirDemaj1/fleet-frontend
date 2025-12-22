import { useState, useEffect, useCallback } from 'react';
import { reportApi } from '../api/reportApi';
import { GetStoredReportsQueryDto, StoredReportDto } from '../types/report.types';

export const useStoredReports = () => {
  const [reports, setReports] = useState<StoredReportDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetStoredReportsQueryDto>({});

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: GetStoredReportsQueryDto = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        ...filters,
      };
      const result = await reportApi.getStoredReports(query);
      setReports(result.reports || []);
      setTotalCount(result.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stored reports');
      setReports([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  }, []);

  const handleDownload = useCallback(async (id: string, fileName: string) => {
    try {
      const blob = await reportApi.downloadStoredReport(id);
      reportApi.downloadFile(blob, fileName);
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await reportApi.deleteStoredReport(id);
      // Refresh the list after deletion
      await fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  }, [fetchReports]);

  const handleFiltersChange = useCallback((newFilters: GetStoredReportsQueryDto) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  }, []);

  const refetch = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports: reports || [],
    totalCount: totalCount || 0,
    page: page || 0,
    rowsPerPage: rowsPerPage || 25,
    loading,
    error,
    filters,
    handlePageChange,
    handleRowsPerPageChange,
    handleDownload,
    handleDelete,
    handleFiltersChange,
    refetch,
  };
};

