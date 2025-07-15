import React, { useState, useMemo } from 'react';
import { useGetAuditLogsQuery } from '../../../logs/api/auditapi';
import AuditLogList from '../../../logs/components/AuditLogList/AuditLogList';
import { Tooltip } from '@mui/material';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Grid,
  Pagination,
  CircularProgress,
  Button,
  Divider,
  alpha,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import {
  Search,
  Clear,
  Refresh,
  CalendarToday,
  Sort,
  History
} from '@mui/icons-material';
import { format, startOfDay, endOfDay, subDays, parse, isValid } from 'date-fns';
import { useDebounce } from '../../../../shared/hooks/useDebounce';

interface CustomerAccountLogsProps {
  customerId: string;
}

const eventTypeOptions = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' }
];

const CustomerAccountLogs: React.FC<CustomerAccountLogsProps> = ({ customerId }) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Calculate date range for the query
  const getDateRangeFilter = () => {
    if (dateRange === '7days') {
      return { 
        startDate: format(startOfDay(subDays(new Date(), 7)), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    } else if (dateRange === '30days') {
      return { 
        startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    } else if (dateRange === 'all') {
      return {};
    }
    return {};
  };

  const dateRangeFilter = getDateRangeFilter();

  const filters = useMemo(() => ({
    entityId: customerId,
    entityType: 'customer',
    search: debouncedSearchTerm,
    limit: rowsPerPage,
    offset: (page - 1) * rowsPerPage,
    sortOrder,
    ...(selectedEventTypes.length > 0 ? { eventTypes: selectedEventTypes } : {}),
    ...dateRangeFilter
  }), [
    customerId,
    debouncedSearchTerm,
    rowsPerPage,
    page,
    sortOrder,
    selectedEventTypes,
    dateRangeFilter
  ]);

  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useGetAuditLogsQuery(filters);

  const logs = response?.data || [];
  const total = response?.total || 0;

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleDateRangeChange = (range: '7days' | '30days' | 'all') => {
    setDateRange(range);
    if (range === '7days') {
      setStartDate(startOfDay(subDays(new Date(), 7)));
      setEndDate(endOfDay(new Date()));
    } else if (range === '30days') {
      setStartDate(startOfDay(subDays(new Date(), 30)));
      setEndDate(endOfDay(new Date()));
    }
  };

  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType)
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange('30days');
    setSelectedEventTypes([]);
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || 
    selectedEventTypes.length > 0 ||
    dateRange !== '30days' ||
    sortOrder !== 'desc';

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <History fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Account Activity
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search account logs..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="date-range-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as any)}
                  label="Date Range"
                  startAdornment={
                    <CalendarToday fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-order-label">Sort</InputLabel>
                <Select
                  labelId="sort-order-label"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  label="Sort"
                  startAdornment={
                    <Sort fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={() => refetch()} 
                color="primary"
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Event Types:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {eventTypeOptions.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                clickable
                color={selectedEventTypes.includes(option.value) ? 'primary' : 'default'}
                variant={selectedEventTypes.includes(option.value) ? 'filled' : 'outlined'}
                onClick={() => handleEventTypeToggle(option.value)}
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </Box>
        </Box>

        {hasActiveFilters && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="body2" color="textSecondary">
                Active filters:
              </Typography>
              
              {searchTerm && (
                <Chip 
                  label={`Search: ${searchTerm}`} 
                  size="small" 
                  onDelete={() => setSearchTerm('')}
                  sx={{ borderRadius: 1.5 }}
                />
              )}
              
              {dateRange !== '30days' && (
                <Chip 
                  label={`Date: ${dateRange === '7days' ? 'Last 7 Days' : 'All Time'}`} 
                  size="small" 
                  onDelete={() => handleDateRangeChange('30days')}
                  sx={{ borderRadius: 1.5 }}
                />
              )}
              
              {selectedEventTypes.map(type => (
                <Chip 
                  key={type}
                  label={`Event: ${type.charAt(0).toUpperCase() + type.slice(1)}`} 
                  size="small" 
                  onDelete={() => handleEventTypeToggle(type)}
                  sx={{ borderRadius: 1.5 }}
                />
              ))}
              
              {sortOrder !== 'desc' && (
                <Chip 
                  label={`Sort: Oldest First`} 
                  size="small" 
                  onDelete={() => setSortOrder('desc')}
                  sx={{ borderRadius: 1.5 }}
                />
              )}
              
              <Button 
                size="small" 
                color="inherit" 
                onClick={handleResetFilters}
                startIcon={<Clear />}
                sx={{ ml: 'auto' }}
              >
                Clear All
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.05),
            borderColor: theme.palette.error.main,
            mb: 3
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Error Loading Account Logs
          </Typography>
          <Typography color="error.dark">
            {('message' in error) ? error.message : 'An unexpected error occurred while loading the account logs.'}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => refetch()} 
            sx={{ mt: 2, borderRadius: 2 }}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Paper>
      ) : (
        <AuditLogList logs={logs} />
      )}

      {logs.length > 0 && !isLoading && (
        <Paper 
          sx={{ 
            p: 2, 
            mt: 2, 
            borderRadius: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
          elevation={0}
          variant="outlined"
        >
          <Box>
            <Typography variant="body2" color="textSecondary">
              Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, total)} of {total} log entries
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 100, mr: 2 }}>
              <InputLabel id="rows-per-page-label">Per Page</InputLabel>
              <Select
                labelId="rows-per-page-label"
                id="rows-per-page"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                label="Per Page"
                sx={{ borderRadius: 2 }}
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
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CustomerAccountLogs;