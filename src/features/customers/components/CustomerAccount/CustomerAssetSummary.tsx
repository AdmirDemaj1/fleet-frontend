import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface CustomerAssetSummaryProps {
  /* Define the props you need to pass to this component, e.g., asset data */
  assets: { name: string; ipAddress: string }[];
}

const CustomerAssetSummary: React.FC<CustomerAssetSummaryProps> = ({ assets }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Asset Summary
      </Typography>
      {assets.map((asset, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Typography>{asset.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>IP Address: {asset.ipAddress}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CustomerAssetSummary;