import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Task } from '../../model/types';
import styles from './task-card.module.scss';

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

  const handleDelete = () => {
    if (onDelete) onDelete(task.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>
        <span className={styles.id}>#{task.id}</span>
      </div>
      
      <div className={clsx(styles.description, {
        [styles.truncated]: truncateDescription,
      })}>
        {task.description}
      </div>
      
      <div className={styles.footer}>
        <span className={clsx(styles.status, {
          [styles.completed]: task.completed,
          [styles.pending]: !task.completed,
        })}>
          {task.completed ? 'Выполнена' : 'В процессе'}
        </span>
        
        <div className={styles.actions}>
          <Link to={`/tasks/${task.id}`}>
            <button className={clsx(styles.button, styles.buttonView)}>
              Просмотр
            </button>
          </Link>
          
          {onEdit && (
            <button
              className={clsx(styles.button, styles.buttonEdit)}
              onClick={handleEdit}
            >
              Редактировать
            </button>
          )}
          
          {onDelete && (
            <button
              className={clsx(styles.button, styles.buttonDelete)}
              onClick={handleDelete}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};