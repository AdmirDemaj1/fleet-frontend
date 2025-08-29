import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Collapse,
  IconButton,
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
import { EndorserFilters as EndorserFiltersType } from "../../types/endorser.types";
import { RELATIONSHIP_FILTER_OPTIONS } from "../../constants/endorserConstants";

interface EndorserFiltersProps {
  filters: EndorserFiltersType;
  onFiltersChange: (filters: EndorserFiltersType) => void;
  loading?: boolean;
}

export const EndorserFilters: React.FC<EndorserFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof EndorserFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    setExpanded(false);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

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
      <CardContent sx={{ pb: expanded ? 2 : "16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={{ position: "relative", flex: 1 }}>
            <Search
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: theme.palette.text.secondary,
                fontSize: 20,
              }}
            />
            <TextField
              fullWidth
              placeholder="Search endorsers by name, email, or ID..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  pl: 5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.7),
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.default, 0.9),
                  },
                  "&.Mui-focused": {
                    backgroundColor: theme.palette.background.paper,
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                disabled={loading}
                sx={{
                  minWidth: "auto",
                  px: 2,
                  color: theme.palette.text.secondary,
                  borderColor: alpha(theme.palette.text.secondary, 0.3),
                  "&:hover": {
                    borderColor: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.text.secondary, 0.04),
                  },
                }}
              >
                Clear
              </Button>
            )}

            <IconButton
              onClick={() => setExpanded(!expanded)}
              disabled={loading}
              sx={{
                color: expanded
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                backgroundColor: expanded
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <FilterList />
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ pt: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
                fontWeight: 600,
              }}
            >
              Advanced Filters
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Relationship Type</InputLabel>
                  <Select
                    value={filters.relationshipToCustomer || ""}
                    onChange={(e) =>
                      handleFilterChange("relationshipToCustomer", e.target.value)
                    }
                    label="Relationship Type"
                    disabled={loading}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {RELATIONSHIP_FILTER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={
                      filters.isActive === undefined
                        ? ""
                        : filters.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange(
                        "isActive",
                        value === "" ? undefined : value === "active"
                      );
                    }}
                    label="Status"
                    disabled={loading}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
