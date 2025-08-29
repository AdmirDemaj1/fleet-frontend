import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  alpha,
  useTheme,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Endorser } from "../../types/endorser.types";

interface EndorserListItemProps {
  endorser: Endorser;
  onDelete: (id: string) => void;
}

export const EndorserListItem: React.FC<EndorserListItemProps> = ({
  endorser,
  onDelete,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    navigate(`/endorsers/${endorser.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/endorsers/${endorser.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(endorser.id);
    handleMenuClose();
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <TableRow
      sx={{
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          cursor: "pointer",
        },
        transition: "background-color 0.2s ease-in-out",
      }}
      onClick={handleView}
    >
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {getInitials(endorser.firstName, endorser.lastName)}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: theme.palette.text.primary, lineHeight: 1.3 }}
            >
              {endorser.firstName} {endorser.lastName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}
            >
              {endorser.dateOfBirth &&
                `Born ${format(new Date(endorser.dateOfBirth), "MMM d, yyyy")}`}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary, lineHeight: 1.3 }}
          >
            {endorser.email}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}
          >
            {endorser.phone && formatPhoneNumber(endorser.phone)}
            {endorser.phone && endorser.city && " • "}
            {endorser.city && (
              <>
                {endorser.city}, {endorser.state}
              </>
            )}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary, lineHeight: 1.3 }}
          >
            {endorser.idNumber || "Not provided"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}
          >
            ID Number
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, fontStyle: "italic" }}
          >
            View relationships
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary, lineHeight: 1.3 }}
          >
            {format(new Date(endorser.createdAt), "MMM d, yyyy")}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}
          >
            {format(new Date(endorser.createdAt), "h:mm a")}
          </Typography>
        </Box>
      </TableCell>

      <TableCell align="right">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e);
          }}
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
          <MenuItem onClick={handleView}>
            <Visibility fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <Edit fontSize="small" />
            Edit
          </MenuItem>
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
            Delete
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};
