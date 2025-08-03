import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton,
  Grid,
  Divider,
  Badge,
  Button,
  Avatar,
  MenuItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Person,
  Search,
  Remove,
  Add,
  CheckCircle,
  PersonAdd
} from '@mui/icons-material';
import { useGetEndorsersQuery } from '../../api/contractApi';
import { EndorserPickerProps, EndorserSummary } from '../../types/contract.types';

export const EndorserPicker: React.FC<EndorserPickerProps> = ({
  selectedEndorserIds,
  onEndorserSelect,
  customerId,
  onCreateEndorser,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEndorsers, setSelectedEndorsers] = useState<EndorserSummary[]>([]);

  // Fetch available endorsers
  const {
    data: endorsers = [],
    isLoading,
    error: apiError
  } = useGetEndorsersQuery({
    customerId,
    search: searchTerm,
    limit: 100
  });

  // Update selected endorsers when IDs change
  useEffect(() => {
    if (selectedEndorserIds.length > 0 && endorsers.length > 0) {
      const selected = endorsers.filter(e => selectedEndorserIds.includes(e.id));
      setSelectedEndorsers(selected);
    } else {
      setSelectedEndorsers([]);
    }
  }, [selectedEndorserIds, endorsers]);

  const handleEndorserAdd = (endorser: EndorserSummary) => {
    if (!selectedEndorserIds.includes(endorser.id)) {
      const newSelectedIds = [...selectedEndorserIds, endorser.id];
      const newSelectedEndorsers = [...selectedEndorsers, endorser];
      setSelectedEndorsers(newSelectedEndorsers);
      onEndorserSelect(newSelectedIds);
    }
  };

  const handleEndorserRemove = (endorserId: string) => {
    const newSelectedIds = selectedEndorserIds.filter(id => id !== endorserId);
    const newSelectedEndorsers = selectedEndorsers.filter(e => e.id !== endorserId);
    setSelectedEndorsers(newSelectedEndorsers);
    onEndorserSelect(newSelectedIds);
  };

  const handleInputChange = (_event: any, newInputValue: string) => {
    setSearchTerm(newInputValue);
  };

  if (apiError) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Failed to load endorsers. Please try again.
      </Alert>
    );
  }

  const availableEndorsers = endorsers.filter(e => !selectedEndorserIds.includes(e.id));

  return (
    <Box>
      {/* Search and Add Endorser */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        <Box sx={{ flex: 1 }}>
          <Autocomplete
            options={availableEndorsers}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            onInputChange={handleInputChange}
            loading={isLoading}
            filterOptions={(x) => x} // Let the API handle filtering
            onChange={(_event, value) => {
              if (value) {
                handleEndorserAdd(value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Endorser to Contract"
                placeholder="Search endorsers..."
                error={!!error}
                helperText={error || 'Search and select endorsers to guarantee this contract'}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <MenuItem
                  {...otherProps}
                  key={option.id}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.firstName} {option.lastName}
                        </Typography>
                        {option.relationshipToCustomer && (
                          <Chip
                            label={option.relationshipToCustomer}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {option.idNumber}
                        </Typography>
                        {option.email && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {option.email}
                          </Typography>
                        )}
                        {option.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {option.phone}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndorserAdd(option);
                    }}
                  >
                    <Add />
                  </IconButton>
                </MenuItem>
              );
            }}
            noOptionsText={
              searchTerm ? 'No endorsers found' : 'Start typing to search endorsers'
            }
            loadingText="Loading endorsers..."
            value={null}
          />
        </Box>
        
        {/* Create New Endorser Button */}
        {onCreateEndorser && (
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={onCreateEndorser}
            sx={{ whiteSpace: 'nowrap', mb: error ? 2.5 : 0 }}
          >
            Create New
          </Button>
        )}
      </Box>

      {/* Selected Endorsers Count */}
      {selectedEndorsers.length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Badge badgeContent={selectedEndorsers.length} color="primary">
            <Chip
              icon={<Person />}
              label="Selected Endorsers"
              variant="outlined"
              color="primary"
            />
          </Badge>
        </Box>
      )}

      {/* Selected Endorsers List */}
      {selectedEndorsers.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Selected Endorsers ({selectedEndorsers.length})
          </Typography>
          
          <Grid container spacing={2}>
            {selectedEndorsers.map((endorser) => (
              <Grid item xs={12} sm={6} md={4} key={endorser.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'secondary.main',
                    borderRadius: 2,
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Remove button */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleEndorserRemove(endorser.id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <Remove fontSize="small" />
                    </IconButton>

                    {/* Status indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircle sx={{ color: 'secondary.main', fontSize: 16 }} />
                      <Chip
                        label="Selected"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>

                    {/* Endorser info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {endorser.firstName} {endorser.lastName}
                        </Typography>
                        {endorser.relationshipToCustomer && (
                          <Chip
                            label={endorser.relationshipToCustomer}
                            size="small"
                            variant="filled"
                            color="secondary"
                            sx={{ fontSize: '0.7rem', height: 18, mt: 0.5 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>ID:</strong> {endorser.idNumber}
                      </Typography>
                      {endorser.email && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Email:</strong> {endorser.email}
                        </Typography>
                      )}
                      {endorser.phone && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Phone:</strong> {endorser.phone}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty state */}
      {selectedEndorsers.length === 0 && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 3,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            No endorsers selected yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Search and select endorsers or create a new one to guarantee this contract
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
