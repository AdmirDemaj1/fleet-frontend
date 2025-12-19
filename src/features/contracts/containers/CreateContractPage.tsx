import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ContractForm } from '../components';
import { useCreateContractWithDependenciesMutation } from '../api/contractApi';
import { useUploadDocumentMutation, ContractDocumentType } from '../api/contractDocumentApi';
import { CreateContractWithDocumentsDto } from '../types/contract.types';
import { useNotification } from '../../../shared/hooks/useNotification';

export const CreateContractPage: React.FC = () => {
  const [createContract, { isLoading: isCreating }] = useCreateContractWithDependenciesMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const { showSuccess, showError, showInfo } = useNotification();
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const handleSubmit = async (data: CreateContractWithDocumentsDto) => {
    try {
      console.log('📋 CreateContractPage received data:', data);
      console.log('📁 Files in data:', data.files);
      console.log('📄 Documents in data:', data.documents);
      
      // Extract files and document metadata before sending
      const { files, documents: documentMetadata, ...contractData } = data;
      
      console.log('📁 Extracted files:', files);
      console.log('📄 Extracted documentMetadata:', documentMetadata);
      
      // Step 1: Create the contract (without files)
      const response = await createContract(contractData).unwrap();
      console.log('Contract creation response:', response);

      // Get the contract ID from the response
      // Response structure: { requiresApproval: false, data: { contract: { id: "..." }, ... }, message: "...", error: false }
      const contractId = response?.data?.contract?.id || response?.data?.id || response?.contract?.id || response?.id;
      console.log('📋 Full response:', response);
      console.log('📋 response.data:', response?.data);
      console.log('📋 response.data.contract:', response?.data?.contract);
      console.log('🆔 Contract ID for document upload:', contractId);
      console.log('📁 Files count:', files?.length);
      console.log('🔍 Condition check - files:', !!files, 'files.length:', files?.length, 'contractId:', !!contractId);
      
      // Step 2: Upload documents if any
      if (files && files.length > 0 && contractId) {
        console.log('✅ Entering document upload block');
        setIsUploadingDocs(true);
        showInfo(`Uploading ${files.length} document(s)...`);
        
        let uploadedCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const metadata = documentMetadata?.[i];
          
          try {
            console.log(`Uploading document ${i + 1}/${files.length}: ${file.name}`);
            
            // Map the document type to ContractDocumentType enum
            const docType = (metadata?.type as ContractDocumentType) || ContractDocumentType.OTHER;
            
            await uploadDocument({
              file,
              data: {
                type: docType,
                title: metadata?.title || file.name,
                description: metadata?.description || '',
                expiryDate: metadata?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                contractId,
                customerId: contractData.customerId,
              },
            }).unwrap();
            uploadedCount++;
            console.log(`✅ Document ${i + 1} uploaded successfully`);
          } catch (uploadError) {
            console.error(`❌ Failed to upload document ${file.name}:`, uploadError);
            failedCount++;
          }
        }
        
        setIsUploadingDocs(false);
        
        if (failedCount > 0) {
          showError(`Contract created but ${failedCount} document(s) failed to upload.`);
        } else {
          showSuccess(`Contract created successfully with ${uploadedCount} document(s)!`);
        }
      } else {
        // No documents to upload
        if (response.requiresApproval) {
          showSuccess("Action requires approval. Request has been submitted.");
        } else {
          showSuccess("Contract created successfully!");
        }
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
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
          loading={isCreating || isUploadingDocs}
        />
      </Box>
    </Container>
  );
};
