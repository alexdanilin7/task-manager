import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { taskApi } from '../../../entities/task/model/api';
import type { Task, TaskUpdateData } from '../../../entities/task/model/types';
import styles from './task-edit-form.module.scss';

interface TaskEditFormProps {
  task: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskEditForm = ({ task, onSuccess, onCancel }: TaskEditFormProps) => {
  const queryClient = useQueryClient();
  const [characterCount, setCharacterCount] = useState({
    title: task.title.length,
    description: task.description.length
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TaskUpdateData>({
    defaultValues: {
      title: task.title,
      description: task.description,
      completed: task.completed,
    },
  });

  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const completedValue = watch('completed');

  useEffect(() => {
    setCharacterCount({
      title: titleValue?.length || 0,
      description: descriptionValue?.length || 0,
    });
  }, [titleValue, descriptionValue]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateData }) =>
      taskApi.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating task:', error);
    },
  });

  const onSubmit = (data: TaskUpdateData) => {
    updateMutation.mutate({ id: task.id, data });
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Редактирование задачи #{task.id}</h2>

      <div className={styles.meta}>
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

      <div className={styles.field}>
        <label htmlFor="title" className={clsx(styles.label, styles.required)}>
          Заголовок
        </label>
        <input
          id="title"
          type="text"
          className={clsx(styles.input, {
            [styles.error]: errors.title,
          })}
          placeholder="Введите заголовок задачи"
          disabled={isSubmitting}
          maxLength={100}
          {...register('title', { 
            required: 'Заголовок обязателен',
            minLength: { value: 3, message: 'Минимум 3 символа' },
            maxLength: { value: 100, message: 'Максимум 100 символов' }
          })}

        />
        <p>Символов {characterCount.title} из 100</p>
        {errors.title && (
          <span className={styles.error}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={clsx(styles.label, styles.required)}>
          Описание
        </label>
        <textarea
          id="description"
          className={clsx(styles.textarea, {
            [styles.error]: errors.description,
          })}
          placeholder="Введите подробное описание задачи..."
          rows={5}
          disabled={isSubmitting}
          maxLength={1000}
          {...register('description', { 
            required: 'Описание обязательно',
            minLength: { value: 10, message: 'Минимум 10 символов' },
            maxLength: { value: 1000, message: 'Максимум 1000 символов' }
          })}
        />
        <p>Символов {characterCount.description} из 1000</p>
        {errors.description && (
          <span className={styles.error}>{errors.description.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              disabled={isSubmitting}
              {...register('completed')}
            />
            <span className={clsx(styles.checkboxText, {
              [styles.completed]: completedValue,
              [styles.pending]: !completedValue,
            })}>
              {completedValue ? 'Задача выполнена' : 'Задача в процессе'}
            </span>
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={clsx(styles.button, styles.cancel)}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button
          type="submit"
          className={clsx(styles.button, styles.submit, {
            [styles.loading]: isSubmitting,
          })}
          disabled={isSubmitting}
        >
          {isSubmitting ? '' : 'Сохранить изменения'}
        </button>
      </div>

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </form>
  );
};