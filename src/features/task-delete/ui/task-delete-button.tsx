import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { taskApi } from '../../../entities/task/model/api';
import styles from './task-delete-button.module.scss';

interface TaskDeleteButtonProps {
  taskId: number;
  onSuccess?: () => void;
}

export const TaskDeleteButton = ({ taskId, onSuccess }: TaskDeleteButtonProps) => {
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onMutate: async (deletedId) => {
      // Сбрасываем ошибку
      setError(null);
      
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Сохраняем предыдущее состояние
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Оптимистично удаляем задачу из кэша
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            tasks: page.tasks.filter((task: any) => task.id !== deletedId),
          })),
        };
      });
      
      return { previousTasks };
    },
    onError: (err: any, _deletedId, context) => {
      console.error('Delete error:', err);
      
      // Устанавливаем понятное сообщение об ошибке
      if (err.response?.status === 404) {
        setError('Задача уже была удалена или не существует');
      } else {
        setError(err.message || 'Не удалось удалить задачу');
      }
      
      // Восстанавливаем предыдущее состояние
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      
      setIsConfirming(false);
    },
    onSuccess: () => {
      // Инвалидируем кэш
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      
      setIsConfirming(false);
      setError(null);
      
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const handleDelete = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    deleteMutation.mutate(taskId);
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setError(null);
  };

  return (
    <div className={styles.delete}>
      {isConfirming ? (
        <div className={styles.confirm}>
          <span className={styles.confirmText}>
            Вы уверены, что хотите удалить эту задачу?
          </span>
          
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
          
          <div className={styles.confirmActions}>
            <button
              className={clsx(styles.button, styles.cancel)}
              onClick={handleCancel}
              disabled={deleteMutation.isPending}
            >
              Отмена
            </button>
            <button
              className={clsx(styles.button, styles.delete)}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Да, удалить'}
            </button>
          </div>
        </div>
      ) : (
        <button
          className={clsx(styles.button, styles.init)}
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          Удалить
        </button>
      )}
    </div>
  );
};