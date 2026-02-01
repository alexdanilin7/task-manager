import { apiClient } from '../../../shared/api/client';
import type{
  Task,
  TaskCreateData,
  TaskUpdateData,
  TasksResponse,
} from './types';

export const taskApi = {
  
  async getInfiniteTasks({ pageParam = 1 }: { pageParam?: number }):Promise<TasksResponse> {
    const response = await apiClient.get<Task[]>('/tasks', {
      params: {
        _start: (pageParam-1)*15,
        _end: (pageParam-1)*15 + 15,
        _sort: 'id'
      },
    });
    // todo fix total count PROBLEM IN JSON_SERVER
    const totalCountHeader = await apiClient.get<Task[]>('/tasks');
    const totalCount = totalCountHeader.data.length? totalCountHeader.data.length : 15;
    const tasks = Array.isArray(response.data) ? response.data : [];
    return {
      tasks,
      total: totalCount,
      page: pageParam,
      limit: 15, 
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