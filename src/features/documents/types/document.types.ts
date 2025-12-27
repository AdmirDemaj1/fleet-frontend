export interface ExpiringDocument {
  id: string;
  type: string;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  status: string;
  customerId: string | null;
  contractId: string | null;
  vehicleId: string | null;
  paymentId: string | null;
  metadata: Record<string, any>;
  downloadCount: number;
  generatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
}

export interface ExpiringDocumentsFilters {
  days?: number;
  type?: string;
}

