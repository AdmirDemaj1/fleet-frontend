import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  Chip,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  Description,
  CalendarToday,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Administrator } from "../../types/customer.types";
import { NonActiveDocuments } from "../../../../shared/components/NonActiveDocuments";

interface AdministratorSummarySidebarProps {
  administrator: Administrator | any;
}

export const AdministratorSummarySidebar: React.FC<AdministratorSummarySidebarProps> = ({
  administrator,
}) => {
  if (!administrator) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 320,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          background: "background.paper",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="text" width="70%" height={24} sx={{ mt: 2 }} />
        </Box>
      </Paper>
    );
  }

  const getInitials = () => {
    const name = administrator.administratorName || "";
    return name
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 320,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        background: "background.paper",
      }}
    >
      {/* Status indicator */}
      <Box
        sx={{
          height: 4,
          width: "100%",
          bgcolor: "warning.main",
        }}
      />

      {/* Header Section */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "warning.main",
              color: "warning.contrastText",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {getInitials()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {administrator.administratorName || "Administrator"}
            </Typography>
            <Chip
              label="Administrator"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Company Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Business sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Company Information
            </Typography>
          </Box>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {administrator.companyName}
            </Typography>
            {administrator.companyEmail && (
              <Typography variant="caption" color="text.secondary">
                {administrator.companyEmail}
              </Typography>
            )}
            {administrator.companyPhone && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {administrator.companyPhone}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Administrator Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Person sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Administrator Details
            </Typography>
          </Box>
          <Box sx={{ pl: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {administrator.administratorId && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  ID Number
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {administrator.administratorId}
                </Typography>
              </Box>
            )}
            {administrator.administratorPosition && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Position
                </Typography>
                <Typography variant="body2">{administrator.administratorPosition}</Typography>
              </Box>
            )}
            {administrator.nuisNipt && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  NUIS/NIPT
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {administrator.nuisNipt}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contact Information */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Contact
            </Typography>
          </Box>
          <Box sx={{ pl: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {administrator.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2">{administrator.phone}</Typography>
              </Box>
            )}
            {administrator.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2">{administrator.email}</Typography>
              </Box>
            )}
            {administrator.secondaryPhone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {administrator.secondaryPhone}
                </Typography>
              </Box>
            )}
            {administrator.secondaryEmail && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {administrator.secondaryEmail}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {administrator.address && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Address
                </Typography>
              </Box>
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2">{administrator.address}</Typography>
              </Box>
            </Box>
          </>
        )}

        {administrator.additionalNotes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Description sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Notes
                </Typography>
              </Box>
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {administrator.additionalNotes}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Created Date */}
        {administrator.createdAt && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Created: {format(new Date(administrator.createdAt), "MMM d, yyyy")}
            </Typography>
          </Box>
        )}

        {/* Non-Active Documents Section */}
        {administrator.id && (
          <NonActiveDocuments
            entityType="administrator"
            entityId={administrator.id}
          />
        )}
      </Box>
    </Paper>
  );
};

