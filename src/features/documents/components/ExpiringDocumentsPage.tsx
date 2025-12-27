import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Badge,
  Link,
} from '@mui/material';
import {
  Download,
  Visibility,
  Warning,
  Error as ErrorIcon,
  Schedule,
  Description,
  DirectionsCar,
  Person,
  Article,
  Payment,
  Search,
  FilterList,
  CalendarMonth,
  OpenInNew,
} from '@mui/icons-material';
import { format, differenceInDays, parseISO, isToday, isPast } from 'date-fns';
import { documentApi } from '../api/documentApi';
import { ExpiringDocument } from '../types/document.types';
import { useNotification } from '../../../shared/hooks/useNotification';

// Document type labels and colors
const DOCUMENT_TYPE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  vehicle_inspection: { label: 'Vehicle Inspection', color: 'info' },
  insurance: { label: 'Insurance', color: 'primary' },
  tpl: { label: 'TPL', color: 'secondary' },
  casco: { label: 'CASCO', color: 'warning' },
  driving_permit: { label: 'Driving Permit', color: 'success' },
  customer_registration: { label: 'Customer Registration', color: 'default' },
  contract_agreement: { label: 'Contract Agreement', color: 'primary' },
  id_card: { label: 'ID Card', color: 'info' },
  business_registration: { label: 'Business Registration', color: 'secondary' },
  tax_certificate: { label: 'Tax Certificate', color: 'warning' },
};

// Days filter options
const DAYS_OPTIONS = [
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
];

