import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Badge,
  CalendarToday,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Endorser } from "../../types/endorser.types";

interface EndorserDetailsCardProps {
  endorser: Endorser;
}

export const EndorserDetailsCard: React.FC<EndorserDetailsCardProps> = ({
  endorser,
}) => {
  const theme = useTheme();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatAddress = () => {
    const parts = [];
    if (endorser.address) parts.push(endorser.address);
    if (endorser.city) parts.push(endorser.city);
    if (endorser.state) parts.push(endorser.state);
    if (endorser.zipCode) parts.push(endorser.zipCode);
    if (endorser.country) parts.push(endorser.country);
    return parts.join(", ");
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
        {/* Header with Avatar and Basic Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 80,
              height: 80,
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {getInitials(endorser.firstName, endorser.lastName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              {endorser.firstName} {endorser.lastName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                icon={<Person sx={{ fontSize: 16 }} />}
                label="Endorser"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 500,
                  "& .MuiChip-icon": {
                    color: theme.palette.success.main,
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Created {format(new Date(endorser.createdAt), "MMMM d, yyyy")}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Contact Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Email sx={{ fontSize: 20 }} />
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Email
                  sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                {endorser.email}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Phone
                  sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" color="textSecondary">
                  Phone
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                {formatPhoneNumber(endorser.phone)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Address Information */}
        {formatAddress() && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocationOn sx={{ fontSize: 20 }} />
              Address
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, ml: 3, color: theme.palette.text.primary }}
            >
              {formatAddress()}
            </Typography>
          </Box>
        )}

        {/* Identification Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Badge sx={{ fontSize: 20 }} />
            Identification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Badge
                  sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                />
                <Typography variant="body2" color="textSecondary">
                  ID Number
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                {endorser.idNumber || "Not provided"}
              </Typography>
            </Grid>
            {endorser.dateOfBirth && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <CalendarToday
                    sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Date of Birth
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500, ml: 3 }}>
                  {format(new Date(endorser.dateOfBirth), "MMMM d, yyyy")}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Timestamps */}
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">
              Created
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {format(new Date(endorser.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="textSecondary">
              Last Updated
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {format(new Date(endorser.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
