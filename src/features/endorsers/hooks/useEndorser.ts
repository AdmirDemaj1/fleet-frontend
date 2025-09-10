import { useState, useEffect } from "react";
import { endorserApi } from "../../customers/api/endorserApi";
import {
  EndorserResponseDto,
  UpdateEndorserDto,
  EndorserContract,
  EndorserContractSummary,
} from "../../customers/types/customer.types";

export const useEndorser = (id: string) => {
  const [endorser, setEndorser] = useState<EndorserResponseDto | null>(null);
  const [contracts, setContracts] = useState<EndorserContract[]>([]);
  const [summary, setSummary] = useState<EndorserContractSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEndorser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await endorserApi.getEndorserWithContracts(id);
      setEndorser(data.endorser);
      setContracts(data.contracts);
      setSummary(data.summary);
    } catch (err: any) {
      console.error("Error fetching endorser:", err);
      setError(err.message || "Failed to fetch endorser details");
    } finally {
      setLoading(false);
    }
  };

  const updateEndorser = async (data: UpdateEndorserDto) => {
    try {
      setError(null);
      const updatedEndorser = await endorserApi.updateEndorser(id, data);
      setEndorser(updatedEndorser);
      return updatedEndorser;
    } catch (err: any) {
      console.error("Error updating endorser:", err);
      
      // Extract detailed error message from API response
      let errorMessage = "Failed to update endorser";
      
      if (err.response?.data?.message) {
        // Use the detailed message from the API
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Create enhanced error object for the component
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).statusCode = err.response?.data?.statusCode;
      (enhancedError as any).error = err.response?.data?.error;
      (enhancedError as any).originalResponse = err.response?.data;
      
      throw enhancedError;
    }
  };

  useEffect(() => {
    if (id) {
      fetchEndorser();
    }
  }, [id]);

  return {
    endorser,
    contracts,
    summary,
    loading,
    error,
    fetchEndorser,
    updateEndorser,
  };
};
