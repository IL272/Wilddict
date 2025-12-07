const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Word {
  id: number;
  word: string;
  definition: string;
  example: string;
  language: string;
  source_language: string;
  tags: string[];
  created_at: string;
}

export interface WordCreate {
  word: string;
  definition: string;
  example: string;
  language: string;
  source_language: string;
  tags?: string[];
}

export interface Stats {
  total_words: number;
  languages: string[];
  language_count: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any additional headers from options
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }
    
    try {
      console.log(`API Request: ${options?.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getWords(params?: { language?: string; skip?: number; limit?: number }): Promise<Word[]> {
    const queryParams = new URLSearchParams();
    if (params?.language) queryParams.append('language', params.language);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<Word[]>(`/api/words${query ? `?${query}` : ''}`);
  }

  async getWord(id: number): Promise<Word> {
    return this.request<Word>(`/api/words/${id}`);
  }

  async createWord(word: WordCreate): Promise<Word> {
    return this.request<Word>('/api/words', {
      method: 'POST',
      body: JSON.stringify(word),
    });
  }

  async updateWord(id: number, word: WordCreate): Promise<Word> {
    return this.request<Word>(`/api/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(word),
    });
  }

  async deleteWord(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/words/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<Stats> {
    return this.request<Stats>('/api/stats');
  }

  async seedDemoData(): Promise<{ message: string; added: number }> {
    return this.request<{ message: string; added: number }>('/api/seed-demo-data', {
      method: 'POST',
    });
  }

  // Authentication methods
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const api = new ApiClient(API_BASE_URL);
