import React from "react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";

interface EditPageLoadingStateProps {
  message?: string;
  useContainer?: boolean;
}

export const EditPageLoadingState: React.FC<EditPageLoadingStateProps> = ({
  message = "Loading...",
  useContainer = true,
}) => {
  const content = (
    <Box
      sx={{
        minHeight: useContainer ? "100vh" : "400px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );

  if (useContainer) {
    return <Container maxWidth="lg">{content}</Container>;
  }

  return content;
};

