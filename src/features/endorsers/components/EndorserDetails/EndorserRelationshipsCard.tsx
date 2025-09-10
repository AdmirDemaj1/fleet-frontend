import React, { useState } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  MoreVert,
  Person,
  Business,
  Edit,
  Delete,
  Add,
  Visibility,
  AttachMoney,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { EndorserRelationship } from "../../types/endorser.types";
import { AddRelationshipModal } from "../AddRelationshipModal";

interface EndorserRelationshipsCardProps {
  endorserId: string;
  relationships: EndorserRelationship[];
  onEdit?: (relationship: EndorserRelationship) => void;
  onDelete?: (relationshipId: string) => void;
  onAdd?: () => void;
  onViewCustomer?: (customerId: string) => void;
  onRefresh?: () => void;
}

export const EndorserRelationshipsCard: React.FC<EndorserRelationshipsCardProps> = ({
  endorserId,
  relationships,
  onEdit,
  onDelete,
  onAdd,
  onViewCustomer,
  onRefresh,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<EndorserRelationship | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, relationship: EndorserRelationship) => {
    setAnchorEl(event.currentTarget);
    setSelectedRelationship(relationship);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRelationship(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
    setIsAddModalOpen(false);
  };

  const handleViewCustomer = () => {
    if (selectedRelationship?.customerId && onViewCustomer) {
      onViewCustomer(selectedRelationship.customerId);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRelationship && onEdit) {
      onEdit(selectedRelationship);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRelationship?.id && onDelete) {
      onDelete(selectedRelationship.id);
    }
    handleMenuClose();
  };

  const getRelationshipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "business partner":
        return theme.palette.secondary.main;
      case "spouse":
        return theme.palette.error.main;
      case "parent":
        return theme.palette.warning.main;
      case "child":
        return theme.palette.info.main;
      case "sibling":
        return theme.palette.success.main;
      case "friend":
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCustomerInitials = (customerName: string) => {
    const parts = customerName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return customerName.charAt(0).toUpperCase();
  };

  const getStatusConfig = (isActive: boolean) => {
    if (isActive) {
      return {
        color: theme.palette.success.main,
        bgcolor: alpha(theme.palette.success.main, 0.1),
        icon: CheckCircle,
        label: 'Active'
      };
    } else {
      return {
        color: theme.palette.error.main,
        bgcolor: alpha(theme.palette.error.main, 0.1),
        icon: ErrorIcon,
        label: 'Inactive'
      };
    }
  };

  const getStats = () => {
    const total = relationships.length;
    const active = relationships.filter(rel => rel.active).length;
    const inactive = relationships.filter(rel => !rel.active).length;
    const totalGuaranteed = relationships.reduce((sum, rel) => sum + rel.maximumGuaranteeAmount, 0);
    
    return { total, active, inactive, totalGuaranteed };
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
          <Person sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Customer Relationships
          </Typography>
        </Box>
        {onAdd && (
          <Button
            size="small"
            startIcon={<Add />}
            onClick={handleOpenAddModal}
            sx={{ 
              textTransform: 'none',
              borderRadius: 1.5
            }}
          >
            Add Relationship
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Manage and review endorser-customer relationships
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
            label={`${stats.active} Active`} 
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1), 
              color: 'success.main',
              fontSize: '0.75rem'
            }}
          />
          {stats.inactive > 0 && (
            <Chip 
              label={`${stats.inactive} Inactive`} 
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.1), 
                color: 'error.main',
                fontSize: '0.75rem'
              }}
            />
          )}
        </Stack>
        
        <Typography variant="caption" color="text.secondary">
          Total Guaranteed: ${stats.totalGuaranteed.toLocaleString()} • {stats.active} active relationships
        </Typography>
      </Box>

      {/* Relationship List */}
      {relationships.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              "& .MuiAlert-message": {
                width: "100%",
                textAlign: "center",
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                No customer relationships found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This endorser is not currently associated with any customers.
              </Typography>
              {onAdd && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleOpenAddModal}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  Add First Relationship
                </Button>
              )}
            </Box>
          </Alert>
        </Box>
      ) : (
        <>
          <Typography variant="subtitle2" sx={{ p: 3, pb: 1, fontWeight: 600 }}>
            Relationship List
          </Typography>
          
          <List sx={{ p: 0 }}>
            {relationships.map((relationship) => {
              const statusConfig = getStatusConfig(relationship.active);
              const StatusIcon = statusConfig.icon;
              const relationshipColor = getRelationshipColor(relationship.relationshipType);

              return (
                <ListItem
                  key={relationship.id}
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
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {relationship.customer?.name 
                        ? getCustomerInitials(relationship.customer.name)
                        : "C"}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {relationship.customer?.name || "Unknown Customer"}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              size="small"
                              label={relationship.relationshipType}
                              sx={{
                                bgcolor: alpha(relationshipColor, 0.1),
                                color: relationshipColor,
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
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
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, relationship)}
                          sx={{
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Max Guarantee: ${relationship.maximumGuaranteeAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires: {format(new Date(relationship.expirationDate), "MMM d, yyyy")} • 
                          {relationship.customer?.type || "Individual"}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {onViewCustomer && (
          <MenuItem onClick={handleViewCustomer}>
            <Visibility fontSize="small" />
            View Customer
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" />
            Edit Relationship
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: theme.palette.error.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <Delete fontSize="small" />
            Delete Relationship
          </MenuItem>
        )}
      </Menu>

      {/* Add Relationship Modal */}
      <AddRelationshipModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        endorserId={endorserId}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
};
