import {
  AccountBalance,
  Description,
  People,
  DirectionsCar,
  SwapHoriz,
  Assessment,
  Timeline,
  LocalShipping,
} from '@mui/icons-material';
import { BLUE, INDIGO, CYAN, GREEN, AMBER } from '../constants/theme';
import type { Feature } from '../types/landing.types';

export const FEATURES: Feature[] = [
  {
    icon: <AccountBalance sx={{ fontSize: 28 }} />,
    title: 'Leasing',
    desc: 'Full lifecycle leasing — from origination to termination with automated rate calculations, EURIBOR tracking and residual value management.',
    color: BLUE,
  },
  {
    icon: <Description sx={{ fontSize: 28 }} />,
    title: 'Contracts',
    desc: 'Structured contract management with versioning, approval workflows, document generation and real-time status tracking.',
    color: INDIGO,
  },
  {
    icon: <People sx={{ fontSize: 28 }} />,
    title: 'Customers',
    desc: 'Unified customer profiles with credit history, endorsers, collateral records, and a complete audit trail.',
    color: CYAN,
  },
  {
    icon: <DirectionsCar sx={{ fontSize: 28 }} />,
    title: 'Vehicles',
    desc: 'Fleet registry with valuation tracking, insurance expiry alerts, ownership history and document management.',
    color: GREEN,
  },
  {
    icon: <SwapHoriz sx={{ fontSize: 28 }} />,
    title: 'Rentals',
    desc: 'Short and long-term rental operations with availability, billing cycles and integrated payment reconciliation.',
    color: AMBER,
  },
  {
    icon: <Assessment sx={{ fontSize: 28 }} />,
    title: 'Reports',
    desc: 'Dynamic report engine covering contracts, payments, customers and vehicles — exportable to Excel with custom filters.',
    color: '#a78bfa',
  },
  {
    icon: <Timeline sx={{ fontSize: 28 }} />,
    title: 'Amortizations',
    desc: 'Precise amortization schedules with early payoff support, penalty calculation and instalment-by-instalment breakdown.',
    color: '#fb7185',
  },
  {
    icon: <LocalShipping sx={{ fontSize: 28 }} />,
    title: 'Asset Management',
    desc: 'Track, depreciate and dispose of assets across the fleet with complete maintenance and valuation history.',
    color: '#34d399',
  },
];
