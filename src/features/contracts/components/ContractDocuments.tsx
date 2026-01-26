import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Description,
  Upload,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
  PictureAsPdf,
  Person,
  DirectionsCar,
  Business,
  Assignment,
  Visibility,
  CloudDownload,
  MoreVert,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Document } from "../../../shared/types/document.types";
import { documentApi } from "../../../shared/api/documentApi";
import { NonActiveDocuments } from "../../../shared/components/NonActiveDocuments";

interface ContractDocumentsProps {
  contractId: string;
}

export const ContractDocuments = React.memo<ContractDocumentsProps>(({
  contractId,
}) => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentApi.getContractDocuments(contractId);
        setDocuments(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchDocuments();
    }
  }, [contractId]);

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          icon: CheckCircle,
          label: "Completed",
        };
      case "pending":
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          icon: Schedule,
          label: "Pending",
        };
      case "rejected":
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          icon: ErrorIcon,
          label: "Rejected",
        };
      default:
        return {
          color: theme.palette.text.secondary,
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          icon: Schedule,
          label: "Unknown",
        };
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "contract":
        return Assignment;
      case "id":
        return Person;
      case "license":
        return DirectionsCar;
      case "endorser":
        return Business;
      default:
        return PictureAsPdf;
    }
  };

  const getStats = () => {
    const total = documents.length;
    const completed = documents.filter(
      (doc) => doc.status === "completed"
    ).length;
    const pending = documents.filter(
      (doc) => doc.status === "pending"
    ).length;
    const rejected = documents.filter(
      (doc) => doc.status === "rejected"
    ).length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, rejected, completion };
  };

  const stats = getStats();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: "hidden",
        boxShadow: theme.shadows[1],
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Description sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Contract Documents
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Upload />}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
          }}
        >
          Upload Document
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Manage and review all contract-related documents
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`${stats.total} Total`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              fontSize: "0.75rem",
            }}
          />
          <Chip
            label={`${stats.completed} Completed`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: "success.main",
              fontSize: "0.75rem",
            }}
          />
          <Chip
            label={`${stats.pending} Pending`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: "warning.main",
              fontSize: "0.75rem",
            }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Completion: {stats.completion}% • 3 of 4 required documents approved
        </Typography>
      </Box>

      {/* Document List */}
      <Typography variant="subtitle2" sx={{ p: 3, pb: 1, fontWeight: 600 }}>
        Document List
      </Typography>

      {loading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : documents.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No documents found
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {documents.map((document) => {
            const statusConfig = getStatusConfig(document.status);
            const StatusIcon = statusConfig.icon;
            const DocumentIcon = getDocumentIcon(document.type);

            return (
              <ListItem
                key={document.id}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: alpha(statusConfig.color, 0.1),
                      color: statusConfig.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {document.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<StatusIcon />}
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            color: statusConfig.color,
                            fontSize: "0.7rem",
                            height: 20,
                            "& .MuiChip-icon": {
                              color: statusConfig.color,
                              fontSize: 12,
                            },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, document)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {document.fileName} • Downloaded {document.downloadCount} times
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created on {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Document Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedDocument && handlePreview(selectedDocument)}>
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <Visibility fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="Preview" />
        </MenuItem>
        <MenuItem onClick={() => selectedDocument && handleDownload(selectedDocument)}>
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <CloudDownload fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="Download" />
        </MenuItem>
      </Menu>

      {/* Non-Active Documents Section */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 3 }}>
        <NonActiveDocuments
          entityType="contract"
          entityId={contractId}
        />
      </Box>

    </Box>
  );
});

ContractDocuments.displayName = 'ContractDocuments';
