import { useMemo } from 'react';
import { useCustomer } from './useCustomer';
import { CustomerSummaryData } from '../types/customerSidebar.types';
import {
  getCustomerDisplayName,
  getCustomerInitials,
  getCustomerStatus,
  calculateFinancialSummary,
  formatCreatedDate,
  getAccountTypes,
  getContactMethodsCount
} from '../utils/sidebarUtils';

export const useCustomerSidebar = (customerId: string) => {
  const { customer, loading, error } = useCustomer(customerId);

  const summaryData = useMemo((): CustomerSummaryData | null => {
    if (!customer) return null;

    // The API returns the customer data directly, not wrapped in a customer property
    const customerData = customer?.customer || customer || {};
    const contracts = (customer as any)?.contracts || [];
    const collateral = (customer as any)?.collateral || [];
    
    const status = getCustomerStatus(contracts);
    const customerName = getCustomerDisplayName(customerData);
    const customerInitials = getCustomerInitials(customerData);
    const createdAt = formatCreatedDate(customerData?.createdAt);
    const accountTypes = getAccountTypes(customerData, contracts, collateral);
    const contactMethodsCount = getContactMethodsCount(customerData);

    return {
      customerData,
      contracts,
      collateral,
      status,
      customerName,
      customerInitials,
      createdAt,
      accountTypes,
      contactMethodsCount
    };
  }, [customer]);

  const financialSummary = useMemo(() => {
    if (!summaryData) return null;
    return calculateFinancialSummary(summaryData.contracts);
  }, [summaryData]);

  return {
    summaryData,
    financialSummary,
    loading,
    error
  };
};
