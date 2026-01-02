import React from "react";
import { Box, Alert, Container } from "@mui/material";

interface EditPageErrorStateProps {
  error: string;
  useContainer?: boolean;
}

export const EditPageErrorState: React.FC<EditPageErrorStateProps> = ({
  error,
  useContainer = true,
}) => {
  const content = (
    <Box sx={{ py: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (useContainer) {
    return <Container maxWidth="lg">{content}</Container>;
  }

  return content;
};

