import { configureStore } from '@reduxjs/toolkit';
import customerReducer from '../features/customers/slices/customerSlice';
import vehicleReducer from '../features/vehicles/slices/vehicleSlice';
import auditReducer from '../features/logs/slices/Auditslice';

import { auditApi } from '../features/logs/api/auditapi'; // Import auditApi
import { contractApi } from '../features/contracts/api/contractApi'; // Import contractApi
import { contractDocumentApi } from '../features/contracts/api/contractDocumentApi'; // Import contractDocumentApi
import { paymentsApi } from '../features/invoices/api/paymentsApi'; // Import paymentsApi

export const store = configureStore({
  reducer: {
    customers: customerReducer,
    vehicles: vehicleReducer,
    audits: auditReducer,
    [auditApi.reducerPath]: auditApi.reducer, // Add the auditApi reducer
    [contractApi.reducerPath]: contractApi.reducer, // Add the contractApi reducer
    [contractDocumentApi.reducerPath]: contractDocumentApi.reducer, // Add the contractDocumentApi reducer
    [paymentsApi.reducerPath]: paymentsApi.reducer, // Add the paymentsApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(auditApi.middleware) // Add the auditApi middleware
      .concat(contractApi.middleware) // Add the contractApi middleware
      .concat(contractDocumentApi.middleware) // Add the contractDocumentApi middleware
      .concat(paymentsApi.middleware), // Add the paymentsApi middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;