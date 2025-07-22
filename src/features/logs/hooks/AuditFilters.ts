import { useState } from 'react';
import { FindAuditLogsDto } from '../types/audit.types';

const useAuditFilters = () => {
  const [filters, setFilters] = useState<FindAuditLogsDto>({});

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return { filters, handleFilterChange, clearFilters };
};

export default useAuditFilters;