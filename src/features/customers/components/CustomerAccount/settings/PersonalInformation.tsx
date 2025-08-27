import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Person,
  Business
} from '@mui/icons-material';
import { customerApi } from '../../../api/customerApi';
import { CustomerType } from '../../../types/customer.types';

interface PersonalInformationProps {
  customerId: string;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({
  customerId
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getById(customerId);
      const customerData = data.customer || data;
      setCustomer(customerData);
      setFormData(customerData);
    } catch (err) {
      setError('Failed to load customer information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...customer });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...customer });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Placeholder
      setCustomer(formData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={150} height={24} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const isIndividual = customer?.type === CustomerType.INDIVIDUAL;

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                mr: 3,
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              {isIndividual ? (
                `${customer?.firstName?.[0]}${customer?.lastName?.[0]}`
              ) : (
                <Business sx={{ fontSize: 40 }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Personal Information
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account details and personal information
              </Typography>
            </Box>
          </Box>
          
          {!isEditing && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Edit Information
            </Button>
          )}
        </Box>

        {/* Profile Picture Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2.5rem',
                  fontWeight: 700
                }}
              >
                {isIndividual ? (
                  `${customer?.firstName?.[0]}${customer?.lastName?.[0]}`
                ) : (
                  <Business sx={{ fontSize: 48 }} />
                )}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.background.paper}`,
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
                size="small"
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Profile Picture
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update your profile picture to help others recognize you
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhotoCamera />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2
                }}
                disabled
              >
                Change Photo
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form Content */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Grid container spacing={3}>
          {/* Customer Type */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              Account Type
            </Typography>
            <Box sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main' }}>
                {isIndividual ? 'Individual Customer' : 'Business Customer'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isIndividual 
                  ? 'Personal account for individual customers'
                  : 'Business account for corporate customers'
                }
              </Typography>
            </Box>
          </Grid>

          {isIndividual ? (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData?.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData?.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ID Number"
                  value={formData?.idNumber || ''}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData?.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Legal Business Name"
                  value={formData?.legalName || ''}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="NUIS/NIPT"
                  value={formData?.nuisNipt || ''}
                  onChange={(e) => handleChange('nuisNipt', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Administrator Name"
                  value={formData?.administratorName || ''}
                  onChange={(e) => handleChange('administratorName', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Administrator Position"
                  value={formData?.administratorPosition || ''}
                  onChange={(e) => handleChange('administratorPosition', e.target.value)}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData?.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={2}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData?.additionalNotes || ''}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={3}
              variant="outlined"
              placeholder="Any additional information or notes..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {isEditing && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': { boxShadow: 6 }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
