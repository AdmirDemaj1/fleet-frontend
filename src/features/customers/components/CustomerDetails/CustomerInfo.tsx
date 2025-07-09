import React from 'react';
import { Grid, Typography, Paper, Box, Chip, Divider } from '@mui/material';
import { CustomerDetailed, CustomerType } from '../../types/customer.types';
import dayjs from 'dayjs';

interface CustomerInfoProps {
  customer: CustomerDetailed;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  const customerData = customer.customer;
  const isIndividual = customerData.type === CustomerType.INDIVIDUAL;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">
              {isIndividual 
                ? `${customerData.firstName} ${customerData.lastName}`
                : customerData.legalName
              }
            </Typography>
            <Chip
              label={isIndividual ? 'Individual' : 'Business'}
              color={isIndividual ? 'primary' : 'secondary'}
              size="small"
            />
          </Box>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        {isIndividual ? (
          <>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ID Number
              </Typography>
              <Typography variant="body1">
                {customerData.idNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date of Birth
              </Typography>
              <Typography variant="body1">
                {dayjs(customerData.dateOfBirth).format('MMMM D, YYYY')}
              </Typography>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                NUIS/NIPT
              </Typography>
              <Typography variant="body1">
                {customerData.nuisNipt}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Administrator
              </Typography>
              <Typography variant="body1">
                {customerData.administratorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {customerData.administratorPosition} - ID: {customerData.administratorId}
              </Typography>
            </Grid>
            {customerData.mainShareholders && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Main Shareholders
                </Typography>
                <Typography variant="body1">
                  {customerData.mainShareholders}
                </Typography>
              </Grid>
            )}
          </>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Address
          </Typography>
          <Typography variant="body1">
            {customerData.address}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Primary Contact
          </Typography>
          <Typography variant="body1">
            {customerData.email}
          </Typography>
          <Typography variant="body1">
            {customerData.phone}
          </Typography>
        </Grid>

        {(customerData.secondaryEmail || customerData.secondaryPhone) && (
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Secondary Contact
            </Typography>
            {customerData.secondaryEmail && (
              <Typography variant="body1">
                {customerData.secondaryEmail}
              </Typography>
            )}
            {customerData.secondaryPhone && (
              <Typography variant="body1">
                {customerData.secondaryPhone}
              </Typography>
            )}
          </Grid>
        )}

        {customerData.additionalNotes && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Additional Notes
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Typography variant="body2">
                {customerData.additionalNotes}
              </Typography>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {dayjs(customerData.createdAt).format('MMMM D, YYYY h:mm A')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {dayjs(customerData.updatedAt).format('MMMM D, YYYY h:mm A')}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};