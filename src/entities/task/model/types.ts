export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateData {
  title: string;
  description: string;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskFilters {
  page: number;
  limit: number;
  search?: string;
  completed?: boolean;
}