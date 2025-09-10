import { api } from "../../../shared/utils/api";
import {
  Payment,
  PaymentFilters,
  CreatePaymentDto,
  UpdatePaymentDto,
  MarkPaymentPaidDto,
  MarkPaymentPaidWithCreditDto,
  RegisterPaymentDto,
  CustomerCreditBalance,
  PaymentStatus,
  PaginatedPaymentsResponse
} from "../types/invoice.types";

export const paymentsApiNew = {
  getAll: async (
    filters?: PaymentFilters & {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ data: Payment[]; total: number }> => {
    const params = new URLSearchParams();
    
    // Set default limit if not provided
    const queryParams = {
      limit: 10,
      ...filters
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

      console.log(
        "Payments API Request URL:",
        `/payments?${params.toString()}`
      );
      console.log("Filters being sent:", queryParams);

      try {
        const response = await api.get<PaginatedPaymentsResponse>(
          `/payments?${params.toString()}`
        );      console.log("Payments API Response:", response);

      // The API returns a paginated response with data and meta fields
      const responseData = response.data;
      
      // Handle the response structure
      let paymentsArray: Payment[];
      let total: number;

      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'meta' in responseData) {
        // Expected paginated response structure
        paymentsArray = responseData.data || [];
        total = responseData.meta?.total || 0;
        console.log("Using paginated response structure - Total from meta:", total);
      } else if (Array.isArray(responseData)) {
        // Fallback: API returns array directly (backward compatibility)
        paymentsArray = responseData;
        total = paymentsArray.length;
        console.log("Using array response structure - Total from array length:", total);
      } else {
        // Unexpected structure
        console.warn("Unexpected payments response structure:", responseData);
        paymentsArray = [];
        total = 0;
      }

      const processedPayments = paymentsArray.map((payment) => ({
        ...payment,
        // Ensure amount is handled properly (could be string from API)
        amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount,
        appliedAmount: payment.appliedAmount ? 
          (typeof payment.appliedAmount === 'string' ? parseFloat(payment.appliedAmount) : payment.appliedAmount) 
          : undefined,
        creditedAmount: payment.creditedAmount ? 
          (typeof payment.creditedAmount === 'string' ? parseFloat(payment.creditedAmount) : payment.creditedAmount) 
          : undefined,
        // Keep dates as strings since they come from API as strings
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate,
        createdAt: payment.createdAt,
      }));

      console.log("Processed payments count:", processedPayments.length);
      console.log("Total count from API:", total);

      return {
        data: processedPayments,
        total: total,
      };
    } catch (error) {
      console.error("Payments API request failed:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  create: async (data: CreatePaymentDto): Promise<Payment> => {
    console.log("Payments API create called with data:", data);
    try {
      const response = await api.post<Payment>('/payments', data);
      console.log("Payments API create response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Payments API create error:", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdatePaymentDto): Promise<Payment> => {
    const response = await api.put<Payment>(`/payments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },

  markAsPaid: async (id: string, data: MarkPaymentPaidDto): Promise<Payment> => {
    const response = await api.put<Payment>(`/payments/${id}/mark-paid`, data);
    return response.data;
  },

  markAsPaidWithCredit: async (id: string, data: MarkPaymentPaidWithCreditDto): Promise<Payment> => {
    const response = await api.put<Payment>(`/payments/${id}/mark-paid-with-credit`, data);
    return response.data;
  },

  registerPayment: async (contractId: string, data: RegisterPaymentDto): Promise<Payment> => {
    const response = await api.post<Payment>(`/payments/register/${contractId}`, data);
    return response.data;
  },

  getCustomerCreditBalance: async (customerId: string): Promise<CustomerCreditBalance> => {
    const response = await api.get<CustomerCreditBalance>(`/payments/customer/${customerId}/credit-balance`);
    return response.data;
  },

  getByContract: async (
    contractId: string, 
    options?: { 
      status?: PaymentStatus; 
      limit?: number; 
      offset?: number; 
    }
  ): Promise<Payment[]> => {
    const params = new URLSearchParams();
    
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get<any>(`/payments/contract/${contractId}?${params.toString()}`);
    
    // Handle different response structures
    let paymentsArray: Payment[];
    if (Array.isArray(response.data)) {
      paymentsArray = response.data;
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
      paymentsArray = response.data.data;
    } else {
      console.warn('Unexpected payments response structure:', response.data);
      paymentsArray = [];
    }
    
    return paymentsArray;
  },

  getByCustomer: async (
    customerId: string, 
    options?: { 
      status?: PaymentStatus; 
      limit?: number; 
      offset?: number; 
    }
  ): Promise<Payment[]> => {
    const params = new URLSearchParams();
    
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await api.get<any>(`/customer/${customerId}/payments?${params.toString()}`);
    
    // Handle different response structures
    let paymentsArray: Payment[];
    if (Array.isArray(response.data)) {
      paymentsArray = response.data;
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
      paymentsArray = response.data.data;
    } else {
      console.warn('Unexpected payments response structure:', response.data);
      paymentsArray = [];
    }
    
    return paymentsArray;
  },
};
