import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { ReportEntityType } from '../types/report.types';

interface EntitySelectorProps {
  value: ReportEntityType | '';
  onChange: (entityType: ReportEntityType) => void;
  disabled?: boolean;
}

const entityLabels: Record<ReportEntityType, string> = {
  [ReportEntityType.CUSTOMER]: 'Customer',
  [ReportEntityType.CONTRACT]: 'Contract',
  [ReportEntityType.PAYMENT]: 'Payment',
  [ReportEntityType.VEHICLE]: 'Vehicle',
  [ReportEntityType.COLLATERAL]: 'Collateral',
};

export const EntitySelector: React.FC<EntitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as ReportEntityType);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="entity-type-label">Entity Type</InputLabel>
      <Select
        labelId="entity-type-label"
        id="entity-type-select"
        value={value}
        label="Entity Type"
        onChange={handleChange}
        disabled={disabled}
      >
        {Object.entries(entityLabels).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

