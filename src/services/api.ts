const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', errors: data.errors };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name?: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/signup', {
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
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
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
    return this.request<{ user: any }>('/auth/me');
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
    return this.request<{ extraction: any }>('/extractions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExtractions(limit = 20, offset = 0) {
    return this.request<{ extractions: any[]; pagination: any }>(
      `/extractions?limit=${limit}&offset=${offset}`
    );
  }

  async getExtraction(id: string) {
    return this.request<{ extraction: any }>(`/extractions/${id}`);
  }

  async updateExtraction(id: string, data: {
    title?: string;
    schemaInput?: string;
    outputJson?: string;
  }) {
    return this.request<{ extraction: any }>(`/extractions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExtraction(id: string) {
    return this.request<{ message: string }>(`/extractions/${id}`, {
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
    return this.request<{ extraction: any }>('/extractions/submit', {
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
    return this.request<{ annotation: any }>('/annotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnnotations(extractionId: string) {
    return this.request<{ annotations: any[] }>(`/annotations?extractionId=${extractionId}`);
  }

  async updateAnnotation(id: string, data: {
    originalValue?: string;
    correctedValue?: string;
    comment?: string;
    flagType?: string;
  }) {
    return this.request<{ annotation: any }>(`/annotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnotation(id: string) {
    return this.request<{ message: string }>(`/annotations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
