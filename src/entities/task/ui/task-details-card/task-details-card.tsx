import { Link } from 'react-router-dom';
import type { Task } from '../../model/types';
import './task-details-card.scss';

interface TaskDetailsCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TaskDetailsCard = ({
  task,
  onEdit,
  onDelete,
}: TaskDetailsCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="task-details">
      <div className="task-details__header">
        <Link to="/">
          <button className="task-details__back-button">
            ← Назад к списку
          </button>
        </Link>
        
        <div className="task-details__title-container">
          <div className="task-details__id">Задача #{task.id}</div>
          <h1 className="task-details__title">{task.title}</h1>
        </div>
      </div>
      
      <div className="task-details__content">
        <div className="task-details__section">
          <h2 className="task-details__section-title">Описание</h2>
          <div className="task-details__description">
            {task.description}
          </div>
        </div>
        
        <div className="task-details__section">
          <h2 className="task-details__section-title">Информация</h2>
          <div className="task-details__meta">
            <div className="task-details__meta-item">
              <span className="task-details__meta-label">Статус</span>
              <span className={`task-details__meta-value ${
                task.completed ? 'task-details__meta-value--completed' : 'task-details__meta-value--pending'
              }`}>
                {task.completed ? 'Выполнена' : 'В процессе'}
              </span>
            </div>
            
            <div className="task-details__meta-item">
              <span className="task-details__meta-label">Создана</span>
              <span className="task-details__meta-value">
                {formatDate(task.createdAt)}
              </span>
            </div>
            
            <div className="task-details__meta-item">
              <span className="task-details__meta-label">Обновлена</span>
              <span className="task-details__meta-value">
                {formatDate(task.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="task-details__actions">
            {onEdit && (
              <button
                className="task-details__button task-details__button--edit"
                onClick={onEdit}
              >
                Редактировать задачу
              </button>
            )}
            
            {onDelete && (
              <button
                className="task-details__button task-details__button--delete"
                onClick={onDelete}
              >
                Удалить задачу
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};