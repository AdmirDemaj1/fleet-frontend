import { combineReducers } from '@reduxjs/toolkit';
import customerReducer from '../features/customers/slices/customerSlice';
// Import other reducers as you create them
 import vehicleReducer from '../features/vehicles/slices/vehicleSlice';
// import contractReducer from '../features/contracts/slices/contractSlice';
// import assetReducer from '../features/assets/slices/assetSlice';

export const rootReducer = combineReducers({
   customers: customerReducer,
   vehicles: vehicleReducer,
  // contracts: contractReducer,
  // assets: assetReducer,
});