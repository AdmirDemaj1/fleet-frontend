import { combineReducers } from '@reduxjs/toolkit';
import customerReducer from '../features/customers/slices/customerSlice';
// Import other reducers as you create them
 import vehicleReducer from '../features/vehicles/slices/vehicleSlice';
// import contractReducer from '../features/contracts/slices/contractSlice';
// import assetReducer from '../features/assets/slices/assetSlice';
import auditreducer from '../features/logs/slices/Auditslice';
export const rootReducer = combineReducers({
   customers: customerReducer,
   vehicles: vehicleReducer,
    audits: auditreducer,
  // contracts: contractReducer,
  // assets: assetReducer,

  
});