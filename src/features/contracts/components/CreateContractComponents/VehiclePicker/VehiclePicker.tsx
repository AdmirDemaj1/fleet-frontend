import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Button,
  Fade,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  DirectionsCar,
  Search,
  Clear,
  Add,
  CheckCircle,
  Refresh,
  Security,
  Warning,
} from "@mui/icons-material";
import { useGetAvailableVehiclesQuery } from "../../../api/contractApi";
import {
  VehiclePickerProps,
  VehicleSummary,
} from "../../../types/contract.types";
import { vehicleApi } from "../../../../vehicles/api/vehicleApi";
import { useUploadDocumentMutation } from "../../../../vehicles/api/vehicleDocumentApi";
import { VehicleDocumentType } from "../../../../vehicles/types/vehicleType";
import {
  VehicleCreationModal,
  BrandLogo,
} from "../../../../../shared/components";
import { Vehicle } from "../../../../vehicles/types/vehicleType";
import {
  VehicleCompletionModal,
  REQUIRED_VEHICLE_DOCUMENT_TYPES,
  VehicleDocumentUpload,
} from "./VehicleCompletionModal";
import { useNotification } from "../../../../../shared/hooks/useNotification";

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Enhanced VehicleSummary for available vehicles only
interface EnhancedVehicleSummary extends VehicleSummary {
  status: "AVAILABLE";
  isVerified?: boolean;
  mileage?: number;
  fuelType?: string;
  color?: string;
}

interface VehiclePickerState {
  searchTerm: string;
  selectedVehicles: EnhancedVehicleSummary[]; // Changed to array for multiple selection
  isOpen: boolean;
  hasInteracted: boolean;
  isCreateModalOpen: boolean;
  isCreatingVehicle: boolean;
  isCompletionModalOpen: boolean;
  pendingVehicle: EnhancedVehicleSummary | null;
  isCompletingVehicle: boolean;
}

