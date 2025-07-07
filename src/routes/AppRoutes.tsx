import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../shared/components/Layout/DashboardLayout';
import { CustomersPage } from '../features/customers/containers/CustomersPage';
import { CreateCustomerPage } from '../features/customers/containers/CreateCustomerPage';
import { VehiclesPage } from '../features/vehicles/containers/VehiclesPage';
// import { CustomerDetailsPage } from '../features/customers/containers/CustomerDetailsPage';
import { EditCustomerPage } from '../features/customers/containers/EditCustomerPage';
// Import other pages as you create them

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/customers" replace />} />

        <Route path="customers">
          <Route index element={<CustomersPage />} />
          <Route path="new" element={<CreateCustomerPage />} />
          <Route path=":id" element={<div>New Vehicle Page</div>} /> 
          <Route path=":id/edit" element={<EditCustomerPage />} />
        </Route>

        
        <Route path="vehicles">
          <Route index element={<VehiclesPage />} />
          <Route path="new" element={<div>New Vehicle Page</div>} />
          <Route path=":id/edit" element={<div>edit Vehicle Page</div>} />
        </Route>

         
        <Route path="contracts">
          <Route index element={<div>Contracts Pager</div>} />
          <Route path="new" element={<div>New Contract Pager</div>} />
          <Route path=":id/edit" element={<div>Edit Contract Page</div>} />
        </Route>

        <Route path='logs' element={<div>Logs Page</div>} />



        <Route path="assets" element={<div>Assets Page</div>} />
      </Route>
    </Routes>
  );
};