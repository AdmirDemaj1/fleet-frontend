import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  Add,
  Delete
} from '@mui/icons-material';

interface ContactInformationProps {
  customerId: string;
}

export const ContactInformation: React.FC<ContactInformationProps> = ({
  customerId
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    secondaryEmail: '',
    phone: '',
    secondaryPhone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFormData({
        email: 'customer@example.com',
        secondaryEmail: 'backup@example.com',
        phone: '+1 (555) 123-4567',
        secondaryPhone: '+1 (555) 987-6543',
        emergencyContact: {
          name: 'John Doe',
          phone: '+1 (555) 111-2222',
          relationship: 'Spouse'
        }
      });
      setLoading(false);
    }, 1000);
  }, [customerId]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Contact Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your contact details and communication preferences
          </Typography>
        </Box>
        
        {!isEditing && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Edit Contact Info
          </Button>
        )}
      </Box>

      {/* Primary Contact */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <Email sx={{ mr: 1 }} />
          Primary Contact Methods
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              type="email"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Secondary Contact */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <Phone sx={{ mr: 1 }} />
          Secondary Contact Methods
          <Chip label="Optional" size="small" sx={{ ml: 2 }} />
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Secondary Email"
              value={formData.secondaryEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, secondaryEmail: e.target.value }))}
              disabled={!isEditing}
              type="email"
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Secondary Phone"
              value={formData.secondaryPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Emergency Contact */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          Emergency Contact
          <Chip label="Important" color="warning" size="small" sx={{ ml: 2 }} />
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Name"
              value={formData.emergencyContact.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, name: e.target.value }
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={formData.emergencyContact.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
              }))}
              disabled={!isEditing}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      {isEditing && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => setIsEditing(false)}
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
        </Paper>
      )}
    </Box>
  );
};
