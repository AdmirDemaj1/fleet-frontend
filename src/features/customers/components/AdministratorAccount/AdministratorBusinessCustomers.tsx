import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import {
  Business,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { customerApi } from "../../api/customerApi";
import { Customer } from "../../types/customer.types";

interface AdministratorBusinessCustomersProps {
  businessCustomerIds: string[];
  loading: boolean;
}

export const AdministratorBusinessCustomers: React.FC<AdministratorBusinessCustomersProps> = ({
  businessCustomerIds,
  loading,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [businessCustomers, setBusinessCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessCustomers = async () => {
      if (businessCustomerIds.length === 0) {
        setBusinessCustomers([]);
        return;
      }

      try {
        setLoadingCustomers(true);
        setError(null);
        const customers: Customer[] = [];
        
        // Fetch each business customer
        for (const customerId of businessCustomerIds) {
          try {
            const customer = await customerApi.getById(customerId);
            const customerData = customer.customer || customer;
            if (customerData.type === "business") {
              customers.push(customerData as Customer);
            }
          } catch (err) {
            console.error(`Failed to fetch customer ${customerId}:`, err);
          }
        }
        
        setBusinessCustomers(customers);
      } catch (err) {
        setError("Failed to load business customers");
        console.error("Error fetching business customers:", err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchBusinessCustomers();
  }, [businessCustomerIds]);

  if (loading || loadingCustomers) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Business sx={{ fontSize: 24, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Business Customers
          </Typography>
          <Chip label={businessCustomerIds.length} size="small" color="primary" />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Business sx={{ fontSize: 24, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Business Customers
        </Typography>
        <Chip label={businessCustomers.length} size="small" color="primary" />
      </Box>

      {businessCustomers.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          This administrator is not associated with any business customers.
        </Typography>
      ) : (
        <List>
          {businessCustomers.map((customer) => (
            <ListItem
              key={customer.id}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mb: 1,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                  cursor: "pointer",
                },
              }}
              onClick={() => navigate(`/customers/${customer.id}`)}
              secondaryAction={
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customers/${customer.id}`);
                  }}
                >
                  View
                </Button>
              }
            >
              <ListItemIcon>
                <Business sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {(customer as any).legalName || "Business Customer"}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {(customer as any).nuisNipt && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        NUIS/NIPT: {(customer as any).nuisNipt}
                      </Typography>
                    )}
                    {customer.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {customer.email}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

