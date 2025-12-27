import React from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Description,
  MoreVert,
  Visibility,
  CloudDownload,
  PictureAsPdf,
  Image,
} from "@mui/icons-material";
import { Document } from "../../../../shared/types/document.types";
import { documentApi } from "../../../../shared/api/documentApi";

interface AdministratorDocumentsProps {
  administratorId: string;
  documents: Document[];
  loading: boolean;
}

export const AdministratorDocuments: React.FC<AdministratorDocumentsProps> = ({
  documents,
  loading,
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<{
    el: HTMLElement;
    documentId: string;
  } | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    event.stopPropagation();
    setMenuAnchorEl({ el: event.currentTarget, documentId });
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handlePreview = async (documentId: string) => {
    try {
      const blob = await documentApi.downloadDocument(documentId);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      handleMenuClose();
    } catch (err: any) {
      console.error("Preview error:", err);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const blob = await documentApi.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      const document = documents.find((d) => d.id === documentId);
      link.download = document?.fileName || "document";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      handleMenuClose();
    } catch (err: any) {
      console.error("Download error:", err);
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) return <PictureAsPdf />;
    if (type.includes("image")) return <Image />;
    return <Description />;
  };

  const getDocumentTypeLabel = (type: string) => {
    if (type === "business_administrator_id_card") return "ID Card";
    if (type === "business_administrator_qkb") return "QKB";
    return type;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Description sx={{ fontSize: 24, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Documents
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Description sx={{ fontSize: 24, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Documents
        </Typography>
        <Chip label={documents.length} size="small" color="primary" />
      </Box>

      {documents.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No documents uploaded for this administrator.
        </Typography>
      ) : (
        <List>
          {documents.map((document) => (
            <ListItem
              key={document.id}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mb: 1,
              }}
              secondaryAction={
                <Tooltip title="More options">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, document.id)}
                    aria-haspopup="true"
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemIcon>
                {getDocumentIcon(document.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {document.title || document.fileName}
                    </Typography>
                    <Chip
                      label={getDocumentTypeLabel(document.type)}
                      size="small"
                      color={
                        document.type === "business_administrator_id_card"
                          ? "error"
                          : "default"
                      }
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {document.fileName}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl?.el || null}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              minWidth: 200,
              borderRadius: 1,
              overflow: "hidden",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => menuAnchorEl && handlePreview(menuAnchorEl.documentId)}
          dense
        >
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          Preview
        </MenuItem>
        <MenuItem
          onClick={() => menuAnchorEl && handleDownload(menuAnchorEl.documentId)}
          dense
        >
          <CloudDownload fontSize="small" sx={{ mr: 1.5 }} />
          Download
        </MenuItem>
      </Menu>
    </Paper>
  );
};

