import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  alpha,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import {
  LocalShipping,
  Domain,
  History,
  LocationOn,
  Business,
  ExpandMore,
  Person,
  Email,
  Phone,
  Description,
  Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { CustomerType, Administrator } from "../../../types/customer.types";
import { documentApi } from "../../../../../shared/api/documentApi";

interface CustomerAccountAdditionalInfoProps {
  customerData: any;
  contracts: any[];
  collateral: any[];
}

const CustomerAccountAdditionalInfo: React.FC<
  CustomerAccountAdditionalInfoProps
> = ({ customerData, contracts, collateral }) => {
  const navigate = useNavigate();
  const [administratorDocuments, setAdministratorDocuments] = useState<Record<string, any[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});

  // Check if current customer is an administrator
  const isAdministrator = customerData?.type === CustomerType.ADMINISTRATOR || 
    (customerData?.administratorName && customerData?.companyName && !customerData?.type);

  // Fetch documents for administrator when viewing directly
  useEffect(() => {
    if (isAdministrator && customerData?.id) {
      const fetchDocuments = async () => {
        try {
          setLoadingDocuments(prev => ({ ...prev, [customerData.id]: true }));
          const documents = await documentApi.getAdministratorDocuments(customerData.id);
          setAdministratorDocuments(prev => ({ ...prev, [customerData.id]: documents }));
        } catch (error) {
          console.error('Failed to fetch administrator documents:', error);
        } finally {
          setLoadingDocuments(prev => ({ ...prev, [customerData.id]: false }));
        }
      };
      fetchDocuments();
    }
  }, [isAdministrator, customerData?.id]);

  // Fetch documents for administrators when viewing business customer
  useEffect(() => {
    if (customerData?.type === CustomerType.BUSINESS && customerData?.administrators) {
      customerData.administrators.forEach((admin: Administrator) => {
        if (admin.id && !administratorDocuments[admin.id] && !loadingDocuments[admin.id]) {
          const fetchDocuments = async () => {
            try {
              setLoadingDocuments(prev => ({ ...prev, [admin.id!]: true }));
              const documents = await documentApi.getAdministratorDocuments(admin.id!);
              setAdministratorDocuments(prev => ({ ...prev, [admin.id!]: documents }));
            } catch (error) {
              console.error(`Failed to fetch documents for administrator ${admin.id}:`, error);
            } finally {
              setLoadingDocuments(prev => ({ ...prev, [admin.id!]: false }));
            }
          };
          fetchDocuments();
        }
      });
    }
  }, [customerData?.type, customerData?.administrators]);

  return (
    <Box sx={{ p: 3, pb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <LocalShipping
          sx={{
            color: "primary.main",
            fontSize: 20,
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: "0.95rem",
          }}
        >
          Account Summary
        </Typography>
      </Box>

      <List dense disablePadding sx={{ "& .MuiListItem-root": { py: 1.5 } }}>
        <ListItem
          disablePadding
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocalShipping sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Active Contracts
            </Typography>
          </Box>
          <Chip
            label={contracts.length}
            size="small"
            sx={{
              bgcolor:
                contracts.length > 0
                  ? (theme) => alpha(theme.palette.success.main, 0.1)
                  : "action.hover",
              color: contracts.length > 0 ? "success.main" : "text.secondary",
              fontWeight: 600,
              minWidth: 32,
              height: 24,
            }}
          />
        </ListItem>

        <ListItem
          disablePadding
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Domain sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Collateral Items
            </Typography>
          </Box>
          <Chip
            label={collateral.length}
            size="small"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
              color: "info.main",
              fontWeight: 600,
              minWidth: 32,
              height: 24,
            }}
          />
        </ListItem>

        <ListItem
          disablePadding
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <History sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Activity Logs
            </Typography>
          </Box>
          <Chip
            label={customerData?.logs?.length || 0}
            size="small"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              color: "warning.main",
              fontWeight: 600,
              minWidth: 32,
              height: 24,
            }}
          />
        </ListItem>

        {customerData?.address && (
          <ListItem
            disablePadding
            sx={{ flexDirection: "column", alignItems: "flex-start", pt: 2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Address
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                lineHeight: 1.4,
                pl: 3,
                fontWeight: 500,
              }}
            >
              {customerData.address}
            </Typography>
          </ListItem>
        )}
      </List>

      {/* Administrators Section for Business Customers */}
      {(customerData?.type === CustomerType.BUSINESS ||
        customerData?.type === "business") &&
        customerData?.administrators &&
        Array.isArray(customerData.administrators) &&
        customerData.administrators.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Business
                  sx={{
                    color: "primary.main",
                    fontSize: 20,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "0.95rem",
                  }}
                >
                  Administrators ({customerData.administrators.length})
                </Typography>
              </Box>

              {customerData.administrators.map(
                (administrator: Administrator, index: number) => (
                  <Accordion
                    key={administrator.id || index}
                    elevation={0}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      mb: 1.5,
                      "&:before": { display: "none" },
                      "&.Mui-expanded": {
                        margin: "0 0 12px 0",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ fontSize: 20 }} />}
                      sx={{
                        minHeight: 48,
                        "&.Mui-expanded": {
                          minHeight: 48,
                        },
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          width: "100%",
                        }}
                      >
                        <Person
                          sx={{ fontSize: 18, color: "text.secondary" }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                          >
                            {administrator.administratorName || "Administrator"}
                          </Typography>
                          {administrator.administratorPosition && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {administrator.administratorPosition}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          pl: 4,
                        }}
                      >
                        {administrator.companyName && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Company
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {administrator.companyName}
                            </Typography>
                          </Box>
                        )}

                        {administrator.administratorId && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              ID Number
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {administrator.administratorId}
                            </Typography>
                          </Box>
                        )}

                        {administrator.nuisNipt && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              NUIS/NIPT
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {administrator.nuisNipt}
                            </Typography>
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          {administrator.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Email
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {administrator.email}
                              </Typography>
                            </Box>
                          )}

                          {administrator.phone && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Phone
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {administrator.phone}
                              </Typography>
                            </Box>
                          )}

                          {administrator.companyEmail && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Email
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                }}
                              >
                                Company: {administrator.companyEmail}
                              </Typography>
                            </Box>
                          )}

                          {administrator.companyPhone && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Phone
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                }}
                              >
                                Company: {administrator.companyPhone}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {administrator.address && (
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Address
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.875rem", lineHeight: 1.4 }}
                            >
                              {administrator.address}
                            </Typography>
                          </Box>
                        )}

                        {/* Documents Section */}
                        {administratorDocuments[administrator.id!] && 
                         administratorDocuments[administrator.id!].length > 0 && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha('#000', 0.1)}` }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 1,
                              }}
                            >
                              Documents ({administratorDocuments[administrator.id!].length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {administratorDocuments[administrator.id!].map((doc: any) => (
                                <Box
                                  key={doc.id}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    py: 0.5,
                                  }}
                                >
                                  <Description sx={{ fontSize: 14, color: "text.secondary" }} />
                                  <Typography
                                    variant="caption"
                                    sx={{ fontSize: "0.75rem" }}
                                  >
                                    {doc.title || doc.fileName || doc.type}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Edit Button */}
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/administrators/${administrator.id}/edit`)}
                            sx={{ textTransform: 'none' }}
                          >
                            Edit Administrator
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )
              )}
            </Box>
          </>
        )}

        {/* Documents Section for Direct Administrator View */}
        {isAdministrator && customerData?.id && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Description
                sx={{
                  color: "primary.main",
                  fontSize: 20,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: "0.95rem",
                }}
              >
                Documents
              </Typography>
            </Box>

            {loadingDocuments[customerData.id] ? (
              <Typography variant="body2" color="text.secondary">
                Loading documents...
              </Typography>
            ) : administratorDocuments[customerData.id]?.length > 0 ? (
              <List dense disablePadding>
                {administratorDocuments[customerData.id].map((doc: any) => (
                  <ListItem
                    key={doc.id}
                    disablePadding
                    sx={{
                      py: 1,
                      px: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <Description sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {doc.title || doc.fileName || doc.type}
                      </Typography>
                      <Chip
                        label={doc.type === 'business_administrator_id_card' ? 'ID Card' : 'QKB'}
                        size="small"
                        sx={{ height: 20 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/administrators/${customerData.id}/edit`)}
                sx={{ textTransform: 'none' }}
              >
                Edit Administrator
              </Button>
            </Box>
          </Box>
        )}
    </Box>
  );
};

export default CustomerAccountAdditionalInfo;
