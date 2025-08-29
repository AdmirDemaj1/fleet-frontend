import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Button,
  alpha,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  MoreVert,
  Person,
  Business,
  Edit,
  Delete,
  Add,
  Visibility,
} from "@mui/icons-material";
import { format } from "date-fns";
import { EndorserRelationship } from "../../types/endorser.types";

interface EndorserRelationshipsCardProps {
  relationships: EndorserRelationship[];
  onEdit?: (relationship: EndorserRelationship) => void;
  onDelete?: (relationshipId: string) => void;
  onAdd?: () => void;
  onViewCustomer?: (customerId: string) => void;
}

export const EndorserRelationshipsCard: React.FC<EndorserRelationshipsCardProps> = ({
  relationships,
  onEdit,
  onDelete,
  onAdd,
  onViewCustomer,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<EndorserRelationship | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, relationship: EndorserRelationship) => {
    setAnchorEl(event.currentTarget);
    setSelectedRelationship(relationship);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRelationship(null);
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
    if (selectedRelationship && onDelete) {
      onDelete(selectedRelationship.id);
    }
    handleMenuClose();
  };

  const getRelationshipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "spouse":
        return theme.palette.error.main;
      case "parent":
        return theme.palette.warning.main;
      case "child":
        return theme.palette.info.main;
      case "sibling":
        return theme.palette.success.main;
      case "business partner":
        return theme.palette.secondary.main;
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

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Person sx={{ fontSize: 20 }} />
            Customer Relationships
          </Typography>
          {onAdd && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={onAdd}
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Add Relationship
            </Button>
          )}
        </Box>

        {relationships.length === 0 ? (
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
                  onClick={onAdd}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  Add First Relationship
                </Button>
              )}
            </Box>
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Relationship Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relationships.map((relationship) => (
                  <TableRow
                    key={relationship.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      transition: "background-color 0.2s ease-in-out",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 32,
                            height: 32,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {relationship.customer?.name 
                            ? getCustomerInitials(relationship.customer.name)
                            : "C"}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, lineHeight: 1.3 }}
                          >
                            {relationship.customer?.name || "Unknown Customer"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {relationship.customer?.type || "Individual"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={
                          relationship.relationshipToCustomer === "business_partner" ? (
                            <Business sx={{ fontSize: 16 }} />
                          ) : (
                            <Person sx={{ fontSize: 16 }} />
                          )
                        }
                        label={relationship.relationshipToCustomer.replace("_", " ")}
                        sx={{
                          bgcolor: alpha(getRelationshipColor(relationship.relationshipToCustomer), 0.1),
                          color: getRelationshipColor(relationship.relationshipToCustomer),
                          fontWeight: 500,
                          textTransform: "capitalize",
                          "& .MuiChip-icon": {
                            color: getRelationshipColor(relationship.relationshipToCustomer),
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={relationship.isActive ? "Active" : "Inactive"}
                        sx={{
                          bgcolor: relationship.isActive
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.grey[500], 0.1),
                          color: relationship.isActive
                            ? theme.palette.success.main
                            : theme.palette.grey[600],
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(relationship.createdAt), "MMM d, yyyy")}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {format(new Date(relationship.createdAt), "h:mm a")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
      </CardContent>
    </Card>
  );
};
