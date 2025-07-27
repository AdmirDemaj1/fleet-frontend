import dayjs from 'dayjs';
import { Invoice } from '../types/customerInvoices.types';

// Utility functions for invoices
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

export const isOverdue = (dueDate: string | Date, status: string): boolean => {
  if (status === 'paid') return false;
  return dayjs(dueDate).isBefore(dayjs(), 'day');
};

// Filter function for invoices
export const filterInvoices = (invoices: Invoice[], filters: any) => {
  let filtered = [...invoices].map(invoice => ({
    ...invoice,
    status: isOverdue(invoice.dueDate, invoice.status) && invoice.status === 'pending' 
      ? 'overdue' 
      : invoice.status
  }));

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(invoice => 
      invoice.id?.toLowerCase().includes(searchTerm) ||
      invoice.transactionReference?.toLowerCase().includes(searchTerm) ||
      invoice.notes?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(invoice => 
      invoice.status?.toLowerCase() === filters.status.toLowerCase()
    );
  }

  if (filters.type) {
    filtered = filtered.filter(invoice => 
      invoice.type?.toLowerCase() === filters.type.toLowerCase()
    );
  }

  return filtered;
};

// Sort function for invoices
export const sortInvoices = (invoices: Invoice[], orderBy: string, order: 'asc' | 'desc') => {
  return invoices.slice().sort((a, b) => {
    let aValue: any = a[orderBy as keyof Invoice];
    let bValue: any = b[orderBy as keyof Invoice];

    if (orderBy === 'dueDate' || orderBy === 'paymentDate' || orderBy === 'createdAt') {
      aValue = aValue ? dayjs(aValue).valueOf() : 0;
      bValue = bValue ? dayjs(bValue).valueOf() : 0;
    }

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return order === 'asc' ? -1 : 1;
    if (bValue == null) return order === 'asc' ? 1 : -1;

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};
