import { apiClient } from '../../../shared/api/client';
import type{
  Task,
  TaskCreateData,
  TaskUpdateData,
} from './types';

export const taskApi = {
  async getInfiniteTasks({ pageParam = 1 }: { pageParam?: number }) {
    const response = await apiClient.get<Task[]>('/tasks', {
      params: {
        _page: pageParam,
        _limit: 10,
        _sort: 'id'
      },
    });
    
    const totalCount = response.headers['x-total-count'] ? parseInt(response.headers['x-total-count'], 10) : response.data?.length || 0;
  
    return {
      tasks: response.data || [],
      total: totalCount,
      page: pageParam,
      limit: 10,
    };
  },

  async getTask(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: TaskCreateData): Promise<Task> {
    const newTask = {
      ...data,
      id: Date.now() + Math.floor(Math.random() * 1000), 
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const response = await apiClient.post<Task>('/tasks', newTask);
    return response.data;
  },


  async updateTask(id: number, data: TaskUpdateData): Promise<Task> {
    const updatedTask = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    const response = await apiClient.patch<Task>(`/tasks/${id}`, updatedTask);
    return response.data;
  },


  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};