/**
 * API Service Layer
 * Centralized API communication with error handling
 */

// Em produção, usa URLs relativas (mesmo domínio). Em dev, usa localhost se definido.
const API_BASE_URL = (import.meta as { env?: { VITE_API_URL?: string; MODE?: string } }).env?.VITE_API_URL || 
  ((import.meta as { env?: { MODE?: string } }).env?.MODE === 'production' ? '' : 'http://localhost:8080');

interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || response.statusText || 'Request failed',
          statusCode: response.status,
          details: errorData,
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return {} as T;
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        details: error,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await this.post<{ token: string }>('/auth/login', {
      email,
      password,
    });
    this.saveToken(response.token);
    return response;
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const response = await this.post<{ token: string }>('/auth/register', {
      name,
      email,
      password,
    });
    this.saveToken(response.token);
    return response;
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  async getProfile(): Promise<{ id: string; name: string; email: string; createdAt: string }> {
    return this.get('/auth/profile');
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<{ id: string; name: string; email: string; createdAt: string }> {
    return this.patch('/auth/profile', data);
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.patch('/auth/password', data);
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    const result = await this.delete<{ message: string }>(`/auth/account?password=${encodeURIComponent(password)}`);
    this.clearToken();
    return result;
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
export type { ApiError };
