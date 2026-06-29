import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "../shared/components/Layout/DashboardLayout";
import { CustomersPage } from "../features/customers/containers/CustomersPage";

import { CreateCustomerPage } from "../features/customers/containers/CreateCustomerPage";
import { VehiclesPage } from "../features/vehicles/containers/VehiclesPage";
import AuditPage from "../features/logs/containers/AuditPage";
import { EditCustomerPage } from "../features/customers/containers/EditCustomerPage";
import CustomerAccountPage from "../features/customers/containers/CustomerAccountPage";
import CustomerSummaryPage from "../features/customers/containers/Account/CustomerSummaryPage";
import CustomerContractsPage from "../features/customers/containers/Account/CustomerContractsPage";
import CustomerLogsPage from "../features/customers/containers/Account/CustomerLogsPage";
import { CustomerInvoicesPage } from "../features/customers/containers";
import CustomerDocumentsPage from "../features/customers/containers/Account/CustomerDocumentsPage";
import CreateVehiclePage from "../features/vehicles/containers/CreateVehiclePage";
import ViewVehiclePage from "../features/vehicles/containers/ViewVehiclePage";
import VehicleAccountPage from "../features/vehicles/containers/VehicleAccountPage";
import { EditVehiclePage } from "../features/vehicles/containers/EditVehiclePage";
import CustomerVehiclesPage from "../features/customers/containers/Account/CustomerVehiclesPage";
import { DashboardPage } from "../features/dashboard/containers/DashboardPage";
import {
  ContractsPage,
  CreateContractPage,
  ContractDetailsPage,
  EditContractPage,
} from "../features/contracts/containers";
import {
  PaymentsPage,
  PaymentDetailPage,
} from "../features/invoices/containers";
import {
  EndorsersPage,
  EndorserDetailsPage,
} from "../features/endorsers/containers";
import { EuriborRatesPage } from "../features/euribor/containers";
import { ApprovalRequestsPage } from "../features/approvals/containers";
import {
  LoginPage,
  SignupPage,
  AcceptInvitePage,
  ProtectedRoute,
  PublicRoute,
  RbacTestingPanel,
} from "../features/auth";
import { ExpiringDocumentsPage } from "../features/documents";
import { ReportsPage } from "../features/reports";
import { LandingPage } from "../features/landing/LandingPage";
import { AdminPage } from "../features/admin";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Landing page - public default route */}
      <Route path="/" element={<LandingPage />} />

      {/* Public routes - redirect to dashboard if already authenticated */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/auth/accept-invite" element={<AcceptInvitePage />} />

      {/* Protected routes - pathless layout route keeps all paths at their original URLs */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="customers">
          <Route index element={<CustomersPage />} />
          <Route path="new" element={<CreateCustomerPage />} />
          <Route path=":id" element={<CustomerAccountPage />}>
            <Route index element={<Navigate to="summary" replace />} />
            <Route path="summary" element={<CustomerSummaryPage />} />
            <Route path="contracts" element={<CustomerContractsPage />} />
            <Route path="invoices" element={<CustomerInvoicesPage />} />
            <Route path="vehicles" element={<CustomerVehiclesPage />} />
            <Route path="documents" element={<CustomerDocumentsPage />} />
            <Route path="logs" element={<CustomerLogsPage />} />
            <Route path="edit" element={<EditCustomerPage />} />
          </Route>
        </Route>

        <Route path="endorsers">
          <Route index element={<EndorsersPage />} />
          <Route path="create" element={<div>Create Endorser Page</div>} />
          <Route path=":id" element={<EndorserDetailsPage />} />
          <Route path=":id/edit" element={<div>Edit Endorser Page</div>} />
        </Route>

        <Route path="vehicles">
          <Route index element={<VehiclesPage />} />
          <Route path="create" element={<CreateVehiclePage />} />
          <Route path=":id" element={<VehicleAccountPage />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ViewVehiclePage />} />
            <Route path="financial" element={<ViewVehiclePage />} />
            <Route path="documents" element={<ViewVehiclePage />} />
            <Route path="customer" element={<ViewVehiclePage />} />
          </Route>
          <Route path=":id/edit" element={<EditVehiclePage />} />
        </Route>

        <Route path="payments">
          <Route index element={<PaymentsPage />} />
          <Route path=":id" element={<PaymentDetailPage />} />
          <Route path=":id/edit" element={<div>edit Vehicle Page</div>} />
        </Route>

        <Route path="contracts">
          <Route index element={<ContractsPage />} />
          <Route path="create" element={<CreateContractPage />} />
          <Route path=":id" element={<ContractDetailsPage />} />
          <Route path=":id/edit" element={<EditContractPage />} />
        </Route>

        <Route path="logs" element={<AuditPage />} />

        <Route path="euribor-rates" element={<EuriborRatesPage />} />

        <Route path="approvals" element={<ApprovalRequestsPage />} />

        <Route path="documents/expiring" element={<ExpiringDocumentsPage />} />

        <Route path="reports" element={<ReportsPage />} />

        <Route path="admin" element={<AdminPage />} />

        <Route path="rbac-testing" element={<RbacTestingPanel />} />

        <Route path="assets" element={<div>Assets Page</div>} />
      </Route>
    </Routes>
  );
};
