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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
}

export const api = new ApiClient(API_BASE_URL);
