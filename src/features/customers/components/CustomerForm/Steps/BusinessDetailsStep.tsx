import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Button,
  Paper
} from '@mui/material';
import {
  Business,
  Badge,
  Email,
  Phone,
  Home,
  Groups,
  Add,
  Remove
} from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { MuiTelInput } from 'mui-tel-input';
import { AdministratorPicker } from '../../AdministratorPicker';

export const BusinessDetailsStep: React.FC = () => {
  const theme = useTheme();
  const { control, formState: { errors }, setValue, watch } = useFormContext();
  const watchedAdministratorIds = watch('businessDetails.administratorIds') || [];

  // Field array for shareholders
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'businessDetails.shareholders'
  });

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

        </Grid>
      </Box>

      {/* Shareholders Section */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 2
        }}>
          <Groups />
          Main Shareholders (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add the main shareholders or owners of the business
        </Typography>

        {fields.length === 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              No shareholders added yet
            </Typography>
          </Box>
        )}

        {fields.map((field, index) => (
          <Paper
            key={field.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.5)
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={10}>
                <Controller
                  name={`businessDetails.shareholders.${index}.name` as const}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`Shareholder ${index + 1}`}
                      fullWidth
                      placeholder="Enter shareholder name"
                      error={!!getNestedError(`businessDetails.shareholders.${index}.name`)}
                      helperText={getNestedError(`businessDetails.shareholders.${index}.name`)?.message}
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
              <Grid item xs={12} sm={2}>
                <IconButton
                  onClick={() => remove(index)}
                  color="error"
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1)
                    }
                  }}
                  aria-label={`Remove shareholder ${index + 1}`}
                >
                  <Remove />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => append({ name: '' })}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderStyle: 'dashed',
            borderWidth: 2,
            py: 1.5,
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          Add Shareholder
        </Button>
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
                <MuiTelInput
                  {...field}
                  label="Phone"
                  fullWidth
                  required
                  defaultCountry="AL"
                  error={!!getNestedError('businessDetails.phone')}
                  helperText={getNestedError('businessDetails.phone')?.message}
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
                <MuiTelInput
                  {...field}
                  label="Secondary Phone (Optional)"
                  fullWidth
                  defaultCountry="AL"
                  error={!!getNestedError('businessDetails.secondaryPhone')}
                  helperText={getNestedError('businessDetails.secondaryPhone')?.message}
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

      {/* Administrator Selection Section */}
      <Box mb={5}>
        <Divider sx={{ mb: 4 }} />
        <AdministratorPicker
          selectedAdministratorIds={watchedAdministratorIds}
          onAdministratorSelect={(ids) => {
            setValue('businessDetails.administratorIds', ids, { shouldValidate: true });
          }}
          error={getNestedError('businessDetails.administratorIds')?.message}
        />
      </Box>
    </Box>
  );
};
