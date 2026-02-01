import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Task } from '../../model/types';
import styles from './task-details-card.module.scss';

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
    <div className={styles.details}>
      <div className={styles.header}>
        <Link to="/">
          <button className={styles.backButton}>
            ← Назад к списку
          </button>
        </Link>
        
        <div className={styles.titleContainer}>
          <div className={styles.id}>Задача #{task.id}</div>
          <h1 className={styles.title}>{task.title}</h1>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Описание</h2>
          <div className={styles.description}>
            {task.description}
          </div>
        </div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Информация</h2>
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Статус</span>
              <span className={clsx(styles.metaValue, {
                [styles.completed]: task.completed,
                [styles.pending]: !task.completed,
              })}>
                {task.completed ? 'Выполнена' : 'В процессе'}
              </span>
            </div>
            
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Создана</span>
              <span className={styles.metaValue}>
                {formatDate(task.createdAt)}
              </span>
            </div>
            
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Обновлена</span>
              <span className={styles.metaValue}>
                {formatDate(task.updatedAt)}
              </span>
            </div>
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className={styles.actions}>
            {onEdit && (
              <button
                className={clsx(styles.button, styles.edit)}
                onClick={onEdit}
              >
                Редактировать задачу
              </button>
            )}
            
            {onDelete && (
              <button
                className={clsx(styles.button, styles.delete)}
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