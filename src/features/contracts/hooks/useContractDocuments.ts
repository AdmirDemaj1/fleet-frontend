import { useGetContractDocumentsQuery } from '../api/contractDocumentApi';

export const useContractDocuments = (contractId: string) => {
  const {
    data: documents = [],
    isLoading,
    error,
    refetch
  } = useGetContractDocumentsQuery(contractId, {
    skip: !contractId
  });

  return {
    documents,
    isLoading,
    error,
    refetch
  };
};
