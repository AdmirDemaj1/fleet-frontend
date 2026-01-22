import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Person,
  Business,
  AdminPanelSettings,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Customer } from "../../types/customer.types";

interface CustomerCreationSuccessProps {
  customer: Customer;
  onDownloadDocument: () => void;
  isDownloading: boolean;
  onReset?: () => void;
}

export const CustomerCreationSuccess: React.FC<
  CustomerCreationSuccessProps
> = ({ customer, onDownloadDocument, isDownloading, onReset }) => {
  const navigate = useNavigate();

  // Detect customer type from the data structure since API may not always return 'type' field
  const detectCustomerType = (): string => {
    // If type is explicitly provided, use it
    if (customer.type && String(customer.type) !== "undefined") {
      return String(customer.type).toLowerCase();
    }

    // Detect administrator: has administratorName, companyName, administratorId
    if ((customer as any).administratorName && (customer as any).companyName) {
      return "administrator";
    }

    // Detect business: has legalName or nuisNipt without administratorName
    if (
      (customer as any).legalName ||
      ((customer as any).nuisNipt && !(customer as any).administratorName)
    ) {
      return "business";
    }

    // Detect individual: has firstName and lastName
    if ((customer as any).firstName && (customer as any).lastName) {
      return "individual";
    }

    // Default fallback
    return "customer";
  };

  const customerType = detectCustomerType();

  const handleGoToCustomer = () => {
    // Administrators are customers now; always navigate to customer account
    navigate(`/customers/${customer.id}`);
  };

  const handleCreateAnother = () => {
    if (onReset) {
      onReset();
    }
  };

  // Get customer name based on type
  const getCustomerName = () => {
    switch (customerType) {
      case "individual":
        return (
          `${(customer as any).firstName || ""} ${
            (customer as any).lastName || ""
          }`.trim() || "Individual Customer"
        );
      case "business":
        return (customer as any).legalName || "Business Customer";
      case "administrator":
        return (
          (customer as any).administratorName ||
          (customer as any).companyName ||
          "Administrator"
        );
      default:
        return "Customer";
    }
  };

  // Get icon based on customer type
  const getCustomerIcon = () => {
    switch (customerType) {
      case "individual":
        return <Person sx={{ color: "primary.main" }} />;
      case "business":
        return <Business sx={{ color: "secondary.main" }} />;
      case "administrator":
        return <AdminPanelSettings sx={{ color: "info.main" }} />;
      default:
        return <Person sx={{ color: "primary.main" }} />;
    }
  };

  // Get chip color based on customer type
  const getChipColor = (): "primary" | "secondary" | "info" => {
    switch (customerType) {
      case "individual":
        return "primary";
      case "business":
        return "secondary";
      case "administrator":
        return "info";
      default:
        return "primary";
    }
  };

  // Get display label for customer type
  const getTypeLabel = (): string => {
    switch (customerType) {
      case "individual":
        return "Individual";
      case "business":
        return "Business";
      case "administrator":
        return "Administrator";
      default:
        // Fallback: capitalize the type if it exists, or return "Customer"
        return customerType
          ? customerType.charAt(0).toUpperCase() + customerType.slice(1)
          : "Customer";
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
      <Card
        elevation={0}
        sx={{
          border: "2px solid",
          borderColor: "success.main",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <CheckCircle
              sx={{
                fontSize: 64,
                color: "success.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              fontWeight="bold"
              color="success.main"
              gutterBottom
            >
              {getTypeLabel()} Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The {getTypeLabel().toLowerCase()} has been added to your fleet
              management system
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer Info */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 2,
              }}
            >
              {getCustomerIcon()}
              <Typography variant="h6" fontWeight="600">
                {getCustomerName()}
              </Typography>
              <Chip
                label={getTypeLabel()}
                size="small"
                color={getChipColor()}
                variant="outlined"
              />
            </Box>

            {customer.email && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Email: {customer.email}
              </Typography>
            )}
            {customer.phone && (
              <Typography variant="body2" color="text.secondary">
                Phone: {customer.phone}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 3 }}>
            What would you like to do next?
          </Typography>

          <Stack spacing={2}>
            {/* Download Registration Document */}
            <Button
              variant="contained"
              size="large"
              startIcon={
                isDownloading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Download />
                )
              }
              onClick={onDownloadDocument}
              disabled={isDownloading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {isDownloading
                ? "Generating Document..."
                : "Download Registration Document"}
            </Button>

            {/* Go to Customer Page */}
            <Button
              variant="outlined"
              size="large"
              startIcon={getCustomerIcon()}
              endIcon={<ArrowForward />}
              onClick={handleGoToCustomer}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Go to {getTypeLabel()} Page
            </Button>

            {/* Create Another Customer */}
            <Button
              variant="text"
              size="medium"
              onClick={handleCreateAnother}
              sx={{
                mt: 2,
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Create Another Customer
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
