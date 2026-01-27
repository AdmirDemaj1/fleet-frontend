import { getApiUrl } from '../../../shared/utils/env';
import { tokenStorage } from '../../auth/utils/tokenStorage';
import {
  GetStoredReportsQueryDto,
  StoredReportsListDto,
  StoredReportDto,
  SimplifiedReportRequest,
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
   * Extract filename from Content-Disposition header
   */
  private extractFilename(response: Response): string | null {
    const contentDisposition = response.headers.get('Content-Disposition');
    
    if (!contentDisposition) {
      return null;
    }

    // Try to match filename*=UTF-8''filename (RFC 5987)
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
    if (utf8Match) {
      return decodeURIComponent(utf8Match[1]);
    }

    // Try filename="something"
    const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
    if (quotedMatch) {
      return quotedMatch[1];
    }

    // Try filename=something (without quotes)
    const unquotedMatch = contentDisposition.match(/filename=([^;]+)/i);
    if (unquotedMatch) {
      return unquotedMatch[1].trim();
    }

    return null;
  }

  /**
   * Generate and download a report
   * Sends the simple request format directly to the backend
   * Returns both the blob and filename from Content-Disposition header
   */
  async generateReport(requestBody: SimplifiedReportRequest): Promise<{ blob: Blob; filename: string | null }> {
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

    const blob = await response.blob();
    const filename = this.extractFilename(response);
    console.log('filename from headerrrrr', filename);

    return { blob, filename };
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

