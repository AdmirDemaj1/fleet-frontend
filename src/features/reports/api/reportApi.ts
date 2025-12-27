import { getApiUrl } from '../../../shared/utils/env';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import {
  ReportEntityType,
  FilterFieldsResponse,
  GenerateDynamicReportDto,
  GetStoredReportsQueryDto,
  StoredReportsListDto,
  StoredReportDto,
} from '../types/report.types';

class ReportApi {
  private readonly BASE_URL = '/reports/dynamic';

  private buildUrl(path: string): string {
    const apiUrl = getApiUrl().replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${apiUrl}${cleanPath}`;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Get available relations for an entity type
   */
  async getAvailableRelations(entityType: ReportEntityType): Promise<string[]> {
    const url = this.buildUrl(`${this.BASE_URL}/entities/relations?entityType=${entityType}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch relations' }));
      throw new Error(error.message || 'Failed to fetch available relations');
    }

    return await response.json();
  }

  /**
   * Get available filter fields for entity and relations
   */
  async getAvailableFilterFields(
    entityType: ReportEntityType,
    relations?: string[]
  ): Promise<FilterFieldsResponse> {
    let path = `${this.BASE_URL}/entities/filter-fields?entityType=${entityType}`;

    if (relations && relations.length > 0) {
      path += `&relations=${relations.join(',')}`;
    }

    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch filter fields' }));
      throw new Error(error.message || 'Failed to fetch available filter fields');
    }

    return await response.json();
  }

  /**
   * Generate and download a dynamic report
   */
  async generateReport(requestBody: GenerateDynamicReportDto): Promise<Blob> {
    const url = this.buildUrl(`${this.BASE_URL}/generate`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate report' }));
      throw new Error(error.message || 'Failed to generate report');
    }

    return await response.blob();
  }

  /**
   * Download a blob as a file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Get list of stored reports
   */
  async getStoredReports(query?: GetStoredReportsQueryDto): Promise<StoredReportsListDto> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.reportType) params.append('reportType', query.reportType);
    if (query?.generatedBy) params.append('generatedBy', query.generatedBy);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);

    const url = this.buildUrl(`/reports/stored?${params.toString()}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch stored reports' }));
      throw new Error(error.message || 'Failed to fetch stored reports');
    }

    return await response.json();
  }

  /**
   * Get stored report metadata
   */
  async getStoredReport(id: string): Promise<StoredReportDto> {
    const url = this.buildUrl(`/reports/stored/${id}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch stored report' }));
      throw new Error(error.message || 'Failed to fetch stored report');
    }

    return await response.json();
  }

  /**
   * Download a stored report
   */
  async downloadStoredReport(id: string): Promise<Blob> {
    const url = this.buildUrl(`/reports/stored/${id}/download`);

    const headers: HeadersInit = {};
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download stored report' }));
      throw new Error(error.message || 'Failed to download stored report');
    }

    return await response.blob();
  }

  /**
   * Delete a stored report
   */
  async deleteStoredReport(id: string): Promise<void> {
    const url = this.buildUrl(`/reports/stored/${id}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete stored report' }));
      throw new Error(error.message || 'Failed to delete stored report');
    }
  }
}

export const reportApi = new ReportApi();

