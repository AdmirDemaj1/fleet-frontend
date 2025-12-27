export enum ReportEntityType {
  CUSTOMER = 'customer',
  CONTRACT = 'contract',
  PAYMENT = 'payment',
  VEHICLE = 'vehicle',
  COLLATERAL = 'collateral',
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  BETWEEN = 'between',
  LIKE = 'like',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
  relation?: string;
}

export interface GenerateDynamicReportDto {
  entityType: ReportEntityType;
  relations?: string[];
  filters?: FilterCondition[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  options?: {
    includeAllFields?: boolean;
    limit?: number;
    offset?: number;
  };
}

export interface FilterFieldsResponse {
  [entityType: string]: string[];
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

