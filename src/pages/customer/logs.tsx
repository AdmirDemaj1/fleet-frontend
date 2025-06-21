import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Paper,
  } from '@mui/material';
  import SearchIcon from '@mui/icons-material/Search';
  import { DataGrid } from '@mui/x-data-grid';
  import { useState } from 'react';
  import FileDownloadIcon from '@mui/icons-material/FileDownload';
  import { saveAs } from 'file-saver';
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, sortable: false },
    { field: 'user', headerName: 'User', width: 150, sortable: false },
    { field: 'action', headerName: 'Action', width: 200, sortable: false },
    { field: 'resource', headerName: 'Resource', width: 200, sortable: false },
    { field: 'ip', headerName: 'IP Address', width: 150, sortable: false },
    { field: 'timestamp', headerName: 'Timestamp', width: 200, sortable: false },
  ];
  
  const rows = [
    { id: 1, user: 'admin', action: 'Login', resource: '-', ip: '192.168.1.10', timestamp: '2025-06-21 18:30:15' },
    { id: 2, user: 'admin', action: 'Updated DNS', resource: 'example.com', ip: '192.168.1.10', timestamp: '2025-06-21 18:45:02' },
    { id: 3, user: 'user1', action: 'Downloaded File', resource: 'invoice.pdf', ip: '192.168.1.23', timestamp: '2025-06-20 10:22:19' },
  ];
  
  const uniqueUsers = [...new Set(rows.map((r) => r.user))];
  const uniqueActions = [...new Set(rows.map((r) => r.action))];
  
  const LogsPage = () => {
    const [search, setSearch] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
  
    const filteredRows = rows.filter((row) => {
      const matchesSearch =
        row.user.toLowerCase().includes(search.toLowerCase()) ||
        row.action.toLowerCase().includes(search.toLowerCase()) ||
        row.resource.toLowerCase().includes(search.toLowerCase()) ||
        row.ip.includes(search) ||
        row.timestamp.includes(search);
      const matchesUser = userFilter ? row.user === userFilter : true;
      const matchesAction = actionFilter ? row.action === actionFilter : true;
      return matchesSearch && matchesUser && matchesAction;
    });
  
    const handleExport = () => {
      const csvContent = [
        columns.map((col) => col.headerName).join(','),
        ...filteredRows.map((row) => columns.map((col) => row[col.field as keyof typeof row]).join(','))
          ].join('\n');
  
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'logs_export.csv');
    };
  
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📝 Activity Logs
        </Typography>
  
        {/* Filter Panel */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              label="Search"
              placeholder="Search all fields"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
  
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>User</InputLabel>
              <Select
                value={userFilter}
                label="User"
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueUsers.map((user) => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueActions.map((action) => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{ textTransform: 'none', height: 40 }}
            >
              Export CSV
            </Button>
          </Box>
        </Paper>
  
        {/* Logs Table */}
        <Paper elevation={1} sx={{ height: 600, borderRadius: 3 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            getRowHeight={() => 'auto'}
            sx={{
              borderRadius: 2,
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f4f4f5',
                fontWeight: 'bold',
                fontSize: '0.95rem',
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal !important',
                wordBreak: 'break-word !important',
              },
            }}
          />
        </Paper>
      </Box>
    );
  };
  
  export default LogsPage;