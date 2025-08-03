import { useState, useEffect } from 'react';
import { customerApi } from '../api/customerApi';
import { documentApi, downloadFile } from '../api/documentApi';
import { CreateCustomerDto, Customer } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

interface CreateCustomerResult {
  customer: Customer | null;
  isDownloading: boolean;
}

export const useCreateCustomerWithDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateCustomerResult>({
    customer: null,
    isDownloading: false
  });
  const { showSuccess, showError } = useNotification();

  // Debug logging for state changes
  useEffect(() => {
    console.log('Hook state updated - result:', result);
  }, [result]);

  const createCustomer = async (data: CreateCustomerDto): Promise<Customer> => {
    console.log('=== CREATE CUSTOMER START ===');
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create customer
      console.log('Creating customer with data:', data);
      const customer = await customerApi.create(data);
      console.log('Customer created successfully:', customer);
      
      const newResult = { customer, isDownloading: false };
      console.log('Setting new result state:', newResult);
      setResult(newResult);
      
      showSuccess('Customer created successfully');
      console.log('=== CREATE CUSTOMER SUCCESS ===');
      return customer;
    } catch (err) {
      console.error('Error creating customer:', err);
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      showError(message);
      console.log('=== CREATE CUSTOMER ERROR ===');
      throw err;
    } finally {
      setLoading(false);
      console.log('=== CREATE CUSTOMER FINALLY ===');
    }
  };

  const downloadRegistrationDocument = async (customerId: string) => {
    if (!customerId) {
      showError('Customer ID is required for document generation');
      return;
    }

    setResult(prev => ({ ...prev, isDownloading: true }));
    
    try {
      // Generate and download PDF
      const pdfBlob = await documentApi.generateAndDownloadCustomerPdf(
        customerId,
        {
          generatedFor: 'customer_registration',
          timestamp: new Date().toISOString(),
        }
      );

      // Generate filename with timestamp
      const fileName = `customer-registration-${customerId}-${Date.now()}.pdf`;
      
      // Trigger download
      downloadFile(pdfBlob, fileName);
      
      showSuccess('Registration document downloaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download registration document';
      setError(message);
      showError(message);
    } finally {
      setResult(prev => ({ ...prev, isDownloading: false }));
    }
  };

  const reset = () => {
    setResult({ customer: null, isDownloading: false });
    setError(null);
  };

  return {
    createCustomer,
    downloadRegistrationDocument,
    loading,
    error,
    customer: result.customer,
    isDownloading: result.isDownloading,
    reset
  };
};
