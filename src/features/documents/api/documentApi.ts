import { api } from '../../../shared/utils/api';
import { ExpiringDocument, ExpiringDocumentsFilters } from '../types/document.types';

export const documentApi = {
  // Get documents expiring within specified days
  getExpiringDocuments: async (filters?: ExpiringDocumentsFilters): Promise<ExpiringDocument[]> => {
    const params = new URLSearchParams();
    if (filters?.days) params.append('days', filters.days.toString());
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const url = queryString ? `/documents/expiring?${queryString}` : '/documents/expiring';
    
    const response = await api.get<ExpiringDocument[]>(url);
    return response.data;
  },

  // Download document by ID
  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  // Preview document by ID
  previewDocument: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

