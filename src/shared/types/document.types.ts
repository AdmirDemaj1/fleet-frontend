export interface Document {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: 'completed' | 'pending' | 'rejected';
  customerId?: string;
  contractId?: string;
  vehicleId?: string;
  downloadCount: number;
  createdAt: string;
}

export interface DocumentPreviewResponse {
  previewUrl: string;
  mimeType: string;
  fileName: string;
}