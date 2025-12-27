import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Box,
} from '@mui/material';

interface RelationSelectorProps {
  availableRelations: string[];
  selectedRelations: string[];
  onChange: (relations: string[]) => void;
  disabled?: boolean;
}

export const RelationSelector: React.FC<RelationSelectorProps> = ({
  availableRelations,
  selectedRelations,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? value.split(',') : value);
  };

  if (availableRelations.length === 0) {
    return null;
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="relations-label">Related Entities (Optional)</InputLabel>
      <Select
        labelId="relations-label"
        id="relations-select"
        multiple
        value={selectedRelations}
        label="Related Entities (Optional)"
        onChange={handleChange}
        disabled={disabled}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((value) => (
              <Chip key={value} label={value} size="small" />
            ))}
          </Box>
        )}
      >
        {availableRelations.map((relation) => (
          <MenuItem key={relation} value={relation}>
            {relation}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

