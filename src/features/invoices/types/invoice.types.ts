export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentType {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  EXTRA = 'extra',
  LATE_FEE = 'late_fee',
  PENALTY = 'penalty',
  REFUND = 'refund',
  ADVANCE = 'advance'
}

export interface RecalculationHistoryEntry {
  recalculatedAt: string | Date;
  startingAmount: number;
  calculatedAmount: number;
  causedByPaymentId: string;
  overpaymentAmount: number;
  causedByPaymentNumber: number;
  startingInterestAmount: number;
  startingPrincipalAmount: number;
  calculatedInterestAmount: number;
  startingRemainingBalance: number;
  calculatedPrincipalAmount: number;
  calculatedRemainingBalance: number;
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
  paidAmount?: number | string;
  paidInterestAmount?: number | string;
  paidPrincipalAmount?: number | string;
  principalAmount?: number | string;
  interestAmount?: number | string;
  remainingBalance?: number | string;
  paymentNumber?: number | null;
  recalculationHistory?: RecalculationHistoryEntry[];
  originalAmount?: number | string | null;
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
  updateFuturePayments?: boolean;
  overpaymentAmount?: number;
}

export interface ApplyPaymentDto {
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: string;
  amountReceived: number;
  getFromCredit: boolean;
  creditAmount?: number; // optional: amount to take from credit (defaults to remaining if omitted)
  notes?: string;
}

export interface RegisterPaymentDto {
  amount: number;
  dueDate: string;
  type: PaymentType;
  notes?: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface CreatePrepaymentDto {
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online_banking' | 'credit_card' | 'debit_card' | 'check' | 'other';
  transactionReference?: string;
  notes?: string;
  prepaymentOption?: 'reduce_term' | 'reduce_payment';
  startingFromPaymentNumber?: number; // Payment number from which the prepayment should start
  startingFromPaymentId?: string; // Payment ID from which the prepayment should start
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
