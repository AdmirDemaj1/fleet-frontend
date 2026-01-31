import { useState, useCallback } from 'react';
import { useCalculatePenaltiesMutation } from '../api/paymentsApi';
import {
  CalculatePenaltyDto,
  PenaltyCalculationResponse,
} from '../types/invoice.types';

interface UsePenaltyCalculatorReturn {
  calculatePenalties: (
    paymentId: string,
    params?: CalculatePenaltyDto
  ) => Promise<PenaltyCalculationResponse | null>;
  result: PenaltyCalculationResponse | null;
  isLoading: boolean;
  error: string | null;
  clearResult: () => void;
}

/**
 * Hook for calculating late payment penalties
 * 
 * @example
 * ```tsx
 * const { calculatePenalties, result, isLoading, error } = usePenaltyCalculator();
 * 
 * // Calculate penalties for 30 days
 * const handleCalculate = async () => {
 *   await calculatePenalties(paymentId, { daysLate: 30 });
 * };
 * 
 * // Calculate to specific date
 * const handleCalculateToDate = async () => {
 *   await calculatePenalties(paymentId, { customEndDate: '2026-02-15' });
 * };
 * 
 * // Calculate to today (no params)
 * const handleCalculateToToday = async () => {
 *   await calculatePenalties(paymentId);
 * };
 * ```
 */
export const usePenaltyCalculator = (): UsePenaltyCalculatorReturn => {
  const [calculatePenaltiesMutation, { isLoading: isMutationLoading }] =
    useCalculatePenaltiesMutation();
  const [result, setResult] = useState<PenaltyCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculatePenalties = useCallback(
    async (
      paymentId: string,
      params?: CalculatePenaltyDto
    ): Promise<PenaltyCalculationResponse | null> => {
      try {
        setError(null);
        const response = await calculatePenaltiesMutation({
          id: paymentId,
          data: params,
        }).unwrap();

        setResult(response);
        return response;
      } catch (err: any) {
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          'Failed to calculate penalties';
        setError(errorMessage);
        console.error('Penalty calculation error:', err);
        return null;
      }
    },
    [calculatePenaltiesMutation]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    calculatePenalties,
    result,
    isLoading: isMutationLoading,
    error,
    clearResult,
  };
};
