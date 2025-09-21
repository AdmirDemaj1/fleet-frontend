// Euribor Rate Types

export interface EuriborRate {
  id?: string;
  rateDate: string; // YYYY-MM-DD format
  tenor: EuriborTenor;
  rateValue: number; // Decimal rate (e.g., 0.0375 for 3.75%)
  rateSource: EuriborRateSource;
  createdBy: string; // Email of creator
  metadata: EuriborMetadata;
  effectiveFrom: string; // ISO datetime string
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EuriborMetadata {
  sourceUrl?: string;
  validationStatus: 'verified' | 'pending' | 'rejected';
  importBatch?: string;
  notes?: string;
}

export enum EuriborTenor {
  ONE_WEEK = '1w',
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  TWELVE_MONTHS = '12m'
}

// TODO: Update this it doesnt make sense
export enum EuriborRateSource {
  ECB = 'ECB',
  BLOOMBERG = 'BLOOMBERG',
  REUTERS = 'REUTERS',
  MANUAL = 'MANUAL',
  API = 'API'
}

export interface CreateEuriborRateDto {
  rateDate: string;
  tenor: EuriborTenor;
  rateValue: number;
  rateSource: EuriborRateSource;
  createdBy: string;
  metadata: EuriborMetadata;
  effectiveFrom: string;
  isActive: boolean;
}

export interface UpdateEuriborRateDto extends Partial<CreateEuriborRateDto> {
  id: string;
}

export interface BulkEuriborRateDto {
  rates: CreateEuriborRateDto[];
}

export interface EffectiveRateCalculation {
  baseRate: number;
  margin: number;
  effectiveRate: number;
  effectiveRatePercentage: number;
}

export interface EuriborRateFilters {
  dateFrom?: string;
  dateTo?: string;
  tenor?: EuriborTenor;
  rateSource?: EuriborRateSource;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EuriborRateFormProps {
  initialData?: Partial<CreateEuriborRateDto>;
  onSubmit: (data: CreateEuriborRateDto) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export interface PaginatedEuriborResponse {
  data: EuriborRate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    offset: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