export const VehiclePicker: React.FC<VehiclePickerProps> = ({
  selectedVehicleIds,
  onVehicleSelect,
  onVehicleDataChange,
  selectedVehicleData,
  isEditMode = false,
  vehicleAsCollateral = false,
  onVehicleAsCollateralChange,
  error,
}) => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();
  const [uploadDocument] = useUploadDocumentMutation();

  const [state, setState] = useState<VehiclePickerState>({
    searchTerm: "",
    selectedVehicles: [], // Changed to array for multiple selection
    isOpen: false,
    hasInteracted: false,
    isCreateModalOpen: false,
    isCreatingVehicle: false,
    isCompletionModalOpen: false,
    pendingVehicle: null,
    isCompletingVehicle: false,
  });

  // Debounced search term to improve performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Parse search term to extract make and model
  const parseSearchTerm = (searchTerm: string) => {
    if (!searchTerm.trim()) return { make: undefined, model: undefined };

    // Try to parse format like "1999 Volkswagen Gof - TR 3896 R"
    const parts = searchTerm.trim().split(/\s+/);
    if (parts.length >= 3) {
      // Skip year (first part), extract make and model
      const make = parts[1];
      const model = parts[2];
      return { make, model };
    }

    // Fallback: use search as is
    return { make: undefined, model: undefined, search: searchTerm };
  };

  const parsedSearch = parseSearchTerm(debouncedSearchTerm);

  // Fetch ONLY available vehicles with documents
  const {
    data: vehiclesResponse = [],
    isLoading,
    error: apiError,
    refetch,
  } = useGetAvailableVehiclesQuery({
    ...parsedSearch,
    status: "AVAILABLE",
    includeDocuments: true,
  });

  // Debug logging for API responses
  console.log("🔍 VehiclePicker Debug:");
  console.log("  🔍 Original Search Term:", debouncedSearchTerm);
  console.log("  🔧 Parsed Search Params:", parsedSearch);
  console.log("  📊 API Response:", vehiclesResponse);
  console.log("  ⚠️ API Error:", apiError);
  console.log("  🔄 Is Loading:", isLoading);

  // Process vehicles - only available ones
  const allVehicles = useMemo(
    () =>
      vehiclesResponse
        .filter((vehicle) => vehicle.status === "AVAILABLE")
        .map((vehicle) => ({
          ...vehicle,
          status: "AVAILABLE" as const,
          isVerified: (vehicle as any).isVerified ?? true,
          mileage: (vehicle as any).mileage,
          fuelType: (vehicle as any).fuelType,
          color: (vehicle as any).color,
        })) as EnhancedVehicleSummary[],
    [vehiclesResponse]
  );

  // Get available vehicles (excluding selected ones)
  const availableVehicles = useMemo(
    () =>
      state.selectedVehicles.length > 0
        ? allVehicles.filter(
            (v) => !state.selectedVehicles.some((sv) => sv.id === v.id)
          )
        : allVehicles,
    [allVehicles, state.selectedVehicles]
  );

  // Check if a vehicle is complete (has license plate and required documents)
  const isVehicleComplete = useCallback(
    (vehicle: EnhancedVehicleSummary): boolean => {
      // Check license plate
      if (!vehicle.licensePlate) return false;

      // Check required documents
      const existingDocTypes =
        (vehicle as any).documents?.map((d: any) => d.type) || [];
      const hasAllDocs = REQUIRED_VEHICLE_DOCUMENT_TYPES.every((type) =>
        existingDocTypes.includes(type)
      );

      return hasAllDocs;
    },
    []
  );

  // Get what's missing from a vehicle
  const getVehicleMissingItems = useCallback(
    (vehicle: EnhancedVehicleSummary): string[] => {
      const missing: string[] = [];

      if (!vehicle.licensePlate) {
        missing.push("License Plate");
      }

      const existingDocTypes =
        (vehicle as any).documents?.map((d: any) => d.type) || [];
      REQUIRED_VEHICLE_DOCUMENT_TYPES.forEach((type) => {
        if (!existingDocTypes.includes(type)) {
          const label = type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          missing.push(label);
        }
      });

      return missing;
    },
    []
  );

  // Update selected vehicles when IDs change
  useEffect(() => {
    if (selectedVehicleIds && selectedVehicleIds.length > 0) {
      const selectedVehicles: EnhancedVehicleSummary[] = [];

      // In edit mode, use selectedVehicleData if provided (vehicles may not be in available list)
      if (isEditMode && selectedVehicleData && selectedVehicleData.length > 0) {
        selectedVehicleIds.forEach((vehicleId) => {
          const vehicleFromData = selectedVehicleData.find(
            (v) => v.id === vehicleId
          );
          if (vehicleFromData) {
            // Transform to EnhancedVehicleSummary format for edit mode
            selectedVehicles.push({
              ...vehicleFromData,
              status: "AVAILABLE" as const, // Override status for display
              isVerified: true,
            } as EnhancedVehicleSummary);
          }
        });
      }

      // For any IDs not found in selectedVehicleData, try to find in available vehicles
      selectedVehicleIds.forEach((vehicleId) => {
        if (!selectedVehicles.find((v) => v.id === vehicleId)) {
          const vehicle = allVehicles.find((v) => v.id === vehicleId);
          if (vehicle) {
            selectedVehicles.push(vehicle);
          }
        }
      });

      // Update state only if the selection has changed
      const currentIds = state.selectedVehicles.map((v) => v.id).sort();
      const newIds = selectedVehicles.map((v) => v.id).sort();
      if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
        setState((prev) => ({ ...prev, selectedVehicles }));
      }
    } else if (
      (!selectedVehicleIds || selectedVehicleIds.length === 0) &&
      state.selectedVehicles.length > 0
    ) {
      setState((prev) => ({ ...prev, selectedVehicles: [] }));
    }
  }, [
    selectedVehicleIds,
    allVehicles,
    selectedVehicleData,
    isEditMode,
    state.selectedVehicles,
  ]);

  // Handle vehicle selection - check if complete first
  const handleVehicleSelect = useCallback(
    (vehicles: EnhancedVehicleSummary[] | null) => {
      if (vehicles && vehicles.length > 0) {
        // Check if any vehicle is incomplete
        const incompleteVehicles = vehicles.filter(
          (v) => !isVehicleComplete(v)
        );

        if (incompleteVehicles.length > 0) {
          // Show completion modal for first incomplete vehicle
          setState((prev) => ({
            ...prev,
            pendingVehicle: incompleteVehicles[0],
            isCompletionModalOpen: true,
            hasInteracted: true,
          }));
          return;
        }

        // All vehicles are complete - proceed with selection
        setState((prev) => ({
          ...prev,
          selectedVehicles: vehicles,
          hasInteracted: true,
        }));

        const vehicleIds = vehicles.map((v) => v.id);
        onVehicleSelect(vehicleIds);
        // Also pass the full vehicle data including documents
        if (onVehicleDataChange) {
          onVehicleDataChange(vehicles);
        }
      } else {
        // Clearing selection
        setState((prev) => ({
          ...prev,
          selectedVehicles: [],
          hasInteracted: true,
        }));
        onVehicleSelect([]); // Empty array
        if (onVehicleDataChange) {
          onVehicleDataChange([]);
        }
      }
    },
    [onVehicleSelect, onVehicleDataChange, isVehicleComplete]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (_event: any, newInputValue: string) => {
      setState((prev) => ({
        ...prev,
        hasInteracted: true,
        searchTerm: newInputValue,
      }));
    },
    []
  );

  // Handle open/close
  const handleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Get vehicle display name
  const getVehicleDisplayName = useCallback(
    (vehicle: EnhancedVehicleSummary) => {
      const plateInfo = vehicle.licensePlate || "No Plate";
      return `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${plateInfo}`;
    },
    []
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Vehicle creation modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setState((prev) => ({ ...prev, isCreateModalOpen: true }));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setState((prev) => ({ ...prev, isCreateModalOpen: false }));
  }, []);

  const handleCreateVehicle = useCallback(
    async (vehicleData: Partial<Vehicle>) => {
      try {
        setState((prev) => ({ ...prev, isCreatingVehicle: true }));

        const newVehicle = await vehicleApi.createVehicle(vehicleData);

        // Transform the created vehicle to match our enhanced type
        const enhancedVehicle: EnhancedVehicleSummary = {
          id: newVehicle.id,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year,
          licensePlate: newVehicle.licensePlate,
          vinNumber: newVehicle.vin,
          status: "AVAILABLE",
          isVerified: true,
          mileage: newVehicle.currentMileage,
          fuelType: newVehicle.fuelType,
          color: newVehicle.color,
        };

        // Add the newly created vehicle to selected vehicles
        setState((prev) => ({
          ...prev,
          selectedVehicles: [...prev.selectedVehicles, enhancedVehicle],
          isCreateModalOpen: false,
          isCreatingVehicle: false,
        }));

        // Notify parent component - add to existing selection
        const newVehicleIds = [...selectedVehicleIds, enhancedVehicle.id];
        onVehicleSelect(newVehicleIds);
        // Also pass the full vehicle data
        if (onVehicleDataChange) {
          const existingVehicles = selectedVehicleData || [];
          onVehicleDataChange([...existingVehicles, enhancedVehicle]);
        }

        // Refresh the vehicle list
        refetch();
      } catch (error) {
        console.error("Failed to create vehicle:", error);
        setState((prev) => ({ ...prev, isCreatingVehicle: false }));
      }
    },
    [
      onVehicleSelect,
      onVehicleDataChange,
      refetch,
      selectedVehicleIds,
      selectedVehicleData,
    ]
  );

  // Handle closing completion modal
  const handleCloseCompletionModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCompletionModalOpen: false,
      pendingVehicle: null,
      isCompletingVehicle: false,
    }));
  }, []);

  // Handle vehicle completion (adding license plate and/or documents)
  const handleVehicleCompletion = useCallback(
    async (data: {
      licensePlate?: string;
      documents?: VehicleDocumentUpload[];
    }) => {
      const vehicle = state.pendingVehicle;
      if (!vehicle) return;

      setState((prev) => ({ ...prev, isCompletingVehicle: true }));

      try {
        let updatedVehicle: EnhancedVehicleSummary = { ...vehicle };

        // Update license plate if provided
        if (data.licensePlate) {
          console.log("🔧 Updating vehicle license plate:", data.licensePlate);
          await vehicleApi.updateVehicle(vehicle.id, {
            licensePlate: data.licensePlate,
          });
          // Explicitly set the license plate from the provided data to ensure it's updated
          updatedVehicle = {
            ...updatedVehicle,
            licensePlate: data.licensePlate, // Use the provided value directly
          };
          console.log(
            "✅ Vehicle updated with license plate:",
            updatedVehicle.licensePlate
          );
        }

        // Upload documents if provided
        if (data.documents && data.documents.length > 0) {
          const uploadPromises = data.documents.map((doc) =>
            uploadDocument({
              file: doc.file,
              data: {
                type: doc.type as VehicleDocumentType,
                title: doc.title,
                expiryDate: doc.expiryDate, // Use the expiry date provided by user
                vehicleId: vehicle.id,
              },
            }).unwrap()
          );

          await Promise.all(uploadPromises);

          // Add documents to the vehicle object
          const newDocs = data.documents.map((doc) => ({
            id: `new-${Date.now()}-${doc.type}`,
            type: doc.type,
            title: doc.title,
            fileName: doc.file.name,
            filePath: "",
            status: "completed",
            createdAt: new Date().toISOString(),
            downloadUrl: "",
            previewUrl: "",
          }));

          updatedVehicle = {
            ...updatedVehicle,
            documents: [...(updatedVehicle.documents || []), ...newDocs],
          } as EnhancedVehicleSummary;
        }

        console.log("🚗 Final updated vehicle data:", {
          id: updatedVehicle.id,
          licensePlate: updatedVehicle.licensePlate,
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          vinNumber: updatedVehicle.vinNumber,
          documentsCount: updatedVehicle.documents?.length || 0,
        });

        // Add the completed vehicle to selected vehicles
        setState((prev) => {
          const existingVehicles = prev.selectedVehicles.filter(
            (v) => v.id !== updatedVehicle.id
          );
          return {
            ...prev,
            selectedVehicles: [...existingVehicles, updatedVehicle],
            pendingVehicle: null,
            isCompletionModalOpen: false,
            isCompletingVehicle: false,
          };
        });

        // Add to existing selection
        const newVehicleIds = [
          ...selectedVehicleIds.filter((id) => id !== updatedVehicle.id),
          updatedVehicle.id,
        ];
        onVehicleSelect(newVehicleIds);
        if (onVehicleDataChange) {
          // Pass the updated vehicle data with the new license plate
          const existingVehicles = (selectedVehicleData || []).filter(
            (v) => v.id !== updatedVehicle.id
          );
          onVehicleDataChange([...existingVehicles, updatedVehicle]);
          console.log(
            "📤 Passed updated vehicle data to parent with licensePlate:",
            updatedVehicle.licensePlate
          );
        }

        showSuccess("Vehicle information updated successfully!");

        // Refresh the vehicle list
        refetch();
      } catch (err) {
        console.error("Failed to complete vehicle:", err);
        showError("Failed to update vehicle information");
        setState((prev) => ({ ...prev, isCompletingVehicle: false }));
        throw err;
      }
    },
    [
      state.pendingVehicle,
      onVehicleSelect,
      onVehicleDataChange,
      uploadDocument,
      refetch,
      showSuccess,
      showError,
    ]
  );

  // Error handling
  if (apiError) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 1 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleRefresh}
            aria-label="retry loading vehicles"
          >
            <Refresh />
          </IconButton>
        }
      >
        Failed to load available vehicles. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            Select Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose one or more available vehicles for this contract
          </Typography>
        </Box>
        <Tooltip title="Create a new vehicle">
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleOpenCreateModal}
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Create Vehicle
          </Button>
        </Tooltip>
      </Box>

      {/* Vehicle Selection Autocomplete */}
      <Autocomplete
        multiple
        options={availableVehicles}
        getOptionLabel={getVehicleDisplayName}
        value={state.selectedVehicles}
        onChange={(_event, value) => {
          handleVehicleSelect(value);
        }}
        onInputChange={handleInputChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={state.isOpen}
        loading={isLoading}
        filterOptions={(x) => x} // API handles filtering
        blurOnSelect={false} // Keep dropdown open for multiple selection
        clearOnBlur={false} // Don't clear on blur
        selectOnFocus={false} // Don't select on focus
        handleHomeEndKeys
        openOnFocus={true} // Open dropdown when focused
        disableCloseOnSelect={true} // Keep dropdown open after selection for multiple
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Vehicles"
            placeholder="Search and select available vehicles..."
            error={!!error}
            helperText={
              error ||
              `${availableVehicles.length} available vehicles found${
                state.selectedVehicles.length > 0
                  ? ` (${state.selectedVehicles.length} selected)`
                  : ""
              }`
            }
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: `0 0 0 1px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          const isSelected = state.selectedVehicles.some(
            (v) => v.id === option.id
          );
          const isComplete = isVehicleComplete(option);
          const missingItems = !isComplete
            ? getVehicleMissingItems(option)
            : [];

          return (
            <MenuItem
              {...otherProps}
              key={option.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "transparent",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: "translateY(-1px)",
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              <BrandLogo brandName={option.make} size={120} />

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {option.year} {option.make} {option.model}
                  </Typography>
                  <Chip
                    label="Available"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem", height: 20 }}
                  />
                  {!isComplete && (
                    <Tooltip title={`Missing: ${missingItems.join(", ")}`}>
                      <Chip
                        icon={<Warning sx={{ fontSize: 14 }} />}
                        label="Incomplete"
                        size="small"
                        color="warning"
                        variant="filled"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </Tooltip>
                  )}
                  {option.isVerified && isComplete && (
                    <Tooltip title="Verified vehicle">
                      <CheckCircle
                        sx={{
                          fontSize: 16,
                          color: theme.palette.success.main,
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  🏷️{" "}
                  {option.licensePlate || (
                    <em style={{ color: theme.palette.warning.main }}>
                      No plate
                    </em>
                  )}{" "}
                  • 🔢 {option.vinNumber}
                </Typography>

                {(option.mileage || option.fuelType || option.color) && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {option.mileage && (
                      <Typography variant="caption" color="text.secondary">
                        📏 {option.mileage?.toLocaleString()} km
                      </Typography>
                    )}
                    {option.fuelType && (
                      <Typography variant="caption" color="text.secondary">
                        ⛽ {option.fuelType}
                      </Typography>
                    )}
                    {option.color && (
                      <Typography variant="caption" color="text.secondary">
                        🎨 {option.color}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </MenuItem>
          );
        }}
        PaperComponent={(props) => (
          <Paper
            {...props}
            sx={{
              mt: 1,
              maxHeight: 300,
              overflow: "auto",
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          />
        )}
        noOptionsText={
          <Box sx={{ textAlign: "center", py: 3 }}>
            <DirectionsCar
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {state.searchTerm
                ? "No available vehicles found"
                : "Start typing to search available vehicles"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only vehicles with AVAILABLE status are shown
            </Typography>
          </Box>
        }
        loadingText={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 2,
              justifyContent: "center",
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="body2">
              Loading available vehicles...
            </Typography>
          </Box>
        }
      />

      {/* Selected Vehicles Display */}
      {state.selectedVehicles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Selected Vehicles ({state.selectedVehicles.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {state.selectedVehicles.map((vehicle) => (
              <Fade in timeout={300} key={vehicle.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: "2px solid",
                    borderColor: "success.main",
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.02),
                    transition: "all 0.3s ease",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <BrandLogo brandName={vehicle.make} size={150} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <Chip
                            label="Selected"
                            size="small"
                            color="success"
                            sx={{ fontSize: "0.7rem" }}
                          />
                          {vehicle.isVerified && (
                            <Chip
                              label="Verified"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Tooltip title="Remove vehicle">
                        <IconButton
                          color="error"
                          onClick={() => {
                            const updatedVehicles =
                              state.selectedVehicles.filter(
                                (v) => v.id !== vehicle.id
                              );
                            handleVehicleSelect(
                              updatedVehicles.length > 0
                                ? updatedVehicles
                                : null
                            );
                          }}
                          sx={{
                            bgcolor: "background.paper",
                            boxShadow: theme.shadows[2],
                            "&:hover": {
                              bgcolor: "error.main",
                              color: "white",
                            },
                          }}
                        >
                          <Clear />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        🏷️ License Plate:{" "}
                        <strong>{vehicle.licensePlate}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🔢 VIN:{" "}
                        <strong style={{ fontFamily: "monospace" }}>
                          {vehicle.vinNumber}
                        </strong>
                      </Typography>
                      {vehicle.color && (
                        <Typography variant="body2" color="text.secondary">
                          🎨 Color: <strong>{vehicle.color}</strong>
                        </Typography>
                      )}
                      {vehicle.mileage && (
                        <Typography variant="body2" color="text.secondary">
                          📏 Mileage:{" "}
                          <strong>{vehicle.mileage.toLocaleString()} km</strong>
                        </Typography>
                      )}
                      {vehicle.fuelType && (
                        <Typography variant="body2" color="text.secondary">
                          ⛽ Fuel Type: <strong>{vehicle.fuelType}</strong>
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>
        </Box>
      )}

      {/* Empty state */}
      {state.selectedVehicles.length === 0 && !isLoading && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 4,
            textAlign: "center",
            border: "2px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <DirectionsCar
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No vehicle selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search and select an available vehicle for this contract
          </Typography>
        </Paper>
      )}

      {/* Vehicle Creation Modal */}
      <VehicleCreationModal
        open={state.isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateVehicle}
        isCreating={state.isCreatingVehicle}
      />

      {/* Vehicle Completion Modal - for adding missing info */}
      <VehicleCompletionModal
        open={state.isCompletionModalOpen}
        onClose={handleCloseCompletionModal}
        vehicle={state.pendingVehicle}
        onComplete={handleVehicleCompletion}
        isLoading={state.isCompletingVehicle}
      />
    </Box>
  );
};
