import { configureStore } from '@reduxjs/toolkit';
import customerReducer from '../features/customers/slices/customerSlice';
import vehicleReducer from '../features/vehicles/slices/vehicleSlice';
import auditReducer from '../features/logs/slices/Auditslice';
import { auditApi } from '../features/logs/api/auditapi'; // Import auditApi

export const store = configureStore({
  reducer: {
    customers: customerReducer,
    vehicles: vehicleReducer,
    audits: auditReducer,
    [auditApi.reducerPath]: auditApi.reducer, // Add the auditApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(auditApi.middleware), // Add the auditApi middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;