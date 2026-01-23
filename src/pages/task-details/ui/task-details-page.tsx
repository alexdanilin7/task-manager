import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
import { TaskDetailsCard } from '../../../entities/task/ui/task-details-card/task-details-card';
import { TaskEditForm } from '../../../features/task-edit/ui/task-edit-form';
import { TaskDeleteButton } from '../../../features/task-delete/ui/task-delete-button';

export const TaskDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const taskId = id ? parseInt(id) : 0;

  const {
    data: task,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getTask(taskId),
    enabled: !!taskId && !isNaN(taskId),
  });

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Обновляем данные задачи и списка задач
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  const handleDeleteSuccess = () => {
    // После удаления перенаправляем на главную страницу
    navigate('/');
    // Инвалидируем кэш списка задач
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  if (isLoading) {
    return (
      <div className="task-details-page">
        <div className="container">
          <div className="loading">Загрузка задачи...</div>
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="task-details-page">
        <div className="container">
          <div className="error">
            Ошибка при загрузке задачи: {(error as Error).message}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => navigate('/')}>Вернуться к списку</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-details-page">
      <div className="container">
        {isEditing ? (
          <TaskEditForm
            task={task}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <TaskDetailsCard
            task={task}
            onEdit={() => setIsEditing(true)}
            onDelete={() => {
              // Можно использовать модальное окно или напрямую TaskDeleteButton
              if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
                taskApi.deleteTask(taskId)
                  .then(() => {
                    handleDeleteSuccess();
                  })
                  .catch(error => {
                    console.error('Ошибка при удалении:', error);
                    alert('Не удалось удалить задачу');
                  });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};