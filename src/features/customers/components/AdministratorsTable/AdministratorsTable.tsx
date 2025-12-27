import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Business,
  Email,
  Phone,
  Person,
  MoreVert,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import { Administrator } from "../../types/customer.types";

interface AdministratorsTableProps {
  administrators: Administrator[];
  loading: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const AdministratorsTable: React.FC<AdministratorsTableProps> = ({
  administrators,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<{
    el: HTMLElement;
    id: string;
  } | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setMenuAnchorEl({ el: event.currentTarget, id });
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleView = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      navigate(`/administrators/${id}`);
    }
    handleMenuClose();
  };

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    } else {
      navigate(`/administrators/${id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    handleMenuClose();
  };

  const handleRowClick = (id: string) => {
    navigate(`/administrators/${id}`);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading administrators...
        </Typography>
      </Paper>
    );
  }

  if (administrators.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
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
        overflow: "hidden",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Business fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Company
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Contact
                </Typography>
              </Box>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" fontWeight={600}>
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {administrators.map((admin) => (
            <TableRow
              key={admin.id}
              hover
              onClick={() => handleRowClick(admin.id)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
                transition: "background-color 0.2s",
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Phone
                        fontSize="small"
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption">{admin.phone}</Typography>
                    </Box>
                  )}
                  {admin.companyPhone && admin.companyPhone !== admin.phone && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Phone
                        fontSize="small"
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {admin.companyPhone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Tooltip title="More options">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, admin.id)}
                    aria-haspopup="true"
                    sx={{
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl?.el || null}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 200,
              borderRadius: 1,
              overflow: "hidden",
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => menuAnchorEl && handleView(menuAnchorEl.id)}
          dense
        >
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => menuAnchorEl && handleEdit(menuAnchorEl.id)}
          dense
        >
          <Edit fontSize="small" sx={{ mr: 1.5 }} />
          Edit Administrator
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => menuAnchorEl && handleDelete(menuAnchorEl.id)}
          dense
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1.5 }} />
          Delete Administrator
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};
