import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { PendingInvite } from '../types/admin.types';
import { adminApi } from '../api/adminApi';

interface InviteRowProps {
  invite: PendingInvite;
  onUpdate: () => void;
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

export const InviteRow: React.FC<InviteRowProps> = ({ invite, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await adminApi.cancelInvite(invite.id);
      setDialogOpen(false);
      onUpdate();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Typography variant="body2">{invite.email}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {invite.firstName} {invite.lastName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{formatDate(invite.expiresAt)}</Typography>
        </TableCell>
        <TableCell align="right">
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => setDialogOpen(true)}
          >
            Cancel Invite
          </Button>
        </TableCell>
      </TableRow>

      <Dialog
        open={dialogOpen}
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cancel Invitation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the invitation sent to{' '}
            <strong>{invite.email}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Keep
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Cancelling…' : 'Cancel Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
