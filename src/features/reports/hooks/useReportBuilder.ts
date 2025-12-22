import { useState, useEffect, useCallback } from 'react';
import {
  ReportEntityType,
  FilterCondition,
  FilterFieldsResponse,
} from '../types/report.types';
import { reportApi } from '../api/reportApi';

export const useReportBuilder = () => {
  const [entityType, setEntityType] = useState<ReportEntityType | ''>('');
  const [availableRelations, setAvailableRelations] = useState<string[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<FilterFieldsResponse>({});
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch available relations when entity type changes
  useEffect(() => {
    if (!entityType) {
      setAvailableRelations([]);
      setSelectedRelations([]);
      setAvailableFields({});
      return;
    }

    const fetchRelations = async () => {
      setLoading(true);
      setError(null);
      try {
        const relations = await reportApi.getAvailableRelations(entityType as ReportEntityType);
        setAvailableRelations(relations);
        setSelectedRelations([]);
        setFilters([]);
        setSortBy('');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch available relations');
        setAvailableRelations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelations();
  }, [entityType]);

  // Fetch available filter fields when entity type or relations change
  useEffect(() => {
    if (!entityType) {
      setAvailableFields({});
      return;
    }

    const fetchFilterFields = async () => {
      setLoading(true);
      setError(null);
      try {
        const fields = await reportApi.getAvailableFilterFields(
          entityType as ReportEntityType,
          selectedRelations.length > 0 ? selectedRelations : undefined
        );
        setAvailableFields(fields);
        // Clear filters that reference removed relations
        setFilters((prev) =>
          prev.filter((f) => {
            if (!f.relation) return true;
            return selectedRelations.includes(f.relation);
          })
        );
      } catch (err: any) {
        setError(err.message || 'Failed to fetch available filter fields');
        setAvailableFields({});
      } finally {
        setLoading(false);
      }
    };

    fetchFilterFields();
  }, [entityType, selectedRelations]);

  const handleEntityTypeChange = useCallback((newEntityType: ReportEntityType) => {
    setEntityType(newEntityType);
    setSelectedRelations([]);
    setFilters([]);
    setSortBy('');
  }, []);

  const handleRelationsChange = useCallback((relations: string[]) => {
    setSelectedRelations(relations);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterCondition[]) => {
    setFilters(newFilters);
  }, []);

  const handleSortByChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  const handleSortOrderChange = useCallback((newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
  }, []);

  const generateReport = useCallback(async () => {
    if (!entityType) {
      setError('Please select an entity type');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const requestBody = {
        entityType: entityType as ReportEntityType,
        relations: selectedRelations.length > 0 ? selectedRelations : undefined,
        filters: filters.length > 0 ? filters : undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortBy ? sortOrder : undefined,
      };

      const blob = await reportApi.generateReport(requestBody);

      // Extract filename from blob or use default
      const filename = `report-${entityType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      reportApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }, [entityType, selectedRelations, filters, sortBy, sortOrder]);

  return {
    entityType,
    availableRelations,
    selectedRelations,
    availableFields,
    filters,
    sortBy,
    sortOrder,
    loading,
    error,
    generating,
    handleEntityTypeChange,
    handleRelationsChange,
    handleFiltersChange,
    handleSortByChange,
    handleSortOrderChange,
    generateReport,
  };
};

