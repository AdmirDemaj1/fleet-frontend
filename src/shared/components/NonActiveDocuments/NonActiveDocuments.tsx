import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Collapse,
  IconButton,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Description,
  PictureAsPdf,
  Image,
  History,
  MoreVert,
  Visibility,
  CloudDownload,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Document } from "../../types/document.types";
import { documentApi } from "../../api/documentApi";

interface NonActiveDocumentsProps {
  entityType: "customer" | "vehicle" | "contract" | "administrator";
  entityId: string;
  title?: string;
}

export const NonActiveDocuments: React.FC<NonActiveDocumentsProps> = ({
  entityType,
  entityId,
  title = "Non-Active Documents",
}) => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Document[] = [];

        switch (entityType) {
          case "customer":
            data = await documentApi.getNonActiveCustomerDocuments(entityId);
            break;
          case "vehicle":
            data = await documentApi.getNonActiveVehicleDocuments(entityId);
            break;
          case "contract":
            data = await documentApi.getNonActiveContractDocuments(entityId);
            break;
          case "administrator":
            data = await documentApi.getNonActiveAdministratorDocuments(
              entityId
            );
            break;
        }

        setDocuments(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load non-active documents"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [entityType, entityId]);

  const getDocumentIcon = (type: string) => {
    if (type.toLowerCase().includes("pdf")) {
      return <PictureAsPdf sx={{ color: "#d32f2f", fontSize: 20 }} />;
    } else if (
      type.toLowerCase().includes("image") ||
      type.toLowerCase().match(/jpe?g|png|gif|bmp|webp/)
    ) {
      return <Image sx={{ color: "#1976d2", fontSize: 20 }} />;
    } else {
      return <Description sx={{ color: "#616161", fontSize: 20 }} />;
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    document: Document
  ) => {
    event.stopPropagation(); // Prevent collapse toggle
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handlePreview = async (document: Document) => {
    try {
      setPreviewLoading(true);
      setActionError(null);
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
      setActionError(err?.message || "Failed to load document preview");
      // Keep menu open to show error
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      setPreviewLoading(true);
      setActionError(null);
      const blob = await documentApi.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName || document.title || "document";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleMenuClose();
    } catch (err: any) {
      console.error("Download error:", err);
      setActionError(err?.response?.data?.message || "Failed to download document");
      // Keep menu open to show error
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (documents.length === 0) {
    return null; // Don't show anything if there are no non-active documents
  }

  return (
    <Box
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 2,
        pt: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          mb: expanded ? 1 : 0,
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <History sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={documents.length}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton size="small" onClick={handleToggle}>
          {expanded ? (
            <ExpandLess sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMore sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <List dense disablePadding>
          {documents.map((document) => (
            <ListItem
              key={document.id}
              sx={{
                py: 1,
                px: 0,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                "&:last-child": {
                  borderBottom: "none",
                },
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getDocumentIcon(document.type || "document")}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {document.title || document.fileName || "Untitled Document"}
                  </Typography>
                }
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(document.createdAt), "MMM dd, yyyy")}
                    </Typography>
                    <Chip
                      label={document.type?.toUpperCase() || "DOC"}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.6rem",
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                      }}
                    />
                  </Box>
                }
              />
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, document)}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Collapse>

      {/* Action Error Alert */}
      {actionError && (
        <Alert 
          severity="error" 
          sx={{ mt: 1, mx: 0 }}
          onClose={() => setActionError(null)}
        >
          {actionError}
        </Alert>
      )}

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
          disabled={previewLoading}
        >
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <Visibility fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="View Document" />
        </MenuItem>
        <MenuItem
          onClick={() => selectedDocument && handleDownload(selectedDocument)}
          disabled={previewLoading}
        >
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <CloudDownload fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="Download" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NonActiveDocuments;
