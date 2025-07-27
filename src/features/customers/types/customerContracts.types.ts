import { ReactElement } from 'react';

// Order types for sorting
export type Order = 'asc' | 'desc';
export type OrderBy = 'contractNumber' | 'type' | 'status' | 'startDate' | 'endDate' | 'totalAmount' | 'remainingAmount';

// Component props
export interface CustomerAccountContractsProps {
  customerId?: string;
}

// Status configuration type
export interface StatusConfig {
  icon: ReactElement;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  label: string;
}

// Contract type configuration
export interface TypeConfig {
  label: string;
  color: string;
}

// Notification state
export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Dialog states
export interface DialogStates {
  showNewContractDialog: boolean;
  deleteDialogOpen: boolean;
  contractToDelete: string | null;
}

// Menu state
export interface MenuState {
  anchorEl: HTMLElement | null;
  selectedContract: any | null; // Using any to match the existing ContractSummary type
}
