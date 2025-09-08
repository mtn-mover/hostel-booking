import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - change this to your production URL
const BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://alpinehavenhostel.ch/api'; // Production

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
      // TODO: Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/admin/login', { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  },
  
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

// Chat service
export const chatService = {
  getActiveChats: async () => {
    const response = await api.get('/admin/chats/active');
    return response.data;
  },
  
  getChatHistory: async (chatId: string) => {
    const response = await api.get(`/chat?sessionId=${chatId}`);
    return response.data;
  },
  
  sendAdminMessage: async (chatId: string, message: string) => {
    const response = await api.post('/chat', {
      sessionId: chatId,
      message,
      isAdminResponse: true,
      adminUserId: await AsyncStorage.getItem('user_id'),
    });
    return response.data;
  },
  
  takeOverChat: async (chatId: string) => {
    const response = await api.post(`/admin/chats/${chatId}/takeover`);
    return response.data;
  },
};

// Escalation service
export const escalationService = {
  getEscalations: async (urgency?: string) => {
    const response = await api.get('/admin/escalations', {
      params: { urgency, status: 'pending' },
    });
    return response.data;
  },
  
  resolveEscalation: async (escalationId: string) => {
    const response = await api.post(`/admin/escalations/${escalationId}/resolve`);
    return response.data;
  },
};

// Learning service
export const learningService = {
  getAnalytics: async () => {
    const response = await api.get('/admin/learning/analytics');
    return response.data;
  },
  
  applyLearning: async (learningId: string) => {
    const response = await api.post('/admin/learning/apply', { learningId });
    return response.data;
  },
  
  reviewLearning: async (learningId: string, approved: boolean) => {
    const response = await api.post('/admin/learning/review', {
      learningId,
      approved,
    });
    return response.data;
  },
};

// Dashboard service
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/admin/dashboard/activity');
    return response.data;
  },
};

// Push notification service
export const pushService = {
  registerDevice: async (token: string) => {
    const response = await api.post('/admin/push/register', { 
      token,
      platform: Platform.OS,
    });
    return response.data;
  },
  
  updateNotificationPreferences: async (preferences: any) => {
    const response = await api.post('/admin/push/preferences', preferences);
    return response.data;
  },
};

// WebSocket connection for real-time updates
import io from 'socket.io-client';
import { Platform } from 'react-native';

class WebSocketService {
  private socket: any = null;
  
  async connect() {
    const token = await AsyncStorage.getItem('auth_token');
    
    this.socket = io(BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  on(event: string, callback: Function) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
  
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
  
  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const wsService = new WebSocketService();

export default api;