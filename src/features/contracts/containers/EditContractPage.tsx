import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Container, Alert } from "@mui/material";
import { ContractForm } from "../components";
import {
  useGetContractsQuery,
  useUpdateContractMutation,
  useGetCustomerQuery,
} from "../api/contractApi";
import { useNotification } from "../../../shared/hooks/useNotification";
import { usePendingDocuments } from "../../../shared/hooks/usePendingDocuments";
import {
  EditPageLoadingState,
  EditPageErrorState,
} from "../../../shared/components";
import { useContractDataLoader } from "../hooks/useContractDataLoader";
import { ContractType, UpdateContractDto } from "../types/contract.types";

export const EditContractPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // API Queries
  const { data: contractsData, isLoading: isLoadingContracts } =
    useGetContractsQuery({ limit: 1000, offset: 0 }, { skip: !id });

  const contract = contractsData?.contracts?.find((c) => c.id === id);

  const { data: customerData, isLoading: isLoadingCustomer } =
    useGetCustomerQuery(contract?.customerId || "", {
      skip: !contract?.customerId,
    });

  const [updateContract, { isLoading: isUpdating }] =
    useUpdateContractMutation();

  // Pending documents management
  const {
    pendingDocumentIds,
    setPendingDocumentIds,
    commitPendingDocuments,
    cleanupPendingDocuments,
    cleanupOnCancel,
  } = usePendingDocuments({
    entityType: "contract",
    entityId: id,
    enabled: !!id,
    cleanupOnUnmount: false,
    cleanupOnCancel: false,
  });

  // Contract data loading hook
  const { initialData, loadingData, error, loadContractData } =
    useContractDataLoader({
      contractId: id,
      contract,
      customerData,
      isLoadingCustomer,
      setPendingDocumentIds,
    });

  // Load contract data when dependencies are ready
  useEffect(() => {
    // Only load if contract is available or contracts query is done
    if (contract || (contractsData && !isLoadingContracts)) {
      loadContractData();
    }
  }, [loadContractData, contract, contractsData, isLoadingContracts]);

  // Check if contract was not found after loading completes
  const contractNotFound =
    contractsData && !isLoadingContracts && !contract && id;

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCancel = async () => {
    // Cleanup pending documents when user cancels (only if cleanupOnCancel is true)
    if (cleanupOnCancel && pendingDocumentIds.length > 0) {
      try {
        console.log(
          `🧹 Cleaning up ${pendingDocumentIds.length} pending documents on cancel`
        );
        await cleanupPendingDocuments();
      } catch (error) {
        console.error("Failed to cleanup pending documents on cancel:", error);
        // Continue with navigation even if cleanup fails
      }
    }
    // Navigate back to contract detail page
    navigate(`/contracts/${id}`);
  };

  const handleSubmit = async (data: any) => {
    if (!id) {
      showError("Contract ID is required");
      return;
    }

    try {
      // Commit pending documents first
      if (pendingDocumentIds.length > 0) {
        console.log(
          `📋 Committing ${pendingDocumentIds.length} pending documents for contract:`,
          pendingDocumentIds
        );
        await commitPendingDocuments();
      }

      // Debug: Log the form data to see what we're receiving
      console.log("📝 Form data received in handleSubmit:", data);
      console.log("🚗 vehicleIds from submitData:", data.vehicleIds);
      console.log("🚗 selectedVehicles (legacy):", data.selectedVehicles);
      console.log("📊 Initial data selectedVehicles:", initialData?.selectedVehicles);

      // Build update DTO with only editable contract fields
      const updateData: UpdateContractDto = {
        id,
        contractNumber: data.contractNumber,
      };

      // Get current vehicle IDs from form data
      // ContractForm sends vehicleIds in submitData (vehicles that should remain assigned)
      // Fallback to selectedVehicles for backward compatibility, then to initialData
      const currentVehicleIds =
        data.vehicleIds !== undefined
          ? Array.isArray(data.vehicleIds)
            ? data.vehicleIds
            : []
          : data.selectedVehicles !== undefined
          ? Array.isArray(data.selectedVehicles)
            ? data.selectedVehicles
            : []
          : initialData?.selectedVehicles || [];

      // Always include vehicleIds array - empty array means remove all vehicles
      // Backend handles both adding and removing in a single update operation
      updateData.vehicleIds = currentVehicleIds;
      console.log("✅ Including vehicleIds in update (vehicles to remain assigned):", updateData.vehicleIds);
      console.log("📊 Initial vehicles:", initialData?.selectedVehicles || []);
      console.log("📊 Current vehicles (will remain):", currentVehicleIds);
      console.log("🔍 Comparison - Initial vs Current:", {
        initial: initialData?.selectedVehicles || [],
        current: currentVehicleIds,
        changed: JSON.stringify(initialData?.selectedVehicles || []) !== JSON.stringify(currentVehicleIds)
      });

      // Include loan details if contract is a loan
      if (data.type === ContractType.LOAN && data.loanDetails) {
        const contractWithLoan = contract as any;
        const loanDetailsId = contractWithLoan?.loanDetails?.id;

        if (loanDetailsId) {
          updateData.loanDetails = {
            id: loanDetailsId,
            interestRate: data.loanDetails.interestRate || 0,
          };
        } else {
          console.warn(
            "⚠️ Loan details ID not found. Cannot update loan details."
          );
        }
      }

      // Include leasing details if contract is a leasing
      if (data.type === ContractType.LEASING && data.leasingDetails) {
        const contractWithLeasing = contract as any;
        const leasingDetailsId = contractWithLeasing?.leasingDetails?.id;

        if (leasingDetailsId) {
          updateData.leasingDetails = {
            id: leasingDetailsId,
            interestRate: data.leasingDetails.interestRate || 0,
          };
        } else {
          console.warn(
            "⚠️ Leasing details ID not found. Cannot update leasing details."
          );
        }
      }

      console.log(
        "📤 Final update data being sent:",
        JSON.stringify(updateData, null, 2)
      );

      await updateContract({ id, data: updateData }).unwrap();
      showSuccess("Contract updated successfully!");
      navigate(`/contracts/${id}`);
    } catch (error: any) {
      console.error("Failed to update contract:", error);
      showError(
        error?.data?.message ||
          error?.message ||
          "Failed to update contract. Please try again."
      );
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loadingData || isLoadingContracts || isLoadingCustomer) {
    return <EditPageLoadingState message="Loading contract data..." />;
  }

  if (contractNotFound) {
    return (
      <EditPageErrorState error="Contract not found. Please check the contract ID." />
    );
  }

  if (error && !initialData) {
    return <EditPageErrorState error={error} />;
  }

  if (!initialData) {
    return (
      <EditPageErrorState error="No contract data available. Please try again." />
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Contract
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Update contract information and details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <ContractForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={isUpdating}
          isEdit={true}
          contractId={id}
          onPendingDocumentIdsChange={setPendingDocumentIds}
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
};
