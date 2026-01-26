import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { CustomerForm } from "../components/CustomerForm/CustomerForm";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import { customerApi } from "../api/customerApi";
import { CustomerType } from "../types/customer.types";
import { documentApi } from "../../../shared/api/documentApi";

export const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCustomer, loading } = useUpdateCustomer();
  const [initialData, setInitialData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [customerType, setCustomerType] = useState<CustomerType | null>(null);
  const [pendingDocumentIds, setPendingDocumentIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!id) {
        setError("Customer ID is required");
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError(null);

        // Fetch customer details
        const customerResponse = await customerApi.getById(id);
        console.log("Fetched customer:", customerResponse);

        // Extract customer data (API might wrap it in a 'customer' property)
        const customerData = (customerResponse.customer || customerResponse) as any;
        const type = customerData.type as CustomerType;
        setCustomerType(type);

        // Transform customer data to form format based on type
        let transformedData: any = {};

        if (type === CustomerType.INDIVIDUAL) {
          transformedData = {
            individualDetails: {
              type: CustomerType.INDIVIDUAL,
              firstName: customerData.firstName || "",
              lastName: customerData.lastName || "",
              idNumber: customerData.idNumber || "",
              dateOfBirth: customerData.dateOfBirth || "",
              address: customerData.address || "",
              phone: customerData.phone || "",
              email: customerData.email || "",
              secondaryPhone: customerData.secondaryPhone || "",
              secondaryEmail: customerData.secondaryEmail || "",
              additionalNotes: customerData.additionalNotes || "",
            },
          };
        } else if (type === CustomerType.BUSINESS) {
          // Transform shareholders if they exist
          const shareholders = customerData.shareholders
            ? Array.isArray(customerData.shareholders)
              ? customerData.shareholders.map((s: string | { name: string }) =>
                  typeof s === "string" ? { name: s } : s
                )
              : []
            : [];

          transformedData = {
            businessDetails: {
              type: CustomerType.BUSINESS,
              legalName: customerData.legalName || "",
              nuisNipt: customerData.nuisNipt || "",
              shareholders: shareholders,
              administratorIds: customerData.administratorIds || [],
              address: customerData.address || "",
              phone: customerData.phone || "",
              email: customerData.email || "",
              secondaryPhone: customerData.secondaryPhone || "",
              secondaryEmail: customerData.secondaryEmail || "",
              additionalNotes: customerData.additionalNotes || "",
            },
          };
        } else {
          setError("Unsupported customer type. Only individual and business customers can be edited here.");
          setLoadingData(false);
          return;
        }

        setInitialData(transformedData);
      } catch (err: any) {
        console.error("Error fetching customer data:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load customer data"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleCancel = () => {
    // Cleanup pending document uploads (if any) before leaving
    if (pendingDocumentIds.length > 0) {
      documentApi.deletePendingDocuments(pendingDocumentIds).catch(console.error);
      setPendingDocumentIds([]);
    }
    navigate(`/customers/${id}`);
  };

  const handleSubmit = async (data: any) => {
    if (!id || !customerType) {
      setError("Customer ID and type are required");
      return;
    }

    try {
      // Transform data to UpdateCustomerDto format
      const updateData: any = {
        id,
      };

      if (customerType === CustomerType.INDIVIDUAL && data.individualDetails) {
        updateData.individualDetails = data.individualDetails;
      } else if (customerType === CustomerType.BUSINESS && data.businessDetails) {
        updateData.businessDetails = data.businessDetails;
      }

      await updateCustomer(id, updateData);

      // Commit any pending document replacements uploaded during edit
      if (pendingDocumentIds.length > 0) {
        await documentApi.commitPendingDocuments(
          pendingDocumentIds,
          "customer",
          id
        );
        setPendingDocumentIds([]);
      }
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const getSteps = () => {
    if (customerType === CustomerType.INDIVIDUAL) {
      return ["Customer Type", "Individual Details", "Review"];
    } else if (customerType === CustomerType.BUSINESS) {
      return ["Customer Type", "Business Details", "Review"];
    }
    return ["Customer Type", "Details", "Review"];
  };

  const getTitle = () => {
    if (customerType === CustomerType.INDIVIDUAL) {
      return "Edit Individual Customer";
    } else if (customerType === CustomerType.BUSINESS) {
      return "Edit Business Customer";
    }
    return "Edit Customer";
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
            Loading customer data...
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

  if (!customerType || (customerType !== CustomerType.INDIVIDUAL && customerType !== CustomerType.BUSINESS)) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Alert severity="error">
            {error || "Only individual and business customers can be edited here. Use the administrator edit page for administrators."}
          </Alert>
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
            {getTitle()}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Update customer information
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
          steps={getSteps()}
          isEdit={true}
          customerId={id}
          onPendingDocumentIdsChange={(ids) => setPendingDocumentIds(ids)}
          onCancel={handleCancel}
        />
      </Box>
    </Box>
  );
};

