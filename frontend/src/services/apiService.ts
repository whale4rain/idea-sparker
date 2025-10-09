// API Service for backend communication
const API_BASE_URL = 'http://localhost:8080';

export interface BlogDraft {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  resource_ids: string[];
}

export interface CollectedResource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface InterestIdea {
  id: string;
  title: string;
  description: string;
  source_data: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CreateDraftRequest {
  title: string;
  content: string;
}

export interface UpdateDraftRequest {
  title?: string;
  content?: string;
}

export interface CreateResourceRequest {
  title: string;
  url: string;
  description: string;
  category: string;
}

export interface UpdateResourceRequest {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // Blog Drafts
  async getDrafts(): Promise<BlogDraft[]> {
    return this.request('/api/drafts');
  }

  async getDraft(id: string): Promise<BlogDraft> {
    return this.request(`/api/drafts/${id}`);
  }

  async createDraft(data: CreateDraftRequest): Promise<BlogDraft> {
    return this.request('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDraft(id: string, data: UpdateDraftRequest): Promise<BlogDraft> {
    return this.request(`/api/drafts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDraft(id: string): Promise<void> {
    return this.request(`/api/drafts/${id}`, {
      method: 'DELETE',
    });
  }

  async addResourceToDraft(draftId: string, resourceId: string): Promise<BlogDraft> {
    return this.request(`/api/drafts/${draftId}/resources`, {
      method: 'POST',
      body: JSON.stringify({ resource_id: resourceId }),
    });
  }

  async removeResourceFromDraft(draftId: string, resourceId: string): Promise<BlogDraft> {
    return this.request(`/api/drafts/${draftId}/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  // Resources
  async getResources(): Promise<CollectedResource[]> {
    return this.request('/api/resources');
  }

  async getResource(id: string): Promise<CollectedResource> {
    return this.request(`/api/resources/${id}`);
  }

  async createResource(data: CreateResourceRequest): Promise<CollectedResource> {
    return this.request('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResource(id: string, data: UpdateResourceRequest): Promise<CollectedResource> {
    return this.request(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResource(id: string): Promise<void> {
    return this.request(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  }

  // Ideas (placeholder implementations)
  async getIdeas(): Promise<InterestIdea[]> {
    return this.request('/api/ideas');
  }

  async createIdea(data: Partial<InterestIdea>): Promise<InterestIdea> {
    return this.request('/api/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIdea(id: string): Promise<InterestIdea> {
    return this.request(`/api/ideas/${id}`);
  }

  // Chat (placeholder implementations)
  async createChatSession(): Promise<ChatSession> {
    return this.request('/api/chat/sessions', {
      method: 'POST',
    });
  }

  async getChatSession(id: string): Promise<ChatSession> {
    return this.request(`/api/chat/sessions/${id}`);
  }

  async addChatMessage(sessionId: string, message: string): Promise<ChatSession> {
    return this.request(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });
  }

  // AI Analysis (placeholder implementation)
  async analyzeContent(data: { content: string; resources: string[] }): Promise<any> {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
