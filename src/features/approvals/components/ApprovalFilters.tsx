import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import {
  ApprovalRequestFilters,
  APPROVAL_STATUS_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from '../types/approval.types';

interface ApprovalFiltersProps {
  filters: ApprovalRequestFilters;
  onFiltersChange: (filters: ApprovalRequestFilters) => void;
  showUserFilter?: boolean; // For admin users only
  loading?: boolean;
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  filters,
  onFiltersChange,
  showUserFilter = false,
  loading = false,
}) => {
  const handleFilterChange = (field: keyof ApprovalRequestFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: '',
      requestorId: '',
      resourceType: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Filter Approval Requests
        </Typography>
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Status Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
            size="small"
          >
            {APPROVAL_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Resource Type Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Resource Type"
            value={filters.resourceType || ''}
            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
            disabled={loading}
            size="small"
          >
            {RESOURCE_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* User Filter (Admin Only) */}
        {showUserFilter && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Requestor ID"
              placeholder="Enter user ID"
              value={filters.requestorId || ''}
              onChange={(e) => handleFilterChange('requestorId', e.target.value)}
              disabled={loading}
              size="small"
            />
          </Grid>
        )}

        {/* Date From Filter */}
        <Grid item xs={12} sm={6} md={showUserFilter ? 3 : 3}>
          <TextField
            fullWidth
            type="date"
            label="From Date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            disabled={loading}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Date To Filter */}
        {showUserFilter ? (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={loading}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={loading}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
