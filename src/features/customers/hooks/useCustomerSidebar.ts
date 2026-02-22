import { useMemo } from 'react';
import { useCustomer } from './useCustomer';
import { customerRtkApi } from '../api/customerRtkApi';
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
  const { customer, loading: customerLoading, error: customerError } = useCustomer(customerId);

  // Fetch contracts separately using RTK Query
  const {
    data: contractsResponse,
    isLoading: contractsLoading,
    error: contractsError
  } = customerRtkApi.useGetCustomerContractsQuery(
    { customerId, limit: 100 },
    { skip: !customerId }
  );

  const summaryData = useMemo((): CustomerSummaryData | null => {
    if (!customer) return null;

    // The API returns the customer data directly, not wrapped in a customer property
    const customerData = customer?.customer || customer || {};
    const contracts = contractsResponse?.data || [];
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
  }, [customer, contractsResponse]);

  const financialSummary = useMemo(() => {
    if (!summaryData) return null;
    return calculateFinancialSummary(summaryData.contracts);
  }, [summaryData]);

  return {
    summaryData,
    financialSummary,
    loading: customerLoading || contractsLoading,
    error: customerError || (contractsError as any)?.message
  };
};
