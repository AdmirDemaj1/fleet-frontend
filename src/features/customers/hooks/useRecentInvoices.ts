import { useMemo } from 'react';
import { useGetCustomerPaymentsQuery } from '../api/customerRtkApi';
import dayjs from 'dayjs';

interface RecentInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const useRecentInvoices = (customerId: string) => {
  // Use RTK Query for data fetching with automatic caching
  const { data, isLoading, error, refetch } = useGetCustomerPaymentsQuery(
    { customerId, limit: 5, offset: 0 },
    { skip: !customerId }
  );

  // Transform the data to match the expected format
  const invoices = useMemo((): RecentInvoice[] => {
    if (!data) return [];

    // Handle different response structures
    let invoicesArray: any[];
    if (Array.isArray(data)) {
      invoicesArray = data;
    } else if (data && typeof data === 'object' && 'invoices' in data && Array.isArray((data as any).invoices)) {
      invoicesArray = (data as any).invoices;
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      invoicesArray = (data as any).data;
    } else {
      return [];
    }

    // Ensure we only take the first 5 invoices
    const limitedData = invoicesArray.slice(0, 5);

    return limitedData.map(invoice => {
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
  }, [data]);

  return {
    invoices,
    loading: isLoading,
    error: error ? (error as any)?.data?.message || 'Failed to load recent invoices' : null,
    refetch
  };
};
