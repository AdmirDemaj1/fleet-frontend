import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import { ContractForm } from "../components";
import {
  useCreateContractWithDependenciesMutation,
  useValidateMigrationMutation,
  useMigrateContractMutation,
} from "../api/contractApi";
import {
  useUploadDocumentMutation,
  ContractDocumentType,
} from "../api/contractDocumentApi";
import { CreateContractWithDocumentsDto } from "../types/contract.types";
import { useNotification } from "../../../shared/hooks/useNotification";
import { parseAmortizationExcel } from "../utils/parseAmortizationExcel";
import dayjs from "dayjs";

export const CreateContractPage: React.FC = () => {
  const [createContract, { isLoading: isCreating }] =
    useCreateContractWithDependenciesMutation();
  const [validateMigration, { isLoading: isValidating }] =
    useValidateMigrationMutation();
  const [migrateContract, { isLoading: isMigrating }] =
    useMigrateContractMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const { showSuccess, showError, showInfo } = useNotification();
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

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
      console.log("📋 Full response:", response);
      console.log("📋 response.data:", response?.data);
      console.log("📋 response.data.contract:", response?.data?.contract);
      console.log("🆔 Contract ID for document upload:", contractId);
      console.log("📁 Files count:", files?.length);
      console.log(
        "🔍 Condition check - files:",
        !!files,
        "files.length:",
        files?.length,
        "contractId:",
        !!contractId
      );

      // Step 2: Upload documents if any
      if (files && files.length > 0 && contractId) {
        console.log("✅ Entering document upload block");
        setIsUploadingDocs(true);
        showInfo(`Uploading ${files.length} document(s)...`);

        let uploadedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const metadata = documentMetadata?.[i];

          try {
            console.log(
              `Uploading document ${i + 1}/${files.length}: ${file.name}`
            );

            // Map the document type to ContractDocumentType enum
            const docType =
              (metadata?.type as ContractDocumentType) ||
              ContractDocumentType.OTHER;

            await uploadDocument({
              file,
              data: {
                type: docType,
                title: metadata?.title || file.name,
                description: metadata?.description || "",
                expiryDate:
                  metadata?.expiryDate ||
                  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                contractId,
                customerId: contractData.customerId,
              },
            }).unwrap();
            uploadedCount++;
            console.log(`✅ Document ${i + 1} uploaded successfully`);
          } catch (uploadError) {
            console.error(
              `❌ Failed to upload document ${file.name}:`,
              uploadError
            );
            failedCount++;
          }
        }

        setIsUploadingDocs(false);

        if (failedCount > 0) {
          showError(
            `Contract created but ${failedCount} document(s) failed to upload.`
          );
        } else {
          showSuccess(
            `Contract created successfully with ${uploadedCount} document(s)!`
          );
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
        } else {
          showSuccess("Contract created successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to create contract:", error);
      showError("Failed to create contract. Please try again.");
      setIsUploadingDocs(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Contract
        </Typography>
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
