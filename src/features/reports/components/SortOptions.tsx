import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  RadioGroup,
  Radio,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { FilterFieldsResponse } from '../types/report.types';

interface SortOptionsProps {
  availableFields: FilterFieldsResponse;
  selectedRelations: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  disabled?: boolean;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  availableFields,
  selectedRelations,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  disabled = false,
}) => {
  const getAvailableSortFields = (): Array<{ value: string; label: string }> => {
    const fields: Array<{ value: string; label: string }> = [];

    // Add main entity fields
    const mainEntity = Object.keys(availableFields)[0];
    if (mainEntity && availableFields[mainEntity]) {
      availableFields[mainEntity].forEach((field) => {
        fields.push({ value: field, label: `${mainEntity}.${field}` });
      });
    }

    // Add relation fields
    selectedRelations.forEach((relation) => {
      if (availableFields[relation]) {
        availableFields[relation].forEach((field) => {
          fields.push({
            value: `${relation}.${field}`,
            label: `${relation}.${field}`,
          });
        });
      }
    });

    return fields;
  };

  const availableSortFields = getAvailableSortFields();

  return (
    <Paper elevation={0} sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sorting
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="Sort By"
            onChange={(e: SelectChangeEvent) => onSortByChange(e.target.value)}
            disabled={disabled || availableSortFields.length === 0}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {availableSortFields.map((field) => (
              <MenuItem key={field.value} value={field.value}>
                {field.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl component="fieldset" disabled={disabled || !sortBy}>
          <RadioGroup
            row
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          >
            <FormControlLabel value="asc" control={<Radio />} label="Ascending" />
            <FormControlLabel value="desc" control={<Radio />} label="Descending" />
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );
};

