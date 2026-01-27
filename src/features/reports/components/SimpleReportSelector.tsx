import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { SimpleReportType } from "../types/report.types";
import { customerRtkApi } from "../../customers/api/customerRtkApi";
import { contractApi } from "../../contracts/api/contractApi";
import { useDebounce } from "../../../shared/hooks/useDebounce";

interface SimpleReportSelectorProps {
  reportType: SimpleReportType | "";
  startDate: string;
  endDate: string;
  customerId: string;
  contractId: string;
  onReportTypeChange: (reportType: SimpleReportType) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onCustomerIdChange: (customerId: string) => void;
  onContractIdChange: (contractId: string) => void;
  disabled?: boolean;
}

const reportTypeLabels: Record<SimpleReportType, string> = {
  [SimpleReportType.PAYMENTS]: "Payments",
  [SimpleReportType.PAYMENTS_PER_CUSTOMER]: "Payments per Customer",
  [SimpleReportType.PAYMENTS_PER_CONTRACT]: "Payments per Contract",
  [SimpleReportType.CUSTOMERS]: "Customers",
  [SimpleReportType.CONTRACTS]: "Contracts",
};

export const SimpleReportSelector: React.FC<SimpleReportSelectorProps> = ({
  reportType,
  startDate,
  endDate,
  customerId, // Used by parent component for state management
  contractId, // Used by parent component for state management
  onReportTypeChange,
  onStartDateChange,
  onEndDateChange,
  onCustomerIdChange,
  onContractIdChange,
  disabled = false,
}) => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [customerInputValue, setCustomerInputValue] = useState("");
  const [contractInputValue, setContractInputValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Debounce search inputs
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const debouncedContractSearch = useDebounce(contractSearch, 300);

  const showCustomerSelector =
    reportType === SimpleReportType.PAYMENTS_PER_CUSTOMER;
  const showContractSelector =
    reportType === SimpleReportType.PAYMENTS_PER_CONTRACT;

  // Fetch customers only when needed
  const { data: customersData, isLoading: customersLoading } =
    customerRtkApi.useGetCustomersQuery(
      {
        search: debouncedCustomerSearch,
        limit: 50,
        offset: 0,
      },
      {
        skip: !showCustomerSelector,
      }
    );

  // Fetch contracts only when needed
  const { data: contractsData, isLoading: contractsLoading } =
    contractApi.useGetContractsQuery(
      {
        search: debouncedContractSearch,
        limit: 50,
        offset: 0,
      },
      {
        skip: !showContractSelector,
      }
    );

  // Update search when input changes
  useEffect(() => {
    setCustomerSearch(customerInputValue);
  }, [customerInputValue]);

  useEffect(() => {
    setContractSearch(contractInputValue);
  }, [contractInputValue]);

  const handleReportTypeChange = (event: SelectChangeEvent<string>) => {
    onReportTypeChange(event.target.value as SimpleReportType);
    // Reset selections when report type changes
    onCustomerIdChange("");
    onContractIdChange("");
    setCustomerSearch("");
    setContractSearch("");
    setCustomerInputValue("");
    setContractInputValue("");
    setSelectedCustomer(null);
    setSelectedContract(null);
  };

  const customers = customersData?.customers || [];
  const contracts = contractsData?.contracts || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="report-type-label">Report Type</InputLabel>
        <Select
          labelId="report-type-label"
          id="report-type-select"
          value={reportType}
          label="Report Type"
          onChange={handleReportTypeChange}
          disabled={disabled}
        >
          {Object.entries(reportTypeLabels).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showCustomerSelector && (
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            if (option.type === "individual") {
              return `${option.firstName || ""} ${option.lastName || ""} - ${
                option.idNumber || ""
              }`.trim();
            } else if (option.type === "business") {
              return `${option.legalName || ""} - ${
                option.nuisNipt || ""
              }`.trim();
            } else {
              return `${option.companyName || ""} - ${
                option.nuisNipt || ""
              }`.trim();
            }
          }}
          value={selectedCustomer}
          onChange={(_, newValue) => {
            setSelectedCustomer(newValue);
            onCustomerIdChange(newValue?.id || "");
            if (newValue) {
              // Set input value to the selected customer's label
              const label = newValue.type === "individual"
                ? `${newValue.firstName || ""} ${newValue.lastName || ""} - ${newValue.idNumber || ""}`.trim()
                : newValue.type === "business"
                ? `${newValue.legalName || ""} - ${newValue.nuisNipt || ""}`.trim()
                : `${newValue.companyName || ""} - ${newValue.nuisNipt || ""}`.trim();
              setCustomerInputValue(label);
            }
          }}
          inputValue={customerInputValue}
          onInputChange={(_, newInputValue, reason) => {
            if (reason !== "reset") {
              setCustomerInputValue(newInputValue);
            }
          }}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          loading={customersLoading}
          disabled={disabled}
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Customer"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {customersLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}

      {showContractSelector && (
        <Autocomplete
          options={contracts}
          getOptionLabel={(option) => {
            if (typeof option === "string") return option;
            return `Contract #${option.contractNumber}`;
          }}
          value={selectedContract}
          onChange={(_, newValue) => {
            setSelectedContract(newValue);
            onContractIdChange(newValue?.id || "");
            if (newValue) {
              setContractInputValue(`Contract #${newValue.contractNumber}`);
            }
          }}
          inputValue={contractInputValue}
          onInputChange={(_, newInputValue, reason) => {
            if (reason !== "reset") {
              setContractInputValue(newInputValue);
            }
          }}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          loading={contractsLoading}
          disabled={disabled}
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Contract"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {contractsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}

      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        disabled={disabled}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />

      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        disabled={disabled}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth
      />
    </Box>
  );
};
