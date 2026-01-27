export enum SimpleReportType {
  PAYMENTS = 'payments',
  PAYMENTS_PER_CUSTOMER = 'payments_per_customer',
  PAYMENTS_PER_CONTRACT = 'payments_per_contract',
  CUSTOMERS = 'customers',
  CONTRACTS = 'contracts',
}

export interface SimplifiedReportRequest {
  reportType: SimpleReportType;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  contractId?: string;
}

// Stored Reports Types
export interface StoredReportDto {
  id: string;
  fileName: string;
  reportType: string;
  format: string;
  status: string;
  title: string;
  description: string | null;
  entityType?: string;
  generatedAt?: string;
  generatedBy: string;
  fileSize: number | string;
  mimeType: string;
  downloadCount: number;
  totalRecords: number;
  executionTimeMs: number;
  filters: any;
  options: any;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GetStoredReportsQueryDto {
  page?: number;
  limit?: number;
  reportType?: string;
  generatedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StoredReportsListDto {
  reports: StoredReportDto[];
  total: number;
  page: number;
  limit: number;
}

