import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
//import './task-delete-button.scss';

interface TaskDeleteButtonProps {
  taskId: number;
  onSuccess?: () => void;
}

export const TaskDeleteButton = ({ taskId, onSuccess }: TaskDeleteButtonProps) => {
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Используем мутацию с инвалидацией кэша
  const deleteMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onMutate: async (deletedId) => {
      setIsDeleting(true);
      
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
    onError: (err, deletedId, context) => {
      // В случае ошибки восстанавливаем предыдущее состояние
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      setIsDeleting(false);
      setIsConfirming(false);
    },
    onSuccess: () => {
      // Инвалидируем кэш чтобы перезагрузить данные
      // queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Убираем дублирование
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      
      setIsDeleting(false);
      setIsConfirming(false);
      
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
  };

  return (
    <div className="task-delete">
      {isConfirming ? (
        <div className="task-delete__confirm">
          <span className="task-delete__confirm-text">
            Вы уверены, что хотите удалить эту задачу?
          </span>
          <div className="task-delete__confirm-actions">
            <button
              className="task-delete__button task-delete__button--cancel"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              Отмена
            </button>
            <button
              className="task-delete__button task-delete__button--delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Да, удалить'}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="task-delete__button task-delete__button--init"
          onClick={handleDelete}
        >
          Удалить
        </button>
      )}
    </div>
  );
};