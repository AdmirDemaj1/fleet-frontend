import React, { useState } from 'react';
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
  Divider,
  Alert,
  useTheme,
  alpha,
  Stack,
  Grid
} from '@mui/material';
import {
  Assignment,
  PictureAsPdf,
  Image,
  Description,
  CloudDownload,
  Visibility,
  Delete,
  MoreVert,
  Add,
  Upload,
  Security,
  Event,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Vehicle, Document as VehicleDocument } from '../../types/vehicleType';

interface VehicleDocumentsProps {
  vehicle: Vehicle;
}

export const VehicleDocuments: React.FC<VehicleDocumentsProps> = ({ vehicle }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdf sx={{ color: '#d32f2f' }} />;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image sx={{ color: '#1976d2' }} />;
      default:
        return <Description sx={{ color: '#616161' }} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDaysUntilExpiry = (expiryDate: string | undefined): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (expiryDate: string | undefined, days: number = 30): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil <= days && daysUntil > 0;
  };

  const isExpired = (expiryDate: string | undefined): boolean => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil !== null && daysUntil < 0;
  };

  // Mock documents - in real app, these would come from the vehicle.documents array
  const mockDocuments: VehicleDocument[] = [
    {
      id: '1',
      name: 'Vehicle Registration Certificate',
      type: 'pdf',
      url: '/documents/registration.pdf',
      uploadDate: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Insurance Policy Document',
      type: 'pdf',
      url: '/documents/insurance.pdf',
      uploadDate: '2024-02-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'Purchase Agreement',
      type: 'pdf',
      url: '/documents/purchase.pdf',
      uploadDate: '2024-01-10T09:15:00Z'
    },
    {
      id: '4',
      name: 'Vehicle Photos',
      type: 'image',
      url: '/documents/photos.zip',
      uploadDate: '2024-01-15T16:45:00Z'
    }
  ];

  const documents = vehicle.documents || mockDocuments;

  // Document categories for better organization
  const documentCategories = [
    {
      title: 'Legal Documents',
      documents: documents.filter(doc => 
        doc.name.toLowerCase().includes('registration') || 
        doc.name.toLowerCase().includes('title') ||
        doc.name.toLowerCase().includes('agreement')
      ),
      icon: <Assignment />,
      color: theme.palette.primary.main
    },
    {
      title: 'Insurance Documents',
      documents: documents.filter(doc => 
        doc.name.toLowerCase().includes('insurance') || 
        doc.name.toLowerCase().includes('policy')
      ),
      icon: <Security />,
      color: theme.palette.success.main
    },
    {
      title: 'Maintenance Records',
      documents: documents.filter(doc => 
        doc.name.toLowerCase().includes('maintenance') || 
        doc.name.toLowerCase().includes('service') ||
        doc.name.toLowerCase().includes('repair')
      ),
      icon: <Event />,
      color: theme.palette.warning.main
    },
    {
      title: 'Photos & Media',
      documents: documents.filter(doc => 
        doc.type === 'image' || 
        doc.name.toLowerCase().includes('photo') ||
        doc.name.toLowerCase().includes('image')
      ),
      icon: <Image />,
      color: theme.palette.info.main
    }
  ];

  const hasExpiringDocuments = isExpiringSoon(vehicle.insuranceExpiryDate) || 
                              isExpiringSoon(vehicle.registrationExpiryDate) ||
                              isExpired(vehicle.insuranceExpiryDate) || 
                              isExpired(vehicle.registrationExpiryDate);

  return (
    <Box sx={{ p: 3 }}>
      {/* Document Status Alert */}
      {hasExpiringDocuments && (
        <Alert 
          severity={isExpired(vehicle.insuranceExpiryDate) || isExpired(vehicle.registrationExpiryDate) ? "error" : "warning"} 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Document Renewal Required
          </Typography>
          <Typography variant="body2">
            Some vehicle documents are expiring soon or have expired. Please update them to maintain compliance.
          </Typography>
        </Alert>
      )}

      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            Vehicle Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage vehicle documentation and certificates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            sx={{ textTransform: 'none' }}
          >
            Upload Document
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ textTransform: 'none' }}
          >
            Add Document
          </Button>
        </Box>
      </Box>

      {/* Document Categories */}
      <Grid container spacing={3}>
        {documentCategories.map((category) => (
          <Grid item xs={12} md={6} key={category.title}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}>
              <CardContent sx={{ p: 0 }}>
                {/* Category Header */}
                <Box sx={{ 
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(category.color, 0.05)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        ml: 'auto'
                      }}
                    />
                  </Box>
                </Box>

                {/* Document List */}
                {category.documents.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
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
                          borderBottom: index < category.documents.length - 1 ? 
                            `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                          }
                        }}
                      >
                        <ListItemIcon>
                          {getDocumentIcon(document.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {document.name}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(document.uploadDate), 'MMM dd, yyyy')}
                              </Typography>
                              <Chip
                                label={document.type.toUpperCase()}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(theme.palette.grey[500], 0.1)
                                }}
                              />
                            </Stack>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e)}
                          sx={{ color: 'text.secondary' }}
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
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Document Status
        </Typography>
        
        <Grid container spacing={2}>
          {/* Insurance Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              border: `1px solid ${isExpired(vehicle.insuranceExpiryDate) ? theme.palette.error.main :
                                  isExpiringSoon(vehicle.insuranceExpiryDate) ? theme.palette.warning.main : 
                                  theme.palette.success.main}`,
              bgcolor: alpha(
                isExpired(vehicle.insuranceExpiryDate) ? theme.palette.error.main :
                isExpiringSoon(vehicle.insuranceExpiryDate) ? theme.palette.warning.main : 
                theme.palette.success.main, 
                0.05
              )
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                {isExpired(vehicle.insuranceExpiryDate) ? (
                  <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                ) : isExpiringSoon(vehicle.insuranceExpiryDate) ? (
                  <Warning sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                ) : (
                  <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Insurance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicle.insuranceExpiryDate ? 
                    format(new Date(vehicle.insuranceExpiryDate), 'MMM dd, yyyy') : 
                    'Not set'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Registration Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              border: `1px solid ${isExpired(vehicle.registrationExpiryDate) ? theme.palette.error.main :
                                  isExpiringSoon(vehicle.registrationExpiryDate) ? theme.palette.warning.main : 
                                  theme.palette.success.main}`,
              bgcolor: alpha(
                isExpired(vehicle.registrationExpiryDate) ? theme.palette.error.main :
                isExpiringSoon(vehicle.registrationExpiryDate) ? theme.palette.warning.main : 
                theme.palette.success.main, 
                0.05
              )
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                {isExpired(vehicle.registrationExpiryDate) ? (
                  <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                ) : isExpiringSoon(vehicle.registrationExpiryDate) ? (
                  <Warning sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                ) : (
                  <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Registration
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicle.registrationExpiryDate ? 
                    format(new Date(vehicle.registrationExpiryDate), 'MMM dd, yyyy') : 
                    'Not set'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Documents */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Assignment sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Total Documents
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {documents.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Storage Used */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.info.main}`,
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CloudDownload sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Storage Used
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'info.main' }}>
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
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
        <MenuItem onClick={handleMenuClose}>
          <Visibility fontSize="small" />
          View Document
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CloudDownload fontSize="small" />
          Download
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleMenuClose}
          sx={{
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Delete fontSize="small" />
          Delete Document
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default VehicleDocuments;
