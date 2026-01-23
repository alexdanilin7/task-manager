import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/model/api';
import { TaskCreateData } from '../../../entities/task/model/types';
import './task-create-form.scss';

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

  // Следим за значениями полей для предпросмотра и подсчета символов
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
      // Показываем сообщение об успехе
      setShowSuccess(true);
      
      // Обновляем кэш списка задач
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Сбрасываем форму
      reset();
      
      // Скрываем сообщение через 3 секунды
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

  // Рассчитываем прогресс для индикатора
  const titleProgress = Math.min((characterCount.title / 100) * 100, 100);
  const descriptionProgress = Math.min((characterCount.description / 1000) * 100, 100);

  return (
    <form className="task-create-form" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="task-create-form__title">Создание новой задачи</h2>

      <div className="task-create-form__field task-create-form__field--with-icon task-create-form__field--title">
        <label htmlFor="title" className="task-create-form__label task-create-form__label--required">
          Заголовок задачи
        </label>
        <input
          id="title"
          type="text"
          className={`task-create-form__input ${errors.title ? 'task-create-form__input--error' : ''}`}
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
          <span className="task-create-form__error">{errors.title.message}</span>
        )}
        
        <div className="task-create-form__character-count">
          <span className={`task-create-form__counter ${
            characterCount.title > 90 ? 'task-create-form__counter--warning' : ''
          }`}>
            {characterCount.title}/100 символов
          </span>
        </div>
        
        <div className="task-create-form__progress-bar">
          <div 
            className="task-create-form__progress-fill" 
            style={{ width: `${titleProgress}%` }}
          />
        </div>
      </div>

      <div className="task-create-form__field task-create-form__field--with-icon task-create-form__field--description">
        <label htmlFor="description" className="task-create-form__label task-create-form__label--required">
          Подробное описание
        </label>
        <textarea
          id="description"
          className={`task-create-form__textarea ${errors.description ? 'task-create-form__textarea--error' : ''}`}
          placeholder="Опишите задачу максимально подробно. Что нужно сделать? Какие есть требования? Каковы критерии выполнения?"
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
          <span className="task-create-form__error">{errors.description.message}</span>
        )}
        
        <div className="task-create-form__character-count">
          <span className={`task-create-form__counter ${
            characterCount.description > 900 ? 'task-create-form__counter--warning' : 
            characterCount.description > 950 ? 'task-create-form__counter--danger' : ''
          }`}>
            {characterCount.description}/1000 символов
          </span>
        </div>
        
        <div className="task-create-form__progress-bar">
          <div 
            className="task-create-form__progress-fill" 
            style={{ width: `${descriptionProgress}%` }}
          />
        </div>
        
        <div className="task-create-form__tip">
          Чем подробнее описание, тем лучше понимание задачи. Укажите сроки, приоритет и дополнительные требования.
        </div>
      </div>

      {/* Предпросмотр */}
      {(titleValue || descriptionValue) && (
        <div className="task-create-form__preview">
          <div className="task-create-form__preview-title">Предпросмотр</div>
          <div className="task-create-form__preview-content">
            {titleValue ? (
              <>
                <strong>{titleValue}</strong>
                <br />
                {descriptionValue || <span className="task-create-form__preview-empty">Описание не указано</span>}
              </>
            ) : (
              <span className="task-create-form__preview-empty">Заполните поля выше для предпросмотра</span>
            )}
          </div>
        </div>
      )}

      {/* Сообщение об успехе */}
      {showSuccess && (
        <div className="task-create-form__success-message">
          <div className="task-create-form__success-message-icon">🎉</div>
          <div className="task-create-form__success-message-text">Задача успешно создана!</div>
          <div className="task-create-form__success-message-subtext">
            Задача добавлена в список и доступна для просмотра
          </div>
        </div>
      )}

      <div className="task-create-form__actions">
        <button
          type="button"
          className="task-create-form__button task-create-form__button--cancel"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <span className="task-create-form__button-icon">←</span>
          Отмена
        </button>
        <button
          type="submit"
          className={`task-create-form__button task-create-form__button--submit ${
            isSubmitting ? 'task-create-form__button--loading' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '' : (
            <>
              Создать задачу
              <span className="task-create-form__button-icon">+</span>
            </>
          )}
        </button>
      </div>

      {/* Оверлей загрузки */}
      {isSubmitting && (
        <div className="task-create-form__loading-overlay">
          <div className="task-create-form__loading-spinner" />
          <div className="task-create-form__loading-text">
            Создание задачи...
          </div>
        </div>
      )}
    </form>
  );
};