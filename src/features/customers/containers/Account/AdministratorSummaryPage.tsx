import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAdministrator } from "../../hooks/useAdministrator";
import { customerApi } from "../../api/customerApi";
import { documentApi } from "../../../../shared/api/documentApi";
import { AdministratorSummarySidebar } from "../../components/AdministratorAccount/AdministratorSummarySidebar";
import { AdministratorDocuments } from "../../components/AdministratorAccount/AdministratorDocuments";
import { AdministratorBusinessCustomers } from "../../components/AdministratorAccount/AdministratorBusinessCustomers";

const AdministratorSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { administrator, loading, error } = useAdministrator(id || "");
  const [businessCustomers, setBusinessCustomers] = useState<string[]>([]);
  const [loadingBusinessCustomers, setLoadingBusinessCustomers] =
    useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    const fetchBusinessCustomers = async () => {
      if (!id) return;
      try {
        setLoadingBusinessCustomers(true);
        const data = await customerApi.getAdministratorBusinessCustomers(id);
        setBusinessCustomers(data.businessCustomerIds || []);
      } catch (err) {
        console.error("Failed to fetch business customers:", err);
      } finally {
        setLoadingBusinessCustomers(false);
      }
    };

    const fetchDocuments = async () => {
      if (!id) return;
      try {
        setLoadingDocuments(true);
        const docs = await documentApi.getAdministratorDocuments(id);
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (id) {
      fetchBusinessCustomers();
      fetchDocuments();
    }
  }, [id]);

  if (!id) {
    return <Box>Administrator ID not found</Box>;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
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

  const administratorData = administrator?.customer || administrator;

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* Sidebar with administrator info */}
      <AdministratorSummarySidebar administrator={administratorData} />

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Business Customers Section */}
          <Grid item xs={12}>
            <AdministratorBusinessCustomers
              businessCustomerIds={businessCustomers}
              loading={loadingBusinessCustomers}
            />
          </Grid>

          {/* Documents Section */}
          <Grid item xs={12}>
            <AdministratorDocuments
              administratorId={id}
              documents={documents}
              loading={loadingDocuments}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdministratorSummaryPage;
