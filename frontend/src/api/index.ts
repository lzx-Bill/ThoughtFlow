import axios from 'axios';
import type {
  IdeaCard,
  CreateCardRequest,
  UpdateCardRequest,
  CardListResponse,
  EditHistoryResponse,
  MessageResponse,
} from '../types';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || '请求失败，请稍后重试';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// 想法卡片 API
export const ideaCardApi = {
  // 新建卡片
  create: async (data: CreateCardRequest): Promise<IdeaCard> => {
    const response = await api.post<IdeaCard>('/idea-card', data);
    return response.data;
  },

  // 获取所有正常卡片
  getAll: async (): Promise<CardListResponse> => {
    const response = await api.get<CardListResponse>('/idea-cards');
    return response.data;
  },

  // 获取所有已删除卡片
  getDeleted: async (): Promise<CardListResponse> => {
    const response = await api.get<CardListResponse>('/idea-cards/deleted');
    return response.data;
  },

  // 获取单张卡片
  getOne: async (cardId: string): Promise<IdeaCard> => {
    const response = await api.get<IdeaCard>(`/idea-card/${cardId}`);
    return response.data;
  },

  // 更新卡片
  update: async (cardId: string, data: UpdateCardRequest): Promise<IdeaCard> => {
    const response = await api.put<IdeaCard>(`/idea-card/${cardId}`, data);
    return response.data;
  },

  // 逻辑删除卡片
  softDelete: async (cardId: string): Promise<MessageResponse> => {
    const response = await api.patch<MessageResponse>(`/idea-card/${cardId}/delete`);
    return response.data;
  },

  // 恢复卡片
  recover: async (cardId: string): Promise<MessageResponse> => {
    const response = await api.patch<MessageResponse>(`/idea-card/${cardId}/recover`);
    return response.data;
  },

  // 获取编辑历史
  getHistory: async (cardId: string): Promise<EditHistoryResponse> => {
    const response = await api.get<EditHistoryResponse>(`/idea-card/${cardId}/history`);
    return response.data;
  },
};

export default api;
