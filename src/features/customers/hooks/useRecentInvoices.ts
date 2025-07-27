import { useState, useEffect, useCallback } from 'react';
import { customerApi } from '../api/customerApi';
import dayjs from 'dayjs';

interface RecentInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const useRecentInvoices = (customerId: string) => {
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentInvoices = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch only the 5 most recent invoices
      const data = await customerApi.getInvoices(customerId, { 
        limit: 5,
        offset: 0
      });
      
      // Transform the data to match the expected format
      const transformedInvoices: RecentInvoice[] = data.map(invoice => {
        // Determine if overdue
        const isDue = dayjs(invoice.dueDate).isBefore(dayjs(), 'day');
        const status = invoice.status === 'pending' && isDue ? 'overdue' : invoice.status;
        
        return {
          id: invoice.transactionReference || invoice.id,
          date: dayjs(invoice.dueDate).format('MMM DD, YYYY'),
          amount: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(invoice.amount || 0),
          status: status as 'paid' | 'pending' | 'overdue'
        };
      });
      
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error('Failed to fetch recent invoices:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recent invoices');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchRecentInvoices();
  }, [fetchRecentInvoices]);

  return {
    invoices,
    loading,
    error,
    refetch: fetchRecentInvoices
  };
};
