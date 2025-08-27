export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentType {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  LATE_FEE = 'late_fee',
  PENALTY = 'penalty',
  REFUND = 'refund',
  ADVANCE = 'advance'
}

export interface Payment {
  id: string;
  contractId: string;
  customerId: string;
  amount: number | string;
  dueDate: Date | string;
  paymentDate?: Date | string;
  status: PaymentStatus;
  type: PaymentType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
  createdAt: Date | string;
  appliedAmount?: number | string;
  creditedAmount?: number | string;
}

export interface PaymentWithCreditResponse extends Payment {
  customerCreditBalance: number;
  contractRemainingBalance: number;
  wasOverpayment?: boolean;
}

export interface CreatePaymentDto {
  contractId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status?: PaymentStatus;
  type: PaymentType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface UpdatePaymentDto {
  id: string;
  amount?: number;
  dueDate?: string;
  paymentDate?: string;
  status?: PaymentStatus;
  type?: PaymentType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface MarkPaymentPaidDto {
  paymentDate: string;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
}

export interface MarkPaymentPaidWithCreditDto extends MarkPaymentPaidDto {
  actualAmountReceived?: number;
  applyCreditBalance?: boolean;
}

export interface RegisterPaymentDto {
  amount: number;
  dueDate: string;
  type: PaymentType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface PaymentFilters {
  contractId?: string;
  customerId?: string;
  status?: PaymentStatus;
  type?: PaymentType;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  search?: string;
}

export interface PaymentQueryParams extends PaymentFilters {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

export interface PaginatedPaymentsResponse {
  data: Payment[];
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

export interface PaymentTableRow extends Payment {
  contractNumber?: string;
  customerName?: string;
  vehicleInfo?: string;
  isOverdue?: boolean;
  daysPastDue?: number;
}

export interface CustomerCreditBalance {
  customerId: string;
  creditBalance: number;
  lastUpdated: string;
}
