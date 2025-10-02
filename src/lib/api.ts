import axios from 'axios';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse,
  AuthTokens,
  User,
  Vehicle,
  CreateVehicleRequest,
  AssignVehicleRequest
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Always check localStorage for the latest token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        accessToken = token; // Update the in-memory token
      }
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Get fresh refresh token from localStorage
      const storedRefreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : refreshToken;

      if (storedRefreshToken) {
        try {
          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken: storedRefreshToken }
          );

          if (response.data.success && response.data.data) {
            const tokens = response.data.data;
            setTokens(tokens.accessToken, tokens.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth functions
export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

export const logout = () => {
  accessToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const isAuthenticated = (): boolean => {
  return !!accessToken;
};

// API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        setTokens(tokens.accessToken, tokens.refreshToken);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      // Handle axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Login failed');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get user data');
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await api.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password');
    }
  },

  // Super Admin impersonation: Get admin token for a company
  impersonateCompanyAdmin: async (companyId: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(`/auth/impersonate-admin/${companyId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to impersonate admin');
  },
};

export const expensesApi = {
  getExpenses: async (params: any = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  getExpense: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post('/expenses/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportExpenses: async (filters: any = {}) => {
    const response = await api.get('/expenses/export', { 
      params: filters,
      responseType: 'blob'
    });
    return response;
  },
};

export const reportsApi = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getSummary: async (params: any) => {
    const response = await api.get('/reports/summary', { params });
    return response.data;
  },

  getTrends: async (months: number = 6) => {
    const response = await api.get('/reports/trends', { params: { months } });
    return response.data;
  },

  getComparison: async (params: {
    period1Start: string;
    period1End: string;
    period2Start: string;
    period2End: string;
  }) => {
    const response = await api.get('/reports/comparison', { params });
    return response.data;
  },
};

export const usersApi = {
  getUsers: async (params: any = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  getUsersByRole: async (params: { role?: string; search?: string; page?: number; limit?: number } = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  assignRoles: async (userId: string, roleIds: string[]) => {
    const response = await api.post('/roles/assign-multiple', { userId, roleIds });
    return response.data;
  },

  unassignRole: async (userId: string, roleId: string) => {
    const response = await api.delete(`/roles/assign/${userId}/${roleId}`);
    return response.data;
  },
};

export const vehiclesApi = {
  getVehicles: async (params: any = {}) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getVehicle: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (data: CreateVehicleRequest) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  updateVehicle: async (id: string, data: Partial<CreateVehicleRequest>) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id: string) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  assignVehicle: async (id: string, driverIds: string[] | string) => {
    const payload = Array.isArray(driverIds) 
      ? { driverIds } 
      : { driverId: driverIds };
    const response = await api.post(`/vehicles/${id}/assign`, payload);
    return response.data;
  },

  unassignVehicle: async (id: string) => {
    const response = await api.post(`/vehicles/${id}/unassign`);
    return response.data;
  },
};

export const rolesApi = {
  getRoles: async (params: any = {}) => {
    const response = await api.get('/roles', { params });
    return response.data;
  },

  getRole: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (data: any) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: any) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/roles/permissions');
    return response.data;
  },

  assignRole: async (data: any) => {
    const response = await api.post('/roles/assign', data);
    return response.data;
  },

  assignMultipleRoles: async (data: any) => {
    const response = await api.post('/roles/assign-multiple', data);
    return response.data;
  },

  unassignRole: async (data: any) => {
    const response = await api.post('/roles/unassign', data);
    return response.data;
  },
};