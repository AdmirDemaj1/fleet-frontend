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
  Person,
  Badge,
  Email,
  Phone,
  Home,
  CalendarToday
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';

export const IndividualDetailsStep: React.FC = () => {
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
      {/* Personal Information Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <Person />
          Personal Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the individual's basic personal details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="individualDetails.firstName"
              control={control}
              defaultValue=""
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  required
                  error={!!getNestedError('individualDetails.firstName')}
                  helperText={getNestedError('individualDetails.firstName')?.message}
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
              name="individualDetails.lastName"
              control={control}
              defaultValue=""
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  required
                  error={!!getNestedError('individualDetails.lastName')}
                  helperText={getNestedError('individualDetails.lastName')?.message}
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
              name="individualDetails.idNumber"
              control={control}
              defaultValue=""
              rules={{ required: 'ID number is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ID Number"
                  fullWidth
                  required
                  error={!!getNestedError('individualDetails.idNumber')}
                  helperText={getNestedError('individualDetails.idNumber')?.message}
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
              name="individualDetails.dateOfBirth"
              control={control}
              defaultValue=""
              rules={{ required: 'Date of birth is required' }}
              render={({ field }) => (
                <DatePicker
                  label="Date of Birth"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.format("YYYY-MM-DD"))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!getNestedError('individualDetails.dateOfBirth'),
                      helperText: getNestedError('individualDetails.dateOfBirth')?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                      sx: fieldStyle
                    },
                  }}
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
          Provide contact details and address information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="individualDetails.address"
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
                  error={!!getNestedError('individualDetails.address')}
                  helperText={getNestedError('individualDetails.address')?.message}
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
              name="individualDetails.phone"
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
                  error={!!getNestedError('individualDetails.phone')}
                  helperText={getNestedError('individualDetails.phone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="individualDetails.email"
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
                  error={!!getNestedError('individualDetails.email')}
                  helperText={getNestedError('individualDetails.email')?.message}
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
              name="individualDetails.secondaryPhone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label="Secondary Phone (Optional)"
                  fullWidth
                  defaultCountry="AL"
                  error={!!getNestedError('individualDetails.secondaryPhone')}
                  helperText={getNestedError('individualDetails.secondaryPhone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="individualDetails.secondaryEmail"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Secondary Email (Optional)"
                  type="email"
                  fullWidth
                  error={!!getNestedError('individualDetails.secondaryEmail')}
                  helperText={getNestedError('individualDetails.secondaryEmail')?.message}
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
              name="individualDetails.additionalNotes"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Notes (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!getNestedError('individualDetails.additionalNotes')}
                  helperText={getNestedError('individualDetails.additionalNotes')?.message}
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
