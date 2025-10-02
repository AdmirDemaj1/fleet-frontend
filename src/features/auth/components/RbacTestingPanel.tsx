import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Chip,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  AdminPanelSettings,
  Person,
  Science,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  ExpandMore,
  Security,
  Assignment,
} from "@mui/icons-material";
import { useRbacTesting } from "../hooks/useRbacTesting";

export const RbacTestingPanel: React.FC = () => {
  const {
    userInfo,
    isLoadingUserInfo,
    isTestingRbac,
    lastTestResult,
    error,
    fetchUserInfo,
    testRbac,
    clearError,
    getUserRoleInfo,
    isLoading,
    hasUserInfo,
    hasError,
  } = useRbacTesting();

  useEffect(() => {
    // Auto-fetch user info on component mount
    fetchUserInfo().catch(() => {
      // Error already handled by the hook
    });
  }, [fetchUserInfo]);

  const roleInfo = getUserRoleInfo();

  const handleTestRbac = async () => {
    try {
      await testRbac();
    } catch (error) {
      // Error already handled by the hook
    }
  };

  const handleTestWithApprovalId = async () => {
    const approvalId = prompt("Enter approval request ID to test:");
    if (approvalId) {
      try {
        await testRbac(approvalId);
      } catch (error) {
        // Error already handled by the hook
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 2 }}
      >
        <Security color="primary" />
        RBAC Testing Panel
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Test Role-Based Access Control and Approval Workflow System
      </Typography>

      {hasError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Info Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Person />
                  Current User Info
                </Box>
              }
              action={
                <Button
                  size="small"
                  onClick={fetchUserInfo}
                  disabled={isLoadingUserInfo}
                  startIcon={
                    isLoadingUserInfo ? (
                      <CircularProgress size={16} />
                    ) : undefined
                  }
                >
                  Refresh
                </Button>
              }
            />
            <CardContent>
              {!hasUserInfo && isLoadingUserInfo && (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              )}

              {hasUserInfo && userInfo && (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {roleInfo?.isAdmin ? (
                      <AdminPanelSettings color="primary" />
                    ) : (
                      <Person color="secondary" />
                    )}
                    <Box>
                      <Typography variant="h6">{userInfo.username}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userInfo.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={roleInfo?.displayName}
                      color={roleInfo?.isAdmin ? "primary" : "secondary"}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {roleInfo?.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">Permissions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {Object.entries(userInfo.permissions).map(
                          ([permission, hasAccess]) => (
                            <ListItem key={permission}>
                              <ListItemIcon>
                                {hasAccess ? (
                                  <CheckCircle color="success" />
                                ) : (
                                  <Cancel color="error" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={permission
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase()}
                                primaryTypographyProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                              />
                            </ListItem>
                          )
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">
                        Approval Requirements
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {Object.entries(userInfo.needsApprovalFor).map(
                          ([action, needsApproval]) => (
                            <ListItem key={action}>
                              <ListItemIcon>
                                {needsApproval ? (
                                  <HourglassEmpty color="warning" />
                                ) : (
                                  <CheckCircle color="success" />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={action
                                  .replace(/([A-Z])/g, " $1")
                                  .toLowerCase()}
                                secondary={
                                  needsApproval
                                    ? "Requires approval"
                                    : "Direct access"
                                }
                                primaryTypographyProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                              />
                            </ListItem>
                          )
                        )}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Testing Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Science />
                  RBAC Testing
                </Box>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Test the Role-Based Access Control system and approval workflow
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleTestRbac}
                  disabled={isLoading}
                  startIcon={
                    isTestingRbac ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Science />
                    )
                  }
                  fullWidth
                >
                  {isTestingRbac ? "Testing RBAC..." : "Test RBAC System"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleTestWithApprovalId}
                  disabled={isLoading}
                  startIcon={<Assignment />}
                  fullWidth
                >
                  Test with Approval ID
                </Button>
              </Box>

              {lastTestResult && (
                <Box mt={3}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Last Test Result:
                  </Typography>

                  <Alert
                    severity={
                      lastTestResult.requiresApproval ? "warning" : "success"
                    }
                    sx={{ mb: 2 }}
                  >
                    {lastTestResult.requiresApproval ? (
                      <Box>
                        <Typography variant="body2">
                          Request submitted for approval
                        </Typography>
                        {lastTestResult.approvalRequestId && (
                          <Typography variant="caption" display="block">
                            Approval ID: {lastTestResult.approvalRequestId}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        Action completed successfully
                      </Typography>
                    )}
                  </Alert>

                  {lastTestResult.data && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">Result Data</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            fontSize: "0.75rem",
                            overflow: "auto",
                            backgroundColor: "grey.100",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          {JSON.stringify(lastTestResult.data, null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Help Panel */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="How to Use" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    For Admin Users:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Actions are executed immediately
                    <br />
                    • No approval required
                    <br />• Can approve requests from low-tier users
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    For Low-Tier Users:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Actions require approval
                    <br />
                    • Approval request ID is generated
                    <br />• Admin users can approve requests
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
