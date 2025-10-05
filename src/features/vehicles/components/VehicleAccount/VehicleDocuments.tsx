import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  Alert,
  useTheme,
  alpha,
  Stack,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Assignment,
  PictureAsPdf,
  Image,
  Description,
  CloudDownload,
  Visibility,
  MoreVert,
  Add,
  Upload,
  Security,
  Event,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Vehicle } from "../../types/vehicleType";
import { Document } from "../../../../shared/types/document.types";
import { documentApi } from "../../../../shared/api/documentApi";

interface VehicleDocumentsProps {
  vehicle: Vehicle;
}

export const VehicleDocuments: React.FC<VehicleDocumentsProps> = ({
  vehicle,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentApi.getVehicleDocuments(vehicle.id);
        setDocuments(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    if (vehicle.id) {
      fetchDocuments();
    }
  }, [vehicle.id]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    document: Document
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handlePreview = async (document: Document) => {
    try {
      setLoading(true);
      console.log("Fetching document preview:", document.id);

      const blob = await documentApi.downloadDocument(document.id);
      console.log("Blob created:", blob.type, blob.size, "bytes");

      if (blob.size === 0) {
        throw new Error("Received empty document");
      }

      const blobUrl = window.URL.createObjectURL(blob);
      console.log("Blob URL created:", blobUrl);

      // Create a temporary link and click it
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      handleMenuClose();
    } catch (err: any) {
      console.error("Preview error:", err);
      setError(err?.message || "Failed to load document preview");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const blob = await documentApi.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleMenuClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to download document");
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.toLowerCase().includes("pdf")) {
      return <PictureAsPdf sx={{ color: "#d32f2f" }} />;
    } else if (
      type.toLowerCase().includes("image") ||
      type.toLowerCase().match(/jpe?g|png|gif|bmp|webp/)
    ) {
      return <Image sx={{ color: "#1976d2" }} />;
    } else {
      return <Description sx={{ color: "#616161" }} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Document categories for better organization
  const documentCategories = [
    {
      title: "Legal Documents",
      documents: documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes("registration") ||
          doc.title.toLowerCase().includes("title") ||
          doc.title.toLowerCase().includes("agreement")
      ),
      icon: <Assignment />,
      color: theme.palette.primary.main,
    },
    {
      title: "Insurance Documents",
      documents: documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes("insurance") ||
          doc.title.toLowerCase().includes("policy")
      ),
      icon: <Security />,
      color: theme.palette.success.main,
    },
    {
      title: "Maintenance Records",
      documents: documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes("maintenance") ||
          doc.title.toLowerCase().includes("service") ||
          doc.title.toLowerCase().includes("repair")
      ),
      icon: <Event />,
      color: theme.palette.warning.main,
    },
    {
      title: "Photos & Media",
      documents: documents.filter(
        (doc) =>
          doc.type === "image" ||
          doc.title.toLowerCase().includes("photo") ||
          doc.title.toLowerCase().includes("image")
      ),
      icon: <Image />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Vehicle Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage vehicle documentation and certificates
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            sx={{ textTransform: "none" }}
          >
            Upload Document
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ textTransform: "none" }}
          >
            Add Document
          </Button>
        </Box>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <>
          {/* Document Categories */}
          <Grid container spacing={3}>
            {documentCategories.map((category) => (
              <Grid item xs={12} md={6} key={category.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {/* Category Header */}
                    <Box
                      sx={{
                        p: 3,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(category.color, 0.05),
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ color: category.color }}>
                          {category.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.title}
                        </Typography>
                        <Chip
                          label={category.documents.length}
                          size="small"
                          sx={{
                            bgcolor: alpha(category.color, 0.1),
                            color: category.color,
                            fontWeight: 600,
                            ml: "auto",
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Document List */}
                    {category.documents.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        <Typography variant="body2">
                          No documents in this category
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {category.documents.map((document, index) => (
                          <ListItem
                            key={document.id}
                            sx={{
                              borderBottom:
                                index < category.documents.length - 1
                                  ? `1px solid ${alpha(
                                      theme.palette.divider,
                                      0.5
                                    )}`
                                  : "none",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.04
                                ),
                              },
                            }}
                          >
                            <ListItemIcon>
                              {getDocumentIcon(document.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {document.title}
                                </Typography>
                              }
                              secondary={
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {format(
                                      new Date(document.createdAt),
                                      "MMM dd, yyyy"
                                    )}
                                  </Typography>
                                  <Chip
                                    label={document.type.toUpperCase()}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: "0.65rem",
                                      bgcolor: alpha(
                                        theme.palette.grey[500],
                                        0.1
                                      ),
                                    }}
                                  />
                                </Stack>
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, document)}
                              sx={{ color: "text.secondary" }}
                            >
                              <MoreVert />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Document Status Cards */}
        </>
      )}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Document Status
        </Typography>

        <Grid container spacing={2}>
          {/* Insurance Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${
                  vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date()
                    ? theme.palette.error.main
                    : vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }`,
                bgcolor: alpha(
                  vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date()
                    ? theme.palette.error.main
                    : vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  0.05
                ),
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                {vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date() ? (
                  <ErrorIcon
                    sx={{ fontSize: 32, color: "error.main", mb: 1 }}
                  />
                ) : vehicle.kaskoExpiryDate && new Date(vehicle.kaskoExpiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? (
                  <Warning
                    sx={{ fontSize: 32, color: "warning.main", mb: 1 }}
                  />
                ) : (
                  <CheckCircle
                    sx={{ fontSize: 32, color: "success.main", mb: 1 }}
                  />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Insurance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicle.kaskoExpiryDate
                    ? format(
                        new Date(vehicle.kaskoExpiryDate),
                        "MMM dd, yyyy"
                      )
                    : "Not set"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Registration Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${
                  vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date()
                    ? theme.palette.error.main
                    : vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? theme.palette.warning.main
                    : theme.palette.success.main
                }`,
                bgcolor: alpha(
                  vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date()
                    ? theme.palette.error.main
                    : vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  0.05
                ),
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                {vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date() ? (
                  <ErrorIcon
                    sx={{ fontSize: 32, color: "error.main", mb: 1 }}
                  />
                ) : vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? (
                  <Warning
                    sx={{ fontSize: 32, color: "warning.main", mb: 1 }}
                  />
                ) : (
                  <CheckCircle
                    sx={{ fontSize: 32, color: "success.main", mb: 1 }}
                  />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Registration
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicle.registrationExpiry
                    ? format(
                        new Date(vehicle.registrationExpiry),
                        "MMM dd, yyyy"
                      )
                    : "Not set"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Documents */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.primary.main}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <Assignment
                  sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Total Documents
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {documents.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Storage Used */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.info.main}`,
                bgcolor: alpha(theme.palette.info.main, 0.05),
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <CloudDownload
                  sx={{ fontSize: 32, color: "info.main", mb: 1 }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Storage Used
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "info.main" }}
                >
                  {formatFileSize(1024 * 1024 * 2.5)} {/* Mock: 2.5MB */}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 160,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
              gap: 1.5,
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => selectedDocument && handlePreview(selectedDocument)}
        >
          <Visibility fontSize="small" />
          View Document
        </MenuItem>
        <MenuItem
          onClick={() => selectedDocument && handleDownload(selectedDocument)}
        >
          <CloudDownload fontSize="small" />
          Download
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VehicleDocuments;
