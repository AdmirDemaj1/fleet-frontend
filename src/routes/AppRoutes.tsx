import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../shared/components/Layout/DashboardLayout';
import { CustomersPage } from '../features/customers/containers/CustomersPage';
import { CreateCustomerPage } from '../features/customers/containers/CreateCustomerPage';
// import { CustomerDetailsPage } from '../features/customers/containers/CustomerDetailsPage';
import { EditCustomerPage } from '../features/customers/containers/EditCustomerPage';
import { ContractsPage } from '../features/contracts/containers/ContratsPage';
// Import other pages as you create them
import { ContractForm } from '../features/contracts/components/ContractForm';
import AddContract from '../features/contracts/containers/AddContract';
import CreateContrats from '../features/contracts/containers/CreateContrats';
import PaymentsPage from '../features/payments/containers/PaymentsPage';


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/customers" replace />} />
        <Route path="customers">
          <Route index element={<CustomersPage />} />
          <Route path="new" element={<CreateCustomerPage />} />
          {/* <Route path=":id" element={<CustomerDetailsPage />} /> */}
          <Route path=":id/edit" element={<EditCustomerPage />} />
        </Route>
        {/* Add other routes here */}
        <Route path="vehicles" element={<div>Vehicles Page</div>} />
        <Route path="/contracts" element={<ContractsPage/>} />
        <Route path="/contracts/new" element={<AddContract />} />
        <Route path="create" element={<CreateContrats />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
    </Routes>
  );
};