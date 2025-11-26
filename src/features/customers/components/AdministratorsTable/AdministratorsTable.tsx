import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import { Business, Email, Phone, Person } from '@mui/icons-material';
import { Administrator } from '../../types/customer.types';

interface AdministratorsTableProps {
  administrators: Administrator[];
  loading: boolean;
}

export const AdministratorsTable: React.FC<AdministratorsTableProps> = ({
  administrators,
  loading,
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading administrators...
        </Typography>
      </Paper>
    );
  }

  if (administrators.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No administrators found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      elevation={2}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Company
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Administrator
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                Position
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                NUIS/NIPT
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Contact
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {administrators.map((admin) => (
            <TableRow
              key={admin.id}
              hover
              sx={{
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                },
                transition: 'background-color 0.2s',
              }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {admin.companyName}
                  </Typography>
                  {admin.companyEmail && (
                    <Typography variant="caption" color="text.secondary">
                      {admin.companyEmail}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {admin.administratorName}
                  </Typography>
                  {admin.email && (
                    <Typography variant="caption" color="text.secondary">
                      {admin.email}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={admin.administratorPosition}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {admin.nuisNipt}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  {admin.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Phone fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">{admin.phone}</Typography>
                    </Box>
                  )}
                  {admin.companyPhone && admin.companyPhone !== admin.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {admin.companyPhone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

