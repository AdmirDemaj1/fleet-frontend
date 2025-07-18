// src/components/ContractForm.tsx
import React from 'react';
import { Box, Button, TextField, MenuItem } from '@mui/material';

type ContractFormProps = {
  onSubmit: (data: any) => void;
  loading: boolean;
};

export const ContractForm: React.FC<ContractFormProps> = ({ onSubmit, loading }) => {
  const [form, setForm] = React.useState({
    client: '',
    type: '',
    amount: '',
    start: '',
    end: '',
    status: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          name="client"
          label="Client"
          value={form.client}
          onChange={handleChange}
          required
        />
        <TextField
          name="type"
          label="Contract Type"
          value={form.type}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="Qira">Qiradhënie</MenuItem>
          <MenuItem value="Hua">Hua</MenuItem>
        </TextField>
        <TextField
          name="amount"
          label="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <TextField
          name="start"
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={form.start}
          onChange={handleChange}
          required
        />
        <TextField
          name="end"
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={form.end}
          onChange={handleChange}
          required
        />
        <TextField
          name="status"
          label="Status"
          value={form.status}
          onChange={handleChange}
          required
        />
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Contract'}
        </Button>
      </Box>
    </form>
  );
};
