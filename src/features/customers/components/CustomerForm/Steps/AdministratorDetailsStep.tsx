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
  AccountBox,
  Work
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { MuiTelInput } from 'mui-tel-input';

export const AdministratorDetailsStep: React.FC = () => {
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
      {/* Company Information Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <Business />
          Company Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the company registration and legal details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="administratorDetails.companyName"
              control={control}
              defaultValue=""
              rules={{ required: 'Company name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.companyName')}
                  helperText={getNestedError('administratorDetails.companyName')?.message}
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
              name="administratorDetails.nuisNipt"
              control={control}
              defaultValue=""
              rules={{ required: 'NUIS/NIPT is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="NUIS/NIPT"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.nuisNipt')}
                  helperText={getNestedError('administratorDetails.nuisNipt')?.message}
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
              name="administratorDetails.companyEmail"
              control={control}
              defaultValue=""
              rules={{ 
                required: 'Company email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Email"
                  type="email"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.companyEmail')}
                  helperText={getNestedError('administratorDetails.companyEmail')?.message}
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
              name="administratorDetails.companyPhone"
              control={control}
              defaultValue=""
              rules={{ required: 'Company phone is required' }}
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label="Company Phone"
                  fullWidth
                  required
                  defaultCountry="AL"
                  error={!!getNestedError('administratorDetails.companyPhone')}
                  helperText={getNestedError('administratorDetails.companyPhone')?.message}
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
          Details of the administrator or authorized representative
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="administratorDetails.administratorName"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator Name"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.administratorName')}
                  helperText={getNestedError('administratorDetails.administratorName')?.message}
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
              name="administratorDetails.administratorId"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator ID is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator ID"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.administratorId')}
                  helperText={getNestedError('administratorDetails.administratorId')?.message}
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
              name="administratorDetails.administratorPosition"
              control={control}
              defaultValue=""
              rules={{ required: 'Administrator position is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Administrator Position"
                  fullWidth
                  required
                  error={!!getNestedError('administratorDetails.administratorPosition')}
                  helperText={getNestedError('administratorDetails.administratorPosition')?.message}
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
          Personal contact details and address information for the administrator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="administratorDetails.address"
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
                  error={!!getNestedError('administratorDetails.address')}
                  helperText={getNestedError('administratorDetails.address')?.message}
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
              name="administratorDetails.phone"
              control={control}
              defaultValue=""
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label="Phone"
                  fullWidth
                  required
                  defaultCountry="AL"
                  error={!!getNestedError('administratorDetails.phone')}
                  helperText={getNestedError('administratorDetails.phone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="administratorDetails.email"
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
                  error={!!getNestedError('administratorDetails.email')}
                  helperText={getNestedError('administratorDetails.email')?.message}
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
              name="administratorDetails.secondaryPhone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label="Secondary Phone (Optional)"
                  fullWidth
                  defaultCountry="AL"
                  error={!!getNestedError('administratorDetails.secondaryPhone')}
                  helperText={getNestedError('administratorDetails.secondaryPhone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="administratorDetails.secondaryEmail"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Secondary Email (Optional)"
                  type="email"
                  fullWidth
                  error={!!getNestedError('administratorDetails.secondaryEmail')}
                  helperText={getNestedError('administratorDetails.secondaryEmail')?.message}
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
              name="administratorDetails.additionalNotes"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Notes (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!getNestedError('administratorDetails.additionalNotes')}
                  helperText={getNestedError('administratorDetails.additionalNotes')?.message}
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

