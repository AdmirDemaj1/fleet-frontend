import dayjs from 'dayjs';

// Utility functions
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return dayjs(date).format('MMM D, YYYY');
  } catch {
    return 'Invalid Date';
  }
};

// Filter function for contracts
export const filterContracts = (contracts: any[], filters: any) => {
  let filtered = [...contracts];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(contract => 
      contract.contractNumber?.toLowerCase().includes(searchTerm) ||
      contract.type?.toLowerCase().includes(searchTerm) ||
      contract.status?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(contract => 
      contract.status?.toLowerCase() === filters.status.toLowerCase()
    );
  }

  if (filters.type) {
    filtered = filtered.filter(contract => 
      contract.type?.toLowerCase() === filters.type.toLowerCase()
    );
  }

  return filtered;
};

// Sort function for contracts
export const sortContracts = (contracts: any[], orderBy: string, order: 'asc' | 'desc') => {
  return contracts.slice().sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'startDate' || orderBy === 'endDate') {
      aValue = aValue ? dayjs(aValue).valueOf() : 0;
      bValue = bValue ? dayjs(bValue).valueOf() : 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};
