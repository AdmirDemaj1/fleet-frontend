import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  TablePagination
} from '@mui/material';
import { CustomerLog } from '../../types/customer.types';
import { customerApi } from '../../api/customerApi';
import dayjs from 'dayjs';

interface CustomerLogsProps {
  customerId: string;
  logs: CustomerLog[];
}

export const CustomerLogs: React.FC<CustomerLogsProps> = ({ 
  customerId, 
  logs: initialLogs 
}) => {
  const [logs, setLogs] = useState<CustomerLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, [customerId, page, rowsPerPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getLogs(customerId, {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      });
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeColor = (type: string) => {
    if (type.includes('created')) return 'success';
    if (type.includes('updated')) return 'info';
    if (type.includes('deleted')) return 'error';
    return 'default';
  };

  if (loading && logs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Activity Log</Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Performed By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  {dayjs(log.createdAt).format('MMM D, YYYY h:mm A')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.type.replace(/_/g, ' ')}
                    size="small"
                    color={getLogTypeColor(log.type) as any}
                  />
                </TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.performedBy || 'System'}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No activity logs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={-1}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};