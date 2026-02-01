import { useState, useCallback} from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
import type { Task } from '../../../entities/task/model/types';
import { TaskCreateForm } from '../../../features/task-create';
import { TaskEditForm } from '../../../features/task-edit';
import { VirtualizedTaskList } from './virtualized-task-list';
import styles from './task-list.module.scss';

export const TaskList = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();


  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      // удаляем из кэша
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old || !old.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            tasks: page.tasks.filter((task: any) => task.id !== id),
          })),
        };
      });

      // удаление на сервере
      await taskApi.deleteTask(id);
      
      // Инвалидируем кэш для перезагрузки
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      // В случае ошибки восстанавливаем данные
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  }, [queryClient]);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [queryClient]);

  const handleEditSuccess = useCallback(() => {
    setEditingTask(null);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [queryClient]);

  // Infinite query hook 
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getInfiniteTasks,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      const currentPage = allPages.length;
      
      console.log(`📄 Страница ${currentPage} из ${totalPages}, всего задач: ${lastPage.total}`);
      
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    
    staleTime: 3000, 
    gcTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    
  });

  // Собираем ВСЕ задачи 
  const allTasks = data?.pages?.flatMap((page) => page?.tasks || []) || [];

  const uniqueTasks = Array.from(
    new Map(allTasks.map(task => [task.id, task])).values()
  );

  // Обработчик загрузки следующей страницы
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log(`🎯 Ручная загрузка следующей страницы`);
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  
  if (isError) {
    return (
      <div className={styles.widget}>
        <div className={styles.error}>
          <h3>Ошибка при загрузке задач</h3>
          <p>{(error as Error).message}</p>
          <button 
            onClick={() => refetch()}
            className={styles.retryButton}
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Список задач
          {uniqueTasks.length > 0 && (
            <span className={styles.count}> ({uniqueTasks.length} из {data?.pages?.[0]?.total || 0})</span>
          )}
        </h1>
        <div className={styles.headerActions}>
          <button
            className={styles.createButton}
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Создать задачу
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <VirtualizedTaskList
          tasks={uniqueTasks}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={loadMore}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        
        {/* {hasNextPage && (
          <div className={styles.loadMoreInfo}>
            <p>
              Загружено {uniqueTasks.length} из {data?.pages?.[0]?.total || 0} задач
              {isFetchingNextPage && ' (загрузка...)'}
            </p>
            <button
              onClick={loadMore}
              className={styles.loadMoreButton}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
            </button>
          </div>
        )} */}
      </div>

      {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Создание задачи</h2>
              <button
                className={styles.modalClose}
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
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Редактирование задачи #{editingTask.id}
              </h2>
              <button
                className={styles.modalClose}
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