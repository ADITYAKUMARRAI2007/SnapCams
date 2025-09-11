// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';
export const SOCKET_BASE_URL = SOCKET_URL;

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  isOnline: boolean;
  lastSeen: string;
  joinDate: string;
  streak: number;
  followers: number;
  following: number;
  isPrivate: boolean;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
  };
  image: string;
  caption: string;
  hashtags: string[];
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Story {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  image: string;
  caption?: string;
  music?: {
    title: string;
    artist: string;
    url: string;
  };
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  views: number;
  isViewed: boolean;
  createdAt: string;
  expiresAt: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  // Token Management
  private loadTokens(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.request<T>(endpoint, options);
          }
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearTokens();
    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        this.saveTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me');
  }

  // User Methods
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserByUsername(username: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/users/${username}`);
  }

  async followUser(userId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
    return this.request<{ isFollowing: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async searchUsers(query: string, page = 1, limit = 20): Promise<ApiResponse<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }>> {
    return this.request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // Post Methods
  async getFeed(page = 1, limit = 20): Promise<ApiResponse<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }>> {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async generateCaption(imageFile: File, context?: {
    location?: string;
    mood?: string;
    timeOfDay?: string;
  }): Promise<ApiResponse<{ caption: string; hashtags: string[]; generated: boolean }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (context?.location) formData.append('location', context.location);
    if (context?.mood) formData.append('mood', context.mood);
    if (context?.timeOfDay) formData.append('timeOfDay', context.timeOfDay);

    const url = `${this.baseURL}/posts/generate-caption`;
    const headers: any = {};
    
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await response.json();
  }

  async createPost(postData: {
    caption: string;
    hashtags: string[];
    location?: {
      name: string;
      coordinates: { lat: number; lng: number };
    };
  }, imageFile: File): Promise<ApiResponse<{ post: Post }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', postData.caption);
    formData.append('hashtags', JSON.stringify(postData.hashtags));
    if (postData.location) {
      formData.append('location', JSON.stringify(postData.location));
    }

    const url = `${this.baseURL}/posts`;
    const headers: any = {};
    
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await response.json();
  }

  async likePost(postId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    return this.request<{ isLiked: boolean; likesCount: number }>(`/posts/${postId}/like`, {
      method: 'POST'
    });
  }

  async savePost(postId: string): Promise<ApiResponse<{ isSaved: boolean }>> {
    return this.request<{ isSaved: boolean }>(`/posts/${postId}/save`, {
      method: 'POST'
    });
  }

  async sharePost(postId: string): Promise<ApiResponse<{ sharesCount: number }>> {
    return this.request<{ sharesCount: number }>(`/posts/${postId}/share`, {
      method: 'POST'
    });
  }

  // Story Methods
  async getStories(): Promise<ApiResponse<{ stories: Story[] }>> {
    return this.request<{ stories: Story[] }>('/stories');
  }

  async createStory(storyData: {
    caption?: string;
    music?: {
      title: string;
      artist: string;
      url: string;
    };
    location?: {
      name: string;
      coordinates: { lat: number; lng: number };
    };
  }, imageFile: File): Promise<ApiResponse<{ story: Story }>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (storyData.caption) formData.append('caption', storyData.caption);
    if (storyData.music) formData.append('music', JSON.stringify(storyData.music));
    if (storyData.location) formData.append('location', JSON.stringify(storyData.location));

    const url = `${this.baseURL}/stories`;
    const headers: any = {};
    
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await response.json();
  }

  async viewStory(storyId: string): Promise<ApiResponse<{ isViewed: boolean; viewsCount: number }>> {
    return this.request<{ isViewed: boolean; viewsCount: number }>(`/stories/${storyId}/view`, {
      method: 'POST',
    });
  }

  // Comment Methods
  async getPostComments(postId: string, page = 1, limit = 20): Promise<ApiResponse<{
    comments: any[];
    pagination: { page: number; limit: number };
  }>> {
    return this.request(`/comments/post/${postId}?page=${page}&limit=${limit}`);
  }

  async createComment(postId: string, content: string, parentCommentId?: string): Promise<ApiResponse<{ comment: any }>> {
    return this.request<{ comment: any }>(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  async likeComment(commentId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    return this.request<{ isLiked: boolean; likesCount: number }>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  // Chat Methods
  async getConversations(page = 1, limit = 20): Promise<ApiResponse<{
    conversations: any[];
    pagination: { page: number; limit: number };
  }>> {
    return this.request(`/chat/conversations?page=${page}&limit=${limit}`);
  }

  async getConversationMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResponse<{
    messages: any[];
    pagination: { page: number; limit: number };
  }>> {
    return this.request(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(receiverId: string, content: string, type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text', mediaFile?: File): Promise<ApiResponse<{ message: any }>> {
    if (type === 'text') {
      return this.request<{ message: any }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId, content, type }),
      });
    } else if (mediaFile) {
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', content);
      formData.append('type', type);
      formData.append('media', mediaFile);

      const url = `${this.baseURL}/chat/messages`;
      const headers: HeadersInit = {};
      
      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await response.json();
    } else {
      throw new Error('Media file required for non-text messages');
    }
  }

  // Notification Methods
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<{
    notifications: any[];
    pagination: { page: number; limit: number };
  }>> {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ isRead: boolean; readAt: string }>> {
    return this.request<{ isRead: boolean; readAt: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return this.request<{ unreadCount: number }>('/notifications/unread-count');
  }

  // Search Methods
  async searchPosts(query: string, page = 1, limit = 20): Promise<ApiResponse<{
    posts: Post[];
    pagination: { page: number; limit: number; total: number };
  }>> {
    return this.request(`/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async searchHashtags(query: string, page = 1, limit = 20): Promise<ApiResponse<{
    hashtags: Array<{ hashtag: string; postCount: number; latestPost: string }>;
    pagination: { page: number; limit: number };
  }>> {
    return this.request(`/search/hashtags?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async globalSearch(query: string): Promise<ApiResponse<{
    users: User[];
    posts: Post[];
    hashtags: Array<{ hashtag: string; postCount: number }>;
  }>> {
    return this.request(`/search/global?q=${encodeURIComponent(query)}`);
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL);

// Export types
export type { User, Post, Story, AuthResponse, ApiResponse };