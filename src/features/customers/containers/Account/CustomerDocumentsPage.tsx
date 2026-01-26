import React from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { useCustomer } from "../../hooks/useCustomer";
import { CustomerDocuments } from "../../components/CustomerAccount/CustomerDocuments";

const CustomerDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customer, loading, error } = useCustomer(id || "");

  if (!id) return <Box>Customer ID not found</Box>;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!customer || !(customer as any).id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Customer not loaded.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <CustomerDocuments customer={customer as any} />
    </Box>
  );
};

export default CustomerDocumentsPage;

