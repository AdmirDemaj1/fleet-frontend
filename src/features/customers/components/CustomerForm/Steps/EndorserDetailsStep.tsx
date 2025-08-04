import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  InputAdornment,
  useTheme,
  alpha,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person,
  Badge,
  Email,
  Phone,
  Home,
  CalendarToday,
  AccountBalance,
  ExpandMore,
  Notes,
  Security
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MuiTelInput } from 'mui-tel-input';
import dayjs from 'dayjs';

export const EndorserDetailsStep: React.FC = () => {
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
          Enter the endorser's basic personal details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="endorserDetails.firstName"
              control={control}
              defaultValue=""
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  required
                  error={!!getNestedError('endorserDetails.firstName')}
                  helperText={getNestedError('endorserDetails.firstName')?.message}
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
              name="endorserDetails.lastName"
              control={control}
              defaultValue=""
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  required
                  error={!!getNestedError('endorserDetails.lastName')}
                  helperText={getNestedError('endorserDetails.lastName')?.message}
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
              name="endorserDetails.idNumber"
              control={control}
              defaultValue=""
              rules={{ required: 'ID number is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="ID Number"
                  fullWidth
                  required
                  error={!!getNestedError('endorserDetails.idNumber')}
                  helperText={getNestedError('endorserDetails.idNumber')?.message}
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
              name="endorserDetails.dateOfBirth"
              control={control}
              defaultValue=""
              rules={{ required: 'Date of birth is required' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Date of Birth"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    field.onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                  }}
                  maxDate={dayjs().subtract(18, 'year')}
                  slots={{
                    textField: (params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!getNestedError('endorserDetails.dateOfBirth')}
                        helperText={getNestedError('endorserDetails.dateOfBirth')?.message}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={fieldStyle}
                      />
                    ),
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
          Provide contact details for the endorser
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="endorserDetails.address"
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
                  rows={2}
                  error={!!getNestedError('endorserDetails.address')}
                  helperText={getNestedError('endorserDetails.address')?.message}
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
              name="endorserDetails.phone"
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
                  error={!!getNestedError('endorserDetails.primaryPhone')}
                  helperText={getNestedError('endorserDetails.primaryPhone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="endorserDetails.email"
              control={control}
              defaultValue=""
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  error={!!getNestedError('endorserDetails.email')}
                  helperText={getNestedError('endorserDetails.email')?.message}
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
              name="endorserDetails.secondaryPhone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label="Phone"
                  fullWidth
                  required
                  defaultCountry="AL"
                  error={!!getNestedError('endorserDetails.secondaryPhone')}
                  helperText={getNestedError('endorserDetails.secondaryPhone')?.message}
                  sx={fieldStyle}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="endorserDetails.secondaryEmail"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Secondary Email (Optional)"
                  type="email"
                  fullWidth
                  error={!!getNestedError('endorserDetails.secondaryEmail')}
                  helperText={getNestedError('endorserDetails.secondaryEmail')?.message}
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
        </Grid>
      </Box>

      {/* Endorser-Specific Information */}
      <Box mb={5}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          mb: 3
        }}>
          <Security />
          Endorser Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Provide endorser-specific information and guarantees
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="endorserDetails.guaranteedAmount"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Maximum Guaranteed Amount"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!getNestedError('endorserDetails.guaranteedAmount')}
                  helperText={getNestedError('endorserDetails.guaranteedAmount')?.message || 'Maximum amount this endorser can guarantee'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance color="action" fontSize="small" />
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
              name="endorserDetails.relationshipToCustomer"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Relationship to Customer"
                  fullWidth
                  placeholder="e.g., Business Partner, Family Member"
                  error={!!getNestedError('endorserDetails.relationshipToCustomer')}
                  helperText={getNestedError('endorserDetails.relationshipToCustomer')?.message}
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

          <Grid item xs={12}>
            <Controller
              name="endorserDetails.active"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active Endorser"
                  sx={{ mt: 1 }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Optional Information - Collapsible */}
      <Box mb={3}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="optional-info-content"
            id="optional-info-header"
          >
            <Typography variant="h6" fontWeight={600}>
              Additional Information (Optional)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="endorserDetails.additionalNotes"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Additional Notes"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Any additional information about the endorser..."
                      error={!!getNestedError('endorserDetails.additionalNotes')}
                      helperText={getNestedError('endorserDetails.additionalNotes')?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <Notes color="action" fontSize="small" />
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
                  name="endorserDetails.notes"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Internal Notes"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Internal notes about this endorser (not visible to customer)..."
                      error={!!getNestedError('endorserDetails.notes')}
                      helperText={getNestedError('endorserDetails.notes')?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <Notes color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};
