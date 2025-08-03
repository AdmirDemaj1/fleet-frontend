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
  // Generate and download customer registration PDF
  generateAndDownloadCustomerPdf: async (
    customerId: string,
    metadata?: DocumentMetadata
  ): Promise<Blob> => {
    try {
      const response = await api.post(
        `/documents/customer/${customerId}/registration-pdf`,
        metadata || {},
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf',
          },
        }
      );
      
      return response.data as Blob;
    } catch (error) {
      console.error('Failed to generate customer PDF:', error);
      throw error;
    }
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
