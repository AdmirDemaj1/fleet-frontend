# Fleet Management Frontend - AI Coding Agent Instructions

## Project Overview
This is a React/TypeScript fleet management application using Material-UI, Redux Toolkit, and Vite. The system manages vehicles, customers, contracts, endorsers, invoices, and logs with a modular feature-based architecture.

## Core Technology Stack
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5 with theme system
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6 with nested routes
- **Build Tool**: Vite with HMR
- **HTTP Client**: Axios via shared API utility

## Architecture Patterns

### Feature-Based Organization
```
src/features/[feature]/
├── api/           # RTK Query API slices
├── components/    # UI components specific to feature
├── containers/    # Page-level components with routing
├── hooks/         # Feature-specific custom hooks
├── slices/        # Redux state slices
├── types/         # TypeScript interfaces/types
└── utils/         # Feature utilities
```

### Component Hierarchy Standards
1. **Containers**: Page-level components in `/containers/` folder
2. **Components**: Reusable UI pieces in `/components/` folder
3. **Shared Components**: Cross-feature components in `/src/shared/components/`

### Account-Style Pages Pattern
For entity detail pages (customers, vehicles), follow this structure:
- `[Entity]AccountPage.tsx` - Container with menu and outlet
- `[Entity]AccountMenu.tsx` - Tab navigation component
- `[Entity][Section].tsx` - Individual tab content components

Example: `CustomerAccountPage` → `CustomerAccountMenu` → `CustomerAccountVehicles`

## Development Guidelines

### Component Creation
```tsx
// Always use functional components with TypeScript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ComponentProps } from '../types';

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return (
    <Box>
      <Typography variant="h6">{prop1}</Typography>
    </Box>
  );
};

export default ComponentName;
```

### Material-UI Theme Usage
- **Always use theme values**: `theme.palette.primary.main` not string literals
- **Responsive breakpoints**: `sx={{ display: { xs: 'none', md: 'block' } }}`
- **Consistent spacing**: Use theme spacing units `sx={{ p: 3, mb: 2 }}`
- **Theme context**: Access via `useTheme()` hook for dynamic values

### API Integration
```typescript
// Use RTK Query for all API calls
import { api } from '../../../shared/utils/api';

export const featureApi = {
  getItems: async (params: QueryParams): Promise<Response> => {
    const response = await api.get<Response>(`/endpoint?${queryParams}`);
    return response.data;
  }
};
```

### State Management
- **Global State**: Use Redux slices for shared data
- **Local State**: Use React hooks for component-specific state
- **API State**: RTK Query handles caching and synchronization
- **Form State**: Use controlled components with useState

### Routing Conventions
- **Nested Routes**: Use `<Outlet />` for child route rendering
- **Route Parameters**: Extract with `useParams()` hook
- **Navigation**: Use `useNavigate()` for programmatic navigation
- **Route Guards**: Implement auth checks in route components

## File Naming Conventions
- **Components**: PascalCase (e.g., `CustomerAccountPage.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCustomers.ts`)
- **Types**: camelCase with '.types.ts' suffix (e.g., `customer.types.ts`)
- **API files**: camelCase with 'Api' suffix (e.g., `customerApi.ts`)
- **Constants**: UPPER_SNAKE_CASE in constants files

## TypeScript Standards
```typescript
// Define interfaces for all props and data structures
interface ComponentProps {
  id: string;
  title: string;
  optional?: boolean;
}

// Use strict typing for API responses
interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
  };
}

// Export types from feature index files
export type { Customer, CustomerStatus } from './customer.types';
```

## Styling Guidelines
- **Box Component**: Primary layout container
- **sx Prop**: Preferred over styled components for simple styling
- **Consistent Spacing**: Use `3` for padding, `2` for margins as base units
- **Color References**: Always use `theme.palette.*` values
- **Responsive Design**: Mobile-first with Material-UI breakpoints

## Error Handling
```typescript
// API error handling
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('API request failed:', error);
  throw error; // Let RTK Query handle the error state
}

// Component error boundaries
const [error, setError] = useState<string | null>(null);

if (error) {
  return <Alert severity="error">{error}</Alert>;
}
```

## Common Patterns

### Data Tables
Use the shared `DataTable` component with:
- Pagination via `usePagination` hook
- Filtering with query parameters
- Loading states during API calls
- Empty states for no data

### Modal Dialogs
Use Material-UI `Dialog` with:
- Confirmation dialogs for destructive actions
- Form modals for data entry
- Backdrop click to close (unless form is dirty)

### Form Handling
```tsx
const [formData, setFormData] = useState<FormData>(initialData);

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  try {
    await api.post('/endpoint', formData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Navigation Menus
For account-style pages:
- Use Material-UI `Tabs` component
- Store active tab in URL parameters
- Implement tab content with nested routing

## Testing Approach
- **Unit Tests**: Test individual component logic
- **Integration Tests**: Test feature workflows
- **API Mocking**: Mock API responses for consistent testing
- **Type Safety**: Leverage TypeScript for compile-time error checking

## Performance Considerations
- **Code Splitting**: Use React.lazy() for route-based splitting
- **Memoization**: Use React.memo() for expensive re-renders
- **API Caching**: RTK Query handles automatic caching
- **Bundle Optimization**: Vite handles tree-shaking automatically

## Accessibility Standards
- **Semantic HTML**: Use appropriate HTML elements
- **ARIA Labels**: Add labels for screen readers
- **Keyboard Navigation**: Ensure all interactions are keyboard accessible
- **Color Contrast**: Follow Material-UI accessibility guidelines

## Quick Reference Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
```

## Common File Templates

### API Service
```typescript
import { api } from '../../../shared/utils/api';
import { EntityType, QueryParams } from '../types';

export const entityApi = {
  getAll: async (params: QueryParams) => {
    const response = await api.get<EntityType[]>('/entities', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<EntityType>(`/entities/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<EntityType>) => {
    const response = await api.post<EntityType>('/entities', data);
    return response.data;
  }
};
```

### Component with API Integration
```tsx
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { entityApi } from '../api/entityApi';
import { EntityType } from '../types';

const EntityComponent: React.FC = () => {
  const [data, setData] = useState<EntityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await entityApi.getAll({});
        setData(result);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* Component content */}
    </Box>
  );
};

export default EntityComponent;
```

## Key Principles
1. **Consistency**: Follow established patterns across the codebase
2. **Type Safety**: Use TypeScript strictly for better developer experience
3. **Performance**: Optimize for user experience with proper loading states
4. **Maintainability**: Write self-documenting code with clear component structure
5. **Accessibility**: Ensure the application is usable by everyone
6. **Responsive Design**: Support all device sizes with Material-UI breakpoints
