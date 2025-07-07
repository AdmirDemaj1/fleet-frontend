import React, { useState, useMemo } from 'react';
import { useGetAuditLogsQuery } from '../api/auditapi';
import AuditLogList from '../components/AuditLogList/AuditLogList';
import { FindAuditLogsDto, AuditLogResponseDto } from '../types/audit.types';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import useAuditFilters from '../hooks/AuditFilters';
import { useDebounce } from '../../../shared/hooks/useDebounce';

const AuditLogsContainer: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { filters, handleFilterChange, clearFilters } = useAuditFilters();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const enhancedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm,
    limit: rowsPerPage,
    offset: (page - 1) * rowsPerPage,
  }), [filters, debouncedSearchTerm, rowsPerPage, page]);

  const {
    data: response, // Expecting { data: AuditLogResponseDto[], total: number }
    isLoading,
    error,
  } = useGetAuditLogsQuery(enhancedFilters);

  const logs = response?.data || [];
  const total = response?.total || 0;

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to the first page when changing rows per page
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Audit Logs
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <IconButton onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                ) : null,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Entity Type"
              name="entityType"
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="User ID"
              name="userId"
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={clearFilters} startIcon={<Clear />}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Error: {('message' in error) ? error.message : 'An error occurred'}
        </Typography>
      ) : logs.length > 0 ? (
        <>
          <AuditLogList logs={logs} />
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">
              Page: {page} of {Math.ceil(total / rowsPerPage)}
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
              <Select
                labelId="rows-per-page-label"
                id="rows-per-page"
                value={rowsPerPage}
                label="Rows per page"
                onChange={handleChangeRowsPerPage}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Pagination
              count={Math.ceil(total / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
              size="medium"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      ) : (
        <Typography>No audit logs found.</Typography>
      )}
    </Container>
  );
};

export default AuditLogsContainer;