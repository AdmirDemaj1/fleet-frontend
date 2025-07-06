import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Grid, TextField, Typography } from '@mui/material';
import { CreateCustomerDto } from '../../types/customer.types';

export const BusinessCustomerForm: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CreateCustomerDto>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Business Information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <Controller
          name="businessDetails.legalName"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Legal Name"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.legalName}
              helperText={(errors.businessDetails as any)?.legalName?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.nuisNipt"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="NUIS/NIPT"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.nuisNipt}
              helperText={(errors.businessDetails as any)?.nuisNipt?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.administratorName"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Administrator Name"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.administratorName}
              helperText={(errors.businessDetails as any)?.administratorName?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.administratorId"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Administrator ID"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.administratorId}
              helperText={(errors.businessDetails as any)?.administratorId?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.administratorPosition"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Administrator Position"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.administratorPosition}
              helperText={(errors.businessDetails as any)?.administratorPosition?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="businessDetails.mainShareholders"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Main Shareholders"
              fullWidth
              multiline
              rows={2}
              error={!!(errors.businessDetails as any)?.mainShareholders}
              helperText={(errors.businessDetails as any)?.mainShareholders?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Contact Information
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="businessDetails.address"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Address"
              fullWidth
              required
              multiline
              rows={2}
              error={!!(errors.businessDetails as any)?.address}
              helperText={(errors.businessDetails as any)?.address?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.phone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.phone}
              helperText={(errors.businessDetails as any)?.phone?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              required
              error={!!(errors.businessDetails as any)?.email}
              helperText={(errors.businessDetails as any)?.email?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.secondaryPhone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Secondary Phone"
              fullWidth
              error={!!(errors.businessDetails as any)?.secondaryPhone}
              helperText={(errors.businessDetails as any)?.secondaryPhone?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="businessDetails.secondaryEmail"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Secondary Email"
              type="email"
              fullWidth
              error={!!(errors.businessDetails as any)?.secondaryEmail}
              helperText={(errors.businessDetails as any)?.secondaryEmail?.message}
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
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              error={!!(errors.businessDetails as any)?.additionalNotes}
              helperText={(errors.businessDetails as any)?.additionalNotes?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};