export const API_ENDPOINTS = {
    CUSTOMERS: '/customers',
    VEHICLES: '/vehicles',
    CONTRACTS: '/contracts',
    ASSETS: '/assets',
    AUDIT: '/audit',
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
  };
  
  export const ROUTES = {
    HOME: '/',
    CUSTOMERS: {
      LIST: '/customers',
      CREATE: '/customers/new',
      DETAILS: (id: string) => `/customers/${id}`,
      EDIT: (id: string) => `/customers/${id}/edit`,
    },
    ENDORSERS: {
      LIST: '/endorsers',
      CREATE: '/endorsers/new',
      DETAILS: (id: string) => `/endorsers/${id}`,
      EDIT: (id: string) => `/endorsers/${id}/edit`,
    },
    VEHICLES: {
      LIST: '/vehicles',
      CREATE: '/vehicles/new',
      DETAILS: (id: string) => `/vehicles/${id}`,
      EDIT: (id: string) => `/vehicles/${id}/edit`,
    },
    CONTRACTS: {
      LIST: '/contracts',
      CREATE: '/contracts/new',
      DETAILS: (id: string) => `/contracts/${id}`,
      EDIT: (id: string) => `/contracts/${id}/edit`,
    },
    ASSETS: {
      LIST: '/assets',
      CREATE: '/assets/new',
      DETAILS: (id: string) => `/assets/${id}`,
      EDIT: (id: string) => `/assets/${id}/edit`,
    },
  };
  
  export const CUSTOMER_TYPE_LABELS = {
    individual: 'Individual',
    business: 'Business',
  };
  
  export const CONTRACT_STATUS_LABELS = {
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  
  export const DATE_FORMAT = 'MMMM D, YYYY';
  export const DATE_TIME_FORMAT = 'MMMM D, YYYY h:mm A';
  export const DEFAULT_PAGE_SIZE = 10;
  export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];