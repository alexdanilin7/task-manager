import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
import type { Task, TaskUpdateData } from '../../../entities/task/model/types';
import './task-edit-form.scss';

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

  // Следим за изменениями полей для подсчета символов
  const titleValue = watch('title');
  const descriptionValue = watch('description');

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
      // Обновляем кэш задачи и списка задач
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
    <form className="task-edit-form" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="task-edit-form__title">Редактирование задачи #{task.id}</h2>

      <div className="task-edit-form__meta">
        <div className="task-edit-form__meta-item">
          <span className="task-edit-form__meta-label">Создана</span>
          <span className="task-edit-form__meta-value">
            {formatDate(task.createdAt)}
          </span>
        </div>
        
        <div className="task-edit-form__meta-item">
          <span className="task-edit-form__meta-label">Обновлена</span>
          <span className="task-edit-form__meta-value">
            {formatDate(task.updatedAt)}
          </span>
        </div>
      </div>

      <div className="task-edit-form__field">
        <label htmlFor="title" className="task-edit-form__label task-edit-form__label--required">
          Заголовок
        </label>
        <input
          id="title"
          type="text"
          className={`task-edit-form__input ${errors.title ? 'task-edit-form__input--error' : ''}`}
          placeholder="Введите заголовок задачи"
          disabled={isSubmitting}
          maxLength={100}
          {...register('title', { 
            required: 'Заголовок обязателен',
            minLength: { value: 3, message: 'Минимум 3 символа' },
            maxLength: { value: 100, message: 'Максимум 100 символов' }
          })}
        />
        {errors.title && (
          <span className="task-edit-form__error">{errors.title.message}</span>
        )}
        <span className={`task-edit-form__character-count ${
          characterCount.title > 90 ? 'task-edit-form__character-count--warning' : ''
        }`}>
          {characterCount.title}/100 символов
        </span>
      </div>

      <div className="task-edit-form__field">
        <label htmlFor="description" className="task-edit-form__label task-edit-form__label--required">
          Описание
        </label>
        <textarea
          id="description"
          className={`task-edit-form__textarea ${errors.description ? 'task-edit-form__textarea--error' : ''}`}
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
        {errors.description && (
          <span className="task-edit-form__error">{errors.description.message}</span>
        )}
        <span className={`task-edit-form__character-count ${
          characterCount.description > 900 ? 'task-edit-form__character-count--warning' : ''
        }`}>
          {characterCount.description}/1000 символов
        </span>
      </div>

      <div className="task-edit-form__field">
        <div className="task-edit-form__checkbox-group">
          <label className="task-edit-form__checkbox-label">
            <input
              type="checkbox"
              className="task-edit-form__checkbox"
              disabled={isSubmitting}
              {...register('completed')}
            />
            <span className={`task-edit-form__checkbox-text ${
              watch('completed') ? 'task-edit-form__checkbox-text--completed' : 'task-edit-form__checkbox-text--pending'
            }`}>
              {watch('completed') ? 'Задача выполнена' : 'Задача в процессе'}
            </span>
          </label>
        </div>
        <span className="task-edit-form__status-info">
          {watch('completed') 
            ? 'Задача будет отмечена как выполненная' 
            : 'Задача будет отмечена как активная'}
        </span>
      </div>

      <div className="task-edit-form__form-footer">
        <div className="task-edit-form__hint">
          Все изменения сохраняются автоматически после нажатия "Сохранить"
        </div>
        
        <div className="task-edit-form__actions">
          <button
            type="button"
            className="task-edit-form__button task-edit-form__button--cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`task-edit-form__button task-edit-form__button--submit ${
              isSubmitting ? 'task-edit-form__button--loading' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      {isSubmitting && (
        <div className="task-edit-form__loading-overlay">
          <div className="task-edit-form__loading-spinner" />
        </div>
      )}
    </form>
  );
};