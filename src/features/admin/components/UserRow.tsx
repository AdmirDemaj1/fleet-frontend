import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { CompanyUser, CompanyRole } from '../types/admin.types';
import { adminApi } from '../api/adminApi';

interface UserRowProps {
  user: CompanyUser;
  roles: CompanyRole[];
  onUpdate: () => void;
  currentUserId: string;
}

const statusChipProps = (
  status: CompanyUser['status'],
): { label: string; color: 'success' | 'warning' | 'default' } => {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'success' };
    case 'suspended':
      return { label: 'Suspended', color: 'warning' };
    default:
      return { label: 'Inactive', color: 'default' };
  }
};

const initials = (user: CompanyUser): string =>
  `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';

export const UserRow: React.FC<UserRowProps> = ({
  user,
  roles,
  onUpdate,
  currentUserId,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId);
  const [roleLoading, setRoleLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const isSelf = user.id === currentUserId;
  const chip = statusChipProps(user.status);
  const roleName = roles.find((r) => r.id === user.roleId)?.name ?? user.roleId;

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleChangeRoleClick = () => {
    closeMenu();
    setChangingRole(true);
    setSelectedRoleId(user.roleId);
  };

  const handleRoleSelectChange = (e: SelectChangeEvent<string>) => {
    setSelectedRoleId(e.target.value);
  };

  const handleRoleSubmit = async () => {
    if (selectedRoleId === user.roleId) {
      setChangingRole(false);
      return;
    }
    setRoleLoading(true);
    try {
      await adminApi.updateUserRole(user.id, selectedRoleId);
      onUpdate();
    } catch {
      // silently ignore; parent will refetch
    } finally {
      setRoleLoading(false);
      setChangingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    closeMenu();
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setStatusLoading(true);
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      onUpdate();
    } catch {
      // ignore
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    setRemoveLoading(true);
    try {
      await adminApi.removeUser(user.id);
      setRemoveDialogOpen(false);
      onUpdate();
    } catch {
      // ignore
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <>
      <TableRow hover>
        {/* User column */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
              {initials(user)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {/* Email column */}
        <TableCell>
          <Typography variant="body2">{user.email}</Typography>
        </TableCell>

        {/* Status column */}
        <TableCell>
          {statusLoading ? (
            <CircularProgress size={18} />
          ) : (
            <Chip size="small" label={chip.label} color={chip.color} />
          )}
        </TableCell>

        {/* Role column */}
        <TableCell>
          {changingRole ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Select
                size="small"
                value={selectedRoleId}
                onChange={handleRoleSelectChange}
                sx={{ minWidth: 130 }}
                disabled={roleLoading}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
              <Button
                size="small"
                variant="contained"
                onClick={handleRoleSubmit}
                disabled={roleLoading}
              >
                {roleLoading ? <CircularProgress size={14} color="inherit" /> : 'Save'}
              </Button>
              <Button
                size="small"
                onClick={() => setChangingRole(false)}
                disabled={roleLoading}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Typography variant="body2">{roleName}</Typography>
          )}
        </TableCell>

        {/* Actions column */}
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={openMenu}
            disabled={isSelf}
            aria-label="user actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleChangeRoleClick}>Change Role</MenuItem>
            <MenuItem onClick={handleToggleStatus}>
              {user.status === 'active' ? 'Suspend' : 'Activate'}
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeMenu();
                setRemoveDialogOpen(true);
              }}
              sx={{ color: 'error.main' }}
            >
              Remove
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* Remove confirmation dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => !removeLoading && setRemoveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{' '}
            <strong>
              {user.firstName} {user.lastName}
            </strong>{' '}
            from this company? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRemoveDialogOpen(false)}
            disabled={removeLoading}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveConfirm}
            disabled={removeLoading}
            startIcon={removeLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {removeLoading ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
