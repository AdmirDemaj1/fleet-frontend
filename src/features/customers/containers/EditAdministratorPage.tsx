import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { CustomerForm } from "../components/CustomerForm/CustomerForm";
import { useUpdateAdministrator } from "../hooks/useUpdateAdministrator";
import { customerApi } from "../api/customerApi";
import { documentApi } from "../../../shared/api/documentApi";
import { AdministratorDocumentType } from "../components/CustomerForm/Steps/AdministratorDocumentsStep";
import { CustomerType } from "../types/customer.types";

export const EditAdministratorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateAdministrator, loading } = useUpdateAdministrator();
  const [initialData, setInitialData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchAdministratorData = async () => {
      if (!id) {
        setError("Administrator ID is required");
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError(null);

        // Fetch administrator details using administrators endpoint
        const administrator = await customerApi.getAdministratorById(id);
        console.log("Fetched administrator:", administrator);

        // Fetch documents
        let documents: any[] = [];
        try {
          documents = await documentApi.getAdministratorDocuments(id);
          console.log("Fetched administrator documents:", documents);
        } catch (docError) {
          console.warn("Failed to fetch documents:", docError);
          // Continue without documents if fetch fails
        }

        // Transform administrator data to form format
        const administratorData = (administrator.customer || administrator) as any;
        
        // Transform documents to form format
        const transformedDocuments = documents
          .map((doc) => {
            // Map document type from API to form enum
            let docType: AdministratorDocumentType;
            if (doc.type === "business_administrator_id_card") {
              docType = AdministratorDocumentType.ID_CARD;
            } else if (doc.type === "business_administrator_qkb") {
              docType = AdministratorDocumentType.QKB;
            } else {
              // Skip unknown document types
              return null;
            }

            return {
              type: docType,
              documentId: doc.id,
              fileName: doc.fileName || doc.title,
              title: doc.title || doc.fileName,
              expiryDate:
                doc.expiryDate ||
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              // No file for existing documents - user can replace if needed
            };
          })
          .filter(Boolean);

        // Set initial data
        setInitialData({
          administratorDetails: {
            type: CustomerType.ADMINISTRATOR,
            nuisNipt: administratorData.nuisNipt || "",
            companyName: administratorData.companyName || "",
            companyEmail: administratorData.companyEmail || "",
            companyPhone: administratorData.companyPhone || "",
            administratorName: administratorData.administratorName || "",
            administratorId: administratorData.administratorId || "",
            administratorPosition:
              administratorData.administratorPosition || "",
            address: administratorData.address || "",
            phone: administratorData.phone || "",
            email: administratorData.email || "",
            secondaryPhone: administratorData.secondaryPhone || "",
            secondaryEmail: administratorData.secondaryEmail || "",
            additionalNotes: administratorData.additionalNotes || "",
          },
          administratorDocuments: transformedDocuments,
        });
      } catch (err: any) {
        console.error("Error fetching administrator data:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load administrator data"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchAdministratorData();
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!id) {
      setError("Administrator ID is required");
      return;
    }

    try {
      await updateAdministrator(id, data);
      navigate(`/administrators/${id}`);
    } catch (error) {
      console.error("Failed to update administrator:", error);
    }
  };

  if (loadingData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading administrator data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && !initialData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Edit Administrator
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Update administrator information and documents
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <CustomerForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          steps={[
            "Customer Type",
            "Administrator Details",
            "Documents",
            "Review",
          ]}
          isEdit={true}
          administratorId={id}
        />
      </Box>
    </Box>
  );
};
