import React, { useState, useMemo } from 'react';
import { useGetAuditLogsQuery } from '../api/auditapi';
import AuditLogList from '../components/AuditLogList/AuditLogList';
import { FindAuditLogsDto } from '../types/audit.types';
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
  Tab,
  Tabs,
  Chip,
  Divider,
  Tooltip,
  Stack,
  alpha,
  Card,
  CardContent,
  useTheme,
  Collapse,
  SelectChangeEvent
} from '@mui/material';
import { 
  Search, 
  Clear, 
  Refresh, 
  FilterList, 
  ExpandMore, 
  ExpandLess,
  Assessment,
  CalendarToday,
  Person,
  Category,
  History,
  Dashboard,
  BarChart,
  PieChart,
  LineStyle,
  Sort
} from '@mui/icons-material';
import useAuditFilters from '../hooks/AuditFilters';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths, parse, isValid } from 'date-fns';

const eventTypeOptions = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
];

const entityTypeOptions = [
  { value: 'user', label: 'User' },
  { value: 'role', label: 'Role' },
  { value: 'customer', label: 'Customer' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'asset', label: 'Asset' },
];

const AuditLogsContainer: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('logs');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Custom filters from the hook
  const { filters, handleFilterChange, clearFilters } = useAuditFilters();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Calculate date range for the query
  const getDateRangeFilter = () => {
    if (dateRange === 'today') {
      return { 
        startDate: format(startOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    } else if (dateRange === '7days') {
      return { 
        startDate: format(startOfDay(subDays(new Date(), 7)), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    } else if (dateRange === '30days') {
      return { 
        startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(new Date()), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    } else if (dateRange === 'custom' && startDate && endDate) {
      return { 
        startDate: format(startOfDay(startDate), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        endDate: format(endOfDay(endDate), 'yyyy-MM-dd\'T\'HH:mm:ss')
      };
    }
    return {};
  };

  const dateRangeFilter = getDateRangeFilter();

  const enhancedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm,
    limit: rowsPerPage,
    offset: (page - 1) * rowsPerPage,
    sortOrder,
    ...(selectedEventTypes.length > 0 ? { eventTypes: selectedEventTypes } : {}),
    ...dateRangeFilter
  }), [
    filters, 
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
  } = useGetAuditLogsQuery(enhancedFilters);

  const logs = response?.data || [];
  const total = response?.total || 0;

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (range: 'today' | '7days' | '30days' | 'custom') => {
    setDateRange(range);
    if (range === 'today') {
      setStartDate(startOfDay(new Date()));
      setEndDate(endOfDay(new Date()));
    } else if (range === '7days') {
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
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
    setSelectedEventTypes([]);
    setSortOrder('desc');
    clearFilters();
  };

  const hasActiveFilters = searchTerm || 
    Object.values(filters).some(val => val) || 
    selectedEventTypes.length > 0 ||
    dateRange !== '30days' ||
    sortOrder !== 'desc';

  const activeFiltersCount = [
    searchTerm,
    ...Object.values(filters).filter(Boolean),
    ...selectedEventTypes,
    dateRange !== '30days' ? 'dateRange' : null,
    sortOrder !== 'desc' ? 'sortOrder' : null
  ].filter(Boolean).length;

  // Function to get event type and entity type distribution for the charts
  const getEventTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    logs.forEach(log => {
      const eventType = log.eventType.toLowerCase();
      distribution[eventType] = (distribution[eventType] || 0) + 1;
    });
    return distribution;
  };

  const getEntityTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    logs.forEach(log => {
      const entityType = log.entityType.toLowerCase();
      distribution[entityType] = (distribution[entityType] || 0) + 1;
    });
    return distribution;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and analyze system activity and changes made by users.
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<History fontSize="small" />} 
          iconPosition="start" 
          label="Logs" 
          value="logs" 
        />
        <Tab 
          icon={<Dashboard fontSize="small" />} 
          iconPosition="start" 
          label="Dashboard" 
          value="dashboard" 
        />
      </Tabs>

      {activeTab === 'logs' && (
        <>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search by user, entity, or action..."
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
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
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
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="7days">Last 7 Days</MenuItem>
                      <MenuItem value="30days">Last 30 Days</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
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
                </Box>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
                
                <Button
                  variant={showAdvancedFilters ? "contained" : "outlined"}
                  color={showAdvancedFilters ? "primary" : "inherit"}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  startIcon={<FilterList />}
                  endIcon={showAdvancedFilters ? <ExpandLess /> : <ExpandMore />}
                  sx={{ borderRadius: 2 }}
                >
                  Filters
                </Button>
              </Grid>
            </Grid>

            <Collapse in={showAdvancedFilters}>
              <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Advanced Filters
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                          setStartDate(isValid(date) ? date : null);
                        }}
                        InputLabelProps={{ shrink: true }}
                        disabled={dateRange !== 'custom'}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        fullWidth
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                          setEndDate(isValid(date) ? date : null);
                        }}
                        InputLabelProps={{ shrink: true }}
                        disabled={dateRange !== 'custom'}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Entity ID"
                      name="entityId"
                      value={filters.entityId || ''}
                      onChange={handleFilterChange}
                      variant="outlined"
                      size="small"
                      placeholder="Filter by entity ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category fontSize="small" sx={{ opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="User ID"
                      name="userId"
                      value={filters.userId || ''}
                      onChange={handleFilterChange}
                      variant="outlined"
                      size="small"
                      placeholder="Filter by user ID"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person fontSize="small" sx={{ opacity: 0.7 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
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
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Entity Types:
                  </Typography>
                  <FormControl sx={{ mt: 1, minWidth: 200 }} size="small">
                    <InputLabel id="entity-type-label">Entity Type</InputLabel>
                    <Select
                      labelId="entity-type-label"
                      name="entityType"
                      value={filters.entityType || ''}
                      onChange={handleFilterChange}
                      label="Entity Type"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Entity Types</MenuItem>
                      {entityTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    onClick={handleResetFilters} 
                    startIcon={<Clear />}
                    sx={{ mr: 1, borderRadius: 2 }}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => refetch()}
                    startIcon={<Search />}
                    sx={{ borderRadius: 2 }}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            </Collapse>
            
            {hasActiveFilters && (
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="textSecondary">
                    Active filters ({activeFiltersCount}):
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
                      label={`Date: ${dateRange === 'today' ? 'Today' : 
                        dateRange === '7days' ? 'Last 7 Days' : 
                        dateRange === 'custom' ? 'Custom Range' : 'Last 30 Days'}`} 
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
                  
                  {filters.entityType && (
                    <Chip 
                      label={`Entity Type: ${filters.entityType}`} 
                      size="small" 
                      onDelete={() => handleFilterChange({ target: { name: 'entityType', value: '' } } as any)}
                      sx={{ borderRadius: 1.5 }}
                    />
                  )}
                  
                  {filters.entityId && (
                    <Chip 
                      label={`Entity ID: ${filters.entityId}`} 
                      size="small" 
                      onDelete={() => handleFilterChange({ target: { name: 'entityId', value: '' } } as any)}
                      sx={{ borderRadius: 1.5 }}
                    />
                  )}
                  
                  {filters.userId && (
                    <Chip 
                      label={`User ID: ${filters.userId}`} 
                      size="small" 
                      onDelete={() => handleFilterChange({ target: { name: 'userId', value: '' } } as any)}
                      sx={{ borderRadius: 1.5 }}
                    />
                  )}
                  
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
                Error Loading Audit Logs
              </Typography>
              <Typography color="error.dark">
                {('message' in error) ? error.message : 'An unexpected error occurred while loading the audit logs.'}
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
            <Paper sx={{ p: 2, mt: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, total)} of {total} logs
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
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
                    <MenuItem value={100}>100</MenuItem>
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
        </>
      )}

      {activeTab === 'dashboard' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Type Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart sx={{ fontSize: 120, color: alpha(theme.palette.primary.main, 0.7) }} />
                </Box>
                <Typography variant="body2" align="center" color="textSecondary">
                  Chart visualization of event types would appear here
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Entity Type Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart sx={{ fontSize: 120, color: alpha(theme.palette.secondary.main, 0.7) }} />
                </Box>
                <Typography variant="body2" align="center" color="textSecondary">
                  Chart visualization of entity types would appear here
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activity Timeline
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LineStyle sx={{ fontSize: 120, color: alpha(theme.palette.info.main, 0.7) }} />
                </Box>
                <Typography variant="body2" align="center" color="textSecondary">
                  Timeline visualization of audit activity would appear here
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AuditLogsContainer;