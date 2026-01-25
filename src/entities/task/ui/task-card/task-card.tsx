import { Link } from 'react-router-dom';
import type { Task } from '../../model/types';
import { TaskDeleteButton } from '../../../../features/task-delete/ui/task-delete-button';
import './task-card.scss';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void; 
  truncateDescription?: boolean;
}

export const TaskCard = ({
  task,
  onEdit,
  onDelete, 
  truncateDescription = true,
}: TaskCardProps) => {
  const handleEdit = () => {
    if (onEdit) onEdit(task);
  };

 
  const handleLegacyDelete = () => {
    if (onDelete) onDelete(task.id);
  };

  return (
    <div className="task-card">
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <span className="task-card__id">#{task.id}</span>
      </div>
      
      <div className={`task-card__description ${truncateDescription ? 'truncated' : ''}`}>
        {task.description}
      </div>
      
      <div className="task-card__footer">
        <span className={`task-card__status ${task.completed ? 'completed' : 'pending'}`}>
          {task.completed ? 'Выполнена' : 'В процессе'}
        </span>
        
        <div className="task-card__actions">
          <Link to={`/tasks/${task.id}`}>
            <button className="task-card__button task-card__button--view">
              Просмотр
            </button>
          </Link>
          
          {onEdit && (
            <button
              className="task-card__button task-card__button--edit"
              onClick={handleEdit}
            >
              Редактировать
            </button>
          )}
          
         
          {!onDelete ? (
            <TaskDeleteButton taskId={task.id} />
          ) : (
            <button
              className="task-card__button task-card__button--delete"
              onClick={handleLegacyDelete}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};