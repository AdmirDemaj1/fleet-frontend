import { useState } from 'react';
import { customerApi } from '../api/customerApi';
import { endorserApi } from '../api/endorserApi';
import { documentApi, downloadFile } from '../api/documentApi';
import { CreateCustomerDto, Customer, EndorserResponseDto } from '../types/customer.types';
import { useNotification } from '../../../shared/hooks/useNotification';

interface CreateCustomerResult {
  customer: Customer | EndorserResponseDto | null;
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

  const createCustomer = async (data: CreateCustomerDto): Promise<Customer | EndorserResponseDto> => {
    setLoading(true);
    setError(null);
    
    try {
      let customer: Customer | EndorserResponseDto;
      
      // Check if we're creating an endorser
      if (data.endorserDetails) {
        console.log('Creating endorser with data:', data.endorserDetails);
        customer = await endorserApi.createEndorser(data.endorserDetails);
        console.log('Endorser created successfully:', customer);
      } else {
        console.log('Creating customer with data:', data);
        customer = await customerApi.create(data);
        console.log('Customer created successfully:', customer);
      }
      
      // 2. Generate registration PDF for the newly created customer/endorser
      if (customer.id) {
        try {
          await documentApi.generateCustomerRegistrationPdf(customer.id);
          console.log('Registration PDF generated successfully for customer:', customer.id);
        } catch (pdfError) {
          console.error('Failed to generate registration PDF:', pdfError);
          // Don't fail the entire customer creation if PDF generation fails
          const entityType = data.endorserDetails ? 'Endorser' : 'Customer';
          showError(`${entityType} created but failed to generate registration document`);
        }
      } else {
        console.error('Customer created but no ID returned');
        const entityType = data.endorserDetails ? 'Endorser' : 'Customer';
        showError(`${entityType} created but cannot generate registration document (no ID)`);
      }
      
      setResult({ customer, isDownloading: false });
      const entityType = data.endorserDetails ? 'Endorser' : 'Customer';
      showSuccess(`${entityType} created successfully`);
      return customer;
    } catch (err) {
      console.error('Error creating customer:', err);
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      showError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadRegistrationDocument = async (customerId: string) => {
    if (!customerId) {
      showError('Customer ID is required for document download');
      return;
    }

    setResult(prev => ({ ...prev, isDownloading: true }));
    
    try {
      // Download the pre-generated registration PDF
      const pdfBlob = await documentApi.downloadCustomerRegistrationPdf(customerId);

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
