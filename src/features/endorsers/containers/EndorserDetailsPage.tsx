import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
} from "@mui/material";
import { ArrowBack, Home, Group } from "@mui/icons-material";
import EndorserInfo from "../components/EndorserInfo";

export const EndorserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleBack = () => {
    navigate("/endorsers");
  };

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="error" align="center">
          Endorser ID not provided
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="contained" onClick={() => navigate("/endorsers")}>
            Back to Endorsers
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        pt: 2,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header with Breadcrumbs and Back Button */}
        <Box sx={{ mb: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": {
                color: theme.palette.text.secondary,
              },
            }}
          >
            <Link
              color="inherit"
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: 16 }} />
              Dashboard
            </Link>
            <Link
              color="inherit"
              onClick={() => navigate("/endorsers")}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              <Group sx={{ mr: 0.5, fontSize: 16 }} />
              Endorsers
            </Link>
            <Typography
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: 500,
              }}
            >
              Endorser Details
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
              px: 3,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                sx={{
                  mr: 2,
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                Back to Endorsers
              </Button>

              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  }}
                >
                  Endorser Details
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "1rem" }}
                >
                  View and manage endorser information and guarantee details
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <EndorserInfo endorserId={id} />
      </Container>
    </Box>
  );
};

export default EndorserDetailsPage;
