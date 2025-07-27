export interface CustomerAccountSidebarProps {
  customerId: string;
}

export interface StatusConfig {
  color: string;
  bgcolor: string;
  icon: React.ReactElement;
}

export interface CustomerFinancialSummary {
  totalDue: number;
  totalContractValue: number;
  progress: number;
  nextBillDate: string;
}

export interface CustomerSummaryData {
  customerData: any;
  contracts: any[];
  collateral: any[];
  status: string;
  customerName: string;
  customerInitials: string;
  createdAt: string;
  accountTypes: string[];
  contactMethodsCount: number;
}
