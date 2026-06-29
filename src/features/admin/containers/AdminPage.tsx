import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Skeleton,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { adminApi } from '../api/adminApi';
import { CompanyUser, PendingInvite, CompanyRole } from '../types/admin.types';
import { UserRow } from '../components/UserRow';
import { InviteRow } from '../components/InviteRow';
import { InviteUserModal } from '../components/InviteUserModal';
import { useAppSelector } from '../../../app/hooks';

export const AdminPage: React.FC = () => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const data = await adminApi.getInvites();
      setInvites(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load invites');
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const data = await adminApi.getRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchUsers();
    fetchInvites();
  }, [fetchUsers, fetchInvites]);

  useEffect(() => {
    fetchUsers();
    fetchInvites();
    fetchRoles();
  }, [fetchUsers, fetchInvites, fetchRoles]);

  // Access guard
  if (!user?.isAdministrator) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Access Denied
        </Typography>
        <Typography color="text.secondary">
          You do not have permission to view this page. Administrator access is required.
        </Typography>
      </Container>
    );
  }

  const renderUsersTab = () => {
    if (loadingUsers || loadingRoles) {
      return (
        <Box>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      );
    }

    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  roles={roles}
                  onUpdate={refetch}
                  currentUserId={user.id ?? ''}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  const renderInvitesTab = () => {
    if (loadingInvites) {
      return (
        <Box>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      );
    }

    if (invites.length === 0) {
      return (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="text.secondary">No pending invitations</Typography>
        </Box>
      );
    }

    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Expires At</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invites.map((invite) => (
              <InviteRow key={invite.id} invite={invite} onUpdate={refetch} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AdminIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2 }}
            >
              Admin
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Manage company users and invitations
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteModalOpen(true)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: theme.shadows[2],
            '&:hover': { boxShadow: theme.shadows[4] },
          }}
        >
          Invite User
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Pending Invites (${invites.length})`} />
        </Tabs>
      </Box>

      {tab === 0 && renderUsersTab()}
      {tab === 1 && renderInvitesTab()}

      {/* Invite modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          setInviteModalOpen(false);
          refetch();
        }}
        roles={roles}
      />
    </Container>
  );
};
