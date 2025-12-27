import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Home as HomeIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  EntitySelector,
  RelationSelector,
  FilterBuilder,
  SortOptions,
  StoredReportsList,
} from '../components';
import { useReportBuilder, useStoredReports } from '../hooks';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const {
    entityType,
    availableRelations,
    selectedRelations,
    availableFields,
    filters,
    sortBy,
    sortOrder,
    loading,
    error,
    generating,
    handleEntityTypeChange,
    handleRelationsChange,
    handleFiltersChange,
    handleSortByChange,
    handleSortOrderChange,
    generateReport,
  } = useReportBuilder();

  const {
    reports,
    totalCount,
    page,
    rowsPerPage,
    loading: storedReportsLoading,
    error: storedReportsError,
    handlePageChange,
    handleRowsPerPageChange,
    handleDownload,
    handleDelete,
    refetch,
  } = useStoredReports();

  const canGenerate = entityType && !generating && !loading;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary" variant="body2">
          Reports
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ReportIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate custom Excel reports or view previously generated reports
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="reports tabs">
          <Tab
            icon={<AddIcon />}
            iconPosition="start"
            label="Generate Report"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Stored Reports"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Error Alerts */}
      {error && activeTab === 0 && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {storedReportsError && activeTab === 1 && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {storedReportsError}
        </Alert>
      )}

      {/* Generate Report Tab */}
      {activeTab === 0 && (
        <>
          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Main Content */}
          {!loading && (
        <Grid container spacing={3}>
          {/* Left Column - Configuration */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Report Configuration
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Entity Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    1. Select Entity Type
                  </Typography>
                  <EntitySelector
                    value={entityType}
                    onChange={handleEntityTypeChange}
                    disabled={generating}
                  />
                </Box>

                <Divider />

                {/* Relation Selection */}
                {entityType && availableRelations.length > 0 && (
                  <>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        2. Select Related Entities (Optional)
                      </Typography>
                      <RelationSelector
                        availableRelations={availableRelations}
                        selectedRelations={selectedRelations}
                        onChange={handleRelationsChange}
                        disabled={generating}
                      />
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Filter Builder */}
                {entityType && Object.keys(availableFields).length > 0 && (
                  <>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        3. Add Filters (Optional)
                      </Typography>
                      <FilterBuilder
                        filters={filters}
                        availableFields={availableFields}
                        selectedRelations={selectedRelations}
                        onChange={handleFiltersChange}
                        disabled={generating}
                      />
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Sort Options */}
                {entityType && Object.keys(availableFields).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      4. Set Sorting (Optional)
                    </Typography>
                    <SortOptions
                      availableFields={availableFields}
                      selectedRelations={selectedRelations}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortByChange={handleSortByChange}
                      onSortOrderChange={handleSortOrderChange}
                      disabled={generating}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Actions & Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                position: 'sticky',
                top: 20,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Generate Report
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={generateReport}
                disabled={!canGenerate}
                sx={{ mb: 2 }}
              >
                {generating ? 'Generating...' : 'Generate Excel Report'}
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Report Information:
                </Typography>
                <Typography variant="body2" component="div">
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    <li>Select an entity type to get started</li>
                    <li>Optionally include related entities</li>
                    <li>Add filters to narrow down results</li>
                    <li>Set sorting preferences</li>
                    <li>Click Generate to download Excel file</li>
                  </Box>
                </Typography>
              </Alert>

              {entityType && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Current Configuration:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Entity: <strong>{entityType}</strong>
                    </Typography>
                    {selectedRelations.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Relations: <strong>{selectedRelations.join(', ')}</strong>
                      </Typography>
                    )}
                    {filters.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Filters: <strong>{filters.length}</strong>
                      </Typography>
                    )}
                    {sortBy && (
                      <Typography variant="body2" color="text.secondary">
                        Sort: <strong>{sortBy} ({sortOrder})</strong>
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
          )}
        </>
      )}

      {/* Stored Reports Tab */}
      {activeTab === 1 && (
        <Box>
          <StoredReportsList
            reports={reports}
            loading={storedReportsLoading}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        </Box>
      )}
    </Container>
  );
};

