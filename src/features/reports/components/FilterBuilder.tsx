import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { FilterCondition, FilterOperator, FilterFieldsResponse } from '../types/report.types';

interface FilterBuilderProps {
  filters: FilterCondition[];
  availableFields: FilterFieldsResponse;
  selectedRelations: string[];
  onChange: (filters: FilterCondition[]) => void;
  disabled?: boolean;
}

const operatorLabels: Record<FilterOperator, string> = {
  [FilterOperator.EQUALS]: 'Equals',
  [FilterOperator.NOT_EQUALS]: 'Not Equals',
  [FilterOperator.IN]: 'In',
  [FilterOperator.NOT_IN]: 'Not In',
  [FilterOperator.GREATER_THAN]: 'Greater Than',
  [FilterOperator.GREATER_THAN_OR_EQUAL]: 'Greater Than or Equal',
  [FilterOperator.LESS_THAN]: 'Less Than',
  [FilterOperator.LESS_THAN_OR_EQUAL]: 'Less Than or Equal',
  [FilterOperator.BETWEEN]: 'Between',
  [FilterOperator.LIKE]: 'Contains',
  [FilterOperator.IS_NULL]: 'Is Null',
  [FilterOperator.IS_NOT_NULL]: 'Is Not Null',
};

const operatorsNotRequiringValue: FilterOperator[] = [
  FilterOperator.IS_NULL,
  FilterOperator.IS_NOT_NULL,
];

const operatorsRequiringArray: FilterOperator[] = [
  FilterOperator.IN,
  FilterOperator.NOT_IN,
  FilterOperator.BETWEEN,
];

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filters,
  availableFields,
  selectedRelations,
  onChange,
  disabled = false,
}) => {
  const getAvailableFieldsForFilter = (): Array<{ value: string; label: string; relation?: string }> => {
    const fields: Array<{ value: string; label: string; relation?: string }> = [];

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
            relation,
          });
        });
      }
    });

    return fields;
  };

  const getOperatorsForField = (): FilterOperator[] => {
    // All operators are available for all fields
    return Object.values(FilterOperator);
  };

  const handleAddFilter = () => {
    const availableFieldsList = getAvailableFieldsForFilter();
    if (availableFieldsList.length === 0) return;

    const newFilter: FilterCondition = {
      field: availableFieldsList[0].value,
      operator: FilterOperator.EQUALS,
      value: '',
      relation: availableFieldsList[0].relation,
    };

    onChange([...filters, newFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, updates: Partial<FilterCondition>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onChange(newFilters);
  };

  const getValueInputType = (operator: FilterOperator, currentValue: any): 'text' | 'number' | 'date' | 'array' => {
    if (operatorsRequiringArray.includes(operator)) {
      return 'array';
    }
    if (operator === FilterOperator.BETWEEN) {
      return 'array';
    }
    // Try to infer from current value or field name
    if (typeof currentValue === 'number') {
      return 'number';
    }
    if (currentValue && typeof currentValue === 'string' && currentValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      return 'date';
    }
    return 'text';
  };

  const renderValueInput = (filter: FilterCondition, index: number) => {
    if (operatorsNotRequiringValue.includes(filter.operator)) {
      return null; // No value input for null checks
    }

    const inputType = getValueInputType(filter.operator, filter.value);

    if (inputType === 'array') {
      const arrayValue = Array.isArray(filter.value) ? filter.value : filter.value ? [filter.value] : [];
      const stringValue = arrayValue.join(', ');

      return (
        <TextField
          fullWidth
          size="small"
          label="Value (comma-separated)"
          value={stringValue}
          onChange={(e) => {
            const values = e.target.value.split(',').map((v) => v.trim()).filter((v) => v);
            handleFilterChange(index, { value: values });
          }}
          placeholder="value1, value2, value3"
          disabled={disabled}
        />
      );
    }

    if (inputType === 'date') {
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Value"
          value={filter.value || ''}
          onChange={(e) => handleFilterChange(index, { value: e.target.value })}
          InputLabelProps={{ shrink: true }}
          disabled={disabled}
        />
      );
    }

    if (inputType === 'number') {
      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Value"
          value={filter.value || ''}
          onChange={(e) => handleFilterChange(index, { value: parseFloat(e.target.value) || 0 })}
          disabled={disabled}
        />
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        label="Value"
        value={filter.value || ''}
        onChange={(e) => handleFilterChange(index, { value: e.target.value })}
        disabled={disabled}
      />
    );
  };

  const availableFieldsList = getAvailableFieldsForFilter();

  return (
    <Paper elevation={0} sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddFilter}
          disabled={disabled || availableFieldsList.length === 0}
          size="small"
        >
          Add Filter
        </Button>
      </Box>

      {filters.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No filters added. Click "Add Filter" to add one.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filters.map((filter, index) => {
            const fieldOptions = getAvailableFieldsForFilter();
            const operatorOptions = getOperatorsForField();

            return (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.default',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={filter.field}
                        label="Field"
                        onChange={(e) => {
                          const selectedField = fieldOptions.find((f) => f.value === e.target.value);
                          handleFilterChange(index, {
                            field: e.target.value,
                            relation: selectedField?.relation,
                            value: '', // Reset value when field changes
                          });
                        }}
                        disabled={disabled}
                      >
                        {fieldOptions.map((field) => (
                          <MenuItem key={field.value} value={field.value}>
                            {field.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        label="Operator"
                        onChange={(e) =>
                          handleFilterChange(index, {
                            operator: e.target.value as FilterOperator,
                            value: '', // Reset value when operator changes
                          })
                        }
                        disabled={disabled}
                      >
                        {operatorOptions.map((op) => (
                          <MenuItem key={op} value={op}>
                            {operatorLabels[op]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    {renderValueInput(filter, index)}
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => handleRemoveFilter(index)}
                      disabled={disabled}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

