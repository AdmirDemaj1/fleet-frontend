import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { VehicleList } from '../components/VehicleList/VehicleList';
import { useVehicles } from '../hooks/useVehicles';
import { setFilters } from '../slices/vehicleSlice';
import { VehicleStatus, FuelType, ConditionStatus } from '../types/vehicleType';
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const VehiclesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, totalCount } = useVehicles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelType | ''>('');
  const [conditionStatusFilter, setConditionStatusFilter] = useState<ConditionStatus | ''>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    dispatch(setFilters({
      search: debouncedSearchTerm,
      status: statusFilter || undefined,
      fuelype: fuelTypeFilter || undefined,
      conditionStatus: conditionStatusFilter || undefined,
      year: yearFilter ? parseInt(yearFilter, 10) : undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage
    }));
  }, [debouncedSearchTerm, statusFilter, fuelTypeFilter, conditionStatusFilter, yearFilter, page, rowsPerPage, dispatch]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setFuelTypeFilter('');
    setConditionStatusFilter('');
    setYearFilter('');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Vehicles</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Vehicles"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <IconButton aria-label="clear" onClick={() => { setSearchTerm(''); setPage(0); }} edge="end">
                    <Clear />
                  </IconButton>
                ),
              }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value as VehicleStatus); setPage(0); }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {Object.values(VehicleStatus).map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="fuel-type-filter-label">Fuel Type</InputLabel>
              <Select
                labelId="fuel-type-filter-label"
                id="fuel-type-filter"
                value={fuelTypeFilter}
                label="Fuel Type"
                onChange={(e) => { setFuelTypeFilter(e.target.value as FuelType); setPage(0); }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {Object.values(FuelType).map((fuelType) => (
                  <MenuItem key={fuelType} value={fuelType}>{fuelType}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="condition-status-filter-label">Condition</InputLabel>
              <Select
                labelId="condition-status-filter-label"
                id="condition-status-filter"
                value={conditionStatusFilter}
                label="Condition"
                onChange={(e) => { setConditionStatusFilter(e.target.value as ConditionStatus); setPage(0); }}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                {Object.values(ConditionStatus).map((condition) => (
                  <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Year"
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Clear Filters">
              <IconButton onClick={handleClearFilters}>
                <Clear />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <VehicleList
        vehicles={vehicles}
        loading={loading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Box>
  );
};