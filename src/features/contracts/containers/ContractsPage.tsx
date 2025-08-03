import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ContractsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateContract = () => {
    navigate('/contracts/create');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3
              }}
            >
              <Typography variant="h4" component="h1">
                Contracts
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateContract}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Create Contract
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography 
                variant="h6" 
                color="text.secondary" 
                gutterBottom
              >
                No contracts found
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 3 }}
              >
                Get started by creating your first contract
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateContract}
                size="large"
              >
                Create Your First Contract
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
