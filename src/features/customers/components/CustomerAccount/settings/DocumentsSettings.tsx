import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Description,
  CloudUpload,
  Verified,
  Warning,
  Add
} from '@mui/icons-material';

interface DocumentsSettingsProps {
  customerId: string;
}

export const DocumentsSettings: React.FC<DocumentsSettingsProps> = ({
  customerId
}) => {
  const theme = useTheme();

  const documents = [
    {
      id: 1,
      name: 'Government ID',
      status: 'verified',
      uploadDate: '2024-01-15',
      required: true
    },
    {
      id: 2,
      name: 'Proof of Address',
      status: 'pending',
      uploadDate: '2024-01-20',
      required: true
    },
    {
      id: 3,
      name: 'Income Verification',
      status: 'missing',
      required: false
    }
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'verified':
        return <Chip label="Verified" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending Review" color="warning" size="small" />;
      case 'missing':
        return <Chip label="Not Uploaded" color="error" size="small" />;
      default:
        return <Chip label="Unknown" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Documents & Verification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your documents and verification status
        </Typography>
      </Box>

      {/* Documents List */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          p: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <Description sx={{ mr: 1 }} />
            Required Documents
          </Typography>
        </Box>

        <List>
          {documents.map((doc, index) => (
            <ListItem
              key={doc.id}
              sx={{
                borderBottom: index < documents.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
              }}
            >
              <ListItemIcon>
                {doc.status === 'verified' ? (
                  <Verified color="success" />
                ) : doc.status === 'pending' ? (
                  <CloudUpload color="warning" />
                ) : (
                  <Warning color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={doc.name}
                secondary={doc.uploadDate ? `Uploaded: ${doc.uploadDate}` : 'Not uploaded'}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getStatusChip(doc.status)}
                <Button
                  size="small"
                  variant={doc.status === 'missing' ? 'contained' : 'outlined'}
                  startIcon={doc.status === 'missing' ? <Add /> : <CloudUpload />}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                  disabled
                >
                  {doc.status === 'missing' ? 'Upload' : 'Replace'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            📄 Upload clear, high-quality images or PDFs of your documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🔒 All documents are encrypted and stored securely
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
