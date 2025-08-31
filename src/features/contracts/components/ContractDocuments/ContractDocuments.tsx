import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Skeleton,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Description,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon,
  Upload,
  Download,
  Visibility,
  Refresh,
} from "@mui/icons-material";
import { useContractDocuments } from "../../hooks/useContractDocuments";
import {
  ContractDocumentResponseDto,
  ContractDocumentStatus,
} from "../../api/contractDocumentApi";
import { getApiUrl } from "../../../../shared/utils/env";

interface ContractDocumentsProps {
  contractId: string;
  contractNumber?: string;
}

export const ContractDocuments: React.FC<ContractDocumentsProps> = ({
  contractId,
  contractNumber,
}) => {
  const theme = useTheme();
  const { documents, isLoading, error, refetch } =
    useContractDocuments(contractId);

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <PictureAsPdf />;
    if (type.includes("image")) return <Image />;
    if (type.includes("word") || type.includes("document"))
      return <Description />;
    return <InsertDriveFile />;
  };

  const getStatusColor = (status: ContractDocumentStatus) => {
    switch (status) {
      case ContractDocumentStatus.APPROVED:
        return "success";
      case ContractDocumentStatus.PENDING:
        return "warning";
      case ContractDocumentStatus.REJECTED:
        return "error";
      case ContractDocumentStatus.EXPIRED:
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: ContractDocumentStatus) => {
    switch (status) {
      case ContractDocumentStatus.APPROVED:
        return <CheckCircle fontSize="small" />;
      case ContractDocumentStatus.PENDING:
        return <Upload fontSize="small" />;
      case ContractDocumentStatus.REJECTED:
        return <ErrorIcon fontSize="small" />;
      case ContractDocumentStatus.EXPIRED:
        return <Description fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreviewDocument = async (doc: ContractDocumentResponseDto) => {
    try {
      // Call the download endpoint to get the document

      console.log("🔍 Previewing document:", doc.id, doc.fileName);
      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/documents/blob/${doc.filePath}/download`;
      console.log("🌐 API URL:", apiUrl);
      console.log("🌐 Full URL:", fullUrl);
      
      const response = await fetch(fullUrl,
        {
          method: "GET",
          headers: {
            accept: "application/pdf",
            // Add authorization if needed
            ...(localStorage.getItem("authToken") && {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for preview
      window.open(url, "_blank");

      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to preview document:", error);
      // Show error notification
      // You can implement a notification system here
    }
  };

  const handleDownloadDocument = async (doc: ContractDocumentResponseDto) => {
    try {
      // Call the download endpoint to get the document
      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/documents/blob/${doc.id}/download`;
      console.log("🌐 API URL:", apiUrl);
      console.log("🌐 Full URL:", fullUrl);
      
      const response = await fetch(fullUrl,
        {
          method: "GET",
          headers: {
            accept: "application/pdf",
            // Add authorization if needed
            ...(localStorage.getItem("authToken") && {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
      // Show error notification
      // You can implement a notification system here
    }
  };

  if (isLoading) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contract Documents
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Alert
            severity="error"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => refetch()}
                aria-label="retry"
              >
                <Refresh />
              </IconButton>
            }
          >
            Failed to load contract documents. Please try again.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Contract Documents
          </Typography>
          <Chip
            label={`${documents.length} document${
              documents.length !== 1 ? "s" : ""
            }`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {documents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Description
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              No documents found for this contract
            </Typography>
          </Box>
        ) : (
          <List>
            {documents.map((document: ContractDocumentResponseDto) => (
              <ListItem
                key={document.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: "background.paper",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderColor: "primary.main",
                  },
                }}
              >
                <ListItemIcon>{getFileIcon(document.type)}</ListItemIcon>

                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {document.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.fileName} • {document.type} •{" "}
                        {formatDate(document.createdAt)}
                      </Typography>
                      {document.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {document.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={document.status}
                        size="small"
                        color={getStatusColor(document.status)}
                        icon={getStatusIcon(document.status)}
                        sx={{ mr: 1 }}
                      />
                      {document.isRequired && (
                        <Chip
                          label="Required"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      {document.expiryDate && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Expires: {formatDate(document.expiryDate)}
                        </Typography>
                      )}
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="View document">
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log("👁️ Preview button clicked for document:", document);
                          handlePreviewDocument(document);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download document">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
