import { useState, useCallback } from 'react';
import { SimpleReportType } from '../types/report.types';
import { reportApi } from '../api/reportApi';

export const useSimpleReportBuilder = () => {
  const [reportType, setReportType] = useState<SimpleReportType | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [contractId, setContractId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleReportTypeChange = useCallback((newReportType: SimpleReportType) => {
    setReportType(newReportType);
    // Reset selections when report type changes
    setCustomerId('');
    setContractId('');
  }, []);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  const handleCustomerIdChange = useCallback((id: string) => {
    setCustomerId(id);
  }, []);

  const handleContractIdChange = useCallback((id: string) => {
    setContractId(id);
  }, []);

  const generateReport = useCallback(async () => {
    if (!reportType) {
      setError('Please select a report type');
      return;
    }

    // Validate required selections
    if (reportType === SimpleReportType.PAYMENTS_PER_CUSTOMER && !customerId) {
      setError('Please select a customer');
      return;
    }

    if (reportType === SimpleReportType.PAYMENTS_PER_CONTRACT && !contractId) {
      setError('Please select a contract');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const { blob, filename } = await reportApi.generateReport({
        reportType: reportType as SimpleReportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        customerId: customerId || undefined,
        contractId: contractId || undefined,
      });

      // Generate a descriptive filename
      const generateFilename = (): string => {
        const date = new Date().toISOString().split('T')[0];
        const dateRange = startDate && endDate 
          ? `_${startDate}_to_${endDate}`
          : startDate 
          ? `_from_${startDate}`
          : endDate
          ? `_until_${endDate}`
          : '';
        
        // Convert report type to readable format
        const reportName = reportType.replace(/_/g, '-');
        
        return `${reportName}${dateRange}_${date}.xlsx`;
      };

      // Use filename from backend or generate a descriptive one
      const downloadFilename = filename || generateFilename();
      reportApi.downloadFile(blob, downloadFilename);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }, [reportType, startDate, endDate, customerId, contractId]);

  return {
    reportType,
    startDate,
    endDate,
    customerId,
    contractId,
    error,
    generating,
    handleReportTypeChange,
    handleStartDateChange,
    handleEndDateChange,
    handleCustomerIdChange,
    handleContractIdChange,
    generateReport,
  };
};
