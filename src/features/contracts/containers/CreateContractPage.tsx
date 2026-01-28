import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import { ContractForm } from "../components";
import {
  useCreateContractWithDependenciesMutation,
  useValidateMigrationMutation,
  useMigrateContractMutation,
  useDeleteContractMutation,
} from "../api/contractApi";
import { ContractDocumentType } from "../api/contractDocumentApi";
import { contractPlainApi } from "../api/contractPlainApi";
import { CreateContractWithDocumentsDto } from "../types/contract.types";
import { useNotification } from "../../../shared/hooks/useNotification";
import { parseAmortizationExcel } from "../utils/parseAmortizationExcel";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { documentApi } from "../../../shared/api/documentApi";

type UploadFailure = {
  key: string;
  fileName: string;
  message: string;
  index: number;
};

type DocumentUploadState = {
  status: "none" | "success" | "partial" | "failed";
  total: number;
  uploaded: number;
  failed: number;
  failures: UploadFailure[];
};

export const CreateContractPage: React.FC = () => {
  const navigate = useNavigate();
  const [createContract, { isLoading: isCreating }] =
    useCreateContractWithDependenciesMutation();
  const [validateMigration, { isLoading: isValidating }] =
    useValidateMigrationMutation();
  const [migrateContract, { isLoading: isMigrating }] =
    useMigrateContractMutation();
  const [deleteContract] = useDeleteContractMutation();
  const { showSuccess, showError, showInfo } = useNotification();
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [createdContractId, setCreatedContractId] = useState<string | null>(
    null
  );
  const [createdContractNumber, setCreatedContractNumber] = useState<string | null>(
    null
  );
  const [contractAgreementDocumentId, setContractAgreementDocumentId] = useState<
    string | null
  >(null);
  const [isAgreementBusy, setIsAgreementBusy] = useState(false);
  const [uploadState, setUploadState] = useState<DocumentUploadState>({
    status: "none",
    total: 0,
    uploaded: 0,
    failed: 0,
    failures: [],
  });
  const [lastUpload, setLastUpload] = useState<{
    contractId: string;
    customerId: string;
    files: File[];
    documentMetadata?: Array<{
      type?: string;
      title?: string;
      description?: string;
      expiryDate?: string;
    }>;
  } | null>(null);

  const failureKey = (file: File, meta: any) =>
    `${meta?.type || "other"}:${meta?.title || file.name}:${file.name}`;

  const uploadContractDocuments = async (params: {
    contractId: string;
    customerId: string;
    files: File[];
    documentMetadata?: Array<{
      type?: string;
      title?: string;
      description?: string;
      expiryDate?: string;
    }>;
    onlyKeys?: Set<string>;
  }): Promise<DocumentUploadState> => {
    const { contractId, customerId, files, documentMetadata, onlyKeys } =
      params;
    if (!files || files.length === 0 || !contractId) {
      return { status: "none", total: 0, uploaded: 0, failed: 0, failures: [] };
    }

    let uploaded = 0;
    let failed = 0;
    const failures: UploadFailure[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = documentMetadata?.[i];
      const key = failureKey(file, metadata);
      if (onlyKeys && !onlyKeys.has(key)) continue;

      try {
        const docType =
          (metadata?.type as ContractDocumentType) ||
          ContractDocumentType.OTHER;

        const expiryDate =
          metadata?.expiryDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        await contractPlainApi.uploadContractDocument(
          contractId,
          file,
          docType,
          expiryDate,
          metadata?.title || file.name,
          customerId
        );
        uploaded++;
      } catch (e: any) {
        failed++;
        failures.push({
          key,
          index: i,
          fileName: file.name,
          message: e?.data?.message || e?.message || "Upload failed",
        });
      }
    }

    const total = onlyKeys ? uploaded + failed : files.length;
    const status: DocumentUploadState["status"] =
      total === 0
        ? "none"
        : failed === 0
        ? "success"
        : uploaded === 0
        ? "failed"
        : "partial";

    return { status, total, uploaded, failed, failures };
  };

  const retryFailedUploads = async () => {
    if (!lastUpload) {
      showError("Nothing to retry.");
      return;
    }
    if (uploadState.failures.length === 0) {
      showSuccess("All documents are already uploaded.");
      return;
    }

    const onlyKeys = new Set(uploadState.failures.map((f) => f.key));
    setIsUploadingDocs(true);
    try {
      const retryState = await uploadContractDocuments({
        ...lastUpload,
        onlyKeys,
      });

      // remaining failures = those retried that still failed
      const stillFailing = new Map<string, UploadFailure>();
      for (const f of retryState.failures) stillFailing.set(f.key, f);

      const remainingFailures = uploadState.failures
        .filter((f) => onlyKeys.has(f.key))
        .map((f) => stillFailing.get(f.key) || null)
        .filter(Boolean) as UploadFailure[];

      const total = uploadState.total;
      const uploaded = Math.min(
        total,
        uploadState.uploaded + retryState.uploaded
      );
      const failed = Math.max(0, total - uploaded);
      const status: DocumentUploadState["status"] =
        total === 0
          ? "none"
          : remainingFailures.length === 0 && failed === 0
          ? "success"
          : uploaded === 0
          ? "failed"
          : "partial";

      const nextState: DocumentUploadState = {
        status,
        total,
        uploaded,
        failed,
        failures: remainingFailures,
      };
      setUploadState(nextState);

      if (nextState.status === "success") {
        showSuccess("All documents uploaded successfully.");
      } else {
        showError(
          `${nextState.failed} document(s) are still failing. You can retry again or upload later from the contract page.`
        );
      }
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const rollbackContract = async () => {
    if (!createdContractId) {
      showError("No contract to rollback.");
      return;
    }
    setIsRollingBack(true);
    try {
      const res: any = await deleteContract(createdContractId).unwrap();
      if (res?.requiresApproval) {
        showError(
          res?.message ||
            "Rollback requested, but deletion requires approval. Check approvals."
        );
        return;
      }
      showSuccess(
        res?.message || "Contract rolled back (deleted) successfully."
      );
      setCreatedContractId(null);
      setCreatedContractNumber(null);
      setContractAgreementDocumentId(null);
      setLastUpload(null);
      setUploadState({
        status: "none",
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      });
    } catch (e: any) {
      showError(
        e?.data?.message || e?.message || "Failed to rollback contract."
      );
    } finally {
      setIsRollingBack(false);
    }
  };

  const previewAgreement = async () => {
    if (!contractAgreementDocumentId) return;
    setIsAgreementBusy(true);
    try {
      const blob = await documentApi.previewDocument(contractAgreementDocumentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // Revoke after a short delay to allow the new tab to load
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      showError(e?.data?.message || e?.message || "Failed to preview contract agreement.");
    } finally {
      setIsAgreementBusy(false);
    }
  };

  const downloadAgreement = async () => {
    if (!contractAgreementDocumentId) return;
    setIsAgreementBusy(true);
    try {
      const blob = await documentApi.downloadDocument(contractAgreementDocumentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = createdContractNumber || createdContractId || "contract";
      a.download = `Contract_Agreement_${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      showError(e?.data?.message || e?.message || "Failed to download contract agreement.");
    } finally {
      setIsAgreementBusy(false);
    }
  };

  const handleValidate = async (data: CreateContractWithDocumentsDto) => {
    try {
      console.log("🔍 Validating migration data:", data);

      // Extract files, document metadata, and amortization file before sending
      const {
        files,
        documents: documentMetadata,
        amortizationPlanFile,
        ...contractData
      } = data;

      // Check if contract start date is in the past
      const startDate = dayjs(contractData.startDate);
      const isPastDate = startDate.isBefore(dayjs(), "day");

      if (!isPastDate || !amortizationPlanFile) {
        showInfo(
          "Validation is only available for contracts with past start dates and amortization plan files."
        );
        return;
      }

      let amortizations:
        | Array<{
            headerData: {
              currency?: string;
              creditAmount?: number;
              interestRate?: number;
              maturityYears?: number;
              maturityMonths?: number;
              monthlyMortgagePayments?: number;
              disbursementCommission?: number;
              commissionAmount?: number;
              interest?: number;
              principal?: number;
              loanDate?: string;
              loanAmount?: number;
            };
            scheduleOfPayments: Array<{
              paymentNumber: number;
              month: string;
              beginningBalance: number;
              monthlyInterestAmount: number;
              principalRepayment: number;
              monthlyMortgagePayment: number;
              endingBalance: number;
              paidAmount?: number | null;
              paymentDate?: string | null;
            }>;
          }>
        | undefined;

      // Parse Excel file if provided
      if (amortizationPlanFile) {
        try {
          console.log(
            "📊 Parsing amortization plan Excel file for validation:",
            amortizationPlanFile.name
          );
          showInfo("Parsing amortization plan file...");

          amortizations = await parseAmortizationExcel(amortizationPlanFile);
          console.log("✅ Excel file parsed successfully for validation");
        } catch (parseError) {
          console.error("❌ Failed to parse amortization plan:", parseError);
          const errorMessage =
            parseError instanceof Error
              ? parseError.message
              : "Failed to parse amortization plan file. Please check the file format.";
          showError(errorMessage);
          return;
        }
      }

      // Prepare migration data
      const migrationData = {
        ...contractData,
        ...(amortizations && { amortizations }),
      };

      // Validate migration data
      showInfo("Validating migration data...");
      const validationResult = await validateMigration(migrationData).unwrap();
      console.log("✅ Migration validation result:", validationResult);

      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.join("\n");
        showError(`Validation failed:\n${errorMessages}`);
        return;
      }

      // Show warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        const warningMessages = validationResult.warnings.join("\n");
        showInfo(`Validation warnings:\n${warningMessages}`);
      }

      // Show summary if available
      if (validationResult.summary) {
        const summary = validationResult.summary;
        const summaryMessage =
          `Validation Summary:\n` +
          `Contract: ${summary.contractNumber}\n` +
          `Amortization Versions: ${summary.amortizationVersions}\n` +
          `Total Payments: ${summary.totalPayments}\n` +
          `Paid Payments: ${summary.paidPayments}`;
        showSuccess(`✅ Validation passed!\n\n${summaryMessage}`);
      } else {
        showSuccess(
          "✅ Validation passed! You can proceed with contract creation."
        );
      }
    } catch (validationError: any) {
      console.error("❌ Migration validation failed:", validationError);
      const errorMessage =
        validationError?.data?.message ||
        validationError?.data?.errors?.join("\n") ||
        validationError?.message ||
        "Validation failed. Please check the data and try again.";
      showError(errorMessage);
    }
  };

  const handleSubmit = async (data: CreateContractWithDocumentsDto) => {
    try {
      console.log("📋 CreateContractPage received data:", data);
      console.log("📁 Files in data:", data.files);
      console.log("📄 Documents in data:", data.documents);
      setCreatedContractId(null);
      setCreatedContractNumber(null);
      setContractAgreementDocumentId(null);
      setLastUpload(null);
      setUploadState({
        status: "none",
        total: 0,
        uploaded: 0,
        failed: 0,
        failures: [],
      });

      // Extract files, document metadata, and amortization file before sending
      const {
        files,
        documents: documentMetadata,
        amortizationPlanFile,
        ...contractData
      } = data;

      console.log("📁 Extracted files:", files);
      console.log("📄 Extracted documentMetadata:", documentMetadata);
      console.log("📊 Amortization plan file:", amortizationPlanFile?.name);

      let amortizations:
        | Array<{
            headerData: {
              currency?: string;
              creditAmount?: number;
              interestRate?: number;
              maturityYears?: number;
              maturityMonths?: number;
              monthlyMortgagePayments?: number;
              disbursementCommission?: number;
              commissionAmount?: number;
              interest?: number;
              principal?: number;
              loanDate?: string;
              loanAmount?: number;
            };
            scheduleOfPayments: Array<{
              paymentNumber: number;
              month: string;
              beginningBalance: number;
              monthlyInterestAmount: number;
              principalRepayment: number;
              monthlyMortgagePayment: number;
              endingBalance: number;
              paidAmount?: number | null;
              paymentDate?: string | null;
            }>;
          }>
        | undefined;

      // Check if contract start date is in the past
      const startDate = dayjs(contractData.startDate);
      const isPastDate = startDate.isBefore(dayjs(), "day");
      const shouldMigrate = isPastDate && amortizationPlanFile;

      // Step 0: Parse Excel file if provided
      if (amortizationPlanFile) {
        try {
          console.log(
            "📊 Parsing amortization plan Excel file:",
            amortizationPlanFile.name
          );
          showInfo("Parsing amortization plan file...");

          // Parse Excel file in frontend - returns array of amortizations
          amortizations = await parseAmortizationExcel(amortizationPlanFile);
          console.log("✅ Excel file parsed successfully:", {
            amortizations: amortizations.length,
            totalEntries: amortizations.reduce(
              (sum, am) => sum + am.scheduleOfPayments.length,
              0
            ),
            fileName: amortizationPlanFile.name,
          });

          // Log each amortization
          amortizations.forEach((am, index) => {
            console.log(`  Amortization ${index + 1}:`, {
              headerData: am.headerData,
              scheduleEntries: am.scheduleOfPayments.length,
            });
          });
        } catch (parseError) {
          console.error("❌ Failed to parse amortization plan:", parseError);
          const errorMessage =
            parseError instanceof Error
              ? parseError.message
              : "Failed to parse amortization plan file. Please check the file format.";
          showError(errorMessage);
          return;
        }
      }

      let response: any;

      // Step 1: Use migration endpoints if start date is in the past and amortization file is provided
      if (shouldMigrate) {
        console.log(
          "🔄 Using migration flow for past contract date with amortization file"
        );
        showInfo("Validating migration data...");

        // Prepare migration data
        const migrationData = {
          ...contractData,
          ...(amortizations && { amortizations }),
        };

        // Step 1a: Validate migration data
        try {
          const validationResult = await validateMigration(
            migrationData
          ).unwrap();
          console.log("✅ Migration validation result:", validationResult);

          if (!validationResult.valid) {
            const errorMessages = validationResult.errors.join("\n");
            showError(`Migration validation failed:\n${errorMessages}`);
            return;
          }

          // Show warnings if any
          if (
            validationResult.warnings &&
            validationResult.warnings.length > 0
          ) {
            validationResult.warnings.forEach((warning: string) => {
              showInfo(`Warning: ${warning}`);
            });
          }

          // Show summary if available
          if (validationResult.summary) {
            console.log("📊 Migration summary:", validationResult.summary);
          }
        } catch (validationError: any) {
          console.error("❌ Migration validation failed:", validationError);
          const errorMessage =
            validationError?.data?.message ||
            validationError?.data?.errors?.join("\n") ||
            validationError?.message ||
            "Migration validation failed. Please check the data and try again.";
          showError(errorMessage);
          return;
        }

        // Step 1b: Perform migration
        try {
          showInfo("Migrating contract with historical amortization data...");
          response = await migrateContract(migrationData).unwrap();
          console.log("✅ Contract migration response:", response);

          if (!response.success) {
            const errorMessages =
              response.errors?.join("\n") || response.message;
            showError(`Migration failed:\n${errorMessages}`);
            return;
          }

          // Show warnings if any
          if (response.warnings && response.warnings.length > 0) {
            response.warnings.forEach((warning: string) => {
              showInfo(`Warning: ${warning}`);
            });
          }
        } catch (migrationError: any) {
          console.error("❌ Contract migration failed:", migrationError);
          const errorMessage =
            migrationError?.data?.message ||
            migrationError?.data?.errors?.join("\n") ||
            migrationError?.message ||
            "Failed to migrate contract. Please try again.";
          showError(errorMessage);
          return;
        }
      } else {
        // Step 1: Create the contract normally (with amortizations if provided)
        const contractDataWithAmortization = {
          ...contractData,
          ...(amortizations && { amortizations }),
        };

        response = await createContract(contractDataWithAmortization).unwrap();
        console.log("Contract creation response:", response);
      }

      // Check for warnings (e.g., amortization plan generation failures)
      // Only show warnings for regular contract creation (migration warnings are already shown)
      if (
        !shouldMigrate &&
        response.warnings &&
        Array.isArray(response.warnings) &&
        response.warnings.length > 0
      ) {
        const warningMessages = response.warnings.join("\n");
        console.warn("Contract creation warnings:", warningMessages);

        // Show warnings but don't fail the operation
        response.warnings.forEach((warning: string) => {
          if (warning.includes("amortization plan")) {
            showInfo(`Contract created successfully. Note: ${warning}`);
          } else {
            showInfo(`Warning: ${warning}`);
          }
        });
      }

      // Get the contract ID from the response
      // Regular response structure: { requiresApproval: false, data: { contract: { id: "..." }, ... }, message: "...", error: false }
      // Migration response structure: { success: true, contract: { id: "..." }, ... }
      const contractId = shouldMigrate
        ? response?.contract?.id ||
          response?.data?.contract?.id ||
          response?.data?.id
        : response?.data?.contract?.id ||
          response?.data?.id ||
          response?.contract?.id ||
          response?.id;

      const contractNumber =
        response?.data?.contract?.contractNumber ||
        response?.contract?.contractNumber ||
        null;
      const agreementId =
        response?.data?.contractAgreementDocumentId ||
        response?.contractAgreementDocumentId ||
        null;

      console.log("📋 Full response:", response);
      console.log("📋 response.data:", response?.data);
      console.log("📋 response.data.contract:", response?.data?.contract);
      console.log("🆔 Contract ID for document upload:", contractId);
      console.log("🔢 Contract Number:", contractNumber);
      console.log("📄 Agreement Document ID:", agreementId);
      console.log("📁 Files count:", files?.length);
      console.log(
        "🔍 Condition check - files:",
        !!files,
        "files.length:",
        files?.length,
        "contractId:",
        !!contractId
      );

      if (contractId) {
        setCreatedContractId(contractId);
        setCreatedContractNumber(contractNumber);
        setContractAgreementDocumentId(agreementId);
      }

      // Step 2: Upload documents if any
      if (files && files.length > 0 && contractId) {
        setLastUpload({
          contractId,
          customerId: contractData.customerId,
          files,
          documentMetadata,
        });
        setIsUploadingDocs(true);
        showInfo(`Uploading ${files.length} document(s)...`);
        const state = await uploadContractDocuments({
          contractId,
          customerId: contractData.customerId,
          files,
          documentMetadata,
        });
        setUploadState(state);
        setIsUploadingDocs(false);

        if (state.status === "partial" || state.status === "failed") {
          showError(
            `Contract created, but ${state.failed} document(s) failed to upload. You can retry uploads or rollback.`
          );
          // Don't navigate - let user retry or rollback
        } else if (state.status === "success") {
          showSuccess(
            `Contract created successfully with ${state.uploaded} document(s)!`
          );
          // Navigate to contract details page after successful upload
          setTimeout(() => {
            navigate(`/contracts/${contractId}`);
          }, 1500);
        } else {
          showSuccess("Contract created successfully!");
          // Navigate to contract details page
          setTimeout(() => {
            navigate(`/contracts/${contractId}`);
          }, 1500);
        }
      } else {
        // No documents to upload
        if (shouldMigrate) {
          showSuccess(
            response.message ||
              "Contract migrated successfully with historical amortization data!"
          );
        } else if (response.requiresApproval) {
          showSuccess("Action requires approval. Request has been submitted.");
          // Don't navigate for approval-required cases
          return;
        } else {
          showSuccess("Contract created successfully!");
        }
        
        // Navigate to contract details page after success message
        if (contractId) {
          setTimeout(() => {
            navigate(`/contracts/${contractId}`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Failed to create contract:", error);
      showError("Failed to create contract. Please try again.");
      setIsUploadingDocs(false);
    }
  };

  console.log('uploadState.status === "success"', uploadState.status);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Contract
        </Typography>

        {createdContractId && (
          <Box sx={{ mb: 2 }}>
            {/* Show agreement status only if there was an attempt to generate one */}
            {(uploadState.status !== "none" || contractAgreementDocumentId !== null) && (
              <>
                {contractAgreementDocumentId ? (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    Contract agreement generated successfully.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Contract agreement was not generated.
                  </Alert>
                )}
              </>
            )}

            {/* Show upload status only if documents were uploaded */}
            {uploadState.status !== "none" && (
              <>
                {uploadState.status === "success" ? (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    Documents uploaded: {uploadState.uploaded}/{uploadState.total}
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    Contract created, but documents uploaded: {uploadState.uploaded}
                    /{uploadState.total}. Failed: {uploadState.failed}.
                  </Alert>
                )}
              </>
            )}

            {/* Always show success alert if no uploads and no agreement */}
            {uploadState.status === "none" && !contractAgreementDocumentId && (
              <Alert severity="success" sx={{ mb: 1 }}>
                Contract created successfully!
              </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/contracts/${createdContractId}`)}
                disabled={isUploadingDocs || isRollingBack}
              >
                Go to Contract
              </Button>
              {contractAgreementDocumentId && (
                <>
                  <Button
                    variant="outlined"
                    onClick={previewAgreement}
                    disabled={isUploadingDocs || isRollingBack || isAgreementBusy}
                  >
                    Preview Agreement
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={downloadAgreement}
                    disabled={isUploadingDocs || isRollingBack || isAgreementBusy}
                  >
                    Download Agreement
                  </Button>
                </>
              )}
              {(uploadState.status === "partial" ||
                uploadState.status === "failed") && (
                <>
                  <Button
                    variant="outlined"
                    onClick={retryFailedUploads}
                    disabled={isUploadingDocs || isRollingBack}
                  >
                    Retry Failed Uploads
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={rollbackContract}
                    disabled={isUploadingDocs || isRollingBack}
                  >
                    Rollback (Delete Contract)
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        )}

        <ContractForm
          onSubmit={handleSubmit}
          onValidate={handleValidate}
          loading={isCreating || isMigrating || isUploadingDocs}
          isValidating={isValidating}
        />
      </Box>
    </Container>
  );
};
