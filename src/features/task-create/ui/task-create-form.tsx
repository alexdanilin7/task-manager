import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { taskApi } from '../../../entities/task/model/api';
import type { TaskCreateData } from '../../../entities/task/model/types';
import styles from './task-create-form.module.scss';

interface TaskCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskCreateForm = ({ onSuccess, onCancel }: TaskCreateFormProps) => {
  const queryClient = useQueryClient();
  const [characterCount, setCharacterCount] = useState({
    title: 0,
    description: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TaskCreateData>();

  const titleValue = watch('title');
  const descriptionValue = watch('description');

  useEffect(() => {
    setCharacterCount({
      title: titleValue?.length || 0,
      description: descriptionValue?.length || 0,
    });
  }, [titleValue, descriptionValue]);

  const createMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
    },
    onError: (error) => {
      console.error('Error creating task:', error);
    },
  });

  const onSubmit = (data: TaskCreateData) => {
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  const isSubmitting = createMutation.isPending;
  const titleProgress = Math.min((characterCount.title / 100) * 100, 100);
  const descriptionProgress = Math.min((characterCount.description / 1000) * 100, 100);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Создание новой задачи</h2>

      <div className={styles.field}>
        <label htmlFor="title" className={clsx(styles.label, styles.required)}>
          Заголовок задачи
        </label>
        <input
          id="title"
          type="text"
          className={clsx(styles.input, {
            [styles.error]: errors.title,
          })}
          placeholder="Введите краткое и понятное название задачи"
          disabled={isSubmitting}
          maxLength={100}
          {...register('title', { 
            required: 'Заголовок обязателен',
            minLength: { value: 3, message: 'Минимум 3 символа' },
            maxLength: { value: 100, message: 'Максимум 100 символов' }
          })}
        />
        {errors.title && (
          <span className={styles.error}>{errors.title.message}</span>
        )}
        
        <div className={styles.counter}>
          <span className={clsx({
            [styles.warning]: characterCount.title > 90,
          })}>
            {characterCount.title}/100 символов
          </span>
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${titleProgress}%` }}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={clsx(styles.label, styles.required)}>
          Подробное описание
        </label>
        <textarea
          id="description"
          className={clsx(styles.textarea, {
            [styles.error]: errors.description,
          })}
          placeholder="Опишите задачу максимально подробно..."
          rows={6}
          disabled={isSubmitting}
          maxLength={1000}
          {...register('description', { 
            required: 'Описание обязательно',
            minLength: { value: 10, message: 'Минимум 10 символов' },
            maxLength: { value: 1000, message: 'Максимум 1000 символов' }
          })}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description.message}</span>
        )}
        
        <div className={styles.counter}>
          <span className={clsx({
            [styles.warning]: characterCount.description > 900,
            [styles.danger]: characterCount.description > 950,
          })}>
            {characterCount.description}/1000 символов
          </span>
        </div>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${descriptionProgress}%` }}
          />
        </div>
        
        <div className={styles.tip}>
          Чем подробнее описание, тем лучше понимание задачи.
        </div>
      </div>

      {showSuccess && (
        <div className={styles.successMessage}>
          <div>🎉</div>
          <div>Задача успешно создана!</div>
          <div>Задача добавлена в список и доступна для просмотра</div>
        </div>
      )}

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
          {isSubmitting ? '' : 'Создать задачу'}
        </button>
      </div>

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>
            Создание задачи...
          </div>
        </div>
      )}
    </form>
  );
};