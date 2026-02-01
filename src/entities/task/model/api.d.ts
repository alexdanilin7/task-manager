import type { Task, TaskCreateData, TaskUpdateData, TasksResponse } from './types';
export declare const taskApi: {
    getInfiniteTasks({ pageParam }: {
        pageParam?: number;
    }): Promise<TasksResponse>;
    getTask(id: number): Promise<Task>;
    createTask(data: TaskCreateData): Promise<Task>;
    updateTask(id: number, data: TaskUpdateData): Promise<Task>;
    deleteTask(id: number): Promise<void>;
};
//# sourceMappingURL=api.d.ts.map