import { api } from '@/lib/api';

export const auditApi = {
  getRecentLogs: async (limit: number = 5) => {
    const response = await api.get('/audit', { params: { page: 1, limit } });
    return response.data?.data || [];
  },
};
