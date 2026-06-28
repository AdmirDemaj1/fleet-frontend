import type { ReactNode } from 'react';

export interface PlanFeature {
  label: string;
  included: boolean;
  note?: string;
}

export interface Plan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  color: string;
  highlight: boolean;
  users: string;
  userRoles: string;
  cta: string;
  ai: string | null;
  features: PlanFeature[];
}

export interface Feature {
  icon: ReactNode;
  title: string;
  desc: string;
  color: string;
}

export interface AiPersona {
  role: string;
  color: string;
  queries: string[];
}

export interface Stat {
  value: string;
  label: string;
}
