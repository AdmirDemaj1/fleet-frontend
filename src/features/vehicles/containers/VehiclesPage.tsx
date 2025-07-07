import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { VehicleList } from '../components/VehicleList/VehicleList';
import { VehicleListFilters } from '../components/VehicleList/VehicleListFilters';
import { useVehicles } from '../hooks/useVehicles';
import { setFilters } from '../slices/vehicleSlice';
import { VehicleStatus } from '../types/vehicleType'; // Import VehicleStatus from vehicleType
import { useDebounce } from '../../../shared/hooks/useDebounce';

export const VehiclesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, totalCount } = useVehicles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    dispatch(setFilters({
      search: debouncedSearchTerm,
      status: statusFilter || undefined,
      limit: rowsPerPage,
      offset: page * rowsPerPage
    }));
  }, [debouncedSearchTerm, statusFilter, page, rowsPerPage, dispatch]);

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as VehicleStatus | '');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Vehicles</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <TextField
          label="Search Vehicles"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />

        <VehicleListFilters
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />
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