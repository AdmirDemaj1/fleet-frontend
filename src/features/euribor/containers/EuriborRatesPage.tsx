import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  Refresh,
  FilterList,
  GetApp
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

import { euriborApi } from '../api/euriborApi';
import { EuriborRateForm, CurrentRatesWidget } from '../components';
import {
  EuriborRate,
  CreateEuriborRateDto,
  EuriborRateFilters,
  EuriborTenor,
  EuriborRateSource,
  PaginatedEuriborResponse
} from '../types/euribor.types';
import { 
  getTenorDisplayName, 
  getTenorColor, 
  formatRateAsPercentage,
  getRateSourceDisplayName 
} from '../utils/euriborUtils';

const EuriborRatesPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [rates, setRates] = useState<EuriborRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<EuriborRate | null>(null);

  // Filter states
  const [filters, setFilters] = useState<EuriborRateFilters>({
    limit: 10,
    offset: 0
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch rates from API
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedEuriborResponse = await euriborApi.getAll({
        ...filters,
        offset: pagination.page * pagination.limit
      });
      
      setRates(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.meta.total
      }));
    } catch (err) {
      console.error('Failed to fetch Euribor rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rates');
      setNotification({
        open: true,
        message: 'Failed to load Euribor rates',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Handle form submission
  const handleCreateRate = useCallback(async (data: CreateEuriborRateDto) => {
    setFormLoading(true);
    
    try {
      await euriborApi.create(data);
      setNotification({
        open: true,
        message: 'Euribor rate created successfully!',
        severity: 'success'
      });
      setCreateDialogOpen(false);
      fetchRates(); // Refresh list
    } catch (err) {
      console.error('Failed to create rate:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to create rate',
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  }, [fetchRates]);

  const handleUpdateRate = useCallback(async (data: CreateEuriborRateDto) => {
    if (!selectedRate) return;
    
    setFormLoading(true);
    
    try {
      await euriborApi.update(selectedRate.id!, data);
      setNotification({
        open: true,
        message: 'Euribor rate updated successfully!',
        severity: 'success'
      });
      setEditDialogOpen(false);
      setSelectedRate(null);
      fetchRates(); // Refresh list
    } catch (err) {
      console.error('Failed to update rate:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to update rate',
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  }, [selectedRate, fetchRates]);

  const handleDeleteRate = useCallback(async (rate: EuriborRate) => {
    if (!window.confirm(`Are you sure you want to delete the ${rate.tenor.toUpperCase()} rate for ${dayjs(rate.rateDate).format('MMM DD, YYYY')}?`)) {
      return;
    }
    
    try {
      await euriborApi.delete(rate.id!);
      setNotification({
        open: true,
        message: 'Euribor rate deleted successfully!',
        severity: 'success'
      });
      fetchRates(); // Refresh list
    } catch (err) {
      console.error('Failed to delete rate:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete rate',
        severity: 'error'
      });
    }
  }, [fetchRates]);

  // Handle pagination
  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 0 }));
    setFilters(prev => ({ ...prev, limit: newLimit, offset: 0 }));
  }, []);

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          Euribor Rates Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage daily Euribor interest rates for different tenors
        </Typography>
      </Box>

      {/* Current Rates Widget */}
      <Box sx={{ mb: 3 }}>
        <CurrentRatesWidget compact />
      </Box>

      {/* Actions Bar */}
      <Card elevation={0} sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add New Rate
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchRates}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Filter rates">
                <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export rates">
                <IconButton>
                  <GetApp />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filters */}
          {filtersOpen && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tenor</InputLabel>
                  <Select
                    value={filters.tenor || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, tenor: e.target.value as EuriborTenor || undefined }))}
                    label="Tenor"
                  >
                    <MenuItem value="">All</MenuItem>
                      {Object.values(EuriborTenor).map((tenor) => (
                        <MenuItem key={tenor} value={tenor}>
                          {getTenorDisplayName(tenor)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={filters.rateSource || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, rateSource: e.target.value as EuriborRateSource || undefined }))}
                    label="Source"
                  >
                    <MenuItem value="">All</MenuItem>
                    {Object.values(EuriborRateSource).map((source) => (
                      <MenuItem key={source} value={source}>
                        {getRateSourceDisplayName(source)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setFilters({ limit: pagination.limit, offset: 0 })}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={fetchRates}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rates Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Tenor</strong></TableCell>
                <TableCell><strong>Rate</strong></TableCell>
                <TableCell><strong>Source</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created By</strong></TableCell>
                <TableCell><strong>Effective From</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>Loading rates...</Typography>
                  </TableCell>
                </TableRow>
              ) : rates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No Euribor rates found. Create your first rate!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((rate) => (
                  <TableRow key={rate.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(rate.rateDate).format('MMM DD, YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getTenorDisplayName(rate.tenor)} 
                        size="small" 
                        color={getTenorColor(rate.tenor) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatRateAsPercentage(rate.rateValue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getRateSourceDisplayName(rate.rateSource)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rate.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={getStatusColor(rate.isActive) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rate.createdBy}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(rate.effectiveFrom).format('MMM DD, YYYY HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit rate">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRate(rate);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete rate">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRate(rate)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <EuriborRateForm
            onSubmit={handleCreateRate}
            onCancel={() => setCreateDialogOpen(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedRate && (
            <EuriborRateForm
              initialData={{
                rateDate: selectedRate.rateDate,
                tenor: selectedRate.tenor,
                rateValue: selectedRate.rateValue,
                rateSource: selectedRate.rateSource,
                createdBy: selectedRate.createdBy,
                metadata: selectedRate.metadata,
                effectiveFrom: selectedRate.effectiveFrom,
                isActive: selectedRate.isActive
              }}
              onSubmit={handleUpdateRate}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedRate(null);
              }}
              loading={formLoading}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EuriborRatesPage;
