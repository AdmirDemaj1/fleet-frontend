import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  InputAdornment,
  useTheme,
  alpha
} from '@mui/material';
import {
  Business,
  Badge,
  Email,
  Phone,
  Home,
  Person,
  Groups,
  AccountBox,
  Work
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

export const BusinessDetailsStep: React.FC = () => {
  const theme = useTheme();
  const { control, formState: { errors } } = useFormContext();

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      }
    }
  };

  const getNestedError = (path: string) => {
    const pathArray = path.split('.');
    let error: any = errors;
    for (const key of pathArray) {
      error = error?.[key];
    }
    return error as { message?: string } | undefined;
  };

  return (
    <Box>
      {/* Business Information Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <Business />
          Business Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the business registration and legal details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="businessDetails.legalName"
              control={control}
              defaultValue=""
              rules={{ required: 'Legal name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Legal Name"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.legalName')}
                  helperText={getNestedError('businessDetails.legalName')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.nuisNipt"
              control={control}
              defaultValue=""
              rules={{ required: 'NUIS/NIPT is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="NUIS/NIPT"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.nuisNipt')}
                  helperText={getNestedError('businessDetails.nuisNipt')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.mainShareholders"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Main Shareholders (Optional)"
                  fullWidth
                  error={!!getNestedError('businessDetails.mainShareholders')}
                  helperText={getNestedError('businessDetails.mainShareholders')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Groups color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Administrator Information Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <AccountBox />
          Administrator Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Details of the business administrator or authorized representative
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.administratorName"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator Name"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.administratorName')}
                  helperText={getNestedError('businessDetails.administratorName')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.administratorId"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator ID is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator ID"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.administratorId')}
                  helperText={getNestedError('businessDetails.administratorId')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="businessDetails.administratorPosition"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator position is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator Position"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.administratorPosition')}
                  helperText={getNestedError('businessDetails.administratorPosition')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Contact Information Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <Phone />
          Contact Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Business contact details and address information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="businessDetails.address"
              control={control}
              defaultValue=""
              rules={{ required: 'Address is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Address"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  error={!!getNestedError('businessDetails.address')}
                  helperText={getNestedError('businessDetails.address')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <Home color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.phone"
              control={control}
              defaultValue=""
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.phone')}
                  helperText={getNestedError('businessDetails.phone')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.email"
              control={control}
              defaultValue=""
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  error={!!getNestedError('businessDetails.email')}
                  helperText={getNestedError('businessDetails.email')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.secondaryPhone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Secondary Phone (Optional)"
                  fullWidth
                  error={!!getNestedError('businessDetails.secondaryPhone')}
                  helperText={getNestedError('businessDetails.secondaryPhone')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="businessDetails.secondaryEmail"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Secondary Email (Optional)"
                  type="email"
                  fullWidth
                  error={!!getNestedError('businessDetails.secondaryEmail')}
                  helperText={getNestedError('businessDetails.secondaryEmail')?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="businessDetails.additionalNotes"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Notes (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!getNestedError('businessDetails.additionalNotes')}
                  helperText={getNestedError('businessDetails.additionalNotes')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
