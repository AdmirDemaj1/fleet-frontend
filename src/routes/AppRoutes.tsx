import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../shared/components/Layout/DashboardLayout';
import { CustomersPage } from '../features/customers/containers/CustomersPage';
import { CreateCustomerPage } from '../features/customers/containers/CreateCustomerPage';
import { VehiclesPage } from '../features/vehicles/containers/VehiclesPage';
import AuditPage from '../features/logs/containers/AuditPage';
import { EditCustomerPage } from '../features/customers/containers/EditCustomerPage';
import CustomerAccountPage from '../features/customers/containers/CustomerAccountPage';
import CustomerSummaryPage from '../features/customers/containers/Account/CustomerSummaryPage';
import CustomerContractsPage from '../features/customers/containers/Account/CustomerContractsPage';
import CustomerLogsPage from '../features/customers/containers/Account/CustomerLogsPage';
import createCustomerPage from '../features/customers/containers/CreateCustomerPage';
import CreateVehiclePage from '../features/vehicles/containers/CreateVehiclePage';
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/customers" replace />} />

        <Route path="customers">
          <Route index element={<CustomersPage />} />
          <Route path="new" element={<CreateCustomerPage />} />
          <Route path=":id" element={<CustomerAccountPage />}>
            <Route index element={<Navigate to="summary" replace />} />
            <Route path="summary" element={<CustomerSummaryPage/>} />
            <Route path="contracts" element={<CustomerContractsPage />} />
            <Route path="invoices" element={<div>Customer Invoices</div>} />
            <Route path="vehicles" element={<div>Customer Vehicles</div>} />
            <Route path="logs" element={< CustomerLogsPage/>} />
          </Route>
          <Route path=":id/edit" element={<EditCustomerPage />} />
        </Route>

        <Route path="vehicles">
          <Route index element={<VehiclesPage />} />
          <Route path="new" element={<CreateVehiclePage />} />
          <Route path=":id/edit" element={<div>edit Vehicle Page</div>} />
        </Route>

        <Route path="contracts">
          <Route index element={<div>Contracts Pager</div>} />
          <Route path="new" element={<div>New Contract Pager</div>} />
          <Route path=":id/edit" element={<div>Edit Contract Page</div>} />
        </Route>

        <Route path='logs' element={<AuditPage />} />

        <Route path="assets" element={<div>Assets Page</div>} />
      </Route>
    </Routes>
  );
};