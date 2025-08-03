import { api } from '../../../shared/utils/api';

export interface DocumentMetadata {
  generatedFor?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface DocumentResponse {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: string;
  filePath?: string;
  customerId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const documentApi = {
  // Generate customer registration PDF
  generateCustomerRegistrationPdf: async (customerId: string): Promise<void> => {
    await api.post(`/documents/generate/customer-registration/${customerId}`);
  },

  // Download customer registration PDF specifically
  downloadCustomerRegistrationPdf: async (customerId: string): Promise<Blob> => {
    const response = await api.post<Blob>(
      `/documents/customer/${customerId}/registration-pdf`,
      {}, // Empty body for POST request
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      }
    );
    return response.data;
  },

  // Generate and download customer PDF with metadata (legacy method)
  generateAndDownloadCustomerPdf: async (
    customerId: string, 
    metadata?: DocumentMetadata
  ): Promise<Blob> => {
    const response = await api.post<Blob>(
      `/documents/customer/${customerId}/generate-pdf`,
      metadata || {},
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      }
    );
    return response.data;
  },

  // Get document by ID
  getDocument: async (documentId: string): Promise<DocumentResponse> => {
    const response = await api.get<DocumentResponse>(`/documents/${documentId}`);
    return response.data;
  },

  // Get all documents for a customer
  getCustomerDocuments: async (customerId: string): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>(`/documents/customer/${customerId}`);
    return response.data;
  },

  // Download existing document
  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

// Utility function to trigger file download
export const downloadFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
