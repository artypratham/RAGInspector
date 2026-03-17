import { getApiUrl } from '../utils/env';
import type { User, Extraction, ExtractionListItem, Pagination, BackendAnnotation } from '../types/api';

const API_URL = getApiUrl();

interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private sanitizeId(id: string): string {
    return encodeURIComponent(id);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { error: 'Session expired. Please log in again.' };
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (response.ok) {
          return { data: {} as T };
        }
        return { error: `Request failed (${response.status})` };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          return { error: `Server error (${response.status}). Please try again.` };
        }
        return { error: 'Unexpected response format from server.' };
      }

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `Request failed (${response.status})`, errors: data.errors };
      }

      return { data };
    } catch (error) {
      if (error instanceof TypeError) {
        return { error: 'Network error. Please check your connection.' };
      }
      return { error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name?: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Extraction endpoints
  async createExtraction(data: {
    title?: string;
    schemaInput: string;
    outputJson: string;
  }) {
    return this.request<{ extraction: Extraction }>('/extractions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExtractions(limit = 20, offset = 0) {
    return this.request<{ extractions: ExtractionListItem[]; pagination: Pagination }>(
      `/extractions?limit=${limit}&offset=${offset}`
    );
  }

  async getExtraction(id: string) {
    return this.request<{ extraction: Extraction }>(`/extractions/${this.sanitizeId(id)}`);
  }

  async updateExtraction(id: string, data: {
    title?: string;
    schemaInput?: string;
    outputJson?: string;
  }) {
    return this.request<{ extraction: Extraction }>(`/extractions/${this.sanitizeId(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExtraction(id: string) {
    return this.request<{ message: string }>(`/extractions/${this.sanitizeId(id)}`, {
      method: 'DELETE',
    });
  }

  async submitExtraction(data: {
    title?: string;
    schemaInput: string;
    outputJson: string;
    annotations: Array<{
      fieldName: string;
      recordId: string;
      status: string;
      extractedValue?: string;
      expectedValue?: string;
      category?: string;
      confidence?: number;
    }>;
  }) {
    return this.request<{ extraction: Extraction }>('/extractions/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Annotation endpoints
  async createAnnotation(data: {
    extractionId: string;
    fieldName: string;
    recordId: string;
    originalValue?: string;
    correctedValue?: string;
    comment?: string;
    flagType?: string;
  }) {
    return this.request<{ annotation: BackendAnnotation }>('/annotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnnotations(extractionId: string) {
    return this.request<{ annotations: BackendAnnotation[] }>(`/annotations?extractionId=${this.sanitizeId(extractionId)}`);
  }

  async updateAnnotation(id: string, data: {
    originalValue?: string;
    correctedValue?: string;
    comment?: string;
    flagType?: string;
  }) {
    return this.request<{ annotation: BackendAnnotation }>(`/annotations/${this.sanitizeId(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnotation(id: string) {
    return this.request<{ message: string }>(`/annotations/${this.sanitizeId(id)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