export const ExpiringDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ExpiringDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  
  const { showSuccess, showError } = useNotification();

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await documentApi.getExpiringDocuments({ days });
        setDocuments(data);
      } catch (err: any) {
        console.error('Failed to fetch expiring documents:', err);
        setError(err.message || 'Failed to load expiring documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [days]);

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = new Set(documents.map(doc => doc.type));
    return Array.from(types);
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Type filter
      if (typeFilter && doc.type !== typeFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query) ||
          doc.fileName.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [documents, typeFilter, searchQuery]);

  // Calculate urgency stats
  const stats = useMemo(() => {
    const today = new Date();
    let expired = 0;
    let expiringToday = 0;
    let expiringThisWeek = 0;
    let expiringLater = 0;

    documents.forEach(doc => {
      const expiryDate = parseISO(doc.expiryDate);
      const daysUntilExpiry = differenceInDays(expiryDate, today);
      
      if (isPast(expiryDate) && !isToday(expiryDate)) {
        expired++;
      } else if (isToday(expiryDate)) {
        expiringToday++;
      } else if (daysUntilExpiry <= 7) {
        expiringThisWeek++;
      } else {
        expiringLater++;
      }
    });

    return { expired, expiringToday, expiringThisWeek, expiringLater, total: documents.length };
  }, [documents]);

  // Get urgency chip for a document
  const getUrgencyChip = (expiryDate: string) => {
    const expiry = parseISO(expiryDate);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (isPast(expiry) && !isToday(expiry)) {
      return <Chip icon={<ErrorIcon />} label="Expired" color="error" size="small" />;
    } else if (isToday(expiry)) {
      return <Chip icon={<Warning />} label="Expires Today" color="error" size="small" variant="outlined" />;
    } else if (daysUntilExpiry <= 7) {
      return <Chip icon={<Warning />} label={`${daysUntilExpiry} days`} color="warning" size="small" />;
    } else if (daysUntilExpiry <= 14) {
      return <Chip icon={<Schedule />} label={`${daysUntilExpiry} days`} color="info" size="small" />;
    } else {
      return <Chip icon={<Schedule />} label={`${daysUntilExpiry} days`} color="default" size="small" />;
    }
  };

  // Get entity info with navigation path
  const getEntityInfo = (doc: ExpiringDocument): { icon: React.ReactNode; label: string; path: string | null } => {
    if (doc.vehicleId) {
      return {
        icon: <DirectionsCar fontSize="small" color="primary" />,
        label: `Vehicle: ${doc.vehicleId.substring(0, 8)}...`,
        path: `/vehicles/${doc.vehicleId}`,
      };
    }
    if (doc.customerId) {
      return {
        icon: <Person fontSize="small" color="primary" />,
        label: `Customer: ${doc.customerId.substring(0, 8)}...`,
        path: `/customers/${doc.customerId}`,
      };
    }
    if (doc.contractId) {
      return {
        icon: <Article fontSize="small" color="primary" />,
        label: `Contract: ${doc.contractId.substring(0, 8)}...`,
        path: `/contracts/${doc.contractId}`,
      };
    }
    if (doc.paymentId) {
      return {
        icon: <Payment fontSize="small" color="primary" />,
        label: `Payment: ${doc.paymentId.substring(0, 8)}...`,
        path: `/payments/${doc.paymentId}`,
      };
    }
    return {
      icon: <Description fontSize="small" color="action" />,
      label: 'Unlinked',
      path: null,
    };
  };

  // Navigate to entity
  const handleNavigateToEntity = (doc: ExpiringDocument) => {
    const { path } = getEntityInfo(doc);
    if (path) {
      navigate(path);
    }
  };

  // Handle download
  const handleDownload = async (doc: ExpiringDocument) => {
    setDownloading(doc.id);
    try {
      const blob = await documentApi.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess('Document downloaded successfully');
    } catch (err: any) {
      console.error('Failed to download document:', err);
      showError('Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  // Handle preview
  const handlePreview = async (doc: ExpiringDocument) => {
    try {
      const blob = await documentApi.previewDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Failed to preview document:', err);
      showError('Failed to preview document');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Expiring Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage documents that are expiring soon
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: stats.expired > 0 ? 'error.main' : 'grey.100',
              color: stats.expired > 0 ? 'error.contrastText' : 'text.primary',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.expired}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expired
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: stats.expiringToday > 0 ? 'warning.main' : 'grey.100',
              color: stats.expiringToday > 0 ? 'warning.contrastText' : 'text.primary',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.expiringToday}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expiring Today
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 48, opacity: 0.5 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.expiringThisWeek}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    This Week
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, opacity: 0.5 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'grey.100' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Documents
                  </Typography>
                </Box>
                <Description sx={{ fontSize: 48, opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search documents..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={days}
              label="Time Range"
              onChange={(e) => setDays(e.target.value as number)}
              startAdornment={
                <InputAdornment position="start">
                  <CalendarMonth fontSize="small" />
                </InputAdornment>
              }
            >
              {DAYS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={typeFilter}
              label="Document Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterList fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="">All Types</MenuItem>
              {documentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {DOCUMENT_TYPE_CONFIG[type]?.label || type.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Badge badgeContent={filteredDocuments.length} color="primary">
            <Chip 
              label={`Showing ${filteredDocuments.length} of ${documents.length}`} 
              variant="outlined"
            />
          </Badge>
        </Stack>
      </Paper>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Description sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Expiring Documents Found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {documents.length === 0
              ? `There are no documents expiring within the next ${days} days.`
              : 'No documents match your current filters.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Related To</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow 
                  key={doc.id}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: isPast(parseISO(doc.expiryDate)) && !isToday(parseISO(doc.expiryDate))
                      ? 'error.lighter'
                      : isToday(parseISO(doc.expiryDate))
                      ? 'warning.lighter'
                      : 'inherit',
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Description color="action" />
                      <Box>
                        <Typography variant="body2" fontWeight="500" noWrap sx={{ maxWidth: 250 }}>
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                          {doc.fileName}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={DOCUMENT_TYPE_CONFIG[doc.type]?.label || doc.type.replace(/_/g, ' ')}
                      color={DOCUMENT_TYPE_CONFIG[doc.type]?.color || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const entityInfo = getEntityInfo(doc);
                      if (entityInfo.path) {
                        return (
                          <Link
                            component="button"
                            onClick={() => handleNavigateToEntity(doc)}
                            underline="hover"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              cursor: 'pointer',
                              textAlign: 'left',
                              '&:hover': {
                                '& .entity-icon': {
                                  transform: 'scale(1.1)',
                                },
                              },
                            }}
                          >
                            <Box className="entity-icon" sx={{ display: 'flex', transition: 'transform 0.2s' }}>
                              {entityInfo.icon}
                            </Box>
                            <Typography variant="body2" color="primary.main" fontWeight={500}>
                              {entityInfo.label}
                            </Typography>
                            <OpenInNew fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                          </Link>
                        );
                      }
                      return (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {entityInfo.icon}
                          <Typography variant="body2" color="text.secondary">
                            {entityInfo.label}
                          </Typography>
                        </Stack>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(parseISO(doc.expiryDate), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getUrgencyChip(doc.expiryDate)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => handlePreview(doc)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDownload(doc)}
                          disabled={downloading === doc.id}
                        >
                          {downloading === doc.id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <Download fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

