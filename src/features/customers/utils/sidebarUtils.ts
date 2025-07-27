import { CustomerType } from '../types/customer.types';
import { CustomerFinancialSummary } from '../types/customerSidebar.types';

export const getCustomerDisplayName = (customerData: any): string => {
  return customerData?.type === CustomerType.INDIVIDUAL 
    ? `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim()
    : customerData?.legalName || 'Business Customer';
};

export const getCustomerInitials = (customerData: any): string => {
  if (customerData?.type === CustomerType.INDIVIDUAL) {
    const firstName = customerData?.firstName || '';
    const lastName = customerData?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  } else {
    // For business, use first two letters of legal name
    const businessName = customerData?.legalName || 'Business';
    return businessName.slice(0, 2).toUpperCase();
  }
};

export const getCustomerStatus = (contracts: any[]): string => {
  return contracts.length > 0 ? 'active' : 'pending';
};

export const calculateFinancialSummary = (contracts: any[]): CustomerFinancialSummary => {
  const totalDue = contracts.reduce((sum: number, contract: any) => sum + (contract?.remainingAmount || 0), 0);
  const totalContractValue = contracts.reduce((sum: number, contract: any) => sum + (contract?.totalAmount || 0), 0);
  const progress = totalContractValue > 0 ? Math.max(0, (1 - totalDue / totalContractValue) * 100) : 100;
  
  // Get next bill date (mock for now - could be calculated from contracts)
  const nextBillDate = contracts.length > 0 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No active contracts';
    
  return {
    totalDue,
    totalContractValue,
    progress,
    nextBillDate
  };
};

export const formatCreatedDate = (createdAt: string | Date | undefined): string => {
  if (!createdAt) return 'Unknown';
  return new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getAccountTypes = (customerData: any, contracts: any[], collateral: any[]): string[] => {
  return [
    customerData?.type === CustomerType.INDIVIDUAL ? 'Individual' : 'Business',
    ...(contracts.length > 0 ? ['Active Contracts'] : ['No Contracts']),
    ...(collateral.length > 0 ? ['Secured'] : [])
  ];
};

export const getContactMethodsCount = (customerData: any): number => {
  return [customerData?.phone, customerData?.secondaryPhone, customerData?.email]
    .filter(Boolean).length;
};
