import React, { useMemo } from "react";
import {
  Box,
  Autocomplete,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
  useTheme,
  alpha,
  Divider,
  Chip,
} from "@mui/material";
import { SupervisorAccount, Search, Email, Phone } from "@mui/icons-material";
import { useAdministrators } from "../../hooks/useAdministrators";
import { Customer, CustomerType } from "../../types/customer.types";

interface AdministratorOption {
  id: string;
  displayName: string;
  type: CustomerType;
  identifier?: string;
  email: string;
  phone: string;
}

interface AdministratorPickerProps {
  selectedAdministratorIds: string[];
  onAdministratorSelect: (ids: string[]) => void;
  error?: string;
}

export const AdministratorPicker: React.FC<AdministratorPickerProps> = ({
  selectedAdministratorIds,
  onAdministratorSelect,
  error,
}) => {
  const theme = useTheme();
  const { administrators, loading } = useAdministrators();

  const getCustomerDisplayName = (customer: Customer): string => {
    if (customer.type === CustomerType.INDIVIDUAL) {
      const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
      return name || "Individual customer";
    }
    if (customer.type === CustomerType.BUSINESS) {
      return customer.legalName || "Business customer";
    }
    // Backward compatibility for any legacy administrator-shaped customers
    const anyCustomer = customer as any;
    return anyCustomer.companyName || anyCustomer.administratorName || "Customer";
  };

  const getCustomerIdentifier = (customer: Customer): string | undefined => {
    if (customer.type === CustomerType.INDIVIDUAL) return customer.idNumber || undefined;
    if (customer.type === CustomerType.BUSINESS) return customer.nuisNipt || undefined;
    const anyCustomer = customer as any;
    return anyCustomer.nuisNipt || anyCustomer.administratorId || undefined;
  };

  // Transform customers to options
  const administratorOptions = useMemo<AdministratorOption[]>(() => {
    return administrators.map((customer: Customer) => ({
      id: customer.id,
      displayName: getCustomerDisplayName(customer),
      type: customer.type,
      identifier: getCustomerIdentifier(customer),
      email: customer.email || "",
      phone: customer.phone || "",
    }));
  }, [administrators]);

  // Get selected administrators
  const selectedAdministrators = useMemo(() => {
    return administratorOptions.filter((admin) =>
      selectedAdministratorIds.includes(admin.id)
    );
  }, [administratorOptions, selectedAdministratorIds]);

  const handleChange = (_event: any, newValue: AdministratorOption[]) => {
    onAdministratorSelect(newValue.map((admin) => admin.id));
  };

  return (
    <Box>
      <Typography
        variant="h6"
        component="h3"
        gutterBottom
        fontWeight={600}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: theme.palette.warning.main,
          mb: 2,
        }}
      >
        <SupervisorAccount />
        Select Administrators (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Administrators can be any existing customer. Select one or more customers
        to link to this business.
      </Typography>

      <Autocomplete
        multiple
        id="administrator-picker"
        options={administratorOptions}
        value={selectedAdministrators}
        onChange={handleChange}
        loading={loading}
        getOptionLabel={(option) => option.displayName}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterOptions={(options, state) => {
          const q = state.inputValue.trim().toLowerCase();
          if (!q) return options;
          return options.filter((o) => {
            const haystack = [
              o.displayName,
              o.identifier || "",
              o.email || "",
              o.phone || "",
              o.type || "",
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(q);
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Customers"
            placeholder="Type to search by name, NUIS/ID, email, phone..."
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: `0 0 0 1px ${alpha(
                    theme.palette.warning.main,
                    0.2
                  )}`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.warning.main,
                    0.2
                  )}`,
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box sx={{ width: "100%", py: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <SupervisorAccount
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.warning.main }}
                />
                <Typography variant="subtitle2" fontWeight={600}>
                  {option.displayName}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", ml: 3 }}
              >
                Type: {option.type}
                {option.identifier ? ` • ID: ${option.identifier}` : ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, ml: 3, mt: 0.5 }}>
                {option.email && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Email
                      sx={{ fontSize: 12, mr: 0.5, color: "text.disabled" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                )}
                {option.phone && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Phone
                      sx={{ fontSize: 12, mr: 0.5, color: "text.disabled" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {option.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </li>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.displayName}
              icon={<SupervisorAccount />}
              color="warning"
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                fontWeight: 500,
              }}
            />
          ))
        }
        PaperComponent={({ children }) => (
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {children}
          </Paper>
        )}
        noOptionsText={
          loading ? (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading customers...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No customers available.
              </Typography>
            </Box>
          )
        }
        sx={{
          "& .MuiAutocomplete-tag": {
            maxWidth: "calc(100% - 32px)",
          },
        }}
      />

      {selectedAdministrators.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Selected Administrators ({selectedAdministrators.length})
          </Typography>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}
          >
            {selectedAdministrators.map((admin) => (
              <Paper
                key={admin.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.02),
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <SupervisorAccount
                        sx={{
                          mr: 1,
                          color: theme.palette.warning.main,
                          fontSize: 20,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {admin.displayName}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Type: {admin.type}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      {admin.identifier ? `ID: ${admin.identifier}` : "ID: —"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      {admin.email && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Email
                            sx={{
                              fontSize: 14,
                              mr: 0.5,
                              color: "text.disabled",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {admin.email}
                          </Typography>
                        </Box>
                      )}
                      {admin.phone && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Phone
                            sx={{
                              fontSize: 14,
                              mr: 0.5,
                              color: "text.disabled",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {admin.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
