import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface CollateralFormProps {
  collaterals: any[];
  onCollateralsChange: (collaterals: any[]) => void;
  error?: string;
}

export const CollateralForm: React.FC<CollateralFormProps> = ({
  collaterals,
  onCollateralsChange,
  error,
}) => {
  const { control } = useFormContext();
  const [activeCollateral, setActiveCollateral] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCollateral = () => {
    const newCollateral = {
      id: Date.now().toString(),
      type: "vehicle",
      description: "",
      value: 0,
      active: true,
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      vinNumber: "",
      color: "",
      engineNumber: "",
      registrationCertificate: "",
      insurancePolicy: "",
    };
    setActiveCollateral(newCollateral);
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleEditCollateral = (collateral: any) => {
    setActiveCollateral(collateral);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDeleteCollateral = (id: string) => {
    const updatedCollaterals = collaterals.filter((c) => c.id !== id);
    onCollateralsChange(updatedCollaterals);
  };

  const handleSaveCollateral = () => {
    if (!activeCollateral) return;

    let updatedCollaterals;
    if (isEditing) {
      // Update existing collateral
      updatedCollaterals = collaterals.map((c) =>
        c.id === activeCollateral.id ? activeCollateral : c
      );
      console.log('🔄 Updating existing collateral:', activeCollateral.id);
    } else {
      // Add new collateral
      updatedCollaterals = [...collaterals, activeCollateral];
      console.log('➕ Adding new collateral:', activeCollateral);
    }

    console.log('📊 Updated collaterals array:', updatedCollaterals);
    onCollateralsChange(updatedCollaterals);
    setActiveCollateral(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setActiveCollateral(null);
    setIsEditing(false);
    setIsAdding(false);
  };

  const updateActiveCollateral = (field: string, value: any) => {
    setActiveCollateral((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <CarIcon />
        Vehicle Collaterals
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add additional vehicles as collateral security for this contract
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Add Collateral Button */}
      {!isEditing && !isAdding && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddCollateral}
          sx={{ mb: 3 }}
        >
          Add Vehicle Collateral
        </Button>
      )}

      {/* Collateral Form */}
      {(isEditing || isAdding) && activeCollateral && (
        <Card
          elevation={2}
          sx={{ mb: 3, border: "2px solid", borderColor: "primary.main" }}
        >
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              {isEditing ? "Edit Vehicle Collateral" : "Add Vehicle Collateral"}
            </Typography>

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={activeCollateral.description}
                  onChange={(e) =>
                    updateActiveCollateral("description", e.target.value)
                  }
                  placeholder="e.g., 2023 BMW X5 - Black"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Value"
                  type="number"
                  value={activeCollateral.value}
                  onChange={(e) =>
                    updateActiveCollateral(
                      "value",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                  required
                />
              </Grid>

              {/* Vehicle Details */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Make"
                  value={activeCollateral.make}
                  onChange={(e) =>
                    updateActiveCollateral("make", e.target.value)
                  }
                  placeholder="e.g., BMW"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Model"
                  value={activeCollateral.model}
                  onChange={(e) =>
                    updateActiveCollateral("model", e.target.value)
                  }
                  placeholder="e.g., X5"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={activeCollateral.year}
                  onChange={(e) =>
                    updateActiveCollateral(
                      "year",
                      parseInt(e.target.value) || new Date().getFullYear()
                    )
                  }
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="License Plate"
                  value={activeCollateral.licensePlate}
                  onChange={(e) =>
                    updateActiveCollateral("licensePlate", e.target.value)
                  }
                  placeholder="e.g., ABC-123"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="VIN Number"
                  value={activeCollateral.vinNumber}
                  onChange={(e) =>
                    updateActiveCollateral("vinNumber", e.target.value)
                  }
                  placeholder="e.g., 5UXCR6C0XN9A12345"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={activeCollateral.color}
                  onChange={(e) =>
                    updateActiveCollateral("color", e.target.value)
                  }
                  placeholder="e.g., Black"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Engine Number"
                  value={activeCollateral.engineNumber}
                  onChange={(e) =>
                    updateActiveCollateral("engineNumber", e.target.value)
                  }
                  placeholder="e.g., BMW987654321"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Certificate"
                  value={activeCollateral.registrationCertificate}
                  onChange={(e) =>
                    updateActiveCollateral(
                      "registrationCertificate",
                      e.target.value
                    )
                  }
                  placeholder="e.g., REG-2023-005678"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Policy"
                  value={activeCollateral.insurancePolicy}
                  onChange={(e) =>
                    updateActiveCollateral("insurancePolicy", e.target.value)
                  }
                  placeholder="e.g., INS-BMW-2024-123456"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activeCollateral.active}
                      onChange={(e) =>
                        updateActiveCollateral("active", e.target.checked)
                      }
                    />
                  }
                  label="Active Collateral"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleSaveCollateral}
                disabled={
                  !activeCollateral.description ||
                  !activeCollateral.make ||
                  !activeCollateral.model
                }
              >
                {isEditing ? "Update Collateral" : "Add Collateral"}
              </Button>
              <Button variant="outlined" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Existing Collaterals List */}
      {collaterals.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Current Collaterals ({collaterals.length})
          </Typography>

          {collaterals.map((collateral, index) => (
            <Card key={collateral.id} elevation={1} sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {collateral.description ||
                        `${collateral.make} ${collateral.model}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {collateral.make} {collateral.model} ({collateral.year}) -{" "}
                      {collateral.color}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      License: {collateral.licensePlate} | VIN:{" "}
                      {collateral.vinNumber}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight={600}
                    >
                      Value: ${collateral.value?.toLocaleString()}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: collateral.active
                            ? "success.main"
                            : "error.main",
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        {collateral.active ? "Active" : "Inactive"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCollateral(collateral)}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCollateral(collateral.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {collaterals.length === 0 && !isEditing && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CarIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No collaterals added
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add vehicle collaterals to provide additional security for this
            contract
          </Typography>
        </Box>
      )}
    </Box>
  );
};
