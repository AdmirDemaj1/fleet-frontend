import { ContractType } from '../types/contract.types';

/**
 * Generate a contract number based on contract type
 * Format: {TYPE}-{YEAR}-{SEQUENCE}
 * Examples: LOAN-2024-001, LEAS-2024-001
 */
export const generateContractNumber = (type: ContractType): string => {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp for uniqueness
  
  let prefix: string;
  switch (type) {
    case ContractType.LOAN:
      prefix = 'LOAN';
      break;
    case ContractType.LEASING:
      prefix = 'LEAS';
      break;
    default:
      prefix = 'CNTR';
      break;
  }
  
  return `${prefix}-${currentYear}-${timestamp}`;
};

/**
 * Validate contract number format
 */
export const isValidContractNumber = (contractNumber: string): boolean => {
  const pattern = /^[A-Z]{3,4}-\d{4}-\d{3,6}$/;
  return pattern.test(contractNumber);
};
