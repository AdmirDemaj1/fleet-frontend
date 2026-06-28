import { BLUE, INDIGO, CYAN } from '../constants/theme';
import type { AiPersona } from '../types/landing.types';

export const AI_PERSONAS: AiPersona[] = [
  {
    role: 'Accountants',
    color: BLUE,
    queries: [
      '"Show me all overdue payments this month"',
      '"Generate a payment reconciliation report for Q2"',
      '"Which customers have outstanding balances over €10 000?"',
    ],
  },
  {
    role: 'Managers',
    color: INDIGO,
    queries: [
      '"How many contracts are expiring in the next 30 days?"',
      '"List vehicles with insurance expiring this week"',
      '"What is the total portfolio value of active leases?"',
    ],
  },
  {
    role: 'Users',
    color: CYAN,
    queries: [
      '"What are the current EURIBOR rates?"',
      '"Show me the amortization schedule for contract #C-2024-042"',
      '"Find all contracts for customer Rossi SpA"',
    ],
  },
];
