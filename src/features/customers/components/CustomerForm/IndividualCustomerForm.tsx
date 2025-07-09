import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Grid, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { CreateCustomerDto } from "../../types/customer.types";

export const IndividualCustomerForm: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateCustomerDto>();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Personal Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.firstName"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                required
                error={!!(errors.individualDetails as any)?.firstName}
                helperText={(errors.individualDetails as any)?.firstName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.lastName"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                required
                error={!!(errors.individualDetails as any)?.lastName}
                helperText={(errors.individualDetails as any)?.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.idNumber"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="ID Number"
                fullWidth
                required
                error={!!(errors.individualDetails as any)?.idNumber}
                helperText={(errors.individualDetails as any)?.idNumber?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.dateOfBirth"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <DatePicker
                label="Date of Birth"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date?.format("YYYY-MM-DD"))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!(errors.individualDetails as any)?.dateOfBirth,
                    helperText: (errors.individualDetails as any)?.dateOfBirth?.message,
                  },
                }}
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
            name="individualDetails.address"
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
                error={!!(errors.individualDetails as any)?.address}
                helperText={(errors.individualDetails as any)?.address?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.phone"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone"
                fullWidth
                required
                error={!!(errors.individualDetails as any)?.phone}
                helperText={(errors.individualDetails as any)?.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!(errors.individualDetails as any)?.email}
                helperText={(errors.individualDetails as any)?.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.secondaryPhone"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Secondary Phone"
                fullWidth
                error={!!(errors.individualDetails as any)?.secondaryPhone}
                helperText={(errors.individualDetails as any)?.secondaryPhone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="individualDetails.secondaryEmail"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Secondary Email"
                type="email"
                fullWidth
                error={!!(errors.individualDetails as any)?.secondaryEmail}
                helperText={(errors.individualDetails as any)?.secondaryEmail?.message}
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
                label="Additional Notes"
                fullWidth
                multiline
                rows={3}
                error={!!(errors.individualDetails as any)?.additionalNotes}
                helperText={(errors.individualDetails as any)?.additionalNotes?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};
