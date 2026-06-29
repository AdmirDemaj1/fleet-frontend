import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { CompanyRole } from '../types/admin.types';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: CompanyRole[];
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  open,
  onClose,
  onSuccess,
  roles,
}) => {
  const [values, setValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.firstName.trim()) next.firstName = 'First name is required';
    if (!values.lastName.trim()) next.lastName = 'Last name is required';
    if (!values.email.trim()) {
      next.email = 'Email is required';
    } else if (!EMAIL_RE.test(values.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!values.roleId) next.roleId = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await adminApi.inviteUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        roleId: values.roleId,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ?? 'Failed to send invitation. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setValues({ firstName: '', lastName: '', email: '', roleId: '' });
    setErrors({});
    setSubmitError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Invite User</DialogTitle>

      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Invitation sent successfully!
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="First Name"
            value={values.firstName}
            onChange={handleChange('firstName')}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            fullWidth
            required
            disabled={submitting}
          />
          <TextField
            label="Last Name"
            value={values.lastName}
            onChange={handleChange('lastName')}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            fullWidth
            required
            disabled={submitting}
          />
          <TextField
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
            required
            disabled={submitting}
          />
          <TextField
            select
            label="Role"
            value={values.roleId}
            onChange={handleChange('roleId')}
            error={Boolean(errors.roleId)}
            helperText={errors.roleId}
            fullWidth
            required
            disabled={submitting}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Sending…' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
