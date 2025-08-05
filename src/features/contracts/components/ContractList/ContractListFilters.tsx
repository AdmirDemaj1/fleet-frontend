import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { ContractType, ContractStatus } from "../../types/contract.types";

interface ContractListFiltersProps {
  search: string;
  type?: ContractType;
  status?: ContractStatus;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: ContractType | undefined) => void;
  onStatusChange: (status: ContractStatus | undefined) => void;
  onReset: () => void;
}

export const ContractListFilters: React.FC<ContractListFiltersProps> = ({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onReset,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchValue);
  };

  const handleReset = () => {
    setSearchValue("");
    onReset();
  };

  const hasActiveFilters = search || type || status;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search and basic filters */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search contracts by number, customer..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "text.secondary", mr: 1 }} />
              ),
              endAdornment: searchValue && (
                <IconButton
                  size="small"
                  onClick={() => setSearchValue("")}
                  sx={{ mr: -0.5 }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              ),
            }}
            size="small"
          />
        </Box>

        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{ minWidth: 120 }}
        >
          Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleReset}
            size="small"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active filters display */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {search && (
            <Chip
              label={`Search: "${search}"`}
              onDelete={() => onSearchChange("")}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {type && (
            <Chip
              label={`Type: ${type === ContractType.LOAN ? "Loan" : "Leasing"}`}
              onDelete={() => onTypeChange(undefined)}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {status && (
            <Chip
              label={`Status: ${
                status.charAt(0).toUpperCase() + status.slice(1)
              }`}
              onDelete={() => onStatusChange(undefined)}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Advanced filters */}
      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Advanced Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Contract Type</InputLabel>
                <Select
                  value={type || ""}
                  onChange={(e) =>
                    onTypeChange((e.target.value as ContractType) || undefined)
                  }
                  label="Contract Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value={ContractType.LOAN}>Loan</MenuItem>
                  <MenuItem value={ContractType.LEASING}>Leasing</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={status || ""}
                  onChange={(e) =>
                    onStatusChange(
                      (e.target.value as ContractStatus) || undefined
                    )
                  }
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={ContractStatus.DRAFT}>Draft</MenuItem>
                  <MenuItem value={ContractStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={ContractStatus.COMPLETED}>
                    Completed
                  </MenuItem>
                  <MenuItem value={ContractStatus.CANCELLED}>
                    Cancelled
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};
