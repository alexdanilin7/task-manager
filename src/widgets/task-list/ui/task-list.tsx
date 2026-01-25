import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
import type { Task } from '../../../entities/task/model/types';
import { TaskCreateForm } from '../../../features/task-create/ui/task-create-form';
import { TaskEditForm } from '../../../features/task-edit/ui/task-edit-form';
import { VirtualizedTaskList } from './virtualized-task-list';
import './task-list.scss';

export const TaskList = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getInfiniteTasks,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    select: (data) => {
      const allTasks = data.pages.flatMap(page => page.tasks);
      const uniqueTasks = allTasks.filter((task, index, self) =>
        index === self.findIndex(t => t.id === task.id)
      );
      return {
        pages: data.pages.map(page => ({
          ...page,
          tasks: page.tasks.filter((task, index, self) =>
            index === self.findIndex(t => t.id === task.id)
          )
        })),
        pageParams: data.pageParams
      };
    },
    initialPageParam: 1,
  });

  const tasks = data?.pages
    ?.flatMap((page) => page?.tasks || [])
    .filter((task, index, self) => index === self.findIndex(t => t.id === task.id)) || [];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log('Задача удалена:', id);
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleEditSuccess = () => {
    setEditingTask(null);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  if (isLoading) {
    return (
      <div className="task-list-widget">
        <div className="task-list-widget__loading">Загрузка задач...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="task-list-widget">
        <div className="task-list-widget__error">
          Ошибка при загрузке задач: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-widget">
      <div className="task-list-widget__header">
        <h1 className="task-list-widget__title">Список задач</h1>
        <button
          className="task-list-widget__create-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Создать задачу
        </button>
      </div>

      <div className="task-list-widget__container">
        <VirtualizedTaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {hasNextPage && (
          <div className="task-list-widget__load-more">
            <button
              className="task-list-widget__load-more-button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
            </button>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="task-list-widget__modal-overlay">
          <div className="task-list-widget__modal">
            <div className="task-list-widget__modal-header">
              <h2 className="task-list-widget__modal-title">Создание задачи</h2>
              <button
                className="task-list-widget__modal-close"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ×
              </button>
            </div>
            <TaskCreateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {editingTask && (
        <div className="task-list-widget__modal-overlay">
          <div className="task-list-widget__modal">
            <div className="task-list-widget__modal-header">
              <h2 className="task-list-widget__modal-title">
                Редактирование задачи #{editingTask.id}
              </h2>
              <button
                className="task-list-widget__modal-close"
                onClick={() => setEditingTask(null)}
              >
                ×
              </button>
            </div>
            <TaskEditForm
              task={editingTask}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};