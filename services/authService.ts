import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = 'http://13.204.79.120/zenark/api/v2';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    }
    return Promise.reject(error);
  }
);

// Types
export interface UserLoginDTO {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDTO {
  login: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  langKey?: string;
  imageUrl?: string;
}

export interface UserDTO {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  activated: boolean;
  langKey: string;
  authorities: string[];
  imageUrl?: string;
}

export interface AuthResponse {
  id_token: string;
  token_type: string;
}

// Authentication Service
class AuthService {
  // Login user
  async login(credentials: UserLoginDTO): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/authenticate', credentials);
      
      if (response.data.id_token) {
        // Store the JWT token securely
        await SecureStore.setItemAsync('authToken', response.data.id_token);
        
        // Get user data and store it
        const userData = await this.getCurrentUser();
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register user
  async register(userData: RegisterDTO): Promise<UserDTO> {
    try {
      const response = await api.post<UserDTO>('/api/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<UserDTO> {
    try {
      const response = await api.get<UserDTO>('/api/account');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return false;
      
      const response = await api.get('/api/authenticate');
      return response.status === 200;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  // Get stored user data
  async getStoredUserData(): Promise<UserDTO | null> {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get stored user data error:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/account/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/api/account/reset-password/init', email);
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  // Finish password reset
  async finishPasswordReset(key: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/account/reset-password/finish', {
        key,
        newPassword,
      });
    } catch (error) {
      console.error('Finish password reset error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService; 