import React from 'react';
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
  Stack
} from '@mui/material';
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
  Assignment
} from '@mui/icons-material';

interface ContractDocumentsProps {
  contractId: string;
}

// Simple placeholder documents for the sidebar
const PLACEHOLDER_DOCUMENTS = [
  {
    id: '1',
    title: 'Contract Agreement',
    status: 'approved',
    fileName: 'contract_agreement_2024_001.pdf',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadDate: 'Jan 15, 2024',
    type: 'contract'
  },
  {
    id: '2',
    title: 'Customer ID Card',
    status: 'approved',
    fileName: 'customer_id_front.jpg',
    size: '1.2 MB',
    uploadedBy: 'Sarah Johnson',
    uploadDate: 'Jan 10, 2024',
    type: 'id'
  },
  {
    id: '3',
    title: 'Vehicle Insurance',
    status: 'pending',
    fileName: 'insurance_policy_2024.pdf',
    size: '890 KB',
    uploadedBy: 'Mike Davis',
    uploadDate: 'Jan 12, 2024',
    type: 'insurance'
  },
  {
    id: '4',
    title: 'Driving License',
    status: 'approved',
    fileName: 'driving_license.jpg',
    size: '950 KB',
    uploadedBy: 'Emily Wilson',
    uploadDate: 'Jan 8, 2024',
    type: 'license'
  },
  {
    id: '5',
    title: 'Endorser ID',
    status: 'rejected',
    fileName: 'endorser_id_card.pdf',
    size: '1.1 MB',
    uploadedBy: 'David Brown',
    uploadDate: 'Jan 14, 2024',
    type: 'endorser'
  },
  {
    id: '6',
    title: 'Bank Statement',
    status: 'approved',
    fileName: 'bank_statement_december.pdf',
    size: '675 KB',
    uploadedBy: 'Lisa Anderson',
    uploadDate: 'Jan 5, 2024',
    type: 'financial'
  }
];

export const ContractDocuments: React.FC<ContractDocumentsProps> = () => {
  const theme = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          icon: CheckCircle,
          label: 'Approved'
        };
      case 'pending':
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          icon: Schedule,
          label: 'Pending Review'
        };
      case 'rejected':
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          icon: ErrorIcon,
          label: 'Rejected'
        };
      default:
        return {
          color: theme.palette.text.secondary,
          bgcolor: alpha(theme.palette.text.secondary, 0.1),
          icon: Schedule,
          label: 'Unknown'
        };
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return Assignment;
      case 'id':
        return Person;
      case 'license':
        return DirectionsCar;
      case 'endorser':
        return Business;
      default:
        return PictureAsPdf;
    }
  };

  const getStats = () => {
    const total = PLACEHOLDER_DOCUMENTS.length;
    const approved = PLACEHOLDER_DOCUMENTS.filter(doc => doc.status === 'approved').length;
    const pending = PLACEHOLDER_DOCUMENTS.filter(doc => doc.status === 'pending').length;
    const rejected = PLACEHOLDER_DOCUMENTS.filter(doc => doc.status === 'rejected').length;
    const completion = Math.round((approved / total) * 100);
    
    return { total, approved, pending, rejected, completion };
  };

  const stats = getStats();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
        boxShadow: theme.shadows[1]
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 3,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Description sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Contract Documents
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<Upload />}
          sx={{ 
            textTransform: 'none',
            borderRadius: 1.5
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
              color: 'primary.main',
              fontSize: '0.75rem'
            }}
          />
          <Chip 
            label={`${stats.approved} Approved`} 
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1), 
              color: 'success.main',
              fontSize: '0.75rem'
            }}
          />
          <Chip 
            label={`${stats.pending} Pending`} 
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.1), 
              color: 'warning.main',
              fontSize: '0.75rem'
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
      
      <List sx={{ p: 0 }}>
        {PLACEHOLDER_DOCUMENTS.map((document) => {
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
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: alpha(statusConfig.color, 0.1),
                    color: statusConfig.color,
                    width: 40,
                    height: 40
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 20 }} />
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {document.title}
                    </Typography>
                    <Chip
                      icon={<StatusIcon />}
                      label={statusConfig.label}
                      size="small"
                      sx={{
                        bgcolor: statusConfig.bgcolor,
                        color: statusConfig.color,
                        fontSize: '0.7rem',
                        height: 20,
                        '& .MuiChip-icon': {
                          color: statusConfig.color,
                          fontSize: 12
                        }
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {document.fileName} • {document.size}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded by {document.uploadedBy} • {document.uploadDate}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};