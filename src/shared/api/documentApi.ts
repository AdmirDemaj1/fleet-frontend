import { api } from '../utils/api';
import { Document, DocumentPreviewResponse } from '../types/document.types';

export const documentApi = {
  // Get documents by customer ID
  getCustomerDocuments: async (customerId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(`/documents/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer documents:', error);
      throw error;
    }
  },

  // Get documents by contract ID
  getContractDocuments: async (contractId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(`/documents/contract/${contractId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract documents:', error);
      throw error;
    }
  },

  // Get documents by vehicle ID
  getVehicleDocuments: async (vehicleId: string): Promise<Document[]> => {
    try {
      const response = await api.get<Document[]>(`/documents/vehicle/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle documents:', error);
      throw error;
    }
  },

  // Get document preview
  getDocumentPreview: async (documentId: string): Promise<DocumentPreviewResponse> => {
    try {
      const response = await api.get<DocumentPreviewResponse>(`/documents/${documentId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document preview:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
};
